const db = require('../lib/prisma')
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const {setLogger} = require('../utils/logger');
const { alertaSoporte } = require('../utils/cuerposCorreo');
const enviarCorreo = require('../utils/enviarCorreo');

const enviarMailDeSoporte = async(req, res) => {
   try {
    const token = req.header('Authorization')
    const verificado = jwt.verify(token, process.env.SECRET_KEY);
    const usuario = await db.usuarios.findUnique({
      where: {
        usuarios: verificado["usuarios"],
      },
    });
    const response = alertaSoporte(req.body, usuario, enviarCorreo)
    if (response.exito){
      return res.status(201).send({ msg: response.mensaje })
    }
    return res.status(201).send({ msgErr: response.mensaje })
   }catch(err) {
    
    console.log(err)
   }
}



module.exports = {
  enviarMailDeSoporte
};
