const bodegapt = require('express').Router();
const { getUserForAsignar, crearManifiesto } = require('../controllers/bodegapt.controller.js');
const verificarToken = require('../middlewares/authJWT.js')

bodegapt.get("/list/users", getUserForAsignar);
bodegapt.post("/asignar/manifiesto", crearManifiesto);

module.exports = bodegapt;  