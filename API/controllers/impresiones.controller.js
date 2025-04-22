const fs = require('fs');
const { exec } = require('child_process');

const imprimirEpson = (req, res) => {
  const filePath = 'boleta_epson.txt';
  
  // ESC @ - Initialize printer
  // ESC ! - Select print mode
  // ESC t - Select character code table
  // ESC E - Bold on/off
  // ESC - - Underline on/off
  // LF - Line feed

  const INIT = '\x1B@';              // Initialize printer
  const BOLD_ON = '\x1B!\x08';       // Turn bold on
  const BOLD_OFF = '\x1B!\x00';      // Turn bold off
  const DOUBLE_WIDTH = '\x1B!\x20';  // Double width text
  const DOUBLE_HEIGHT = '\x1B!\x10'; // Double height text
  const DOUBLE_SIZE = '\x1B!\x30';   // Double width and height
  const UNDERLINE = '\x1B-\x01';     // Turn underline on
  const NO_UNDERLINE = '\x1B-\x00';  // Turn underline off
  const CENTER = '\x1Ba\x01';        // Center alignment
  const LEFT = '\x1Ba\x00';          // Left alignment
  const RIGHT = '\x1Ba\x02';         // Right alignment
  const FORM_FEED = '\x0C';          // Form feed - Eject page
  const LINE = '________________________________________________________________________________'; // Separator line

  // Build the receipt content with improved formatting
  const contenido = 
    `${INIT}${CENTER}${DOUBLE_SIZE}BAPROSA${BOLD_OFF}${LEFT}
${CENTER}${BOLD_ON}Boleta de Peso No. 01280${BOLD_OFF}${LEFT}

${BOLD_ON}Fecha         :${BOLD_OFF} 14 de Abril de 2025
${BOLD_ON}Nombre        :${BOLD_OFF} Hermanitos Alvarez Carbajal   ${BOLD_ON}Transporte    :${BOLD_OFF} DIDERPROBA
${BOLD_ON}Producto      :${BOLD_OFF} Migon                         ${BOLD_ON}Movimiento    :${BOLD_OFF} Flete de Venta
${BOLD_ON}Placa         :${BOLD_OFF} C116807                       ${BOLD_ON}Tiempo Estadia:${BOLD_OFF} 01:45
${BOLD_ON}Motorista     :${BOLD_OFF} HECTOR SALAZAR                ${BOLD_ON}Transportista :${BOLD_OFF} DIDERPROBA
${BOLD_ON}Origen        :${BOLD_OFF} BAPROSA
${BOLD_ON}Destino       :${BOLD_OFF} BAPROSA

${LINE}

${BOLD_ON}Peso Entrada  :${BOLD_OFF} 31,580 kg                     ${BOLD_ON}Peso Salida   :${BOLD_OFF} 81,660 kg
${BOLD_ON}Peso Neto     :${BOLD_OFF} 50,080 kg                     ${BOLD_ON}Peso Teorico  :${BOLD_OFF} 50,000 kg
${BOLD_ON}Desviacion    :${BOLD_OFF} 80 kg

${LINE}

${BOLD_ON}Pesador       :${BOLD_OFF} Luis Armando Salgado          ${BOLD_ON}Autorizado    :${BOLD_OFF} ________________

${CENTER}www.baprosa.com${LEFT}
${CENTER}Tel: (XXX) XXX-XXXX${LEFT}

${LINE}
${FORM_FEED}`;
  
  fs.writeFileSync(filePath, contenido);

  // Comando de impresión (Windows)
  exec(`print /D:"\\\\localhost\\BASCULA" ${filePath}`, (err, stdout, stderr) => {
    if (err) {
      console.error('Error al imprimir:', err);
      res.status(500).send('Error al imprimir');
      return;
    }
    
    console.log('Boleta impresa correctamente');
    res.download(filePath, 'boleta_impresa.txt');
  });
};

module.exports = imprimirEpson;
