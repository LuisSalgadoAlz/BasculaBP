const informes = require('express').Router();
const { buquesBoletas } = require('../controllers/informes.controller');

informes.get('/data', buquesBoletas)

module.exports = informes;