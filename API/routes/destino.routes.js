const destino = require('express').Router();
const { getDestinoParaBoletas } = require('../controllers/destino.controller.js')
const verificarToken = require('../middlewares/authJWT.js')

destino.get("/boletas", verificarToken, getDestinoParaBoletas);

module.exports = destino;  