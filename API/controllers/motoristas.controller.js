const db = require('../lib/prisma')
const dotenv = require('dotenv')

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