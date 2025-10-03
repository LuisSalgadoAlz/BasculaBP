const { executeView } = require("../lib/hanaActions");
const db = require("../lib/prisma");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

const getViewManifiestos = async(req, res)=> {
    try{
        const result = await executeView('IT_MANIFIESTOS_ACTIVOS');
        return res.send(result)
    }catch(err){
        console.log(err)
        return res.status(400).send({err: err.message})
    }
}

/**
 * ! Area para helpers data para combobox etc
 */

const getUserForAsignar = async(req, res) => {
    try{
        const users = await db.Usuarios.findMany({
            where: {
                usuarioRef: {
                isNot: null
                }
            }
        })

        return res.send(users)
    }catch(err){
        console.log(err)
        return res.status(400).send({err: 'Error interno del sistema.'})
    }
} 

module.exports = {
    getViewManifiestos
}