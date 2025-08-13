const socios = require("express").Router();
const {
  getSocios,
  postSocios,
  getStats,
  getSocioPorID,
  updateSocios,
  getDireccionesPorSocios,
  postDirecciones,
  getDireccionesPorID, 
  putDireccionesPorID,
  postCrearFacturasPorSocios
} = require("../controllers/socios.controller.js");
const verificarToken = require("../middlewares/authJWT.js");

socios.get("/", verificarToken, getSocios);
socios.post("/", verificarToken, postSocios);
socios.post("/direcciones", verificarToken, postDirecciones);
socios.post("/crear/facturas", verificarToken, postCrearFacturasPorSocios);
socios.get("/stats", verificarToken, getStats);
socios.get("/:id", verificarToken, getSocioPorID);
socios.get("/direcciones/:id", verificarToken,getDireccionesPorSocios);
socios.get("/direcciones/f/:id",verificarToken, getDireccionesPorID);
socios.put("/:id", verificarToken, updateSocios);
socios.put("/direcciones/pt/", verificarToken, putDireccionesPorID);
module.exports = socios;
