const boletas = require("express").Router();
const {
  getAllData,
  postBoletasNormal,
  getDataBoletas,
  getStatsBoletas,
  getBoletaID, 
  updateBoleta,
  postBoleta,
  getBoletasHistorial,
  getReimprimir
} = require("../controllers/boleta.controller");
const verificarToken = require("../middlewares/authJWT.js");

boletas.get("/", getAllData);
boletas.get("/stats", getStatsBoletas);
boletas.get("/data", getDataBoletas);
boletas.get("/boleta/:id", getBoletaID);
boletas.get("/historial", getBoletasHistorial)
boletas.get("/historial/:id", getReimprimir)
boletas.post("/", postBoletasNormal);
boletas.post("/newPlaca", postBoleta);
boletas.put("/:id", updateBoleta);

module.exports = boletas;
