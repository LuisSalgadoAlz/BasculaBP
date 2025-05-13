const admin = require('express').Router();
const { getPM2Metrics, getSpaceForTable, getLogs, getStatsForLogs, getUsuariosForSelect,  } = require('../controllers/metrics.controller.js')
const verificarToken = require('../middlewares/authJWT.js')

admin.get("/metrics", getPM2Metrics);
admin.get("/spaceTables", getSpaceForTable);
admin.get("/logs", getLogs);
admin.get("/stats", getStatsForLogs)
admin.get("/usuarios", getUsuariosForSelect)

module.exports = admin;  