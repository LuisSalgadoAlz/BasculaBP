const db = require("../lib/prisma");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

const buquesBoletas = async(req, res) => {
    try{
        const resultado = await db.boleta.groupBy({
            by: ['socio', 'idSocio'], 
            where:{
                idMovimiento: 2, 
                idProducto: 18,
                estado:{
                    not: {
                        in: ['Pendiente', 'Cancelada'],
                    },
                }
            }, 
        })
        res.send(resultado)
    }catch(err){
        console.log(err)
    }
}

module.exports = {
    buquesBoletas
}