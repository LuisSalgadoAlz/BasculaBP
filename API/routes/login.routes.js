const logUser = require('express').Router();
const loginUsers = require('../controllers/login.controller');
const ingresarLog = require('../middlewares/logs')

logUser.post('/', ingresarLog,loginUsers)

module.exports = logUser;  