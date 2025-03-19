const {PrismaClient} = require('@prisma/client')
const dotenv = require('dotenv')
const db = new PrismaClient()

/* Listar usuarios */
const getTipoDePesoParaBoletas = async (req, res) => {   
    const data = await db.tiposDePeso.findMany({
        select: {
            id: true,
            nombre: true
        }
    })
    res.json(data)
}

module.exports = {
    getTipoDePesoParaBoletas
}