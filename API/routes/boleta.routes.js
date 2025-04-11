const boletas = require("express").Router();
const {
  getAllData,
  postBoletasNormal,
  getDataBoletas,
  getStatsBoletas,
  postClientePlacaMoto,
  getBoletaID, 
  updateBoletaOut
} = require("../controllers/boleta.controller");
const verificarToken = require("../middlewares/authJWT.js");

boletas.get("/", getAllData);
boletas.get("/stats", getStatsBoletas);
boletas.get("/data", getDataBoletas);
boletas.get("/boleta/:id", getBoletaID);
boletas.post("/", postBoletasNormal);
boletas.post("/newPlaca", postClientePlacaMoto);
boletas.put("/:id", updateBoletaOut);

module.exports = boletas;
