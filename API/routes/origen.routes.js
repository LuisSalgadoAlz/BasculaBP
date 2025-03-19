const origen = require('express').Router();
const { getOrigenParaBoletas } = require('../controllers/origen.controller.js')
const verificarToken = require('../middlewares/authJWT.js')

origen.get("/boletas", verificarToken, getOrigenParaBoletas);

module.exports = origen;  