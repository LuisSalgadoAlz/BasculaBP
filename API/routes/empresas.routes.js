const empresas = require('express').Router();
const { getEmpresas, postEmpresas, getStats, getSociosParaSelect, getEmpresaPorId } = require('../controllers/empresas.controller.js')
const verificarToken = require('../middlewares/authJWT.js')

empresas.get("/", verificarToken, getEmpresas);
empresas.get("/socios", verificarToken, getSociosParaSelect);
empresas.get("/stats", verificarToken,getStats);
empresas.get("/:id", verificarToken, getEmpresaPorId);
empresas.post("/", verificarToken, postEmpresas);

module.exports = empresas;  