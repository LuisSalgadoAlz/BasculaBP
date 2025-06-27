const informes = require('express').Router();
const { buquesBoletas } = require('../controllers/informes.controller');

informes.get('/buques', buquesBoletas)

module.exports = informes;