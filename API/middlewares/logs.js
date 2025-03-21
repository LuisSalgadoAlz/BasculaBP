const { verify } = require("jsonwebtoken");

const ingresarLog = (req, res, next) => {
    const token = req.header('Authorization');

    const data = {
        method: req.method,
        donde: req.baseUrl,
        plataforma: req.headers["sec-ch-ua-platform"],
        origen: req.headers["origin"],
        navegador: req.headers["sec-ch-ua"],
        usuario: token ? token :req.body.usuarios,
    };
    console.log(data);
    next();
};

module.exports = ingresarLog;
