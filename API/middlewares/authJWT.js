const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    const token = req.header('Authorization');
    
    if (!token) return res.status(401).json({ msg: 'Acceso denegado' });

    try {
        const verificado = jwt.verify(token, process.env.TOKEN_SECRET);
        console.log(verificado);
        next();
    } catch (error) {
        res.status(400).json({ msg: 'Token no válido' });
    }
}

module.exports = verificarToken;