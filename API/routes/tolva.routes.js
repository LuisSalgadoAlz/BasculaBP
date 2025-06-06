const tolva = require('express').Router();
const { analizadorQR, getDataForSelectSilos, updateSiloInBoletas, getAsignForDay, getStatsForTolva } = require('../controllers/tolva.controller.js');
const verificarToken = require('../middlewares/authJWT.js')
const upload = require('../middlewares/upload.js');

tolva.get("/silos", getDataForSelectSilos)
tolva.get("/silosForTime", getAsignForDay)
tolva.get("/stats", getStatsForTolva)
tolva.post("/analizar-qr", upload.single('image'), analizadorQR);
tolva.put("/add/silo/:id", updateSiloInBoletas)

module.exports = tolva;  