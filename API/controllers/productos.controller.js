const {PrismaClient} = require('@prisma/client')
const dotenv = require('dotenv')
const db = new PrismaClient()

/* Listar usuarios */
const getProductosParaBoletas = async (req, res) => {   
    const data = await db.producto.findMany({
        select: {
            id: true,
            nombre: true
        }
    })
    res.json(data)
}

module.exports = {
    getProductosParaBoletas
}