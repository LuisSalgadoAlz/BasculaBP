const db = require('../lib/prisma')
const dotenv = require("dotenv");

const getBuscarPlaca = async(req, res) => {
    try{
        const placa = (req.query.placa || '').trim().toUpperCase();
        if(!placa) return res.send({err: 'Ingresar una placa valida.'})
        const data = await db.boleta.findFirst({
            select:{
                id: true,
                numBoleta: true,
                proceso: true,
                placa: true,
                producto: true, 
                origen: true,
                destino: true,  
                trasladoOrigen:true,
                trasladoDestino: true,
                movimiento:true,
                manifiesto: true,
                ordenDeCompra: true, 
                ordenDeTransferencia: true,
                estado: true, 
                fechaInicio:true,
                fechaFin:true,
                tolva: {
                    select: {
                        fechaEntrada:true, 
                        fechaSalida: true, 
                    }
                }, 
                paseDeSalida: {
                    select: {
                        numPaseSalida: true,
                        estado: true,
                    }
                }, 
            }, 
            orderBy: {
                id: 'desc', 
            }, 
            where: {
                placa:placa,

            }
        })
        if(!data) return res.send({err: 'Boleta no encontrada con esa placa.'})
        return res.send({data: data})
    }catch(err){
        console.log(err)
        res.send({err: 'Error interno del servidor'})
    }
}

module.exports = {
    getBuscarPlaca
}