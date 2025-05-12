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
        <img src="data:image/png;base64,logo" alt="BAPROSA" style="max-height: 100px;"/>
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

    enviarCorreo('practicas@baprosa.com', asunto, cuerpoMail)
        
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

module.exports = alertaDesviacion;
