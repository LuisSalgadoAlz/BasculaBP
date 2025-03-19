const procesos = require('express').Router();
const { getProcesosParaBoletas } = require('../controllers/procesos.controller.js')
const verificarToken = require('../middlewares/authJWT.js')

procesos.get("/boletas", verificarToken, getProcesosParaBoletas);

module.exports = procesos;  