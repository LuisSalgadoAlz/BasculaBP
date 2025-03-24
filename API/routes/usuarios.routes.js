const {getUsuarios,postUsuarios,updateUsuarios} = require('../controllers/usuarios.controller');
const verificarToken = require('../middlewares/authJWT')
const router = require('express').Router();

router.get('/', verificarToken, getUsuarios)
router.post('/', postUsuarios)
router.put('/:id', verificarToken, updateUsuarios)  

module.exports = router;