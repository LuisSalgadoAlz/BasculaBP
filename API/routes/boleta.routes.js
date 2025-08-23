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
  updateCancelBoletas,
  getMovimientosYProductos,
  getConfigTolerancia,
  getReimprimirTicket,
} = require("../controllers/boleta.controller");
const { exportToExcel } = require("../controllers/exportaciones.controller.js");
const { imprimirPDF, imprimirWorkForce, reimprimirComprobante } = require("../controllers/impresiones.controller.js");
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
boletas.post("/export/excel/", exportToExcel)
boletas.get("/reimprimir/ticket/", getReimprimirTicket)
boletas.get("/reimprimir/comprobante/:id", reimprimirComprobante)
boletas.post("/print/workforce/", imprimirWorkForce)
boletas.get("/informes/", getMovimientosYProductos)
boletas.get("/config/tolerancia", getConfigTolerancia)
boletas.post("/", postBoletasNormal);
boletas.post("/newPlaca", postBoleta);
boletas.put("/:id", updateBoleta);
boletas.put("/cancelar/:id", updateCancelBoletas);

module.exports = boletas;
