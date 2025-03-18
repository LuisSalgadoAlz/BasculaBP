const clientes = require('express').Router();
const {getUsuariosParaBoletas} = require('../controllers/clientes.controller.js')
const verificarToken = require('../middlewares/authJWT.js')

clientes.get("/boletas", verificarToken, getUsuariosParaBoletas);

module.exports = clientes;  