const transporte = require('express').Router();
const {getTransporteParaBoletas, getTransporte} = require('../controllers/transporte.controller.js')
const verificarToken = require('../middlewares/authJWT.js')

transporte.get("/boletas/", verificarToken, getTransporte);
transporte.get("/boletas/:idPlaca", verificarToken, getTransporteParaBoletas);

module.exports = transporte;  