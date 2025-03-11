const {getUsuarios,postUsuarios,updateUsuarios,loginUsers} = require('../controllers/usuarios.controller');
const router = require('express').Router();

/* Probar con el login */
const verificarToken = require('../middlewares/authJWT');

router.get('/', getUsuarios)
router.post('/', postUsuarios)
router.put('/:id', updateUsuarios)  
router.post('/login', loginUsers)  
module.exports = router;