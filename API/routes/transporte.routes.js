const transporte = require('express').Router();
const {getTransporteParaBoletas} = require('../controllers/transporte.controller.js')
const verificarToken = require('../middlewares/authJWT.js')

transporte.get("/", verificarToken, getTransporteParaBoletas);

module.exports = transporte;  