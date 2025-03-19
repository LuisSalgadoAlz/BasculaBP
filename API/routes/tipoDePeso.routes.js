const tipoDePeso = require('express').Router();
const {getTipoDePesoParaBoletas} = require('../controllers/tipoDePeso.controller.js')
const verificarToken = require('../middlewares/authJWT.js')

tipoDePeso.get("/boletas/", verificarToken, getTipoDePesoParaBoletas);

module.exports = tipoDePeso;  