const {PrismaClient} = require('@prisma/client')
const dotenv = require('dotenv')
const db = new PrismaClient()

/* Listar usuarios */
const getProcesosParaBoletas = async (req, res) => {   
    const data = await db.procesos.findMany({
        select: {
            id: true,
            nombre: true
        }
    })
    res.json(data)
}

module.exports = {
    getProcesosParaBoletas
}