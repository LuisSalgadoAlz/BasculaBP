const db = require('../lib/prisma')
const dotenv = require("dotenv");
const {setLogger} = require('../utils/logger');
const { alertaSoporte } = require('../utils/cuerposCorreo');

const enviarMailDeSoporte = (req, res) => {
   try {
    res.send({token: req.header('Authorization')})
   }catch(err) {
    console.log(err)
   }
}



module.exports = {
  enviarMailDeSoporte
};
