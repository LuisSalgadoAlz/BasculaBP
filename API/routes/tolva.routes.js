const tolva = require('express').Router();
const { analizadorQR, getDataForSelectSilos, getAsignForDay, getStatsForTolva, buscarBoleSinQR, getListUsersForTolva, postSiloInBoletas, getTolvasDeDescargasOcupadas, updateFinalizarDescarga, getInfoAllSilos, postResetSilo, getStatsBuquesAndAll } = require('../controllers/tolva.controller.js');
const verificarToken = require('../middlewares/authJWT.js')
const upload = require('../middlewares/upload.js');

tolva.get("/silos", getDataForSelectSilos)
tolva.get("/silosForTime", getAsignForDay)
tolva.get("/stats", getStatsForTolva)
tolva.get("/analizar-sin-qr", buscarBoleSinQR)
tolva.get("/tipoUsuario", getListUsersForTolva)
tolva.get("/tolvas-de-descargas", getTolvasDeDescargasOcupadas)
tolva.get("/info/silos", getInfoAllSilos)
tolva.get("/info/camionesEnviados", getStatsBuquesAndAll)
tolva.post("/analizar-qr", upload.single('image'), analizadorQR);
tolva.post("/newReset", postResetSilo);
tolva.put("/add/silo/:id", postSiloInBoletas)
tolva.put("/upd/silo/:id", updateFinalizarDescarga)

module.exports = tolva;  