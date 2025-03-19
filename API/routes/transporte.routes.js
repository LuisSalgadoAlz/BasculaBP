const transporte = require('express').Router();
const {getTransporteParaBoletas, getTransporte} = require('../controllers/transporte.controller.js')
const verificarToken = require('../middlewares/authJWT.js')

transporte.get("/boletas/", getTransporteParaBoletas);
transporte.get("/boletas/:idPlaca", getTransporteParaBoletas);

module.exports = transporte;  