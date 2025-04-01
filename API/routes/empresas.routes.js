const empresas = require("express").Router();
const {
  getEmpresas,
  postEmpresas,
  getStats,
  getSociosParaSelect,
  getEmpresaPorId,
  updateEmpresasPorId,
  getVehiculosPorEmpresa,
  postVehiculosDeEmpresa,
  getVehiculosPorID, 
  updateVehiculosPorID
} = require("../controllers/empresas.controller.js");
const verificarToken = require("../middlewares/authJWT.js");

empresas.get("/", verificarToken, getEmpresas);
empresas.get("/socios", verificarToken, getSociosParaSelect);
empresas.get("/stats", verificarToken, getStats);
empresas.get("/:id", verificarToken, getEmpresaPorId);
empresas.get("/vehiculos/:id", verificarToken,getVehiculosPorEmpresa);
empresas.get("/vehiculos/v/data", getVehiculosPorID);
empresas.post("/", verificarToken, postEmpresas);
empresas.post("/vehiculos", verificarToken, postVehiculosDeEmpresa);
empresas.put("/:id", verificarToken, updateEmpresasPorId);
empresas.put("/vehiculos/u/:idEmpresa", verificarToken, updateVehiculosPorID);
module.exports = empresas;
