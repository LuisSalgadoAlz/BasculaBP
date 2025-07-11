const informes = require('express').Router();
const { buquesBoletas, getResumenBFH, getBuqueDetalles, getBuqueStats } = require('../controllers/informes.controller');

informes.get('/buques', buquesBoletas)
informes.get('/resumenBFH', getResumenBFH)
informes.get('/buquedetalles', getBuqueDetalles)
informes.get('/stats', getBuqueStats)

module.exports = informes;