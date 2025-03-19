const {PrismaClient} = require('@prisma/client')
const dotenv = require('dotenv')
const db = new PrismaClient()

/* Listar usuarios */
const getTransporteParaBoletas = async (req, res) => {   
    const data = await db.transporte.findMany({
        select: {
            id: true,
            nombre: true, 
            idPlaca: true
        }
    })
    res.json(data)
}

module.exports = {
    getTransporteParaBoletas
}