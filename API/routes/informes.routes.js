const informes = require('express').Router();
const { buquesBoletas, getResumenBFH, getBuqueDetalles } = require('../controllers/informes.controller');

informes.get('/buques', buquesBoletas)
informes.get('/resumenBFH', getResumenBFH)
informes.get('/buquedetalles', getBuqueDetalles)

module.exports = informes;