const db = require("../lib/prisma");
const UAParser = require('ua-parser-js');

const setLogger = async (usuario, tabla, Evento, req, navegador='Chrome', Clave=null) => {
    try {
        const parser = new UAParser();
        const Ip = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;
        parser.setUA(req.headers['user-agent']);
        const result = parser.getResult();
        const navegador = result.browser.name;
        const Fecha = new Date()

        /**
         * Se crea el log
         */
        
        const data = await db.logs.create({
            data: {
                usuario, tabla, Evento,Fecha,Ip,navegador, Clave
            }
        })
    } catch (err){
        console.log('Error al ingresar el log', err)
    }
};

module.exports = setLogger;