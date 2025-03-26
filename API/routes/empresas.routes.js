const empresas = require('express').Router();
const { getEmpresas, postEmpresas, getStats } = require('../controllers/empresas.controller.js')
const verificarToken = require('../middlewares/authJWT.js')

empresas.get("/", verificarToken, getEmpresas);
empresas.get("/stats", verificarToken,getStats);
empresas.post("/", verificarToken, postEmpresas);

module.exports = empresas;  