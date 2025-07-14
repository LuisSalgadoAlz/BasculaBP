const informes = require('express').Router();
const { buquesBoletas, getResumenBFH, getBuqueDetalles, getBuqueStats, exportR1Importaciones } = require('../controllers/informes.controller');

informes.get('/buques', buquesBoletas)
informes.get('/resumenBFH', getResumenBFH)
informes.get('/buquedetalles', getBuqueDetalles)
informes.get('/stats', getBuqueStats)
informes.get('/export/r1/excel', exportR1Importaciones)

module.exports = informes;