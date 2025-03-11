const {getUsuarios,postUsuarios,updateUsuarios} = require('../controllers/usuarios.controller');
const router = require('express').Router();

router.get('/', getUsuarios)
router.post('/', postUsuarios)
router.put('/:id', updateUsuarios)  

module.exports = router;