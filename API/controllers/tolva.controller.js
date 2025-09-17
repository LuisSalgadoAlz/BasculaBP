const db = require('../lib/prisma')
const dotenv = require("dotenv");
const {setLogger} = require('../utils/logger');
const jsQR = require('jsqr');
const jimp = require('jimp');
const sharp = require('sharp');
const jwt = require("jsonwebtoken");
const enviarCorreo = require("../utils/enviarCorreo");
const { alertaMarchamosDiferentes } = require('../utils/cuerposCorreo');
const { formatNumber } = require('../lib/formatNumber');

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

/*       // Intento 13: Imagen original sin procesar (por si acaso)
      async () => {
        const originalImage = await sharp(imageBuffer)
          .toBuffer();
        
        const imgData = await createImageData(originalImage);
        return jsQR(imgData.data, imgData.width, imgData.height, {
          inversionAttempts: "attemptBoth"
        });
      }, */

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
          
      if (boleta.idMovimiento!==2 && (boleta.idMovimiento!==14 && boleta.idProducto!==17)) return res.status(200).send({err: 'Favor, ingresar boletas proporcionadas por su ticket'})
      if (boleta.tolvaAsignada!=usuario.UsuariosPorTolva.tolva) return res.status(200).send({err: 'Boleta, no esta asignada a su tolva, favor enviar a la tolva correcta'})
      if (tolva!=0) return res.status(200).send({err: 'Boleta ya ha sido asignada'})
      
      setLogger('TOLVA', 'BUSQUEDA CON QR', req, null, 1, idBolQR)  
      
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
    setLogger('TOLVA', 'BUSQUEDA CON QR', req, null, 3)  
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
    if (boleta.idMovimiento!==2 && (boleta.idMovimiento!==14 && boleta.idProducto!==17)) return res.status(200).send({err: 'Favor, ingresar boletas proporcionadas por su ticket'})

    if (boleta.tolvaAsignada!=usuario.UsuariosPorTolva.tolva) return res.status(200).send({err: 'Boleta, no esta asignada a su tolva, favor enviar a la tolva correcta'})
    if (tolva!=0) return res.status(200).send({err: 'Boleta ya ha sido asignada'})
    

    setLogger('TOLVA', 'BUSQUEDA SIN QR', req, null, 1, parseInt(id))  

      /* Falta Validacion */
    return res.json({ 
      boleta: boleta,
      processingTime: 0, 
    });

  }catch(err){
    setLogger('TOLVA', 'BUSQUEDA SIN QR', req, null, 3)  
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
    setLogger('SILOS', 'ERROR AL OBTENER SILOS', req, null, 3)  
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
    setLogger('TOLVA', 'ERROR AL OBTENER USUARIOS', req, null, 3)  
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
    const { silo, silo2, silo3, tolvaDescarga, sello1, sello2, sello3, sello4, sello5, sello6 } = req.body;
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

    const [isEmptyTolva, boleta] = await Promise.all([
      db.tolva.count({
        where: {
          tolvaDescarga: {
            contains: `T${usuario.UsuariosPorTolva.tolva}-${tolvaDescarga}`
          },
          estado: 0,
        }
      }),
      db.boleta.findUnique({
        select: {
          socio:true, empresa: true, placa: true, motorista: true, producto: true, tolvaAsignada: true, sello1: true, sello2:true, sello3:true, sello4: true, sello5: true, sello6: true,
        },
        where:{id:parseInt(boletaID)}
      })
    ])

    const arrTolva = [sello1, sello2, sello3, sello4, sello5, sello6].filter(Boolean); 
    /* Autorizado por Javier y Salomon dia: 18/9/2025 a las 3PM */
    if ((arrTolva.length < 3 && boleta.idMovimiento===2)) return res.status(200).send({ err: 'Minimo de marchamos 3.' });
    const arrBoleta = [boleta.sello1, boleta.sello2, boleta.sello3, boleta.sello4, boleta.sello5, boleta.sello6].filter(Boolean);

    const arraysIguales = (a, b) => {
        if (a.length !== b.length) return false;
        const sortedA = [...a].sort();
        const sortedB = [...b].sort();
        return sortedA.every((val, index) => val === sortedB[index]);
    };

    const enviarAlerta = !arraysIguales(arrTolva, arrBoleta);
    
    if(enviarAlerta) {
        setLogger('TOLVA', 'MARCHAMOS NO COINCIDEN CON BÁSCULA', req, null, 3);
        alertaMarchamosDiferentes(boleta, usuario, enviarCorreo, arrBoleta, arrTolva, tolvaDescarga);
    }

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
        tolvaDescarga: `T${usuario.UsuariosPorTolva.tolva}-${tolvaDescarga}`,
        Sello1: sello1 || null, 
        Sello2: sello2 || null, 
        Sello3: sello3 || null, 
        Sello4: sello4 || null, 
        Sello5: sello5 || null, 
        Sello6: sello6 || null, 
      }
    })
    setLogger('TOLVA', 'ASIGNO BOLETA A SILO, Y COMENZO A DESCARGAR', req, null, 1, updateSiloBoleta.id)  
    return res.status(200).send({msg:'¡Boleta ha sido asignada correctamente!'})
  } catch(err) {
    console.log(err)
    setLogger('TOLVA', 'ASIGNO BOLETA A SILO, Y NO PUDO COMENZO A DESCARGAR', req, null, 3)  
    res.status(200).send({err:'Intente denuevo'})
  }
}

const updateFinalizarDescarga = async(req, res)=>{
  try{
    const id = req.params.id;
    const { motivo } = req.body

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
        usuarioDeCierre: usuario.name, 
        ...(motivo ? { observacionTiempo: motivo } : {})
      }, 
      where:{
        id: parseInt(id)
      }
    })
    setLogger('TOLVA', 'FINALIZO LA DESCARGA EN TOLVA', req, null, 1, updateFinalizarDescarga.id)  
    return res.status(200).send({msg:'Finalizada correctamente'})
  }catch(err){
    setLogger('TOLVA', 'FINALIZO LA DESCARGA EN TOLVA', req, null, 3)  
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
    setLogger('TOLVA', 'OBTENER EL ESTADO DE LAS TOLVAS DE DESCARGA', req, null, 3)  
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
    setLogger('TOLVA', 'OBTENER LOS DATOS DE CAMIONES DESCARGADOS EN TOLVA', req, null, 3)  
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

    const fechaSalida = { gte: startOfDay, lte: endOfDay }

    const [total, pendientes, gamericana, gnacional] = await Promise.all([
      db.tolva.count({
        where:{
          estado: 1, 
          fechaSalida, 
        }
      }), 
      db.boleta.count({
        where:{
          estado: 'Pendiente', 
          tolva : {
            none:{}
          },
          OR:[
            {
              idProducto: 18,
              idMovimiento: 2, 
            },
            {
              idProducto: 17, 
              idMovimiento: 1, 
            }
          ]
        }
      }), 
      db.tolva.count({
        where:{
          estado: 1,
          fechaSalida,  
          boleta:{
            idProducto: {in:[18]}
          }
        }
      }), 
      db.tolva.count({
        where:{
          estado: 1,
          fechaSalida, 
          boleta:{
            idProducto: {in:[17]}
          }
        }
      })
    ])
    res.status(200).send({total, pendientes, gamericana, gnacional})
  }catch(err){
    setLogger('TOLVA', 'OBTENER ESTADISTICAS DE LA TOLVA', req, null, 3)  
    console.log(err)
  }
}

const getInfoAllSilos = async (req, res) => {
  try {
    const { idSocio } = req.query; 
    
    // Validar idSocio si se proporciona
    if (idSocio && (isNaN(parseInt(idSocio)) || parseInt(idSocio) <= 0)) {
      return res.status(400).json({
        success: false,
        message: 'El parámetro idSocio debe ser un número válido mayor que 0'
      });
    }
    
    result = await db.$queryRaw`
      SELECT 
          s.nombre as silo_nombre,
          s.capacidad,
          COALESCE(SUM(peso_calculado.peso_silo), 0) as peso_total,
          CASE 
              WHEN s.capacidad > 0 THEN 
                  ROUND((COALESCE(SUM(peso_calculado.peso_silo), 0) / s.capacidad) * 100, 2)
              ELSE NULL 
          END as porcentaje_ocupacion,
          -- Agregar las IDs de boleta concatenadas
          STRING_AGG(CAST(peso_calculado.id_boleta AS VARCHAR), ', ') as [IDs_Boletas]
      FROM Silos s
      LEFT JOIN (
          -- Subconsulta que combina todos los silos en una sola pasada
          SELECT DISTINCT  -- Agregar DISTINCT aquí
              silo_data.silo_id,
              silo_data.peso_silo,
              silo_data.id_boleta
          FROM (
              -- Silo Principal
              SELECT DISTINCT  -- Agregar DISTINCT aquí también
                  b.numBoleta,
                  b.id as id_boleta,
                  s1.id as silo_id,
                  CASE 
                      WHEN t.siloTerciario IS NOT NULL THEN b.pesoNeto/300.0
                      WHEN t.siloSecundario IS NOT NULL THEN b.pesoNeto/200.0
                      ELSE b.pesoNeto/100.0
                  END as peso_silo
              FROM Boleta b
              INNER JOIN tolva t ON b.id = t.idBoleta
              INNER JOIN Silos s1 ON t.siloPrincipal = s1.id
              
              UNION ALL
              
              -- Silo Secundario
              SELECT DISTINCT  -- Agregar DISTINCT aquí también
                  b.numBoleta,
                  b.id as id_boleta,
                  s2.id as silo_id,
                  CASE 
                      WHEN t.siloTerciario IS NOT NULL THEN b.pesoNeto/300.0
                      ELSE b.pesoNeto/200.0
                  END as peso_silo
              FROM Boleta b
              INNER JOIN tolva t ON b.id = t.idBoleta
              INNER JOIN Silos s2 ON t.siloSecundario = s2.id
              
              UNION ALL
              
              -- Silo Terciario
              SELECT DISTINCT  -- Agregar DISTINCT aquí también
                  b.numBoleta,
                  b.id as id_boleta,
                  s3.id as silo_id,
                  b.pesoNeto/300.0 as peso_silo
              FROM Boleta b
              INNER JOIN tolva t ON b.id = t.idBoleta
              INNER JOIN Silos s3 ON t.siloTerciario = s3.id
          ) silo_data
          LEFT JOIN (
              SELECT 
                  SiloId,
                  MAX(numBoleta) as ultimoReset
              FROM ResetSilos
              GROUP BY SiloId
          ) rs ON silo_data.silo_id = rs.SiloId
          WHERE rs.SiloId IS NULL OR silo_data.numBoleta > rs.ultimoReset
      ) peso_calculado ON s.id = peso_calculado.silo_id
      GROUP BY s.id, s.nombre, s.capacidad
      ORDER BY s.id;
    `;

    // Convertir los resultados a un formato más amigable para JavaScript
    const formattedResult = result.map(row => ({
      silo_nombre: row.silo_nombre,
      capacidad: Number(row.capacidad),
      peso_total: Number(row.peso_total),
      porcentaje_ocupacion: row.porcentaje_ocupacion ? Number(row.porcentaje_ocupacion) : 0,
      boletas: row.IDs_Boletas ? row.IDs_Boletas.split(', ').map(id => parseInt(id)) : []
    }));

    const formattedResultBar2 = result.map(row => ({
      silo_nombre: row.silo_nombre,
      capacidad: 100,
      capacidadNeta: row.capacidad,
      peso_total: row.porcentaje_ocupacion ? Number(row.porcentaje_ocupacion) > 100 ? 100 : Number(row.porcentaje_ocupacion) : 0,
      peso_total_neto: Number(row.peso_total),
      porcentaje_ocupacion: row.porcentaje_ocupacion ? Number(row.porcentaje_ocupacion) : 0, 
      boletas: row.IDs_Boletas ? row.IDs_Boletas.split(', ').map(id => parseInt(id)) : []
    }));

    res.status(200).json({
      success: true,
      data: formattedResult,
      data2: formattedResultBar2,
      total: formattedResult.length
    });

  } catch (error) {
    console.error('Error en getInfoAllSilos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'production' ? 'Error en la consulta' : error.message
    });
  }
};

const postGetallInfoDetailsSilos = async(req, res) => {   
  try {     
    const { boletas } = req.body;      

    const getBoletas = await db.boleta.findMany({       
      select: {         
        numBoleta: true,         
        placa: true,         
        socio: true,          
        empresa: true,          
        pesoNeto: true,         
        tolvaAsignada: true,         
        producto: true,          
        factura: true,           
        tolva: {           
          select: {             
            fechaEntrada: true,              
            fechaSalida: true,             
            siloPrincipal: true,              
            siloSecundario: true,              
            SiloTerciario: true,              
          }         
        }         
      },       
      where: {         
        id: {           
          in: boletas         
        }       
      }     
    });
    
    let accPeso = 0;     
    const refactor = getBoletas.map((item, index) => {       
      // Calcular duración de tolva       
      let duracionTolva = 'En proceso...';              
      
      if (item.tolva[0]?.fechaEntrada && item.tolva[0]?.fechaSalida) {         
        const entrada = new Date(item.tolva[0].fechaEntrada);         
        const salida = new Date(item.tolva[0].fechaSalida);         
        const diferencia = salida - entrada;                  
        
        // Convertir a horas y minutos         
        const horas = Math.floor(diferencia / (1000 * 60 * 60));         
        const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));                  
        
        duracionTolva = `${horas}h ${minutos}m`;       
      }        

      // Verificar si hay peso neto
      let pesoDistribuido = 0;
      
      if (item.pesoNeto) {
        // Verificar qué silos existen (el principal siempre debe existir)
        const tienePrincipal = item.tolva[0]?.siloPrincipal;
        const tieneSecundario = item.tolva[0]?.siloSecundario;
        const tieneTerciario = item.tolva[0]?.SiloTerciario;
        
        // Lógica de división según los silos disponibles
        if (tienePrincipal && tieneSecundario && tieneTerciario) {
          // Los 3 silos: dividir entre 300
          pesoDistribuido = (item.pesoNeto / 300).toFixed(2);
        } else if (tienePrincipal && tieneSecundario) {
          // Solo principal y secundario: dividir entre 200
          pesoDistribuido = (item.pesoNeto / 200).toFixed(2);
        } else if (tienePrincipal) {
          // Solo principal: dividir entre 100
          pesoDistribuido = (item.pesoNeto / 100).toFixed(2);
        } else {
          // No hay silos (caso extraño): peso 0
          pesoDistribuido = 0;
        }
      }
      
      accPeso += parseFloat(pesoDistribuido);                             

      return {         
        '#': index+1, 
        numBoleta: item.numBoleta || 'En proceso...',         
        placa: item.placa,         
        socio: `${item.socio} ${item.factura ? `- ${item.factura}` : '- Sin Factura'}`,
        fechaIngresoTolva: new Date(item.tolva[0]?.fechaEntrada).toLocaleString(),          
        empresa: item.empresa,         
        producto: item.producto,         
        tolva: item.tolvaAsignada,         
        pesoNeto: `${pesoDistribuido} QQ`,         
        pesoAcumulado: `${accPeso.toFixed(2)} QQ`,         
        duracion: duracionTolva       
      };     
    });      

    return res.status(200).send({ data: refactor });   
  } catch (err) {     
    console.log(err);     
    return res.status(500).send({ error: 'Error interno del servidor' });   
  } 
};

const postResetSilo = async (req, res) => {
  try{
    const { silo } = req.body;
  
    const [ultimo, siloID] = await Promise.all([
      db.boleta.findFirst({
        orderBy: { numBoleta: 'desc' },
        select: { numBoleta: true },
      }), 
      db.Silos.findFirst({
        where: {
          nombre: silo
        },
        select: {
          id: true
        }
      })
    ])

    const newReset = await db.ResetSilos.create({
      data: {
        siloId: siloID.id,
        numBoleta: ultimo.numBoleta, 
      }
    })
  
    return res.status(200).send({msg: `Se ha creado un nuevo reset - ${silo}`})  
  }catch(err){
    console.log(err)
  }
  
}

const getStatsBuquesAndAll = async (req, res) => {
  try {
    const buque = req.query.buque || null;
    const factura = req.query.factura || null;

    if (factura !== null && (isNaN(factura) || factura === '')) {
      return res.status(400).json({ error: 'El parámetro factura debe ser un número válido.' });
    }

    if (buque !== null && (isNaN(buque) || buque === '')) {
      return res.status(400).json({ error: 'El parámetro buque debe ser un número válido.' });
    }

    const buqueId = buque ? parseInt(buque) : null;

    const [cantidadBoletasPorTolva, resultado, tiemposRaw, tiempoPerdidoTotal] = await Promise.all([
      // Consulta 1: Cantidad de boletas por tolva
      db.boleta.groupBy({
        by: ['tolvaAsignada'],
        _count: { tolvaAsignada: true },
        _sum: { pesoNeto: true },
        where: {
          tolvaAsignada: {
            not: null
          },
          ...(buqueId ? { idSocio: buqueId } : {}), 
          ...(factura ? { factura: factura } : {})
        }
      }),

      // Consulta 2: Resultado principal por usuario
      buqueId && factura 
        ? db.$queryRaw`
            SELECT 
              t.usuarioTolva,
              COUNT(DISTINCT t.idBoleta) as totalUnicos,
              SUM(b.pesoNeto) as pesoNetoTotal,
              CONCAT(
                  CAST(AVG(DATEDIFF(MINUTE, t.fechaEntrada, t.fechaSalida)) / 60 AS VARCHAR), ' horas, ',
                  CAST(AVG(DATEDIFF(MINUTE, t.fechaEntrada, t.fechaSalida)) % 60 AS VARCHAR), ' minutos'
              ) as tiempoPromedio
            FROM Boleta b
            INNER JOIN Tolva t ON b.id = t.idBoleta
            WHERE b.idSocio = ${buqueId} and b.factura = ${factura} and b.estado not in ('Cancelada', 'Pendiente')
            GROUP BY t.usuarioTolva
          `
        : db.$queryRaw`
            SELECT 
                t.usuarioTolva,
                COUNT(DISTINCT t.idBoleta) as totalUnicos,
                SUM(b.pesoNeto) as pesoNetoTotal,
                CONCAT(
                    CAST(AVG(DATEDIFF(MINUTE, t.fechaEntrada, t.fechaSalida)) / 60 AS VARCHAR), ' horas, ',
                    CAST(AVG(DATEDIFF(MINUTE, t.fechaEntrada, t.fechaSalida)) % 60 AS VARCHAR), ' minutos'
                ) as tiempoPromedio
            FROM Boleta b
            INNER JOIN Tolva t ON b.id = t.idBoleta
            WHERE b.estado NOT IN ('Cancelada', 'Pendiente')
            GROUP BY t.usuarioTolva
          `,

      // Consulta 3: Tiempos por tolva
      buqueId && factura
        ? db.$queryRaw`
            SELECT 
              CAST(AVG(DATEDIFF(MINUTE, t.fechaEntrada, t.fechaSalida)) / 60 AS VARCHAR) 
                + 'h ' + 
              CAST(AVG(DATEDIFF(MINUTE, t.fechaEntrada, t.fechaSalida)) % 60 AS VARCHAR) 
                + 'm' AS PromedioTiempo, 
              b.tolvaAsignada,
              SUM(b.pesoNeto) as pesoNetoTotal
            FROM Boleta AS b
            INNER JOIN Tolva AS t ON b.id = t.idBoleta
            WHERE b.idSocio = ${buqueId} and b.factura = ${factura} and b.estado not in ('Cancelada', 'Pendiente')
            GROUP BY b.tolvaAsignada
          `
        : db.$queryRaw`
            SELECT 
              CAST(AVG(DATEDIFF(MINUTE, t.fechaEntrada, t.fechaSalida)) / 60 AS VARCHAR) 
                + 'h ' + 
              CAST(AVG(DATEDIFF(MINUTE, t.fechaEntrada, t.fechaSalida)) % 60 AS VARCHAR) 
                + 'm' AS PromedioTiempo, 
              b.tolvaAsignada,
              SUM(b.pesoNeto) as pesoNetoTotal
            FROM Boleta AS b
            INNER JOIN Tolva AS t ON b.id = t.idBoleta
            WHERE b.estado not in ('Cancelada', 'Pendiente')
            GROUP BY b.tolvaAsignada
          `,

      // Consulta 4: Tiempo perdido total por tolva
      buqueId && factura
        ? db.$queryRaw`
            SELECT 
              b.tolvaAsignada, 
              CAST(SUM(CASE 
                           WHEN (DATEDIFF(MINUTE, t.fechaEntrada, t.fechaSalida) - 
                                 CASE 
                                     WHEN b.tolvaAsignada = 1 THEN 50
                                     WHEN b.tolvaAsignada = 2 THEN 40
                                     ELSE 0
                                 END) < 0 THEN 0
                           ELSE (DATEDIFF(MINUTE, t.fechaEntrada, t.fechaSalida) - 
                                 CASE 
                                     WHEN b.tolvaAsignada = 1 THEN 50
                                     WHEN b.tolvaAsignada = 2 THEN 40
                                     ELSE 0
                                 END)
                       END) / 60 AS VARCHAR)
              + ' h ' + 
              CAST(SUM(CASE 
                           WHEN (DATEDIFF(MINUTE, t.fechaEntrada, t.fechaSalida) - 
                                 CASE 
                                     WHEN b.tolvaAsignada = 1 THEN 50
                                     WHEN b.tolvaAsignada = 2 THEN 40
                                     ELSE 0
                                 END) < 0 THEN 0
                           ELSE (DATEDIFF(MINUTE, t.fechaEntrada, t.fechaSalida) - 
                                 CASE 
                                     WHEN b.tolvaAsignada = 1 THEN 50
                                     WHEN b.tolvaAsignada = 2 THEN 40
                                     ELSE 0
                                 END)
                       END) % 60 AS VARCHAR)
              + ' m' AS tiempo_perdido_total
            FROM Boleta b 
            INNER JOIN Tolva t ON b.id = t.idBoleta
            WHERE b.idSocio = ${buqueId} and b.factura = ${factura} and b.estado not in ('Cancelada', 'Pendiente')
            GROUP BY b.tolvaAsignada
          `
        : db.$queryRaw`
            SELECT 
              b.tolvaAsignada, 
              CAST(SUM(CASE 
                           WHEN (DATEDIFF(MINUTE, t.fechaEntrada, t.fechaSalida) - 
                                 CASE 
                                     WHEN b.tolvaAsignada = 1 THEN 50
                                     WHEN b.tolvaAsignada = 2 THEN 40
                                     ELSE 0
                                 END) < 0 THEN 0
                           ELSE (DATEDIFF(MINUTE, t.fechaEntrada, t.fechaSalida) - 
                                 CASE 
                                     WHEN b.tolvaAsignada = 1 THEN 50
                                     WHEN b.tolvaAsignada = 2 THEN 40
                                     ELSE 0
                                 END)
                       END) / 60 AS VARCHAR)
              + ' h ' + 
              CAST(SUM(CASE 
                           WHEN (DATEDIFF(MINUTE, t.fechaEntrada, t.fechaSalida) - 
                                 CASE 
                                     WHEN b.tolvaAsignada = 1 THEN 50
                                     WHEN b.tolvaAsignada = 2 THEN 40
                                     ELSE 0
                                 END) < 0 THEN 0
                           ELSE (DATEDIFF(MINUTE, t.fechaEntrada, t.fechaSalida) - 
                                 CASE 
                                     WHEN b.tolvaAsignada = 1 THEN 50
                                     WHEN b.tolvaAsignada = 2 THEN 40
                                     ELSE 0
                                 END)
                       END) % 60 AS VARCHAR)
              + ' m' AS tiempo_perdido_total
            FROM Boleta b 
            INNER JOIN Tolva t ON b.id = t.idBoleta
            WHERE b.estado not in ('Cancelada', 'Pendiente')
            GROUP BY b.tolvaAsignada
          `
    ]);

    // Crear estructura base para tolvas 1 y 2
    const tolvasBase = [
      { tolvaAsignada: 1, cantidad: 0, pesoNeto: 0 },
      { tolvaAsignada: 2, cantidad: 0, pesoNeto: 0 }
    ];

    // Mapear los datos existentes y combinar con la estructura base
    const refactorData = tolvasBase.map(tolvaBase => {
      const dataExistente = cantidadBoletasPorTolva.find(
        item => item.tolvaAsignada === tolvaBase.tolvaAsignada
      );
      
      return {
        tolvaAsignada: tolvaBase.tolvaAsignada,
        cantidad: dataExistente ? dataExistente._count.tolvaAsignada : 0,
        pesoNeto: dataExistente ? (dataExistente._sum.pesoNeto || 0) : 0
      };
    });

    // Asegurar que siempre tengamos tolvas 1 y 2 en tiempos
    const tiemposBase = [
      { PromedioTiempo: "0h 0m", tolvaAsignada: 1, pesoNetoTotal: 0 },
      { PromedioTiempo: "0h 0m", tolvaAsignada: 2, pesoNetoTotal: 0 }
    ];
    
    const tiempos = tiemposBase.map(tiempoBase => {
      const tiempoExistente = tiemposRaw.find(
        item => item.tolvaAsignada === tiempoBase.tolvaAsignada
      );
      
      return tiempoExistente || tiempoBase;
    });

    // Asegurar que siempre tengamos tolvas 1 y 2 en tiempo perdido total
    const tiempoPerdidoBase = [
      { tolvaAsignada: 1, tiempo_perdido_total: "0 h 0 m" },
      { tolvaAsignada: 2, tiempo_perdido_total: "0 h 0 m" }
    ];
    
    const tiempoPerdidoFormateado = tiempoPerdidoBase.map(tiempoBase => {
      const tiempoPerdidoExistente = tiempoPerdidoTotal.find(
        item => item.tolvaAsignada === tiempoBase.tolvaAsignada
      );
      
      return tiempoPerdidoExistente || tiempoBase;
    });

    const totalDescargas = resultado.reduce((total, item) => total + Number(item.totalUnicos), 0);
    const totalPesoNeto = resultado.reduce((total, item) => total + Number(item.pesoNetoTotal || 0), 0);

    const dataLimpia = resultado.map((item) => {
      const cantidad = Number(item.totalUnicos);
      const pesoNeto = Number(item.pesoNetoTotal || 0);
      const porcentaje = totalDescargas > 0 ? ((cantidad / totalDescargas) * 100).toFixed(2) : 0;
      const porcentajePeso = totalPesoNeto > 0 ? ((pesoNeto / totalPesoNeto) * 100).toFixed(2) : 0;
      
      return {
        Usuario: item.usuarioTolva,
        'Tiempo Promedio': item.tiempoPromedio || 'N/A',
        Cantidad: cantidad,
        'Porcentaje según Cantidad': `${porcentaje} %`,
        'Descargado (qq)': `${formatNumber(pesoNeto.toFixed(2)/100)}`,
        'Porcentaje según Peso': `${porcentajePeso}%`,
      };
    });    

    return res.status(200).json({
      asignadas: refactorData,
      descargadas: dataLimpia, 
      tiempos: tiempos,
      tiempoPerdidoTotal: tiempoPerdidoFormateado,
      totales: {
        totalDescargas,
        totalPesoNeto
      }
    });

  } catch (err) {
    console.error('Error en getStatsBuquesAndAll:', err);
    return res.status(500).json({ 
      error: 'Error interno del servidor. Intente nuevamente.' 
    });
  }
};

const getViajesTotales = async(req, res) => {
  try {
    const buque = req.query.buque || null;
    const factura = req.query.factura || null;
    
    const usuarioTolva = req.query.usuarioTolva || null;
    const usuarioCierre = req.query.usuarioCierre || null;
    const tiempoExcedido = req.query.tiempoExcedido || null; // 'true', 'false' o null (todos)
    const searchPlaca = req.query.searchPlaca || null;

    // Parámetros de paginación
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Validaciones existentes
    if (factura !== null && (isNaN(factura) || factura === '')) {
      return res.status(400).json({ error: 'El parámetro factura debe ser un número válido.' });
    }

    if (buque !== null && (isNaN(buque) || buque === '')) {
      return res.status(400).json({ error: 'El parámetro buque debe ser un número válido.' });
    }

    // Nuevas validaciones
    if (page < 1) {
      return res.status(400).json({ error: 'El parámetro page debe ser mayor a 0.' });
    }

    if (limit < 1 || limit > 100) {
      return res.status(400).json({ error: 'El parámetro limit debe estar entre 1 y 100.' });
    }

    if (tiempoExcedido !== null && !['true', 'false'].includes(tiempoExcedido)) {
      return res.status(400).json({ error: 'El parámetro tiempoExcedido debe ser "true" o "false".' });
    }

    // Construir filtros para la consulta WHERE
    const whereConditions = {
      tolva: {
        some: {
          // Filtros anidados para tolva
          ...(usuarioTolva ? { usuarioTolva: usuarioTolva } : {}),
          ...(usuarioCierre ? { usuarioDeCierre: usuarioCierre } : {}),
          // Filtro por tiempo excedido
          ...(tiempoExcedido === 'true' ? { observacionTiempo: { not: null } } : {}),
          ...(tiempoExcedido === 'false' ? { observacionTiempo: null } : {})
        }
      },
      ...(buque ? { idSocio: parseInt(buque) } : {}),
      ...(factura ? { factura: factura } : {}),
      ...(searchPlaca ? { placa: { contains: searchPlaca } } : {})
    };

    const [totalRecords, totalSinFiltros, resultados] = await Promise.all([
      // Consulta 1: Obtener el total de registros para la paginación
      db.boleta.count({
        where: whereConditions
      }),
      // Consulta 2: Obtener el total de registros para la paginación
      (factura && buque) ? db.boleta.count({
        where:{
          ...(buque ? { idSocio: parseInt(buque) } : {}),
          ...(factura ? { factura: factura } : {}),
        }
      }) : 0,
      // Consulta 3: Consulta principal con paginación
      db.boleta.findMany({
        select: {
          id: true,
          numBoleta: true,
          placa: true,
          motorista: true,
          tolvaAsignada: true,
          tolva: {
            select: {
              idBoleta: true,
              usuarioTolva: true,
              usuarioDeCierre: true,
              observacionTiempo: true,
              fechaEntrada: true,
              fechaSalida: true,
            },
            take: 1,
            orderBy: {
              fechaEntrada: 'asc'
            }
          }
        },
        where: whereConditions,
        skip: offset,
        take: limit,
        orderBy: {
          numBoleta: 'desc'
        }
      })
    ]);

    const resultadosUnicos = resultados
      .filter(boleta => boleta.tolva.length > 0)
      .map(boleta => {
        const tolvaData = boleta.tolva[0];
        
        const fechaEntrada = new Date(tolvaData.fechaEntrada);
        const fechaSalida = new Date(tolvaData.fechaSalida);
        const diferenciaMinutos = Math.floor((fechaSalida - fechaEntrada) / (1000 * 60));
        
        const horas = Math.floor(diferenciaMinutos / 60);
        const minutos = diferenciaMinutos % 60;
        
        // Lógica para tiempo excedido con resta según tolva asignada
        const tiempoExcedidoFlag = (tolvaData.observacionTiempo !== null) ? 1 : 0;
        let tiempoAjustadoMinutos = diferenciaMinutos;
        
        // Si hay tiempo excedido, aplicar la resta según la tolva asignada
        if (tiempoExcedidoFlag === 1) {
          let minutosARestar = 0;
          
          // Determinar cuántos minutos restar según la tolva asignada
          if (boleta.tolvaAsignada === '1' || boleta.tolvaAsignada === 1) {
            minutosARestar = 50;
          } else if (boleta.tolvaAsignada === '2' || boleta.tolvaAsignada === 2) {
            minutosARestar = 40;
          }
          
          // Restar los minutos correspondientes, pero nunca menos de 0
          tiempoAjustadoMinutos = Math.max(0, diferenciaMinutos - minutosARestar);
        }
        
        // Calcular horas y minutos para el tiempo ajustado
        const horasAjustadas = Math.floor(tiempoAjustadoMinutos / 60);
        const minutosAjustados = tiempoAjustadoMinutos % 60;
        
        return {
          'Boleta': boleta.numBoleta,
          placa: boleta.placa,
          motorista: boleta.motorista,
          usuarioInicial: tolvaData.usuarioTolva,
          tolvaAsignada: `Tolva ${boleta.tolvaAsignada}`,
          usuarioDeCierre: tolvaData.usuarioDeCierre || '',
          observacionTiempo: tolvaData.observacionTiempo,
          TiempoTotal: `${horas}h ${minutos}m`, 
          TiempoPerdido: tiempoExcedidoFlag ? `${horasAjustadas}h ${minutosAjustados}m` : '0h 0m',
          tiempoExcedido: tiempoExcedidoFlag,
        };
      });

    // Calcular información de paginación
    const totalPages = Math.ceil(totalRecords / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Respuesta con paginación
    return res.status(200).json({
      data: resultadosUnicos,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalRecords: totalRecords,
        totalAllData: totalSinFiltros,
        recordsPerPage: limit,
        hasNextPage: hasNextPage,
        hasPrevPage: hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null
      }
    });

  } catch(err) {
    console.log(err);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: err.message 
    });
  }
}

const getUserTolva = async(req, res) => {
  try{
    const usuarios = await db.usuarios.findMany({
      where: {
        tipo: "TOLVA",
      },
      select: {
        id: true,
        name: true
      }
    });

    return res.status(200).send(usuarios)
  }catch(err){
    console.log(err)
    return res.status(500).send({err:'Intente denuevo'})
  }
}

/* Este queda para desarrollo posterior */
const getInfoForBuquesQQ = async(req, res) => {
  try{
    const buque = parseInt(req.query.buque) || null;
    const factura = req.query.factura || null;
    const LB_TO_QQ = 100;

    if(!buque || !factura || isNaN(buque) || isNaN(factura)) return res.status(400).send({err: 'Intente denuevo'})

    const data = await db.$queryRaw`
      WITH BoletasUnicas AS (
          SELECT 
              b.id,
              b.pesoNeto,
              CASE 
                  WHEN t.siloSecundario IS NULL THEN s1.nombre
                  ELSE CONCAT(s1.nombre, ' - ', s2.nombre)
              END AS nombre
          FROM Boleta b
          INNER JOIN Tolva t ON b.id = t.idBoleta
          LEFT JOIN Silos s1 ON s1.id = t.siloPrincipal
          LEFT JOIN Silos s2 ON s2.id = t.siloSecundario
          WHERE b.idSocio = ${buque} and factura=${factura}
          GROUP BY b.id, b.pesoNeto, s1.nombre, s2.nombre, t.siloSecundario
      )
      SELECT 
          nombre,
          COUNT(*) as camiones,
          SUM(pesoNeto)/${LB_TO_QQ} as quintales
      FROM BoletasUnicas
      GROUP BY nombre
      ORDER BY nombre asc
    `

    return res.status(200).send(data)
  }catch(err){
    console.log(err)
    return res.s
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
  updateFinalizarDescarga, 
  getInfoAllSilos,
  postResetSilo,
  getStatsBuquesAndAll, 
  getViajesTotales,
  getUserTolva,
  getInfoForBuquesQQ,
  postGetallInfoDetailsSilos,  
};