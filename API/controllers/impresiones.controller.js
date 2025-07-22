const fs = require('fs');
const { exec } = require('child_process');
const db = require('../lib/prisma')
const PDFDocument = require('pdfkit');
const qrcode = require('qrcode');
const escpos = require('escpos');
escpos.Network = require('escpos-network');
const dotenv = require("dotenv");
const path = require('path');
const { setLoggerSystema } = require('../utils/logger');
const ipp = require('ipp');
const { print } = require('pdf-to-printer');
const PdfPrinter = require('pdfmake');


const stringtruncado = (str, len) => {
  return str.length > len
    ? String(str).substring(0, len).padEnd(len , ' ')
    : String(str).padEnd(len, ' ');
};

const quitarAcentos = (str) => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};


const imprimirPDF = async (req, res) => {
  try {
    const { id } = req.params;

    const boleta = await db.boleta.findUnique({
      where: { id: parseInt(id) }
    });

    // Configuración del documento con mejor tamaño y márgenes
    const doc = new PDFDocument({ 
      size: 'LETTER', 
      margin: 50,
      bufferPages: true 
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=boleta.pdf');

    doc.pipe(res);

    // Definición de colores en blanco y negro
    const black = '#000000';
    const darkGray = '#333333';
    const midGray = '#666666';
    const lightGray = '#EEEEEE';
    const white = '#FFFFFF';

    // Variables para datos de la boleta
    const LABELSINSPACE = boleta.proceso === 0 ? 'Entrada' : 'Salida';
    const LABEL = boleta.proceso === 0 ? 'Proveedor' : 'Cliente';

    const TIEMPOPROCESO = boleta.fechaFin - boleta.fechaInicio;
    const totalSegundos = Math.floor(TIEMPOPROCESO / 1000);
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = totalSegundos % 60;
    const TIEMPOESTADIA = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;

    const isTraslado = boleta.movimiento.includes('Traslado');
    const origen = isTraslado ? boleta.trasladoOrigen : boleta.origen;
    const destino = isTraslado ? boleta.trasladoDestino : boleta.destino;
    const fueraTol = boleta.estado === 'Completo(Fuera de tolerancia)';
    const isOriginal = boleta.impreso == null;

    const TARA = boleta.proceso === 0 ? boleta.pesoFinal : boleta.pesoInicial;
    const PESOBRUTO = boleta.proceso === 0 ? boleta.pesoInicial : boleta.pesoFinal;

    const fechaAhora = new Date().toLocaleString('es-ES');
    const fechaImpreso = boleta.impreso ? boleta.impreso.toLocaleString('es-ES') : '';

    // Funciones auxiliares para el diseño
    const drawBorder = (x, y, width, height) => {
      doc.rect(x, y, width, height)
         .lineWidth(0.5)
         .stroke(midGray);
    };

    const drawSection = (title, x, y, width, height) => {
      // Barra de título en gris oscuro
      doc.fillColor(darkGray)
         .rect(x, y, width, 20)
         .fill();
      
      // Texto del título en blanco
      doc.fillColor(white)
         .font('Helvetica-Bold')
         .fontSize(10)
         .text(title, x + 10, y + 6);
      
      // Cuerpo de la sección en gris claro
      doc.fillColor(lightGray)
         .rect(x, y + 20, width, height - 20)
         .fill()
         .fillColor(black);
      
      // Borde para toda la sección
      drawBorder(x, y, width, height);
    };

    const createLabelValue = (label, value, x, y, labelWidth = 90) => {
      doc.font('Helvetica-Bold')
         .fontSize(9)
         .fillColor(darkGray)
         .text(label, x, y);
      
      doc.font('Helvetica')
         .fontSize(9)
         .fillColor(black)
         .text(value || '', x + labelWidth, y, { width: 230 - labelWidth });
    };

    const createDataBox = (title, value, x, y, width, height) => {
      // Título del cuadro
      doc.fillColor(black)
         .font('Helvetica-Bold')
         .fontSize(8)
         .text(title, x-10, y - 15);
      
      // Cuadro de datos
      doc.rect(x-10, y, width, height)
         .fillAndStroke(lightGray, midGray);
      
      // Valor dentro del cuadro
      doc.fillColor(black)
         .font('Helvetica-Bold')
         .fontSize(9)
         .text(value || '0', x, y + height/2 - 6, { 
           width: width - 10,
           align: 'center'
         });
    };

    // ============ ENCABEZADO ============
    // Borde del encabezado completo
    drawBorder(50, 50, doc.page.width - 100, 60);
    
    // Logo y título
    doc.image('logo.png', 60, 60, { width: 70 })
       .fontSize(16)
       .font('Helvetica-Bold')
       .fillColor(black)
       .text('BAPROSA', 150, 65);
    
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor(midGray)
       .text('Básculas y Procesos S.A.', 150, 85);
    
    // Información de boleta en la parte superior derecha
    doc.font('Helvetica-Bold')
       .fontSize(14)
       .fillColor(black)
       .text('BOLETA DE PESO', 380, 65, { width: 150, align: 'right' });
    
    doc.font('Helvetica-Bold')
       .fontSize(12)
       .fillColor(black)
       .text(`N° ${boleta.numBoleta}`, 380, 85, { width: 150, align: 'right' });

    // Marca de copia u original
    if (!isOriginal) {
      doc.font('Helvetica-Bold')
         .fontSize(10)
         .fillColor(black)
         .text('COPIA', 50,25);
    } else {
      doc.font('Helvetica-Bold')
         .fontSize(10)
         .fillColor(black)
         .text('ORIGINAL', 75, 40);
    }

    // Información de proceso (recuadro)
    const infoBoxY = 120;
    drawBorder(50, infoBoxY, doc.page.width - 100, 40);
    
    // Información del proceso (lado izquierdo)
    doc.font('Helvetica-Bold')
       .fontSize(10)
       .fillColor(black)
       .text(`Proceso: ${LABELSINSPACE} - ${quitarAcentos(boleta.movimiento)}`, 60, infoBoxY + 10);
    
    doc.font('Helvetica')
       .fontSize(9)
       .fillColor(midGray)
       .text(`Fecha de impresión: ${stringtruncado(fechaAhora, 27)}`, 60, infoBoxY + 25);
    
    // Información del tiempo y reimpresión (lado derecho)
    doc.font('Helvetica-Bold')
       .fontSize(10)
       .fillColor(black)
       .text(`Tiempo de proceso: ${TIEMPOESTADIA}`, 380, infoBoxY + 10, { 
         width: 150, 
         align: 'right' 
       });
    
    if (!isOriginal) {
      doc.font('Helvetica')
         .fontSize(9)
         .fillColor(midGray)
         .text(`Impresión original: ${fechaImpreso}`, 320, infoBoxY + 25, {
           width: 210,
           align: 'right'
         });
    }

    // ============ DATOS GENERALES ============
    const contentY = 180;
    
    // Sección de datos generales
    drawSection('DATOS GENERALES', 50, contentY, doc.page.width - 100, 100);
    
    // Primera columna
    createLabelValue(`${LABEL}:`, quitarAcentos(boleta.socio), 60, contentY + 30);
    createLabelValue('Placa:', stringtruncado(boleta.placa, 20), 60, contentY + 45);
    createLabelValue('Motorista:', stringtruncado(quitarAcentos(boleta.motorista), 30), 60, contentY + 60);
    createLabelValue('Transporte:', quitarAcentos(boleta.empresa), 60, contentY + 75);
    
    // Segunda columna
    createLabelValue('Origen:', quitarAcentos(origen), 350, contentY + 30);
    createLabelValue('Destino:', quitarAcentos(destino), 350, contentY + 45);
    createLabelValue('Producto:', quitarAcentos(boleta.producto), 350, contentY + 60);
    createLabelValue('Pesador:', stringtruncado(quitarAcentos(boleta.usuario), 30), 350, contentY + 75);
    
    // ============ REGISTRO DE TIEMPOS ============
    const timeY = contentY + 120;
    const boxWidth = (doc.page.width - 140) / 3;
    const boxHeight = 40;
    
    // Sección de registro de tiempo
    drawSection('REGISTRO DE TIEMPOS', 50, timeY, doc.page.width - 100, 100);
    
    createDataBox('HORA DE ENTRADA', boleta.fechaInicio.toLocaleString(), 70, timeY + 45, boxWidth, boxHeight);
    createDataBox('HORA DE SALIDA', boleta.fechaFin.toLocaleString(), 80 + boxWidth, timeY + 45, boxWidth, boxHeight);
    createDataBox('TIEMPO DE ESTADÍA', TIEMPOESTADIA, 90 + boxWidth * 2, timeY + 45, boxWidth, boxHeight);
    
    // ============ REGISTRO DE PESAJE ============
    const weightY = timeY + 115;
    drawSection('REGISTRO DE PESAJE', 50, weightY, doc.page.width - 100, 160);
    
    // Primera fila de pesos
    createDataBox('PESO TARA (lb)', TARA, 70, weightY + 45, boxWidth, boxHeight);
    createDataBox('PESO BRUTO (lb)', PESOBRUTO, 80 + boxWidth, weightY + 45, boxWidth, boxHeight);
    createDataBox('PESO NETO (lb)', boleta.pesoNeto, 90 + boxWidth * 2, weightY + 45, boxWidth, boxHeight);
    
    // Segunda fila de pesos
    createDataBox('PESO TEÓRICO (lb)', boleta.pesoTeorico, 70 + boxWidth/2, weightY + 110, boxWidth, boxHeight);
    createDataBox('DESVIACIÓN (lb)', boleta.desviacion, 80 + boxWidth * 1.5, weightY + 110, boxWidth, boxHeight);
    
    // ============ ALERTA TOLERANCIA ============
    if (fueraTol) {
      const toleranceY = weightY + 180;
      doc.rect(50, toleranceY, doc.page.width - 100, 30)
         .fillAndStroke(darkGray, darkGray);
      doc.fillColor(white)
         .font('Helvetica-Bold')
         .fontSize(14)
         .text('FUERA DE TOLERANCIA', 0, toleranceY + 9, { align: 'center' });
    }
    
    // ============ FIRMAS ============
    const signY = weightY + (fueraTol ? 230 : 180);
    
    drawSection('AUTORIZACIONES', 50, signY, doc.page.width - 100, 70);
    
    // Líneas de firma
    doc.strokeColor(midGray);
    doc.lineWidth(0.5);
    doc.moveTo(100, signY + 45).lineTo(250, signY + 45).stroke();
    doc.font('Helvetica')
       .fontSize(9)
       .fillColor(midGray)
       .text('Firma del Pesador', 140, signY + 50);
    
    doc.moveTo(350, signY + 45).lineTo(500, signY + 45).stroke();
    doc.text('Firma de Conformidad', 380, signY + 50);
    
        
    try{
      const url = `http://192.9.100.56:3000/api/boletas/pdf/bol/${boleta.id}`;
      const qrCodeImage = await qrcode.toDataURL(url);
      doc.image(qrCodeImage, 270, signY + 130, { width: 70 });
    }catch(err) {
      console.log(err)
    }
    // ============ PIE DE PÁGINA ============
    // Finalizar el contenido principal antes de añadir el pie de página
    doc.flushPages();
    
    // Ahora añadimos el pie de página
    const pageHeight = doc.page.height;
    
    // Obtenemos el número total de páginas después de que todo el contenido se haya añadido
    const range = doc.bufferedPageRange();
    
    // Para cada página, añadimos el pie de página
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(i);
      // Barra inferior gris
      doc.rect(40, pageHeight - 40, doc.page.width - 80, 30)
         .fillAndStroke(darkGray, darkGray);
      
      doc.fillColor(white)
         .font('Helvetica')
         .fontSize(8)
         .text('www.baprosa.com', 60, pageHeight - 30);
      
      doc.text('Tel: (504) 2222-2222', doc.page.width/2, pageHeight - 30, { align: 'center' });
      
      doc.font('Helvetica-Bold')
         .text(`Página ${i + 1} de ${range.count}`, doc.page.width - 60, pageHeight - 30, { align: 'right' });
    }


    doc.end();
  } catch (err) {
    console.error('Error generando PDF:', err);
    res.status(500).send('Error al generar PDF');
  }
}; 

function getPrinter() {
  const device = new escpos.Network(process.env.PRINTER_IP, process.env.PRINTER_PORT);
  const printer = new escpos.Printer(device);
  return { device, printer };
}

/**
 * Terminada
 * @param {*} boleta 
 * @returns 
 */
const imprimirQRTolva = (boleta) => {
  try {
    // Configuración del URL para el código QR
    const qrUrl = `${boleta.id}`;
    const tux = path.join(__dirname, 'logo.png');

    // Obtener la impresora configurada
    const { device, printer } = getPrinter();
    
    if (!device || !printer) {
      setLoggerSystema(
        'IMPRESORAS', 
        'ERROR NO SE ENCONTRO LA IMPRESORA DE TICKETS, REVISE LA CONEXION', 
        3
      )
    }

    const fecha = new Date().toLocaleString('es-ES');
    
    escpos.Image.load(tux, function(image){
      device.open((err) => {
        if (err) {
          setLoggerSystema(
            'IMPRESORAS', 
            'ERROR EN ESTABLECER LA CONEXION CON LA IMPRESORA DE TICKETS, REVISE LA CONE', 
            3
          )
          console.log({msg: err})
        }
      
        // Configurar e imprimir la boleta
        printer
          .model('qsprinter')
          .align('ct')
          .encode('utf8')
          .image(image, 'd24')
          .then(() => {
            printer.qrimage(qrUrl, {
              type: 'png',
              size: 3,
              mode: 'dhdw'
            }, function(err) {
              if (err) {
                console.error('Error al generar código QR:', err);
                this.text('Error al generar código QR')
                    .cut()
                    .close();

                return res.status(500).json({
                  success: false,
                  message: `Error al generar código QR: ${err.message}`
                });
              }

              this.text(' ')
                  .size(0, 0.5)
                  .text(`${fecha}`)
                  .text(`${boleta.placa} | ${boleta.id} | ${boleta.tolvaAsignada}`)
                  .size(0, 0.5)
                  .text('--------------------------------')
                  .text('Gracias por su visita')
                  .text('--------------------------------')
                  .cut()
                  .close();
            });
          });
      });
    })

    return true
    
  } catch (error) {
    console.error('Error en el proceso de impresión:', error);
    return false
  }
};

/**
 * ! Sustituto de la funcion de imprimirQRTolva por los momentos
 */

const imprimirTikets = (boleta, despachador) => {
  try {
    const { device, printer } = getPrinter();
    const TITLE = boleta.idProducto === 17 ? 'RECIBO  DE GRANZA NACIONAL' : 'RECIBO DE GRANZA AMERICANA'
    const LABEL = boleta.idProducto === 17 ? 'PRODUCTOR:' : 'MOTORISTA:';
    const LABELVALUE = boleta.idProducto === 17 ? boleta.socio : boleta.motorista;
    const PROCEDENCIA = boleta.idProducto === 17 ? boleta.origen : boleta.socio;

    if (!device || !printer) {
      console.log('No se pudo acceder al dispositivo de impresión')
      return
    }
    const companyName = 'BENEFICIO DE ARROZ PROGRESO, S.A.';
    const fecha = new Date().toLocaleString('es-ES');
    
    device.open((err) => {
        if (err) {
          console.log(err)
        }
      
        // Configurar e imprimir la boleta
        printer
          .model('qsprinter')
          .align('ct')
          .encode('utf8')
          .size(0, 0.5)
          .text('--------------------------------')
          .style('B')
          .text(companyName)
          .style('NORMAL')
          .text('--------------------------------')
          .align('ct')
          .text(TITLE)
          .text(`${fecha}`)
          .text(` `)
          .align('lt')
          .text('------------------------------------------')
          .tableCustom([
            { text: LABEL, align: "LEFT", width: 0.4, style: 'B' }, 
            { text: LABELVALUE, align: "RIGHT", width: 0.4 }
          ])
          .tableCustom([
            { text: "PLACA:", align: "LEFT", width: 0.4, style: 'B' }, 
            { text: boleta.placa, align: "RIGHT", width: 0.4 }
          ])
          .tableCustom([
            { text: "PROCEDENCIA:", align: "LEFT", width: 0.4, style: 'B' }, 
            { text: PROCEDENCIA, align: "RIGHT", width: 0.4 }
          ])
          .text(`MARCHAMOS:`)
          .text([boleta?.sello1, boleta?.sello2, boleta?.sello3, boleta?.sello4, boleta?.sello5, boleta?.sello6].filter(Boolean).join(', ') || 'N/A')
          .text('------------------------------------------')
          .style(`NORMAL`)
          .text(` `)
          .align(`ct`)
          .text(`________________________________`)
          .text(`FIRMA: ${despachador}`)
          .text(' ')
          .size(0, 0.5)
          .cut()
          .close()
      });
  } catch (error) {
    console.error('Error en el proceso de impresión:', error);
  }
}

/**
 * Reimpresion de lo de arriba
 */

const reImprimirTikets = (boleta, despachador) => {
  try {
    const { device, printer } = getPrinter();
    const TITLE = boleta.idProducto === 17 ? 'RECIBO  DE GRANZA NACIONAL' : 'RECIBO DE GRANZA AMERICANA'
    const LABEL = boleta.idProducto === 17 ? 'PRODUCTOR:' : 'MOTORISTA:';
    const LABELVALUE = boleta.idProducto === 17 ? boleta.socio : boleta.motorista;
    const PROCEDENCIA = boleta.idProducto === 17 ? boleta.origen : boleta.socio;

    if (!device || !printer) {
      console.log('No se pudo acceder al dispositivo de impresión')
      return
    }
    const companyName = 'BENEFICIO DE ARROZ PROGRESO, S.A.';
    const fecha = new Date().toLocaleString('es-ES');
    
    device.open((err) => {
        if (err) {
          console.log(err)
        }
      
        // Configurar e imprimir la boleta
        printer
          .model('qsprinter')
          .align('ct')
          .encode('utf8')
          .size(0, 0.5)
          .text('--------------------------------')
          .style('B')
          .text(companyName)
          .style('NORMAL')
          .text('--------------------------------')
          .align('ct')
          .text(TITLE)
          .text(`REIMPRESION - ${fecha}`)
          .text(` `)
          .align('lt')
          .text('------------------------------------------')
          .tableCustom([
            { text: LABEL, align: "LEFT", width: 0.4, style: 'B' }, 
            { text: LABELVALUE, align: "RIGHT", width: 0.4 }
          ])
          .tableCustom([
            { text: "PLACA:", align: "LEFT", width: 0.4, style: 'B' }, 
            { text: boleta.placa, align: "RIGHT", width: 0.4 }
          ])
          .tableCustom([
            { text: "PROCEDENCIA:", align: "LEFT", width: 0.4, style: 'B' }, 
            { text: PROCEDENCIA, align: "RIGHT", width: 0.4 }
          ])
          .text(`MARCHAMOS:`)
          .text([boleta?.sello1, boleta?.sello2, boleta?.sello3, boleta?.sello4, boleta?.sello5, boleta?.sello6].filter(Boolean).join(', ') || 'N/A')
          .text('------------------------------------------')
          .style(`NORMAL`)
          .text(` `)
          .align(`ct`)
          .text(`________________________________`)
          .text(`FIRMA: ${despachador}`)
          .text(' ')
          .size(0, 0.5)
          .cut()
          .close()
      });
  } catch (error) {
    console.error('Error en el proceso de impresión:', error);
  }
}

/**
 * Terminada
 * @param {*} boleta 
 * @param {*} despachador 
 * @returns 
 */
const comprobanteDeCarga = (boleta, despachador)=> {
    try {
    const tux = path.join(__dirname, 'logo.png');
    const { device, printer } = getPrinter();

    if (!device || !printer) {
      return res.status(500).json({
        success: false,
        message: 'No se pudo acceder al dispositivo de impresión'
      });
    }
    const companyName = 'BENEFICIO DE ARROZ PROGRESO, S.A.';
    const fecha = new Date().toLocaleString('es-ES');
    /* 42 */
    escpos.Image.load(tux, function(image){
      device.open((err) => {
        if (err) {
          return {
            success: false,
            message: `Error al abrir conexión con la impresora: ${err.message}`
          }
        }
      
        // Configurar e imprimir la boleta
        printer
          .model('qsprinter')
          .align('ct')
          .encode('utf8')
          .size(0, 0.5)
          .text('--------------------------------')
          .style('B')
          .text(companyName)
          .style('NORMAL')
          .text('--------------------------------')
          .text(` `)
          .align('ct')
          .text(`COMPROBANTE DE DESCARGA`)
          .text(`${fecha} No. ${addCero(boleta.numBoleta)}`)
          .text(` `)
          .align('lt')
          .tableCustom([
            { text: "PRODUCTO:", align: "LEFT", width: 0.4, style: 'B' }, 
            { text: "Granza Americana", align: "RIGHT", width: 0.4 }
          ])
          .tableCustom([
            { text: "MOTORISTA:", align: "LEFT", width: 0.4, style: 'B' }, 
            { text: `${boleta.motorista}`, align: "RIGHT", width: 0.4 }
          ])
          .tableCustom([
            { text: "TICKET:", align: "LEFT", width: 0.4, style: 'B' }, 
            { text: `#${boleta.Nviajes} (${boleta.NSalida})`, align: "RIGHT", width: 0.4 }
          ])
          .text('------------------------------------------')
          .tableCustom([
            { text: "PESO TEORICO:", align: "LEFT", width: 0.4, style: 'B' }, 
            { text: `${(boleta.pesoTeorico/100).toFixed(2)} QQ`, align: "RIGHT", width: 0.4 }
          ])
          .tableCustom([
            { text: "TOTAL QQ. DESCARGA:", align: "LEFT", width: 0.4, style: 'B' }, 
            { text: `${(boleta.pesoNeto/100).toFixed(2)} QQ`, align: "RIGHT", width: 0.4 }
          ])
          .tableCustom([
            { text: `${parseFloat(boleta.desviacion || 0) < 0 ? `DESVIACION:` : ''}`, align: "LEFT", width: 0.4, style: 'B' }, 
            { text: `${parseFloat(boleta.desviacion || 0) < 0 ? `${(boleta.desviacion/100).toFixed(2)+' QQ'}` : ''}`, align: "RIGHT", width: 0.4 }
          ])
          .text('------------------------------------------')
          .text(`Observaciones: ${boleta.observaciones? boleta.observaciones: 'Ninguna.'}`)
          .style(`NORMAL`)
          .text(` `)
          .text(` `)
          .align(`ct`)
          .text(`________________________________`)
          .text(`Aprobado Por: ${despachador}`)
          .text(' ')
          .size(0, 0.5)
          .image(image, 'd24')
          .then(() => {
            printer.text(' ')
                   .cut()
                   .close()
          });
      });
    })
  } catch (error) {
    console.error('Error en el proceso de impresión:', error);
  }
}

const addCero = (str) => {
  return String(str).padStart(7, '0')
}

function generarContenidoTercioCarta(copia, esPrimera = false, colors, boleta, despachador, numPaseSalida) {
  
  // Verificar si es pase de salida (antes de fechaFin)
  const esPaseSalida = copia === 'y';
  
  // Cálculo de tiempo solo si hay fechaFin
  let TIEMPOESTADIA = 'En proceso';
  if (boleta.fechaFin) {
    const TIEMPOPROCESO = boleta.fechaFin - boleta.fechaInicio;
    const totalSegundos = Math.floor(TIEMPOPROCESO / 1000);
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = totalSegundos % 60;
    TIEMPOESTADIA = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
  }
  
  const TYPEOFUSER = boleta.proceso == 0 ? 'Proveedor    ' : 'Cliente      ';

  /**
   * IDENTIFICADOR DE TARA Y PESO BRUTO
   */
  const isEspecialTraslado = boleta?.proceso === 0 && (boleta?.idMovimiento===10 || boleta?.idMovimiento===11)
  const TARA = isEspecialTraslado ? boleta.pesoInicial : (boleta.proceso == 0 ? boleta.pesoFinal : boleta.pesoInicial)
  const PESOBRUTO = isEspecialTraslado ? boleta.pesoFinal : (boleta.proceso == 0 ? boleta.pesoInicial : boleta.pesoFinal)

  /**
   * Identificador de proceso
   */
  const PROCESO = boleta.proceso===0 ? 'Entrada' : 'Salida'

  /* SALIDA DE DOCUMENTO */
  const manifiesto = boleta?.manifiesto ? `Manifiesto_${boleta.manifiesto}` : null;
  const ordenCompra = boleta?.ordenDeCompra ? `OrdenCompra_${boleta.ordenDeCompra}` : null;
  const ultimoDocumento = manifiesto || ordenCompra || 'N/A';

  /**
   * Identificador de fuera de tolerancia
   */
  const fueraTol = boleta.estado === 'Completo(Fuera de tolerancia)';

  const contenido = [
    !esPrimera ? { text: '', pageBreak: 'before' } : null,
    { canvas: [ { type: 'rect', x: 0, y: 0, w: 608, h: 10, color: colors[copia], }], absolutePosition: { x: 2, y: 0 } },
    { canvas: [ { type: 'rect', x: 0, y: 0, w: 10, h: 250, color: colors[copia] }], absolutePosition: { x: 98, y: 2 } },
    { canvas: [ { type: 'rect', x: 0, y: 0, w: 608, h: 10, color: colors[copia], }], absolutePosition: { x: 2, y: 252 } },
    {
      text: esPaseSalida ? '' : 'O R I G I N A L',
      color: 'gray',
      opacity: 0.2,
      bold: true,
      italics: true,
      fontSize: esPaseSalida ? 30 : 40,
      absolutePosition: { x: (esPaseSalida ? 70 : 120), y: 130 },
    },
    { text: 'BENEFICIO DE ARROZ PROGRESO, S.A.', alignment: 'center', bold: true, margin: [0, 15, 0, 0]  },
    { text: [
      { text: `${esPaseSalida ? 'PASE DE SALIDA ' : 'Boleta de Peso '}`, bold: true, ...(esPaseSalida ? { fontSize: 11 } : {})},
      { text: `No. ${esPaseSalida ? `${addCero(numPaseSalida)}` : addCero(boleta.numBoleta)}`, color: 'red', bold: true, ...(esPaseSalida ? { fontSize: 11 } : {})}, 
      { text: `${esPaseSalida && boleta?.numBoleta ? ' SEGÚN BOLETA DE PESO ' : ''}`, bold: true, ...(esPaseSalida ? { fontSize: 11 } : {})},
      { text: `${esPaseSalida && boleta?.numBoleta ? `No. ${addCero(boleta?.numBoleta)}` : ''}`, color: 'red', bold: true, ...(esPaseSalida ? { fontSize: 11 } : {})},
    ], alignment: 'center', bold: true,  margin: [0, 5, 0, 2] },
    { text: `Proceso: ${PROCESO} - ${boleta.movimiento} / Duración del Proceso ${TIEMPOESTADIA}`, alignment: 'center', margin: [0, 1, 0, 15] },
    {
      canvas: [{ type: 'line', x1: 36, y1: 0, x2: 576, y2: 0, lineWidth: 1 }]
    },
    {
      margin: [36, 10, 36, 0],
      layout: 'noBorders',
      watermark: {text: copia.toUpperCase(), color: 'blue', opacity: 0.3, bold: true, italics: false},
      table: {
      widths: ['*', '*'],
      body: [
          [`Fecha        : ${new Date().toLocaleString()}`, ''],
          [`${TYPEOFUSER}: ${boleta.socio}`, `Hora Entrada     : ${boleta.fechaInicio.toLocaleString()}`],
          [`Placa        : ${boleta.placa}`, `Hora de Salida   : ${boleta.fechaFin ? boleta.fechaFin.toLocaleString() : 'Pendiente'}`],
          [`Motorista    : ${boleta.motorista}`, `Documento        : ${ultimoDocumento}`],
          [`Transporte   : ${boleta.empresa}`, `Marchamos        : ${[boleta?.sello1, boleta?.sello2, boleta?.sello3, boleta?.sello4, boleta?.sello5, boleta?.sello6].filter(Boolean).join(', ') || 'N/A'}`],
          [`Origen       : ${boleta.origen || boleta.trasladoOrigen}`, ''],
          [`Destino      : ${boleta.destino || boleta.trasladoDestino || 'Pendiente'}`, ''],
          [`Producto     : ${boleta.producto}`, ''],
        ]
      }
    },
    {
      margin: [36, 10, 36, 0],
      canvas: [{ type: 'line', x1: 0, y1: 0, x2: 540, y2: 0, lineWidth: 1 }]
    },
      (esPaseSalida ? {
      text: 'P A S E  D E  S A L I D A',
      color: 'gray',
      opacity: 0.3,
      bold: true,
      italics: true,
      fontSize: 30,
      alignment: 'center',
      margin: [10, 10, 36, 0]
    } : {
      margin: [36, 10, 36, 0],
      layout: 'noBorders',
      table: {
        widths: ['*', '*'],
        body: [
          [`Peso Tara    : ${TARA || 0}`, `Peso Teórico     : ${boleta.pesoTeorico ||0}`],
          [`Peso Bruto   : ${PESOBRUTO || 0}`, `Desviación       : ${boleta.desviacion ||0}`],
          [
            `Peso Neto    : ${boleta.pesoNeto || 0}`,
            fueraTol
              ? { text: 'FUERA DE TOLERANCIA', color: 'red', bold: true }
              : ''
          ]
        ]
      }
    }),
    {
      margin: [36, 10, 36, 0],
      canvas: [{ type: 'line', x1: 0, y1: 0, x2: 540, y2: 0, lineWidth: 1 }]
    },
    {
      margin: [36, 10, 36, 0],
      layout: 'noBorders',
      table: {
        widths: ['*', '*'],
        body: [
          [{ text: `Pesador      : ${despachador}` }, 'Autorizado       : '],
        ]
      }
    }
  ];

  // Elimina el null del principio si es la primera copia
  return contenido.filter(Boolean);
}

function generarContenidoTercioCartaReimpresion(copia, esPrimera = false, colors, boleta, despachador, isPrint, datePrint, numPaseSalida) {
  
  // Verificar si es pase de salida (antes de fechaFin)
  const esPaseSalida = copia === 'y';
  
  // Cálculo de tiempo solo si hay fechaFin
  let TIEMPOESTADIA = 'En proceso';
  if (boleta.fechaFin) {
    const TIEMPOPROCESO = boleta.fechaFin - boleta.fechaInicio;
    const totalSegundos = Math.floor(TIEMPOPROCESO / 1000);
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = totalSegundos % 60;
    TIEMPOESTADIA = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
  }
  
  const TYPEOFUSER = boleta.proceso == 0 ? 'Proveedor    ' : 'Cliente      ';

  /**
   * IDENTIFICADOR DE TARA Y PESO BRUTO
   */
  const isEspecialTraslado = boleta?.proceso === 0 && (boleta?.idMovimiento===10 || boleta?.idMovimiento===11)
  const TARA = isEspecialTraslado ? boleta.pesoInicial : (boleta.proceso == 0 ? boleta.pesoFinal : boleta.pesoInicial)
  const PESOBRUTO = isEspecialTraslado ? boleta.pesoFinal : (boleta.proceso == 0 ? boleta.pesoInicial : boleta.pesoFinal)

  /**
   * Identificador de proceso
   */
  const PROCESO = boleta.proceso===0 ? 'Entrada' : 'Salida'

  /* SALIDA DE DOCUMENTO */
  const manifiesto = boleta?.manifiesto ? `Manifiesto_${boleta.manifiesto}` : null;
  const ordenCompra = boleta?.ordenDeCompra ? `OrdenCompra_${boleta.ordenDeCompra}` : null;
  const ultimoDocumento = manifiesto || ordenCompra || 'N/A';

  /**
   * Identificador de fuera de tolerancia
   */
  const fueraTol = boleta.estado === 'Completo(Fuera de tolerancia)';

  const contenido = [
    !esPrimera ? { text: '', pageBreak: 'before' } : null,
    { canvas: [ { type: 'rect', x: 0, y: 0, w: 608, h: 10, color: colors[copia], }], absolutePosition: { x: 2, y: 0 } },
    { canvas: [ { type: 'rect', x: 0, y: 0, w: 10, h: 250, color: colors[copia] }], absolutePosition: { x: 98, y: 2 } },
    { canvas: [ { type: 'rect', x: 0, y: 0, w: 608, h: 10, color: colors[copia], }], absolutePosition: { x: 2, y: 252 } },
    {
      text: (isPrint ? "R E I M P R E S I O N" : esPaseSalida ? 'P A S E  D E  S A L I D A' : 'O R I G I N A L'),
      color: 'gray',
      opacity: 0.2,
      bold: true,
      italics: true,
      fontSize: (isPrint ? 35 : 40),
      absolutePosition: { x: (isPrint ? 70 : 120), y: 130 },
    },
    { text: 'BENEFICIO DE ARROZ PROGRESO, S.A.', alignment: 'center', bold: true, margin: [0, 15, 0, 0]  },
    { text: [
      { text: `${esPaseSalida ? 'PASE DE SALIDA ' : 'Boleta de Peso '}`, bold: true, ...(esPaseSalida ? { fontSize: 10 } : {}) },
      { text: `No. ${esPaseSalida ? `${numPaseSalida ? addCero(numPaseSalida) : 'S/N'}` : addCero(boleta.numBoleta)}`, color: 'red', bold: true, ...(esPaseSalida ? { fontSize: 10 } : {})  }, 
      { text: `${esPaseSalida && boleta?.numBoleta ? ' SEGÚN BOLETA DE PESO ' : ''}`, bold: true, ...(esPaseSalida ? { fontSize: 10 } : {}) },
      { text: `${esPaseSalida && boleta?.numBoleta ? `No. ${addCero(boleta?.numBoleta)}` : ''}`, color: 'red', bold: true, ...(esPaseSalida ? { fontSize: 10 } : {}) },
    ], alignment: 'center', bold: true,  margin: [0, 5, 0, 2] },
    { text: `Proceso: ${PROCESO} - ${boleta.movimiento} / Duración del Proceso ${TIEMPOESTADIA}`, alignment: 'center', margin: [0, 1, 0, 15] },
    {
      canvas: [{ type: 'line', x1: 36, y1: 0, x2: 576, y2: 0, lineWidth: 1 }]
    },
    {
      margin: [36, 10, 36, 0],
      layout: 'noBorders',
      watermark: {text: copia.toUpperCase(), color: 'blue', opacity: 0.3, bold: true, italics: false},
      table: {
      widths: ['*', '*'],
      body: [
          [`Fecha        : ${isPrint ? new Date(datePrint).toLocaleString() : new Date().toLocaleString()}`, isPrint ? `Reimpresión      : ${new Date().toLocaleString()}`: ''],
          [`${TYPEOFUSER}: ${boleta.socio}`, `Hora Entrada     : ${boleta.fechaInicio.toLocaleString()}`],
          [`Placa        : ${boleta.placa}`, `Hora de Salida   : ${boleta.fechaFin ? boleta.fechaFin.toLocaleString() : 'Pendiente'}`],
          [`Motorista    : ${boleta.motorista}`, `Documento        : ${ultimoDocumento}`],
          [`Transporte   : ${boleta.empresa}`, `Marchamos        : ${[boleta?.sello1, boleta?.sello2, boleta?.sello3, boleta?.sello4, boleta?.sello5, boleta?.sello6].filter(Boolean).join(', ') || 'N/A'}`],
          [`Origen       : ${boleta.origen || boleta.trasladoOrigen}`, ''],
          [`Destino      : ${boleta.destino || boleta.trasladoDestino || 'Pendiente'}`, ''],
          [`Producto     : ${boleta.producto}`, ''],
        ]
      }
    },
    {
      margin: [36, 10, 36, 0],
      canvas: [{ type: 'line', x1: 0, y1: 0, x2: 540, y2: 0, lineWidth: 1 }]
    },
    (esPaseSalida ? {
      text: 'P A S E  D E  S A L I D A',
      color: 'gray',
      opacity: 0.3,
      bold: true,
      italics: true,
      fontSize: 30,
      alignment: 'center',
      margin: [10, 10, 36, 0]
    }:{
      margin: [36, 10, 36, 0],
      layout: 'noBorders',
      table: {
        widths: ['*', '*'],
        body: [
          [`Peso Tara    : ${TARA || 0}`, `Peso Teórico     : ${boleta.pesoTeorico ||0}`],
          [`Peso Bruto   : ${PESOBRUTO || 0}`, `Desviación       : ${boleta.desviacion ||0}`],
          [
            `Peso Neto    : ${boleta.pesoNeto || 0}`,
            fueraTol
              ? { text: 'FUERA DE TOLERANCIA', color: 'red', bold: true }
              : ''
          ]
        ]
      }
    }),
    {
      margin: [36, 10, 36, 0],
      canvas: [{ type: 'line', x1: 0, y1: 0, x2: 540, y2: 0, lineWidth: 1 }]
    },
    {
      margin: [36, 10, 36, 0],
      layout: 'noBorders',
      table: {
        widths: ['*', '*'],
        body: [
          [{ text: `Pesador      : ${despachador}` }, 'Autorizado       : '],
        ]
      }
    }
  ];

  // Elimina el null del principio si es la primera copia
  return contenido.filter(Boolean);
}

const generarCantidadCopias = (boleta, numPaseSalida) => {
  const { idMovimiento, idProducto, boletaType, idEmpresa, idSocio, } = boleta
  const arrContenerizados =  [4, 5, 6, 15, 16]
  const arrSubproductos = [2, 7, 8, 9, 10]
  const arrExtras = [1, 27, 28, 29, 30, 31, 32, 33, 34]
  const arrTraslados = [10, 11]
  const todasLasCopias = [11, 17, 21, 35, 36]
  const paseDeSalida = [18, 23]

  const filtrarCopias = (copias) => {
    if (numPaseSalida === undefined || numPaseSalida === null) {
      return copias.filter(copia => copia !== 'y')
    }
    return copias
  }

  if (arrTraslados.includes(idMovimiento)) {
    return filtrarCopias(['o', 'p', 'y'])
  }

  if (idMovimiento==13){
    return filtrarCopias(['o', 'y'])
  }

  /* Servcio Contratado de Baprosa */
  if (idSocio==1 && (idEmpresa !=1 && idEmpresa !=1015 && idEmpresa!=1014) ) {
    return filtrarCopias(['o', 'g', 'y'])
  }

  if(arrExtras.includes(idProducto)){
    return filtrarCopias(['o', 'y'])
  }

  if (paseDeSalida.includes(idProducto)) {
    return filtrarCopias(['o', 'y'])
  }

  if(arrContenerizados.includes(idProducto)) {
    return filtrarCopias(['o', 'y', 'p'])
  }

  if(arrSubproductos.includes(idProducto)) {
    return filtrarCopias(['o', 'g', 'p'])
  }

  if (todasLasCopias.includes(idProducto)) {
    return filtrarCopias(['o', 'g', 'p', 'y'])
  }

  /* Clientes Planta */
  if ((boletaType==3 || boletaType==4) && (idProducto !=24 && idProducto!=25 && idMovimiento!=12)){
    return filtrarCopias(['o', 'y'])
  }

  /* Servicio Bascula */
  if (idMovimiento==12){
    return filtrarCopias(['o', 'g', 'y'])
  }

  return filtrarCopias(['o', 'y']);
}


/**
 *  TODO - > 1/3 de carta pageSize: { width: 612, height: 264 } font 9 
 *  TODO - > 1/2 de carta pageSize: { width: 612, height: 396 }
 */
const imprimirWorkForce = async(boleta, numPaseSalida) => {
  try{
    const colors = {o:'white', g: '#98FB98', p: 'pink', y:'yellow'}
    const datePrint = new Date()
    const despachador = await db.usuarios.findUnique({where: {usuarios:boleta.usuario}})
    const copias = generarCantidadCopias(boleta, numPaseSalida); /* Genera Arreglo de Copias ['o', 'g', 'p', 'y'] puede ser ['o', 'g', 'y']  segun el caso*/

    const saveDatePrints =  await db.boleta.update({
      where : {
        id: parseInt(boleta.id)
      }, 
      data : {
        impreso: new Date(), 
        ...(copias.includes('y') ? {impresaAmarilla : datePrint} : {}),
        ...(copias.includes('g') ? {ImpresaVerde : datePrint} : {}),
        ...(copias.includes('p') ? {impresaRosa : datePrint} : {}), 
      }
    })

    const fonts = {
      Courier: {
        normal: 'Courier',
        bold: 'Courier-Bold',
        italics: 'Courier-Oblique',
        bolditalics: 'Courier-BoldOblique'
      }
    };

    const printer = new PdfPrinter(fonts);
    const filePath = 'boleta_epson.pdf';

    const docDefinition = {
      pageSize: { width: 612, height: 264 },
      pageMargins: [2, 2, 2, 2],
      defaultStyle: {
        font: 'Courier',
        fontSize: 8
      },	
      content: copias.flatMap((copia, i) => generarContenidoTercioCarta(copia, i === 0, colors, boleta, despachador.name, numPaseSalida))
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const writeStream = fs.createWriteStream(filePath);

    pdfDoc.pipe(writeStream);
    pdfDoc.end();

    writeStream.on('finish', () => {
      print(filePath, { printer: `WFBASCULA` })
      .then(() => {
          console.log('Imprimiendo...') 
      })
      .catch(error => {
          return true
      })
    });
  }catch(err){
    console.log(err)
  }
};

/**
 * Reimpresiones
 */

const getReimprimirWorkForce = async(boleta, type, numPaseSalida) => {
  try{
    const colors = {o:'white', g: '#98FB98', p: 'pink', y:'yellow'}
    const datePrint = new Date()
    const despachador = await db.usuarios.findUnique({where: {usuarios:boleta.usuario}})
    const copias = type
    const estadoCopias = {
      g: boleta.ImpresaVerde,
      p: boleta.impresaRosa,
      y: boleta.impresaAmarilla,
    };

    const isPrint = !!estadoCopias[type];
    if (!isPrint) {
      const updatePrint = await db.boleta.update({
        where: {
          id: parseInt(boleta.id)
        }, 
        data:{
          ...(copias.includes('y') ? {impresaAmarilla : datePrint} : {}),
          ...(copias.includes('g') ? {ImpresaVerde : datePrint} : {}),
          ...(copias.includes('p') ? {impresaRosa : datePrint} : {}), 
        }
      })
    }

    const fonts = {
      Courier: {
        normal: 'Courier',
        bold: 'Courier-Bold',
        italics: 'Courier-Oblique',
        bolditalics: 'Courier-BoldOblique'
      }
    };

    const printer = new PdfPrinter(fonts);
    const filePath = 'boleta_epson.pdf';

    const docDefinition = {
      pageSize: { width: 612, height: 264 },
      pageMargins: [2, 2, 2, 2],
      defaultStyle: {
        font: 'Courier',
        fontSize: 8
      },	
      content: copias.flatMap((copia, i) => generarContenidoTercioCartaReimpresion(copia, i === 0, colors, boleta, despachador.name, isPrint, estadoCopias[type], numPaseSalida))
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const writeStream = fs.createWriteStream(filePath);

    pdfDoc.pipe(writeStream);
    pdfDoc.end();

      writeStream.on('finish', () => {
        print(filePath, { printer: `WFBASCULA` })
        .then(() => {
            console.log('Imprimiendo...') 
        })
        .catch(error => {
            return true
        })
      });
  }catch(err){
    console.log(err)
  }
};

const generarPaseDeSalidaTemporal = async(boleta, numPaseSalida) => {
  try{
    const colors = {o:'white', g: '#98FB98', p: 'pink', y:'yellow'}
    const datePrint = new Date()
    const despachador = await db.usuarios.findUnique({where: {usuarios:boleta.usuario}})
    const copias = ['y']; /* Genera Arreglo de Copias ['o', 'g', 'p', 'y'] puede ser ['o', 'g', 'y']  segun el caso */

    const fonts = {
      Courier: {
        normal: 'Courier',
        bold: 'Courier-Bold',
        italics: 'Courier-Oblique',
        bolditalics: 'Courier-BoldOblique'
      }
    };

    const printer = new PdfPrinter(fonts);
    const filePath = 'boleta_epson.pdf';

    const docDefinition = {
      pageSize: { width: 612, height: 264 },
      pageMargins: [2, 2, 2, 2],
      defaultStyle: {
        font: 'Courier',
        fontSize: 8
      },	
      content: copias.flatMap((copia, i) => generarContenidoTercioCarta(copia, i === 0, colors, boleta, despachador.name, numPaseSalida))
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const writeStream = fs.createWriteStream(filePath);

    pdfDoc.pipe(writeStream);
    pdfDoc.end();

    writeStream.on('finish', () => {
      print(filePath, { printer: `WFBASCULA` })
      .then(() => {
          console.log('Imprimiendo...') 
      })
      .catch(error => {
          return true
      })
    });
  }catch(err){
    console.log(err)
  }
}

module.exports = {
  imprimirPDF, 
  imprimirQRTolva,
  comprobanteDeCarga,  
  imprimirWorkForce, 
  imprimirTikets, 
  getReimprimirWorkForce,
  reImprimirTikets,
  generarPaseDeSalidaTemporal,
};
