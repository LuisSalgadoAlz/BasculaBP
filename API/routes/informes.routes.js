const informes = require('express').Router();
const { buquesBoletas, getResumenBFH, getBuqueDetalles, getBuqueStats, exportR1Importaciones, getInformePagoAtrasnporte } = require('../controllers/informes.controller');

informes.get('/buques', buquesBoletas)
informes.get('/resumenBFH', getResumenBFH)
informes.get('/buquedetalles', getBuqueDetalles)
informes.get('/stats', getBuqueStats)
informes.get('/generar/pagos/:buque/:factura', getInformePagoAtrasnporte)
informes.get('/export/r1/excel', exportR1Importaciones)

module.exports = informes;