const bodegapt = require('express').Router();
const { getUserForAsignar, crearManifiesto } = require('../controllers/bodegapt.controller.js');
const verificarToken = require('../middlewares/authJWT.js');
const { getManifiestosAsignados } = require('../sockets/websocketPeso.js');

bodegapt.get("/list/users", getUserForAsignar);
bodegapt.get("/probar", getManifiestosAsignados);
bodegapt.post("/asignar/manifiesto", crearManifiesto);

module.exports = bodegapt;  