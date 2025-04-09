const boletas = require('express').Router();
const { getAllData, postBoletasNormal, getDataBoletas, getStatsBoletas } = require('../controllers/boleta.controller');
const verificarToken = require('../middlewares/authJWT.js')

boletas.get('/', getAllData)
boletas.get('/stats', getStatsBoletas)
boletas.get('/data', getDataBoletas)
boletas.post('/', postBoletasNormal)

module.exports = boletas;  