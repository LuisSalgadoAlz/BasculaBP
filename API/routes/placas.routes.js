const placas = require('express').Router();
const {getPlacasParaBoletas} = require('../controllers/placas.controller.js')
const verificarToken = require('../middlewares/authJWT.js')

placas.get("/boletas", verificarToken, getPlacasParaBoletas);

module.exports = placas;  