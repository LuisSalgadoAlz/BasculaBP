const db = require("../lib/prisma");

const setLogger = async (usuario, tabla, Evento, req, navegador='Chrome', Clave=null) => {
    try {
        const Ip = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;
        const navegador = req.headers['user-agent']
        const Fecha = new Date()
        const data = await db.logs.create({
            data: {
                usuario, tabla, Evento,Fecha,Ip,navegador, Clave
            }
        })
        console.log(data)
    } catch (err){
        console.log('Error al ingresar el log', err)
    }
};

module.exports = setLogger;