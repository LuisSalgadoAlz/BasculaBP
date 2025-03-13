const basculaLive = require('express').Router();
const obtenerPeso = require('../controllers/basculaLive.controller');

basculaLive.get("/", async (req, res) => {
    try {
      const peso = await obtenerPeso();
      res.json({ peso});
    } catch (error) {
      res.status(500).json({ error });
    }
  });

module.exports = basculaLive;  