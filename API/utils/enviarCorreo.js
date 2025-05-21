// backend/sendEmail.js
const nodemailer = require("nodemailer");
const dotenv = require('dotenv')

const transporter = nodemailer.createTransport({
  host: "mail.baprosa.com",
  port: 587,
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.MAIl,
    pass: process.env.CONTRAMAIL,
  },
});

/**
 * 
 * @param {*} destino al mail que a dirigido
 * @param {*} asunto cuerpo del mensaje
 * @param {*} mensaje mensaje en html
 */
async function enviarCorreo(destino, asunto, mensaje,) {
  try {
    await transporter.sendMail({
    from: `SISTEMA BASCULA <${process.env.MAIl}>`,
    to: destino,
    subject: asunto,
    html: mensaje,
  });
  }catch(err){
    console.log(`Se produjo el siguiente error: ${err}`)
  }
}

    module.exports = enviarCorreo;
