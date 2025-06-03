const tolva = require('express').Router();
const { analizadorQR } = require('../controllers/tolva.controller.js');
const verificarToken = require('../middlewares/authJWT.js')
const upload = require('../middlewares/upload.js');

tolva.post("/analizar-qr", upload.single('image'), analizadorQR);

module.exports = tolva;  