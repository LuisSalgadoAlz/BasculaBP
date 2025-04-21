const imprimir = require('express').Router();
const imprimirEpson = require('../controllers/impresiones.controller');

imprimir.get('/', imprimirEpson)

module.exports = imprimir;  