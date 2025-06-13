const db = require('../lib/prisma')
const dotenv = require("dotenv");
const {setLogger} = require('../utils/logger');
const jsQR = require('jsqr');
const jimp = require('jimp');
const sharp = require('sharp');

const analyzeQRWithSharp = async (imageBuffer) => {
  try {
    if (!imageBuffer || imageBuffer.length === 0) {
      throw new Error('Buffer de imagen vacío');
    }

    const startTime = Date.now();

    // Obtener metadatos una sola vez
    const metadata = await sharp(imageBuffer).metadata();
    
    // Calcular tamaño objetivo más agresivo para obtener mas velocidad
    let targetWidth = metadata.width;
    let targetHeight = metadata.height;
    
    const maxDimension = 800; // Reducido a 800 para mayor velocidad
    if (Math.max(targetWidth, targetHeight) > maxDimension) {
      const ratio = maxDimension / Math.max(targetWidth, targetHeight);
      targetWidth = Math.round(targetWidth * ratio);
      targetHeight = Math.round(targetHeight * ratio);
    }

    const processStart = Date.now();
    const processedImage = await sharp(imageBuffer)
      .resize(targetWidth, targetHeight, { 
        kernel: sharp.kernel.nearest,
        fit: 'fill'
      })
      .greyscale()
      .normalize()
      .png({ compressionLevel: 1 })
      .toBuffer();
    
    // Función helper para crear imageData más eficientemente
    const createImageData = async (image) => {
      const { data, info } = await sharp(image)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      return { data: new Uint8ClampedArray(data), width: info.width, height: info.height };
    };

    // Intentos optimizados - solo los más efectivos
    const attempts = [
      // Intento 1: Imagen normal (más probable que funcione)
      async () => {
        const imgData = await createImageData(processedImage);
        return jsQR(imgData.data, imgData.width, imgData.height, {
          inversionAttempts: "attemptBoth"
        });
      },

      // Intento 2: Solo si el primero falla - imagen más pequeña y rápida
      async () => {
        const quickImage = await sharp(imageBuffer)
          .resize(400, 400, { fit: 'inside', kernel: sharp.kernel.nearest })
          .greyscale()
          .normalize()
          .png({ compressionLevel: 0 })
          .toBuffer();
        
        const imgData = await createImageData(quickImage);
        return jsQR(imgData.data, imgData.width, imgData.height, {
          inversionAttempts: "attemptBoth"
        });
      },

      // Intento 3: Solo para casos difíciles - con contraste
      async () => {
        const contrastImage = await sharp(processedImage)
          .linear(1.3, -30) // Contraste más suave pero efectivo
          .toBuffer();
        
        const imgData = await createImageData(contrastImage);
        return jsQR(imgData.data, imgData.width, imgData.height, {
          inversionAttempts: "attemptBoth"
        });
      }
    ];

    // Timeout para evitar procesos colgados
    for (let i = 0; i < attempts.length; i++) {
      const attemptStart = Date.now();      
      try {
        // Timeout de 1 segundo por intento
        const code = await Promise.race([
          attempts[i](),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 1000)
          )
        ]);
        
        if (code) {
          return {
            found: true,
            data: code.data,
            processingTime: Date.now() - startTime
          };
        }
      } catch (error) {
        console.warn(`Intento ${i + 1} falló: ${error.message}`);
      }
    }

    return {
      found: false,
      error: 'QR no encontrado',
      processingTime: Date.now() - startTime
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      found: false,
      error: `Error: ${error.message}`
    };
  }
};

// Versión ultra-rápida para casos simples
const quickQRAnalysis = async (imageBuffer) => {
  try {
    const startTime = Date.now();

    // Procesamiento mínimo para casos fáciles
    const { data, info } = await sharp(imageBuffer)
      .resize(600, 600, { fit: 'inside', kernel: sharp.kernel.nearest })
      .greyscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const code = jsQR(new Uint8ClampedArray(data), info.width, info.height, {
      inversionAttempts: "dontInvert" // Más rápido
    });
    
    return code ? {
      found: true,
      data: code.data,
      processingTime: Date.now() - startTime
    } : null;

  } catch (error) {
    return null;
  }
};

// Controlador optimizado con análisis rápido primero
const analizadorQR = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(200).json({err: 'No se recibió imagen'});
    }

    const maxFileSize = 5 * 1024 * 1024;
    if (req.file.buffer.length > maxFileSize) {
      return res.status(200).json({err:'Archivo demasiado grande'});
    }

    const totalStart = Date.now();

    // Intentar análisis rápido primero
    let result = await quickQRAnalysis(req.file.buffer);
    
    // Si el análisis rápido falla, usar el completo
    if (!result) {
      result = await analyzeQRWithSharp(req.file.buffer);
    }

    const totalTime = Date.now() - totalStart;

    if (!result || !result.found) {
      return res.status(200).json({
        err: result?.error || 'QR no detectado',
        processingTime: totalTime
      });
    }

    try {
      const idBolQR = parseInt(result.data);
      
      if (isNaN(idBolQR)) {
        return res.status(200).json({err:'QR no contiene ID válido'});
      }

      // Consulta a DB en paralelo mientras se procesa
      const dbStart = Date.now();
      const boleta = await db.boleta.findUnique({
        where: { id: idBolQR }
      });

      if (!boleta) {
        return res.status(200).json({err: 'Boleta no encontrada'});
      }

      if(boleta.estado !='Pendiente') {
        return res.status(200).json({err: 'Boleta ya finalizada, no puede asignarla.'});
      }

      if (boleta.siloID) {
        return res.status(200).json({err: 'Boleta ya ha sido asignada.'});
      }

      return res.json({ 
        boleta: boleta,
        processingTime: totalTime 
      });

    } catch (err) {
      console.error('Error DB:', err);
      return res.status(200).json({err: 'QR inválido o no del sistema'});
    }
    
  } catch (error) {
    console.error('Error general:', error);
    return res.status(200).json({err: 'Error interno'});
  }
};

/* Sustituto en caso de que falle el QR */

const buscarBoleSinQR = async(req, res) => {
  try {
    const id = req.query.id || null;
    
    if (!id || id==0) return res.status(200).send({err: 'ID no valida, intente denuevo.'})
    
    const boleta = await db.boleta.findUnique({where:{id:parseInt(id)}})

    if (!boleta) return res.status(200).send({err: 'Boleta no encontrada'})
    if (boleta.estado !='Pendiente') return res.status(200).send({err: 'Boleta ya finalizada, no puede asignarla.'})
    if (boleta.siloID) return res.status(200).send({err: 'Boleta ya ha sido asignada.'})
    
    return res.json({ 
      boleta: boleta,
      processingTime: 0, 
    });

  }catch(err){
    console.log(err)
  }
}

const getDataForSelectSilos = async(req, res) => {
  try{
    const data = await db.silos.findMany()
    res.status(200).send(data)
  }catch(err) {
    console.log(err)
  }
}

const updateSiloInBoletas = async(req, res) => {
  try{
    const { silo, silo2, silo3 } = req.body;
    const boletaID = req.params.id;

    const updateSiloBoleta = await db.boleta.update({
      where : {
        id: parseInt(boletaID)
      },
      data: {
        siloID : parseInt(silo),
        silo2 : parseInt(silo2),
        silo3 : parseInt(silo3), 
        fechaTolva: new Date(), 
      }
    })
    res.status(200).send({msg:'¡Boleta ha sido asignada correctamente!'})
  } catch(err) {
    res.status(200).send({err:'Intente denuevo'})
    console.log(err)
  }
}

const getAsignForDay = async(req, res) => {
  try{
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate(); 
    startOfDay = new Date(Date.UTC(year, month, day, 6, 0, 0));
    endOfDay = new Date(Date.UTC(year, month, day + 1, 5, 59, 59, 999));

    const fechaTolva = { gte: startOfDay, lte: endOfDay }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    const where = {
      siloID: { not: null },
      idProducto : {in:[17, 18]},
      fechaTolva, 
    }
    
    const silos = await db.silos.findMany({select:{id: true, nombre:true}})
    const newSilos = Object.fromEntries(silos.map(silo => [silo.id, silo.nombre]));
    const data = await db.boleta.findMany({
      select: {
        id: true,
        socio: true,
        empresa:true,
        motorista: true,
        producto: true,
        origen: true,
        fechaTolva: true, 
        boletasXsilos: {
          select :{
            nombre: true
          }
        },
        silo2: true, 
        silo3: true,
      }, 
      where, 
      orderBy:{
        fechaTolva: 'desc'
      },  
      skip: skip,
      take: limit,
    })

    const totalData = await db.boleta.count({ where, })

    const refactorData = data.map((prev) => {
      const { boletasXsilos, silo2, silo3, ...rest } = prev;
      const siloNombre = [
        boletasXsilos?.nombre,
        newSilos[prev.silo2],
        newSilos[prev.silo3],
      ].filter(Boolean).join(' / ');

      return {
        Silo: siloNombre,
        ...rest,
        fechaTolva: new Date(prev.fechaTolva).toLocaleString(),
      };
    });
    res.status(200).send( {
      data: refactorData, 
      pagination: {
        totalData, 
        totalPages: Math.ceil(totalData / limit),
        currentPage: page,
        limit,
      }
    } )
  }catch(err){
    console.log(err)
  }
}

const getStatsForTolva = async(req, res) =>{
  try{
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate(); 
    startOfDay = new Date(Date.UTC(year, month, day, 6, 0, 0));
    endOfDay = new Date(Date.UTC(year, month, day + 1, 5, 59, 59, 999));

    const fechaTolva = { gte: startOfDay, lte: endOfDay }

    const [total, pendientes, gamericana, gnacional] = await Promise.all([
      db.boleta.count({
        where: {
          siloID:{not: null}, 
          fechaTolva, 
        }
      }), 
      db.boleta.count({
        where: {
          idProducto: {in:[17, 18]}, 
          siloID: null, 
          estado: 'Pendiente',
        }
      }), 
      db.boleta.count({
        where:{
          siloID:{not: null}, 
          idProducto: 18, 
          fechaTolva
        }
      }), 
      db.boleta.count({
        where:{
          siloID:{not: null}, 
          idProducto: 17, 
          fechaTolva
        }
      })
    ])
    res.status(200).send({total, pendientes, gamericana, gnacional})
  }catch(err){
    console.log(err)
  }
}

module.exports = {
  analizadorQR, getDataForSelectSilos, updateSiloInBoletas, getAsignForDay, getStatsForTolva, buscarBoleSinQR
};