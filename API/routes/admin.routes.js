const admin = require('express').Router();
const { getPM2Metrics, getSpaceForTable,  } = require('../controllers/metrics.controller.js')
const verificarToken = require('../middlewares/authJWT.js')

admin.get("/metrics", getPM2Metrics);
admin.get("/spaceTables", getSpaceForTable);


module.exports = admin;  