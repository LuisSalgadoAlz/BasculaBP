const db = require('../lib/prisma')
const dotenv = require('dotenv')

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