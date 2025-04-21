const fs = require('fs');
const PDFDocument = require('pdfkit');
const { print } = require('pdf-to-printer');

const imprimirEpson = (req, res) => {
  const filePath = 'boleta_epson.pdf';
  const doc = new PDFDocument({size:'Letter', margins: 0});
  
  doc.pipe(fs.createWriteStream(filePath));

  // Configurar la tipografía a Courier (monoespaciada)
  doc.font('Courier-Bold').fontSize(11);

  doc.text('BAPROSA', { align: 'center' })
    .moveDown(1)
    .text('Boleta de Peso No. 01280', { align: 'center' })
    .moveDown(2);

  // Coordenadas base para las columnas
  const leftX = 50;
  const rightX = 370;
  let y = doc.y;

  doc.moveTo(36, y)        // punto inicial (x, y)
  .lineTo(576, y)       // punto final (ancho página Letter - márgenes)
  .stroke(); 
  y += 10;
  // Datos en dos columnas
  const twoColumnRow = (leftText, rightText = '') => {
    doc.text(leftText, leftX, y);
    if (rightText) doc.text(rightText, rightX, y);
    y += 15;
  };

  twoColumnRow('Fecha         : 14 de Abril de 2025');
  twoColumnRow('Nombre        : Hermanitos Alvarez Carbajal', 'Transporte    : DIDERPROBA');
  twoColumnRow('Producto      : Migon', 'Movimiento    : Flete de Venta');
  twoColumnRow('Placa         : C116807', 'Tiempo Estadía: 01:45');
  twoColumnRow('Motorista     : HECTOR SALAZAR', 'Transportista : DIDERPROBA');
  twoColumnRow('Origen        : BAPROSA');
  twoColumnRow('Destino       : BAPROSA');
  twoColumnRow('Peso Entrada  : 31,580', 'Peso Salida   : 81,660');
  twoColumnRow('Peso Neto     : 50,080', 'Peso Teórico  : 50,000');
  twoColumnRow('Desviación    : 80');

  y += 10;

  twoColumnRow('Pesador       : Luis Armando Salgado', 'Autorizado  : ');

  y += 10;
  doc.moveTo(36, y)        // punto inicial (x, y)
     .lineTo(576, y)       // punto final (ancho página Letter - márgenes)
     .stroke(); 

  doc.end();

  const options = {
    printer: 'BASCULA', // Asegúrate de que el nombre coincida con el que tienes configurado
    silent: true,
  };
  


  print(filePath, options).then(() => {
      console.log('Impresión realizada con éxito');
      // Luego de imprimir, enviar el archivo al navegador
      res.download(filePath, 'boleta_impresa.pdf', (err) => {
        if (err) {
          console.error('Error al enviar el archivo:', err);
          res.status(500).send('Error al enviar el archivo');
        }
      });
    })
  .catch((err) => {
      console.error('Error de impresión:', err);
      res.status(500).send('Error de impresión');
  }); 
};

module.exports = imprimirEpson;
