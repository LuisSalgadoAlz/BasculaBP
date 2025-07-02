const guardia = require('express').Router();
const { getBuscarPlaca } = require('../controllers/guardia.js');
const verificarToken = require('../middlewares/authJWT.js')

guardia.get("/buscarPlaca", getBuscarPlaca)
module.exports = guardia;  