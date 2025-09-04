const guardia = require('express').Router();
const { getBuscarPlaca, updatePaseDeSalida, getStats, getPorcentajeDeCumplimiento } = require('../controllers/guardia.controller.js');
const verificarToken = require('../middlewares/authJWT.js')

guardia.get("/buscarPlaca", getBuscarPlaca)
guardia.get("/stats", getStats)
guardia.get("/porcentajeCumplimiento", getPorcentajeDeCumplimiento)
guardia.put("/upd/pase/:id", updatePaseDeSalida)
module.exports = guardia;  