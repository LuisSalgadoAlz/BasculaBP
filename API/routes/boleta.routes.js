const boletas = require('express').Router();
const { getAllData, postBoletasNormal, getDataBoletas } = require('../controllers/boleta.controller');
const verificarToken = require('../middlewares/authJWT.js')

boletas.get('/', getAllData)
boletas.get('/data', getDataBoletas)
boletas.post('/', postBoletasNormal)

module.exports = boletas;  