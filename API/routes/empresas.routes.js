const empresas = require('express').Router();
const { getEmpresas, postEmpresas } = require('../controllers/empresas.controller.js')
const verificarToken = require('../middlewares/authJWT.js')

empresas.get("/", getEmpresas);
empresas.post("/", postEmpresas);

module.exports = empresas;  