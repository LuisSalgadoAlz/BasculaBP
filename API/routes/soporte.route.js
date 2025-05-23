const soporte = require('express').Router();
const { enviarMailDeSoporte } = require('../controllers/soporte.controller.js');
const verificarToken = require('../middlewares/authJWT.js')

soporte.post("/", enviarMailDeSoporte);

module.exports = soporte;  