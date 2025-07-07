const guardia = require('express').Router();
const { getBuscarPlaca, updatePaseDeSalida } = require('../controllers/guardia.controller.js');
const verificarToken = require('../middlewares/authJWT.js')

guardia.get("/buscarPlaca", getBuscarPlaca)
guardia.put("/upd/pase/:id", updatePaseDeSalida)
module.exports = guardia;  