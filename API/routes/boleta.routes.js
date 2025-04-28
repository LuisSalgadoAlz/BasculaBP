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
  getReimprimir,
  getBoletasCompletadasDiarias,
  getBoletasMes,
  getTimeLineForComponent
} = require("../controllers/boleta.controller");
const verificarToken = require("../middlewares/authJWT.js");

boletas.get("/", getAllData);
boletas.get("/stats", getStatsBoletas);
boletas.get("/data", getDataBoletas);
boletas.get("/data/completadas", getBoletasCompletadasDiarias);
boletas.get("/boleta/:id", getBoletaID);
boletas.get("/historial", getBoletasHistorial)
boletas.get("/historial/:id", getReimprimir)
boletas.get("/calendario/mes", getBoletasMes)
boletas.get("/calendario/mes/detalles", getTimeLineForComponent)
boletas.post("/", postBoletasNormal);
boletas.post("/newPlaca", postBoleta);
boletas.put("/:id", updateBoleta);

module.exports = boletas;
