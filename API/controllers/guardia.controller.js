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
                        fechaSalida: true,
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

const updatePaseDeSalida = async(req, res) => {
    try{
        const id = req.params.id || null;
        if (!id) return res.status(400).send({err: 'No se ingreso una ID'})
    
        const updatePaseSalida = await db.pasesDeSalida.update({
            data: {
                estado: true,
                fechaSalida: new Date()
            }, 
            where: {
                idBoleta: parseInt(id),
            }
        })

        return res.status(200).send({msg: 'Salida registrada, puede despachar el vehiculo.'})
    } catch(err){
        console.log(err)
        return res.status(500).send({err: 'Error Interno del API'})
    }
}

module.exports = {
    getBuscarPlaca, 
    updatePaseDeSalida
}