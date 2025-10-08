const bodegapt = require('express').Router();
const { getUserForAsignar, crearManifiesto, getLogsManifiestos, crearManifiestos, getUserFront, getManifiestoDetalles } = require('../controllers/bodegapt.controller.js');
const verificarToken = require('../middlewares/authJWT.js');

bodegapt.get("/list/users", getUserForAsignar);
bodegapt.get("/manifiestos/logs/:DocNum", getLogsManifiestos);
bodegapt.get("/probar/:DocNum", getLogsManifiestos);
bodegapt.get("/user", getUserFront)
bodegapt.get("/manifiestos/detalles/:DocNum", getManifiestoDetalles)
bodegapt.post("/asignar/manifiesto", crearManifiestos);

module.exports = bodegapt;