const {PrismaClient} = require('@prisma/client')
const dotenv = require('dotenv')
const db = new PrismaClient()

/* Listar usuarios */
const getMotoristasParaBoletas = async (req, res) => {   
    const data = await db.motoristas.findMany({
        select: {
            id: true,
            nombre: true
        }
    })
    res.json(data)
}

module.exports = {
    getMotoristasParaBoletas
}