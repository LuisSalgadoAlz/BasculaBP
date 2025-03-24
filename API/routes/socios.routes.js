const socios = require('express').Router();
const { getSocios, postSocios, getStats } = require('../controllers/socios.controller.js')
const verificarToken = require('../middlewares/authJWT.js')

socios.get("/", verificarToken, getSocios);
socios.post("/", verificarToken, postSocios);
socios.get("/stats", verificarToken, getStats);
module.exports = socios;  