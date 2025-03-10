const {getUsuarios,postUsuarios,updateUsuarios} = require('../controllers/usuarios.controller');
const router = require('express').Router();
const verificarOrigen = require('../middlewares/cors');

router.get('/', verificarOrigen, getUsuarios)
router.post('/', verificarOrigen, postUsuarios)
module.exports = router;