const sap = require('express').Router();
/**
 * Controllers para usar con el API de SAP
 */

const { getCamiones } = require('../controllers/sapApi.controller.js');

/**
 * Controllers para usar desde hanadb de SAP
 * (unicamente vistas y procedimientos almacenados que devuelvan vistas)
 */

const { getViewManifiestos } = require('../controllers/sapHana.controller.js');

/**
 * Middleware para verificar que sea un usuario autorizado de BPSERVER
 */

const verificarToken = require('../middlewares/authJWT.js')

sap.get("/info", getViewManifiestos);

module.exports = sap;  