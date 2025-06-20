const db = require('../lib/prisma')
const dotenv = require("dotenv");
const {setLogger} = require('../utils/logger');
const jsQR = require('jsqr');
const jimp = require('jimp');
const sharp = require('sharp');
const jwt = require("jsonwebtoken");

const TYPES_OF_STATES = ['PENDIENTE', 'COMPLETO', 'CANCELADO', 'FUERA DE TIEMPO']

const analyzeQRWithSharp = async (imageBuffer) => {
  try {
    if (!imageBuffer || imageBuffer.length === 0) {
      throw new Error('Buffer de imagen vacío');
    }

    const startTime = Date.now();

    // Obtener metadatos una sola vez
    const metadata = await sharp(imageBuffer).metadata();
    
    // Calcular múltiples tamaños objetivo
    let targetWidth = metadata.width;
    let targetHeight = metadata.height;
    
    const maxDimension = 800;
    if (Math.max(targetWidth, targetHeight) > maxDimension) {
      const ratio = maxDimension / Math.max(targetWidth, targetHeight);
      targetWidth = Math.round(targetWidth * ratio);
      targetHeight = Math.round(targetHeight * ratio);
    }

    // Función helper para crear imageData más eficientemente
    const createImageData = async (image) => {
      const { data, info } = await sharp(image)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      return { data: new Uint8ClampedArray(data), width: info.width, height: info.height };
    };

    // Función para aplicar rotación
    const rotateImage = async (image, angle) => {
      return await sharp(image)
        .rotate(angle, { background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .toBuffer();
    };

    // Intentos optimizados y expandidos
    const attempts = [
      // Intento 1: Imagen normal (más probable que funcione)
      async () => {
        const processedImage = await sharp(imageBuffer)
          .resize(targetWidth, targetHeight, { 
            kernel: sharp.kernel.nearest,
            fit: 'fill'
          })
          .greyscale()
          .normalize()
          .png({ compressionLevel: 1 })
          .toBuffer();
        
        const imgData = await createImageData(processedImage);
        return jsQR(imgData.data, imgData.width, imgData.height, {
          inversionAttempts: "attemptBoth"
        });
      },

      // Intento 2: Imagen más pequeña para casos difíciles
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

      // Intento 3: Con contraste aumentado
      async () => {
        const contrastImage = await sharp(imageBuffer)
          .resize(targetWidth, targetHeight, { fit: 'fill' })
          .greyscale()
          .linear(1.5, -40) // Contraste más agresivo
          .toBuffer();
        
        const imgData = await createImageData(contrastImage);
        return jsQR(imgData.data, imgData.width, imgData.height, {
          inversionAttempts: "attemptBoth"
        });
      },

      // Intento 4: Con threshold binario
      async () => {
        const binaryImage = await sharp(imageBuffer)
          .resize(targetWidth, targetHeight, { fit: 'fill' })
          .greyscale()
          .threshold(128) // Convierte a blanco y negro puro
          .toBuffer();
        
        const imgData = await createImageData(binaryImage);
        return jsQR(imgData.data, imgData.width, imgData.height, {
          inversionAttempts: "attemptBoth"
        });
      },

      // Intento 5: Con blur para reducir ruido
      async () => {
        const blurredImage = await sharp(imageBuffer)
          .resize(targetWidth, targetHeight, { fit: 'fill' })
          .greyscale()
          .blur(0.5) // Blur muy ligero para reducir ruido
          .normalize()
          .toBuffer();
        
        const imgData = await createImageData(blurredImage);
        return jsQR(imgData.data, imgData.width, imgData.height, {
          inversionAttempts: "attemptBoth"
        });
      },

      // Intento 6: Imagen más grande para casos con QR pequeños
      async () => {
        const largeImage = await sharp(imageBuffer)
          .resize(1200, 1200, { fit: 'inside', kernel: sharp.kernel.lanczos3 })
          .greyscale()
          .normalize()
          .toBuffer();
        
        const imgData = await createImageData(largeImage);
        return jsQR(imgData.data, imgData.width, imgData.height, {
          inversionAttempts: "attemptBoth"
        });
      },

      // Intento 7: Rotación 90 grados
      async () => {
        const baseImage = await sharp(imageBuffer)
          .resize(targetWidth, targetHeight, { fit: 'fill' })
          .greyscale()
          .normalize()
          .toBuffer();
        
        const rotatedImage = await rotateImage(baseImage, 90);
        const imgData = await createImageData(rotatedImage);
        return jsQR(imgData.data, imgData.width, imgData.height, {
          inversionAttempts: "attemptBoth"
        });
      },

      // Intento 8: Rotación 180 grados
      async () => {
        const baseImage = await sharp(imageBuffer)
          .resize(targetWidth, targetHeight, { fit: 'fill' })
          .greyscale()
          .normalize()
          .toBuffer();
        
        const rotatedImage = await rotateImage(baseImage, 180);
        const imgData = await createImageData(rotatedImage);
        return jsQR(imgData.data, imgData.width, imgData.height, {
          inversionAttempts: "attemptBoth"
        });
      },

      // Intento 9: Rotación 270 grados
      async () => {
        const baseImage = await sharp(imageBuffer)
          .resize(targetWidth, targetHeight, { fit: 'fill' })
          .greyscale()
          .normalize()
          .toBuffer();
        
        const rotatedImage = await rotateImage(baseImage, 270);
        const imgData = await createImageData(rotatedImage);
        return jsQR(imgData.data, imgData.width, imgData.height, {
          inversionAttempts: "attemptBoth"
        });
      },

      // Intento 10: Gamma correction
      async () => {
        const gammaImage = await sharp(imageBuffer)
          .resize(targetWidth, targetHeight, { fit: 'fill' })
          .greyscale()
          .gamma(2.2) // Gamma correction
          .normalize()
          .toBuffer();
        
        const imgData = await createImageData(gammaImage);
        return jsQR(imgData.data, imgData.width, imgData.height, {
          inversionAttempts: "attemptBoth"
        });
      },

      // Intento 11: Sharpening para mejorar bordes
      async () => {
        const sharpImage = await sharp(imageBuffer)
          .resize(targetWidth, targetHeight, { fit: 'fill' })
          .greyscale()
          .sharpen({ sigma: 1, flat: 1, jagged: 2 })
          .normalize()
          .toBuffer();
        
        const imgData = await createImageData(sharpImage);
        return jsQR(imgData.data, imgData.width, imgData.height, {
          inversionAttempts: "attemptBoth"
        });
      },

      // Intento 12: Combinación de técnicas (contraste + threshold)
      async () => {
        const combinedImage = await sharp(imageBuffer)
          .resize(targetWidth, targetHeight, { fit: 'fill' })
          .greyscale()
          .linear(1.3, -20) // Contraste moderado
          .threshold(120) // Threshold más suave
          .toBuffer();
        
        const imgData = await createImageData(combinedImage);
        return jsQR(imgData.data, imgData.width, imgData.height, {
          inversionAttempts: "attemptBoth"
        });
      },

      // Intento 13: Imagen original sin procesar (por si acaso)
      async () => {
        const originalImage = await sharp(imageBuffer)
          .toBuffer();
        
        const imgData = await createImageData(originalImage);
        return jsQR(imgData.data, imgData.width, imgData.height, {
          inversionAttempts: "attemptBoth"
        });
      },

      // Intento 14: Crop central (enfoque en el centro)
      async () => {
        const cropSize = Math.min(targetWidth, targetHeight) * 0.8;
        const croppedImage = await sharp(imageBuffer)
          .resize(targetWidth, targetHeight, { fit: 'fill' })
          .extract({
            left: Math.round((targetWidth - cropSize) / 2),
            top: Math.round((targetHeight - cropSize) / 2),
            width: Math.round(cropSize),
            height: Math.round(cropSize)
          })
          .greyscale()
          .normalize()
          .toBuffer();
        
        const imgData = await createImageData(croppedImage);
        return jsQR(imgData.data, imgData.width, imgData.height, {
          inversionAttempts: "attemptBoth"
        });
      },

      // Intento 15: Filtro de mediana (para reducir ruido tipo sal y pimienta)
      async () => {
        const medianImage = await sharp(imageBuffer)
          .resize(targetWidth, targetHeight, { fit: 'fill' })
          .greyscale()
          .median(3) // Filtro de mediana
          .normalize()
          .toBuffer();
        
        const imgData = await createImageData(medianImage);
        return jsQR(imgData.data, imgData.width, imgData.height, {
          inversionAttempts: "attemptBoth"
        });
      }
    ];

    // Ejecutar intentos con timeout más largo para dar tiempo a las rotaciones
    for (let i = 0; i < attempts.length; i++) {
      const attemptStart = Date.now();      
      try {
        console.log(`Ejecutando intento ${i + 1}/${attempts.length}`);
        
        // Timeout de 2 segundos por intento (más tiempo para rotaciones)
        const code = await Promise.race([
          attempts[i](),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 2000)
          )
        ]);
        
        if (code) {
          console.log(`¡QR encontrado en intento ${i + 1}! Tiempo: ${Date.now() - attemptStart}ms`);
          return {
            found: true,
            data: code.data,
            processingTime: Date.now() - startTime,
            attemptUsed: i + 1
          };
        }
      } catch (error) {
        console.warn(`Intento ${i + 1} falló: ${error.message} (${Date.now() - attemptStart}ms)`);
      }
    }

    return {
      found: false,
      error: 'QR no encontrado después de 15 intentos',
      processingTime: Date.now() - startTime,
      attemptsUsed: attempts.length
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
    
    // Si el análisis rápido falla, usar el completo con más intentos
    if (!result) {
      console.log('Análisis rápido falló, iniciando análisis completo...');
      result = await analyzeQRWithSharp(req.file.buffer);
    }

    const totalTime = Date.now() - totalStart;

    if (!result || !result.found) {
      return res.status(200).json({
        err: result?.error || 'QR no detectado',
        processingTime: totalTime,
        attemptsUsed: result?.attemptsUsed || 0
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

      const tolva = await db.tolva.count({where:{idBoleta:parseInt(idBolQR)}})

      const token = req.header('Authorization');
    
      if (!token) return res.status(401).send({ error: 'Token no proporcionado' });
      const verificado = jwt.verify(token, process.env.SECRET_KEY);
      
      const usuario = await db.usuarios.findUnique({
        select: {
          name: true,
          UsuariosPorTolva: {
            select: { tolva: true }
          }
        },
        where: { usuarios: verificado["usuarios"] }
      });

      if (!boleta) {
        return res.status(200).json({err: 'Boleta no encontrada'});
      }

      if(boleta.estado !='Pendiente') {
        return res.status(200).json({err: 'Boleta ya finalizada, no puede asignarla.'});
      }
          
      if (boleta.idProducto !=17 && boleta.idProducto!=18) return res.status(200).send({err: 'Favor, ingresar boletas proporcionadas por su ticket'})
      if (boleta.tolvaAsignada!=usuario.UsuariosPorTolva.tolva) return res.status(200).send({err: 'Boleta, no esta asignada a su tolva, favor enviar a la tolva correcta'})
      if (tolva!=0) return res.status(200).send({err: 'Boleta ya ha sido asignada'})

      return res.json({ 
        boleta: boleta,
        processingTime: totalTime,
        attemptUsed: result.attemptUsed || 'quick'
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
/**
 * Faltan agregar validacion de la tolva de los recibos
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const buscarBoleSinQR = async(req, res) => {
  try {
    const id = req.query.id || null;
    const token = req.header('Authorization');
    
    if (!token) return res.status(401).send({ error: 'Token no proporcionado' });
    const verificado = jwt.verify(token, process.env.SECRET_KEY);
    
    const usuario = await db.usuarios.findUnique({
      select: {
        name: true,
        UsuariosPorTolva: {
          select: { tolva: true }
        }
      },
      where: { usuarios: verificado["usuarios"] }
    });

    if (!id || id==0) return res.status(200).send({err: 'ID no valida, intente denuevo.'})
    
    const boleta = await db.boleta.findUnique({where:{id:parseInt(id)}})
    const tolva = await db.tolva.count({where:{idBoleta:parseInt(id)}})

    if (!boleta) return res.status(200).send({err: 'Boleta no encontrada'})
    if (boleta.estado !='Pendiente') return res.status(200).send({err: 'Boleta ya finalizada, no puede asignarla.'})
    if (boleta.idProducto !=17 && boleta.idProducto!=18) return res.status(200).send({err: 'Favor, ingresar boletas proporcionadas por su ticket'})

    if (boleta.tolvaAsignada!=usuario.UsuariosPorTolva.tolva) return res.status(200).send({err: 'Boleta, no esta asignada a su tolva, favor enviar a la tolva correcta'})
    if (tolva!=0) return res.status(200).send({err: 'Boleta ya ha sido asignada'})
    
      /* Falta Validacion */
    return res.json({ 
      boleta: boleta,
      processingTime: 0, 
    });

  }catch(err){
    console.log(err)
  }
}

/**
 * CORRECTA LISTA PARA PRODUCCION
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const getDataForSelectSilos = async (req, res) => {
  try {
    const token = req.header('Authorization');
    if (!token) return res.status(401).send({ error: 'Token no proporcionado' });

    const verificado = jwt.verify(token, process.env.SECRET_KEY);
    
    const usuario = await db.usuarios.findUnique({
      select: {
        name: true,
        UsuariosPorTolva: {
          select: { tolva: true }
        }
      },
      where: { usuarios: verificado["usuarios"] }
    });

    if (!usuario || !usuario.UsuariosPorTolva) {
      return res.status(201).send({ error: 'Usuario o configuración de tolva no encontrada' });
    }

    const tolva = usuario.UsuariosPorTolva.tolva;
    const filtros = {
      1: [1, 3],
      2: [2, 3]
    };

    const silos = await db.silos.findMany({
      where: {
        nivelTolvaPermitida: {
          in: filtros[tolva] || filtros[2]
        }
      }
    });

    res.status(200).send(silos);
  } catch (err) {
    console.error('Error al obtener silos:', err);
    res.status(500).send({ error: 'Error interno del servidor' });
  }
};

/**
 * CORRECTA, LISTA PARA PRODUCCION
 * @param {*} req 
 * @param {*} res 
 */
const getListUsersForTolva = async(req, res) =>{
  try{
    const verificado = jwt.verify(req.header('Authorization'), process.env.SECRET_KEY);
    const usuario = await db.usuarios.findUnique({
      select:{
        name: true, 
        UsuariosPorTolva: true,
      },
      where: {
        usuarios: verificado["usuarios"],
      },
    });
    res.json(usuario)
  }catch(err){
    console.log(err)
  }
}

/**
 * COMPLETO LISTO PARA PRODUCION
 * @param {*} req 
 * @param {*} res 
 */
const postSiloInBoletas = async(req, res) => {
  try{
    const { silo, silo2, silo3, tolvaDescarga } = req.body;
    const boletaID = req.params.id;

    const token = req.header('Authorization');
    
    if (!token) return res.status(401).send({ error: 'Token no proporcionado' });
    const verificado = jwt.verify(token, process.env.SECRET_KEY);
    
    const usuario = await db.usuarios.findUnique({
      select: {
        id:true, 
        name: true,
        UsuariosPorTolva: {
          select: { tolva: true }
        }
      },
      where: { usuarios: verificado["usuarios"] }
    });

    const isEmptyTolva = await db.tolva.count({
      where: {
        tolvaDescarga: {
          contains: `T${usuario.UsuariosPorTolva.tolva}-${tolvaDescarga}`
        },
        estado: 0,
      }
    });

    if (isEmptyTolva !== 0) {
      return res.status(200).send({ err: 'Tolva de descarga actualmente en uso, finalice proceso' });
    }

    const updateSiloBoleta = await db.tolva.create({
      data: {
        idBoleta: parseInt(boletaID), 
        fechaEntrada: new Date(), 
        idUsuarioTolva: usuario.id, 
        usuarioTolva: usuario.name, 
        siloPrincipal: parseInt(silo), 
        siloSecundario: parseInt(silo2)|| null, 
        SiloTerciario: parseInt(silo3) || null, 
        estado: 0, 
        tolvaDescarga: `T${usuario.UsuariosPorTolva.tolva}-${tolvaDescarga}`
      }
    })
    return res.status(200).send({msg:'¡Boleta ha sido asignada correctamente!'})
  } catch(err) {
    console.log(err)
    res.status(200).send({err:'Intente denuevo'})
  }
}

const updateFinalizarDescarga = async(req, res)=>{
  try{
    const id = req.params.id;

    const token = req.header('Authorization');
    
    if (!token) return res.status(401).send({ error: 'Token no proporcionado' });
    const verificado = jwt.verify(token, process.env.SECRET_KEY);
    
    const usuario = await db.usuarios.findUnique({
      select: {
        id:true, 
        name: true,
        UsuariosPorTolva: {
          select: { tolva: true }
        }
      },
      where: { usuarios: verificado["usuarios"] }
    });

    const updateFinalizarDescarga = await db.tolva.update({
      data:{
        fechaSalida: new Date(), 
        estado: 1, 
        idUsuarioDeCierre: usuario.id, 
        usuarioDeCierre: usuario.name
      }, 
      where:{
        id: parseInt(id)
      }
    })

    return res.status(200).send({msg:'Finalizada correctamente'})
  }catch(err){
    console.log(err)
  }
}

const getTolvasDeDescargasOcupadas = async(req, res) => {
  try{
    const token = req.header('Authorization');
    
    if (!token) return res.status(401).send({ error: 'Token no proporcionado' });
    const verificado = jwt.verify(token, process.env.SECRET_KEY);
    
    const usuario = await db.usuarios.findUnique({
      select: {
        id:true, 
        name: true,
        UsuariosPorTolva: {
          select: { tolva: true }
        }
      },
      where: { usuarios: verificado["usuarios"] }
    });

    const tolva = usuario?.UsuariosPorTolva?.tolva;
    if (!tolva) return res.status(404).json({ error: 'Tolva no asignada al usuario' });

    const [descarga1, descarga2] = await Promise.all(
      [1, 2].map(num =>
        db.tolva.findMany({
          select: {
            id:true, 
            idBoleta: true, 
            fechaEntrada: true, 
            usuarioTolva:true, 
            tolvaDescarga:true,
            estado: true,
            boleta: {
              select:{
                socio:true, 
                placa:true, 
                motorista:true, 
                origen: true, 
              }
            },
            principal: {
              select: {nombre:true,}
            },
            secundario: {
              select:{nombre:true}
            },
            terciario:{
              select:{nombre:true}
            }, 
          },
          where: {
            tolvaDescarga: { contains: `T${tolva}-${num}` },
            estado: 0
          }
        })
      )
    );
    
    res.status(200).send({descarga1, descarga2})

  }catch(err){
    console.log(err)
  }
}

/**
 * CONTROLADOR LISTO PARA PRODUCCION
 * @param {*} req 
 * @param {*} res 
 */
const getAsignForDay = async(req, res) => {
  try{
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate(); 
    startOfDay = new Date(Date.UTC(year, month, day, 6, 0, 0));
    endOfDay = new Date(Date.UTC(year, month, day + 1, 5, 59, 59, 999));

    const fechaSalida = { gte: startOfDay, lte: endOfDay }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    const where = {
      estado: {in:[1, 2, 3]},
      fechaSalida, 
    }
    
    const data = await db.tolva.findMany({
      select: {
        id:true, 
        idBoleta: true, 
        fechaSalida: true,
        fechaEntrada: true,  
        usuarioDeCierre: true, 
        tolvaDescarga:true,
        estado: true,
        boleta: {
          select:{
            socio:true, 
            placa:true, 
            motorista:true, 
            origen: true, 
          }
        },
        principal: {
          select: {nombre:true,}
        },
        secundario: {
          select:{nombre:true}
        },
        terciario:{
          select:{nombre:true}
        }, 
      }, 
      where, 
      orderBy:{
        fechaSalida: 'desc'
      },  
      skip: skip,
      take: limit,
    })

    const totalData = await db.tolva.count({ where, })

    const refactorData = data.map((prev) => {
      const { boleta, principal, secundario, terciario, fechaEntrada,fechaSalida,idBoleta,estado,id,...rest } = prev;
      const siloNombre = [principal?.nombre, secundario?.nombre, terciario?.nombre].filter(Boolean).join(' / ');
      const TIEMPOPROCESO = prev.fechaSalida - prev.fechaEntrada;
      const totalSegundos = Math.floor(TIEMPOPROCESO / 1000);
      const horas = Math.floor(totalSegundos / 3600);
      const minutos = Math.floor((totalSegundos % 3600) / 60);
      const segundos = totalSegundos % 60;
      const TIEMPOESTADIA = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;

      return {
        Silo: siloNombre,
        boleta: prev.idBoleta, 
        Socio: boleta.socio, 
        Origen: boleta.origen,
        Placa: boleta.placa,
        Estado: TYPES_OF_STATES[prev.estado],  
        Motorista: boleta.motorista, 
        ...rest,
        TIEMPOS: TIEMPOESTADIA,
      };
    });
    res.status(200).send( {
      data: refactorData, 
      pagination: {
        totalData: totalData, 
        totalPages: Math.ceil(totalData / limit),
        currentPage: page,
        limit,
      }
    } )
  }catch(err){
    console.log(err)
  }
}

/**
 * ! ERROR ARREGLAR
 */
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
      0, 
      0, 
      0, 
      0
    ])
    res.status(200).send({total, pendientes, gamericana, gnacional})
  }catch(err){
    console.log(err)
  }
}

module.exports = {
  analizadorQR, 
  getDataForSelectSilos, 
  postSiloInBoletas, 
  getAsignForDay, 
  getStatsForTolva, 
  buscarBoleSinQR, 
  getListUsersForTolva, 
  getTolvasDeDescargasOcupadas, 
  updateFinalizarDescarga
};