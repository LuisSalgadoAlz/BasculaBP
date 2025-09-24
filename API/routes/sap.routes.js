const sap = require('express').Router();
const { getSessionSAP } = require('../controllers/sap.controller.js');
const verificarToken = require('../middlewares/authJWT.js')

sap.get("/info", getSessionSAP);

module.exports = sap;  