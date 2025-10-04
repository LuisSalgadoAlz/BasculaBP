const bodegapt = require('express').Router();
const { getUserForAsignar, crearManifiesto, getLogsManifiestos } = require('../controllers/bodegapt.controller.js');
const verificarToken = require('../middlewares/authJWT.js');

bodegapt.get("/list/users", getUserForAsignar);
bodegapt.get("/manifiestos/logs/:DocNum", getLogsManifiestos);
bodegapt.get("/probar/:DocNum", getLogsManifiestos);
bodegapt.post("/asignar/manifiesto", crearManifiesto);

module.exports = bodegapt;  