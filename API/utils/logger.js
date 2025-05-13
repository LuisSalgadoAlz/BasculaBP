const db = require("../lib/prisma");
const UAParser = require('ua-parser-js');
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv')

const setLogger = async (tabla, Evento, req, user=null, categoria=1, Clave=null) => {
    try {
        const parser = new UAParser();
        const Ip = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;
        parser.setUA(req.headers['user-agent']);
        const result = parser.getResult();
        const navegador = result.browser.name;
        const Fecha = new Date()

        const verificado = user ? user : jwt.verify(req.header('Authorization'), process.env.SECRET_KEY)
        const usuario = user ? user : await db.usuarios.findUnique({
            where: {
                usuarios: verificado["usuarios"],
            },
        });

        /**
         * Se crea el log
         */
        
        const data = await db.logs.create({
            data: {
                usuario: usuario.name, tabla, Evento,Fecha,Ip,navegador, Clave, categoria
            }
        })
    } catch (err){
        console.log('Error al ingresar el log', err)
    }
};

const setLoggerSystema = async (errorTable, errorDetails, categoria) => {
    try {
        const Fecha = new Date()
        const data = await db.logs.create({
            data: {
                usuario: 'SISTEMA BASCULA', tabla: errorTable, Evento: errorDetails, Fecha, Ip: process.env.HOST, navegador: 'SERVER', Clave: null, categoria
            }
        })
    } catch (err){
        console.log('Error al ingresar el log', err)
    }
};

module.exports = {setLogger, setLoggerSystema};