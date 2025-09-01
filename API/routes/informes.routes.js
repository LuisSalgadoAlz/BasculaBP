const informes = require('express').Router();
const { buquesBoletas, getResumenBFH, getBuqueDetalles, getBuqueStats, exportR1Importaciones, getInformePagoAtrasnporte, getRerportContenerizada, getBoletasCasulla, getBoletasCasullaDetalleSocio } = require('../controllers/informes.controller');

informes.get('/buques', buquesBoletas)
informes.get('/resumenBFH', getResumenBFH)
informes.get('/buquedetalles', getBuqueDetalles)
informes.get('/stats', getBuqueStats)
informes.get('/generar/pagos/:buque/:factura', getInformePagoAtrasnporte)
informes.get('/export/r1/excel', exportR1Importaciones)
informes.get('/export/r2/excel', getRerportContenerizada)

/* Parte de casulla */
informes.get('/casulla/data', getBoletasCasulla)
informes.get('/casulla/data/detalles', getBoletasCasullaDetalleSocio)

module.exports = informes;