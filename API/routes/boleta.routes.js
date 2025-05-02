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
  getTimeLineForComponent,
  updateCancelBoletas
} = require("../controllers/boleta.controller");
const { imprimirPDF } = require("../controllers/impresiones.controller.js");
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
boletas.get("/pdf/bol/:id", imprimirPDF)
boletas.post("/", postBoletasNormal);
boletas.post("/newPlaca", postBoleta);
boletas.put("/:id", updateBoleta);
boletas.put("/cancelar/:id", updateCancelBoletas);

module.exports = boletas;
