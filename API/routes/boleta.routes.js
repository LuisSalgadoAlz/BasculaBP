const boletas = require('express').Router();
const { getAllData } = require('../controllers/boleta.controller');
const verificarToken = require('../middlewares/authJWT.js')

boletas.get('/', getAllData)

module.exports = boletas;  