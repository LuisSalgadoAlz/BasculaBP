const empresas = require('express').Router();
const { getEmpresas, postEmpresas, getStats, getSociosParaSelect, getEmpresaPorId, updateEmpresasPorId } = require('../controllers/empresas.controller.js')
const verificarToken = require('../middlewares/authJWT.js')

empresas.get("/", verificarToken, getEmpresas);
empresas.get("/socios", verificarToken, getSociosParaSelect);
empresas.get("/stats", verificarToken,getStats);
empresas.get("/:id", verificarToken, getEmpresaPorId);
empresas.post("/", verificarToken, postEmpresas);
empresas.put("/:id", verificarToken, updateEmpresasPorId);
module.exports = empresas;  