const guardia = require('express').Router();
const { getBuscarPlaca, updatePaseDeSalida, getStats } = require('../controllers/guardia.controller.js');
const verificarToken = require('../middlewares/authJWT.js')

guardia.get("/buscarPlaca", getBuscarPlaca)
guardia.get("/stats", getStats)
guardia.put("/upd/pase/:id", updatePaseDeSalida)
module.exports = guardia;  