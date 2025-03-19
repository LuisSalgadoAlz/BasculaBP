const {PrismaClient} = require('@prisma/client')
const dotenv = require('dotenv')
const db = new PrismaClient()

/* Listar usuarios */
const getTransporteParaBoletas = async (req, res) => {   
    const data = await db.transporte.findMany({
        where : {
            idPlaca: parseInt(req.params.idPlaca)
        }
    })

    res.json(data)
}

const getTransporte = async (req, res) => {   
    const data = await db.transporte.findMany()
    res.json(data)
}


module.exports = {
    getTransporteParaBoletas, getTransporte
}