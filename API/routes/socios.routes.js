const socios = require('express').Router();
const { getSocios, postSocios, getStats, getSocioPorID, updateSocios } = require('../controllers/socios.controller.js')
const verificarToken = require('../middlewares/authJWT.js')

socios.get("/", verificarToken, getSocios);
socios.post("/", verificarToken, postSocios);
socios.get("/stats", verificarToken, getStats);
socios.get("/:id", verificarToken, getSocioPorID);
socios.put("/:id", verificarToken, updateSocios);
module.exports = socios;  