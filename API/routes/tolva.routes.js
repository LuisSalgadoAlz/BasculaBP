const tolva = require('express').Router();
const { analizadorQR, getDataForSelectSilos, getAsignForDay, getStatsForTolva, buscarBoleSinQR, getListUsersForTolva, postSiloInBoletas, getTolvasDeDescargasOcupadas, updateFinalizarDescarga, getInfoAllSilos, postResetSilo, getStatsBuquesAndAll, getViajesTotales, getUserTolva, getInfoForBuquesQQ, postGetallInfoDetailsSilos, getNewInfoNivelSilos, getNewInfoNivelDetails, getCamionesDeDescargasOcupadsTodos } = require('../controllers/tolva.controller.js');
const verificarToken = require('../middlewares/authJWT.js')
const upload = require('../middlewares/upload.js');

tolva.get("/silos", getDataForSelectSilos)
tolva.get("/silosForTime", getAsignForDay)
tolva.get("/stats", getStatsForTolva)
tolva.get("/analizar-sin-qr", buscarBoleSinQR)
tolva.get("/tipoUsuario", getListUsersForTolva)
tolva.get("/tolvas-de-descargas", getTolvasDeDescargasOcupadas)
tolva.get("/tolvasOcupadas/info", getCamionesDeDescargasOcupadsTodos)
tolva.get("/info/silos", getInfoAllSilos)
tolva.get("/info/statsTolvas", getStatsBuquesAndAll)
tolva.get("/info/historicoViajes", getViajesTotales)
tolva.get("/info/users", getUserTolva)
tolva.get("/info/silosDestino", getInfoForBuquesQQ)
tolva.get("/info/nivelSilos", getNewInfoNivelSilos)
tolva.get("/info/nivelSilos/details/:siloId", getNewInfoNivelDetails)
tolva.post("/analizar-qr", upload.single('image'), analizadorQR);
tolva.post("/newReset", postResetSilo);
tolva.post("/info/silos/details", postGetallInfoDetailsSilos)
tolva.put("/add/silo/:id", postSiloInBoletas)
tolva.put("/upd/silo/:id", updateFinalizarDescarga)

module.exports = tolva;  