const db = require('../lib/prisma')
const dotenv = require("dotenv");
const {setLogger} = require('../utils/logger');
const jsQR = require('jsqr');
const jimp = require('jimp');
const sharp = require('sharp');

/* Se deben de quitar dos dependencias */

const analyzeQRWithSharp = async (imageBuffer) => {
  try {
    // Validar que el buffer no esté vacío
    if (!imageBuffer || imageBuffer.length === 0) {
      throw new Error('Buffer de imagen vacío');
    }

    console.log('Procesando imagen, tamaño del buffer:', imageBuffer.length);

    // Procesar con Sharp (más confiable que Jimp para este caso)
    const processedImage = await sharp(imageBuffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .greyscale()
      .normalize()
      .sharpen()
      .png()
      .toBuffer();

    // Obtener datos de imagen en formato RGBA
    const { data, info } = await sharp(processedImage)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { width, height } = info;

    // Convertir datos a Uint8ClampedArray
    const imageData = new Uint8ClampedArray(data);

    // Intentar detectar QR con diferentes configuraciones
    let code = jsQR(imageData, width, height, {
      inversionAttempts: "attemptBoth"
    });

    if (!code) {
      // Segundo intento con imagen invertida
      const invertedData = new Uint8ClampedArray(imageData.length);
      for (let i = 0; i < imageData.length; i += 4) {
        invertedData[i] = 255 - imageData[i];     // R
        invertedData[i + 1] = 255 - imageData[i + 1]; // G
        invertedData[i + 2] = 255 - imageData[i + 2]; // B
        invertedData[i + 3] = imageData[i + 3];   // A
      }
      
      code = jsQR(invertedData, width, height);
    }

    if (code) {
      return {
        found: true,
        data: code.data,
      };
    } else {
      return {
        found: false,
        error: 'No se encontró código QR en la imagen'
      };
    }

  } catch (error) {
    console.error('Error en analizar:', error);
    return {
      found: false,
      error: `Error procesando imagen: ${error.message}`
    };
  }
};

// Controlador actualizado
const analizadorQR = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se recibió imagen'
      });
    }
    

    const result = await analyzeQRWithSharp(req.file.buffer);
    
    try {
      const idBolQR = parseInt(result.data)
      const boleta = await db.boleta.findMany({
        where: {
          id: idBolQR,
        }
      })
      return res.send({boleta: boleta})
    } catch (err) {
      console.log(err)
    }
    return res.json({
      success: true,
      qr: result
    });
    
  } catch (error) {
    console.error('Error en analizadorQR:', error);
    res.status(500).json({
      success: false,
      message: 'Error procesando imagen',
      error: error.message
    });
  }
};


module.exports = {
  analizadorQR
};