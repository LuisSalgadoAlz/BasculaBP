const informes = require('express').Router();
const { testingApi } = require('../controllers/informes.controller');

informes.get('/data', testingApi)

module.exports = informes;