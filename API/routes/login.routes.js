const logUser = require('express').Router();
const loginUsers = require('../controllers/login.controller');

logUser.post('/', loginUsers)

module.exports = logUser;  