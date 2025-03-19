const motoristas = require('express').Router();
const { getMotoristasParaBoletas } = require('../controllers/motoristas.controller.js')
const verificarToken = require('../middlewares/authJWT.js')

motoristas.get("/boletas", verificarToken, getMotoristasParaBoletas);

module.exports = motoristas;  