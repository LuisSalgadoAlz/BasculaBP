const fs = require('fs');
const { exec } = require('child_process');

const imprimirEpson = (boleta) => {
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
  const BOLD_CENTERED_BIG = CENTER + BOLD_ON + DOUBLE_SIZE;
  const BOLD_CENTERED = CENTER + BOLD_ON;
  const LINE = '________________________________________________________________________________'; 
  
  const PROCESO = boleta.proceso == 0 ? 'ENTRADA DE MATERIAL' : 'SALIDA DE MATERIAL'; 
  const LABEL = boleta.proceso == 0 ? 'Proveedor     :' : 'Cliente       :';
  const LABELSINSPACE = boleta.proceso == 0 ? 'Entrada' : 'Salida';
  const TIEMPOPROCESO = boleta.fechaFin - boleta.fechaInicio;
  const TIEMPOESTADIA = new Date(TIEMPOPROCESO).toISOString().slice(11, 19);


  // Build the receipt content with improved formatting
  const contenido = `
${INIT}${BOLD_CENTERED_BIG}BAPROSA${BOLD_OFF}
${BOLD_CENTERED}Boleta de Peso No. ${boleta.id}${LEFT}
${BOLD_CENTERED}Proceso: ${LABELSINSPACE} - ${quitarAcentos(boleta.movimiento)} / Duracion del Proceso: ${TIEMPOESTADIA}${LEFT}
${BOLD_ON}Fecha         :${BOLD_OFF} ${new Date().toLocaleString('es-ES')}
${BOLD_ON}${LABEL}${BOLD_OFF} ${quitarAcentos(boleta.socio)}               
${BOLD_ON}Placa         :${BOLD_OFF} ${stringtruncado(boleta.placa, 27)}${BOLD_ON}Hora de Entrada      :${BOLD_OFF} ${boleta.fechaInicio.toLocaleTimeString()}
${BOLD_ON}Motorista     :${BOLD_OFF} ${stringtruncado(quitarAcentos(boleta.motorista), 27)}${BOLD_ON}Hora de Salida       :${BOLD_OFF} ${boleta.fechaFin.toLocaleTimeString()}
${BOLD_ON}Origen        :${BOLD_OFF} ${quitarAcentos(boleta.origen)}       
${BOLD_ON}Destino       :${BOLD_OFF} ${quitarAcentos(boleta.destino)}                       
${BOLD_ON}Producto      :${BOLD_OFF} ${quitarAcentos(boleta.producto)}

${LINE}

${BOLD_ON}Peso Tara     :${BOLD_OFF} ${stringtruncado(`${boleta.pesoInicial} lb`, 27)}${BOLD_ON}Peso Teorico  :${BOLD_OFF} ${boleta.pesoTeorico} lb
${BOLD_ON}Peso Bruto    :${BOLD_OFF} ${stringtruncado(`${boleta.pesoFinal} lb`, 27)}${BOLD_ON}Desviacion    :${BOLD_OFF} ${boleta.desviacion} lb
${BOLD_ON}Peso Neto     :${BOLD_OFF} ${boleta.pesoNeto} lb                    

${LINE}

${BOLD_ON}Pesador       :${BOLD_OFF} ${stringtruncado(quitarAcentos(boleta.usuario), 27)}${BOLD_ON}Firma         :${BOLD_OFF} ________________
${CENTER}www.baprosa.com
${CENTER}Tel: (504) 2222-2222${LEFT}
${FORM_FEED}`;
  
  fs.writeFileSync(filePath, contenido);

  // Comando de impresión (Windows)
  exec(`print /D:"\\\\localhost\\BASCULA" ${filePath}`, (err, stdout, stderr) => {
    if (err) {
      console.error('Error al imprimir:', err);
      return;
    }
    
    console.log('Boleta impresa correctamente');
  });
};

const stringtruncado = (str, len) => {
  return str.length > len
    ? String(str).substring(0, len).padEnd(len , ' ')
    : String(str).padEnd(len, ' ');
};

const quitarAcentos = (str) => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

module.exports = imprimirEpson;
