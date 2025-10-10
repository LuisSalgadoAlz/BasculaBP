const bodegapt = require('express').Router();
const { getUserForAsignar, crearManifiesto, getLogsManifiestos, crearManifiestos, getUserFront, getManifiestoDetalles, putComenzarPicking, getLastPickingForDocNum, getManifiestoDetallesLocal } = require('../controllers/bodegapt.controller.js');
const verificarToken = require('../middlewares/authJWT.js');

bodegapt.get("/list/users", verificarToken, getUserForAsignar);
bodegapt.get("/manifiestos/logs/:DocNum", verificarToken, getLogsManifiestos);
bodegapt.get("/probar/:DocNum", verificarToken, getLogsManifiestos);
bodegapt.get("/user", verificarToken, getUserFront)
bodegapt.get("/manifiestos/detalles/:DocNum", verificarToken, getManifiestoDetalles)
bodegapt.get("/manifiestos/detalles/picking/:DocNum", verificarToken, getLastPickingForDocNum)
bodegapt.get("/manifiestos/detalles/local/:DocNum", verificarToken, getManifiestoDetallesLocal)
bodegapt.post("/asignar/manifiesto", verificarToken, crearManifiestos);
bodegapt.put("/picking/manifiestos/v1/:DocNum", verificarToken, putComenzarPicking);

module.exports = bodegapt;