const fs = require('fs');
const { exec } = require('child_process');
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

const imprimirEpson = (boleta) => {
  const filePath = 'boleta_epson.txt';
  
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
  
    // Comandos para marca de agua
    const COLOR_LIGHT = '\x1Br\x01';   // Selecciona color más claro (reducción de intensidad)
    const COLOR_NORMAL = '\x1Br\x00';  // Vuelve al color normal
    const NORMAL_SIZE = '\x1B!\x00';    // Tamaño normal
    const WATERMARK_FORMAT = CENTER + COLOR_LIGHT ; // Formato de marca de agua
    const WATERMARK_RESET = NORMAL_SIZE + COLOR_NORMAL + LEFT 
  /**
   * ? Variables de la boleta
   */
  const LABEL = boleta.proceso == 0 ? 'Proveedor     :' : 'Cliente       :';
  const LABELSINSPACE = boleta.proceso == 0 ? 'Entrada' : 'Salida';
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
  const msg = fueraTol ? `${BOLD_CENTERED} *****  F U E R A  D E  T O L E R A N C I A  ***** ${LEFT}` : '';

  /**
   * Detecion de reimprisiones
   */
  const isOriginal = boleta.impreso == null
  const WATERMARK_MSG = isOriginal ? "" : `${BOLD_CENTERED}***** C O P I A  |  C O P I A  |  C O P I A *****${LEFT}` ;
  const LABEL_COPIA = isOriginal ? 
  `${BOLD_ON}Fecha         :${BOLD_OFF} ${stringtruncado(new Date().toLocaleString('es-ES'), 27)}` 
  : `${BOLD_ON}Reimpreso     :${BOLD_OFF} ${stringtruncado(new Date().toLocaleString('es-ES'), 27)}${BOLD_ON}Impreso         :${BOLD_OFF} ${boleta.impreso.toLocaleString('es-ES')}`
  

  const contenido = `
${INIT}${BOLD_CENTERED_BIG}BAPROSA${BOLD_OFF}
${BOLD_CENTERED}Boleta de Peso No. ${boleta.id}${LEFT}${BOLD_CENTERED}Proceso: ${LABELSINSPACE} - ${quitarAcentos(boleta.movimiento)} / Duracion del Proceso: ${TIEMPOESTADIA}${LEFT}
${LABEL_COPIA}
${BOLD_ON}${LABEL}${BOLD_OFF} ${quitarAcentos(boleta.socio)}               
${BOLD_ON}Placa         :${BOLD_OFF} ${stringtruncado(boleta.placa, 27)}${BOLD_ON}Hora de Entrada :${BOLD_OFF} ${boleta.fechaInicio.toLocaleTimeString()}
${BOLD_ON}Motorista     :${BOLD_OFF} ${stringtruncado(quitarAcentos(boleta.motorista), 27)}${BOLD_ON}Hora de Salida  :${BOLD_OFF} ${boleta.fechaFin.toLocaleTimeString()}
${BOLD_ON}Transporte    :${BOLD_OFF} ${quitarAcentos(boleta.empresa)}
${BOLD_ON}Origen        :${BOLD_OFF} ${quitarAcentos(origen)}       
${BOLD_ON}Destino       :${BOLD_OFF} ${quitarAcentos(destino)}                       
${BOLD_ON}Producto      :${BOLD_OFF} ${quitarAcentos(boleta.producto)}
${WATERMARK_MSG}${LINE}

${BOLD_ON}Peso Tara     :${BOLD_OFF} ${stringtruncado(`${boleta.pesoInicial} lb`, 27)}${BOLD_ON}Peso Teorico  :${BOLD_OFF} ${String(boleta.pesoTeorico).trim()} lb ${BOLD_ON}
${BOLD_ON}Peso Bruto    :${BOLD_OFF} ${stringtruncado(`${boleta.pesoFinal} lb`, 27)}${BOLD_ON}Desviacion    :${BOLD_OFF} ${String(boleta.desviacion).trim()} lb ${BOLD_ON}
${BOLD_ON}Peso Neto     :${BOLD_OFF} ${stringtruncado(`${String(boleta.pesoNeto).trim()} lb`, 27)} ${BOLD_ON}                  
${msg}${LINE}

${BOLD_ON}Pesador       :${BOLD_OFF} ${stringtruncado(quitarAcentos(boleta.usuario), 27)}${BOLD_ON}Firma         :${BOLD_OFF} ________________

${CENTER} www.baprosa.com | (504) 2222-2222 ${LEFT}`;
  
  fs.writeFileSync(filePath, contenido);

/*   exec(`print /D:"\\\\localhost\\BASCULA" ${filePath}`, (err, stdout, stderr) => {
    if (err) {
      console.error('Error al imprimir:', err);
      return;
    }
    
    actualizarImpresion(boleta.id)
  }); */
};

const stringtruncado = (str, len) => {
  return str.length > len
    ? String(str).substring(0, len).padEnd(len , ' ')
    : String(str).padEnd(len, ' ');
};

const quitarAcentos = (str) => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

const actualizarImpresion = async (id) => {
  try{
    const updateBoletaImpresion = await db.boleta.update({
      where : {
        id : parseInt(id)
      }, 
      data : {
        impreso : new Date()
      }
    })
  }catch (err) {
    console.log(err)
  }
}

module.exports = imprimirEpson;
