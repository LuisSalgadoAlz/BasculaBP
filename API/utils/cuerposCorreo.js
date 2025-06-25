const { footerImgage } = require("../lib/image");
const dotenv = require("dotenv");

/**
 * Función para generar alertas por correo electrónico cuando se detectan desviaciones en el peso
 * @param {Object} nuevaBoleta - Objeto con los datos de la boleta
 * @param {Object} despachador - Objeto con los datos del usuario de báscula
 * @param {Function} enviarCorreo - Función para enviar el correo electrónico
 * @param {Array} destinatarios - Lista de correos electrónicos destinatarios
 * @returns {Object} Resultado de la operación de envío
 */
const alertaDesviacion = (nuevaBoleta, despachador, enviarCorreo) => {
  // Validar que los parámetros requeridos existan
  if (!nuevaBoleta || !despachador || !enviarCorreo) {
    console.error('Error: Faltan parámetros requeridos');
    return { exito: false, mensaje: 'Faltan parámetros requeridos' };
  }
  
  // Formatear la desviación con 2 decimales y signo
  const desviacionFormateada = parseFloat(nuevaBoleta.desviacion).toFixed(2);
  const signoDesviacion = nuevaBoleta.desviacion > 0 ? '+' : '';
  
  // Determinar clase de severidad según el valor absoluto de la desviación
  let colorDesviacion = '#d32f2f'; // Rojo por defecto
  let severidad = 'ALTA';
  
  const desviacionAbs = Math.abs(nuevaBoleta.desviacion);

  // Fecha y hora actual formateada
  const fechaHora = new Date().toLocaleString('es-GT', {
    dateStyle: 'medium',
    timeStyle: 'medium'
  });
  
  // Construir el cuerpo del correo con estilos mejorados
  const cuerpoMail = `
    <div style="font-family: Arial, sans-serif; border: 1px solid #ccc; border-radius: 8px; padding: 20px; max-width: 600px; margin: 0 auto;">
      <div style="background-color: ${colorDesviacion}; color: white; padding: 12px; border-radius: 4px; margin-bottom: 16px;">
        <h2 style="margin: 0;">🚨 Alerta de Desviación - Severidad ${severidad}</h2>
      </div>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 40%;">Boleta:</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${nuevaBoleta.numBoleta || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Socio:</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${nuevaBoleta.socio || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Transporte:</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${nuevaBoleta.empresa || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Placa:</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${nuevaBoleta.placa || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Placa:</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${nuevaBoleta.motorista || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Manifiesto:</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${nuevaBoleta.manifiesto || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Orden de compra:</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${nuevaBoleta.ordenDeCompra || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Orden de transferencia:</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${nuevaBoleta.ordenDeTransferencia || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Usuario de Báscula:</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${despachador.name || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Producto:</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${nuevaBoleta.producto || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Desviación:</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; color: ${colorDesviacion}; font-weight: bold;">
            ${signoDesviacion}${desviacionFormateada} lb
          </td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Fecha y Hora:</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${fechaHora}</td>
        </tr>
      </table>
      
      <p style="font-size: 14px; color: #555; margin-top: 16px;">
        Esta es una notificación automática generada por el sistema de control de báscula.
        Por favor, no responda a este correo.
      </p>

      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;"/>
      <div style="text-align: center;">
        ${footerImgage}
        <p style="font-size: 12px; color: #888;">
          SISTEMA DE BÁSCULA · <strong>BAPROSA</strong><br/>
          ©2025 BAPROSA. Todos los derechos reservados.
        </p>
      </div>
    </div>
  `;
  
  // Generar el asunto del correo
  const asunto = `Alerta de Desviación [${severidad}] - Boleta #${nuevaBoleta.numBoleta}`;
  
  try {

    enviarCorreo(process.env.END_MAILS, asunto, cuerpoMail)
        
    return {
      exito: true,
      mensaje: 'Alerta enviada correctamente',
      destinatario: 'practicas@baprosa.com',
      fecha: new Date()
    };
    
  } catch (error) {
    console.error('Error al enviar alerta de desviación:', error);
    return {
      exito: false,
      mensaje: `Error al enviar alerta: ${error.message}`,
      error: error
    };
  }
};

const alertaCancelacion = (boletaCancelada, usuario, enviarCorreo) => {
  // Validar que los parámetros requeridos existan
  if (!boletaCancelada || !usuario || !enviarCorreo) {
    console.error('Error: Faltan parámetros requeridos');
    return { exito: false, mensaje: 'Faltan parámetros requeridos' };
  }
  
  // Fecha y hora actual formateada
  const fechaHora = new Date().toLocaleString('es-GT', {
    dateStyle: 'medium',
    timeStyle: 'medium'
  });
  
  // Definir el color para la alerta de cancelación (naranja)
  const colorAlerta = '#ff9800';
  
  // Construir el cuerpo del correo con estilos mejorados
  const cuerpoMail = `
    <div style="font-family: Arial, sans-serif; border: 1px solid #ccc; border-radius: 8px; padding: 20px; max-width: 600px; margin: 0 auto;">
      <div style="background-color: ${colorAlerta}; color: white; padding: 12px; border-radius: 4px; margin-bottom: 16px;">
        <h2 style="margin: 0;">🚫 Alerta de Cancelación de Boleta</h2>
      </div>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 40%;">Boleta Cancelada:</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${boletaCancelada.numBoleta || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Socio:</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${boletaCancelada.socio || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Transporte:</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${boletaCancelada.empresa || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Placa:</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${boletaCancelada.placa || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Usuario que cancela:</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${usuario.name || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Producto:</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${boletaCancelada.producto || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Motivo de cancelación:</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${boletaCancelada.observaciones || 'No especificado'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Fecha y Hora:</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${fechaHora}</td>
        </tr>
      </table>
      
      <p style="font-size: 14px; color: #555; margin-top: 16px;">
        Esta es una notificación automática generada por el sistema de control de báscula.
        Por favor, no responda a este correo.
      </p>

      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;"/>
      <div style="text-align: center;">  
        ${footerImgage}
        <p style="font-size: 12px; color: #888;">
          SISTEMA DE BÁSCULA · <strong>BAPROSA</strong><br/>
          ©2025 BAPROSA. Todos los derechos reservados.
        </p>
      </div>
    </div>
  `;
  
  // Generar el asunto del correo
  const asunto = `Alerta de Cancelación - Boleta #${boletaCancelada.numBoleta}`;
  
  try {
    // Enviar el correo de notificación
    enviarCorreo(process.env.END_MAILS, asunto, cuerpoMail);
        
    return {
      exito: true,
      mensaje: 'Alerta de cancelación enviada correctamente',
      destinatario: 'practicas@baprosa.com',
      fecha: new Date()
    };
    
  } catch (error) {
    console.error('Error al enviar alerta de cancelación:', error);
    return {
      exito: false,
      mensaje: `Error al enviar alerta: ${error.message}`,
      error: error
    };
  }
};

const alertaSoporte = (datosFormulario, usuario, enviarCorreo) => {
  if (!datosFormulario || !usuario || !enviarCorreo) {
    console.error('Error: Faltan parámetros requeridos');
    return { exito: false, mensaje: 'Faltan parámetros requeridos' };
  }
  
  const fechaHora = new Date().toLocaleString('es-GT', {
    dateStyle: 'medium',
    timeStyle: 'medium'
  });
  
  const colorAlerta = '#1976d2';
  
  const iconoTipoProblema = {
    'Error o bug': '🐞',
    'Funcionalidad incorrecta': '⚠️',
    'Sugerencia de mejora': '💡'
  };
  
  const icono = iconoTipoProblema[datosFormulario.type] || '❓';
  
  // Construir el cuerpo del correo con estilos mejorados
  const cuerpoMail = `
    <div style="font-family: Arial, sans-serif; border: 1px solid #ccc; border-radius: 8px; padding: 20px; max-width: 600px; margin: 0 auto;">
      <div style="background-color: ${colorAlerta}; color: white; padding: 12px; border-radius: 4px; margin-bottom: 16px;">
        <h2 style="margin: 0;">${icono} Solicitud de Soporte Técnico</h2>
      </div>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 40%;">Tipo de Problema:</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${datosFormulario.type || 'No especificado'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Usuario:</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${usuario.name || 'No identificado'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Rol del usuario:</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${usuario.tipo || 'No especificado'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Fecha y Hora:</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${new Date().toLocaleString()}</td>
        </tr>
      </table>
      
      <div style="margin-top: 20px; background-color: #f5f5f5; padding: 12px; border-radius: 4px;">
        <h3 style="margin-top: 0;">Descripción del problema:</h3>
        <p style="margin-bottom: 0;">${datosFormulario.description || 'No se proporcionó descripción'}</p>
      </div>
      
      <p style="font-size: 14px; color: #555; margin-top: 16px;">
        Este reporte fue generado desde el Sistema de Báscula.
        Por favor, no responda a este correo.
      </p>

      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;"/>
      <div style="text-align: center;">
        ${footerImgage} 
        <p style="font-size: 12px; color: #888;">
          SISTEMA DE BÁSCULA · <strong>BAPROSA</strong><br/>
          ©2025 BAPROSA. Todos los derechos reservados.
        </p>
      </div>
    </div>
  `;
  
  // Generar el asunto del correo
  const asunto = `Soporte Técnico - ${datosFormulario.type} - ${usuario.name}`;
  
  try {
    // Enviar el correo de notificación
    enviarCorreo(process.env.SUPORT_MAILS, asunto, cuerpoMail);
        
    return {
      exito: true,
      mensaje: 'Solicitud de soporte enviada correctamente',
    };
    
  } catch (error) {
    console.error('Error al enviar solicitud de soporte:', error);
    return {
      exito: false,
      mensaje: 'Solicitud de soporte no ha sido enviada.',
    };
  }
};

module.exports = {alertaCancelacion, alertaDesviacion, alertaSoporte};
