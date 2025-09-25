const sap = require('express').Router();
const { getCamiones } = require('../controllers/sap.controller.js');
const verificarToken = require('../middlewares/authJWT.js')

sap.get("/info", getCamiones);

module.exports = sap;  