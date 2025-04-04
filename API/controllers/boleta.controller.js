const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");
const db = new PrismaClient();

const getAllData = async (req, res) => {
    try {
        /* 0 Proveedor 1 Cliente */
        const tipo = req.query.tipo !== undefined ? parseInt(req.query.tipo) : undefined;
        const socio = req.query.socio !== undefined ? parseInt(req.query.socio) : undefined;
        const placa = req.query.placa || '';
        const empresa = req.query.empresa !== undefined ? parseInt(req.query.empresa) : undefined

        const [socios, empresas] = Promise.all[(
            db.socios.
        )]
        res.status(200).json({socios, empresas});
    }catch (err) {
        console.log(err)
    }
}

module.exports = {
    getAllData,
}