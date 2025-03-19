const productos = require('express').Router();
const { getProductosParaBoletas } = require('../controllers/productos.controller.js')
const verificarToken = require('../middlewares/authJWT.js')

productos.get("/boletas", verificarToken, getProductosParaBoletas);

module.exports = productos;  