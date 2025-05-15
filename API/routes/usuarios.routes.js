const {getUsuarios,postUsuarios,updateUsuarios, getStatsUser} = require('../controllers/usuarios.controller');
const verificarToken = require('../middlewares/authJWT')
const router = require('express').Router();

router.get('/', verificarToken, getUsuarios)
router.get('/stats', getStatsUser)
router.post('/', postUsuarios)
router.put('/:id', verificarToken, updateUsuarios)  

module.exports = router;