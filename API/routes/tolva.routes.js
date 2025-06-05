const tolva = require('express').Router();
const { analizadorQR, getDataForSelectSilos, updateSiloInBoletas } = require('../controllers/tolva.controller.js');
const verificarToken = require('../middlewares/authJWT.js')
const upload = require('../middlewares/upload.js');

tolva.get("/silos", getDataForSelectSilos)
tolva.post("/analizar-qr", upload.single('image'), analizadorQR);
tolva.put("/add/silo/:id", updateSiloInBoletas)

module.exports = tolva;  