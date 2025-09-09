const guardia = require('express').Router();
const { getBuscarPlaca, updatePaseDeSalida, getStats, getPorcentajeDeCumplimiento, getBoletasPorFecha, getPorcentajeMes, getBoletasPorFechaCalendario } = require('../controllers/guardia.controller.js');
const verificarToken = require('../middlewares/authJWT.js')

guardia.get("/buscarPlaca", getBuscarPlaca)
guardia.get("/stats", getStats)
guardia.get("/porcentajeCumplimiento", getPorcentajeDeCumplimiento)
guardia.get("/boletas/dias", getBoletasPorFecha)
guardia.get("/calendario/mes", getPorcentajeMes)
guardia.post("/calendario/dia", getBoletasPorFechaCalendario)
guardia.put("/upd/pase/:id", updatePaseDeSalida)
module.exports = guardia;  