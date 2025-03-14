const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ msg: 'Acceso denegado' });
    try {
        const verificado = jwt.verify(token, process.env.SECRET_KEY);
        next();
    } catch (error) {
        res.status(200).json({ msg: 'Token no válido' });
    }
}

module.exports = verificarToken;