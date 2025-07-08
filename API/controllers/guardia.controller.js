const db = require('../lib/prisma')
const dotenv = require("dotenv");

const getBuscarPlaca = async(req, res) => {
    try{
        const placa = (req.query.placa || '').trim().toUpperCase();
        if(!placa) return res.send({err: 'Ingresar una placa valida.'})
        const data = await db.boleta.findMany({
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
        
        /* Primer filtro es buscar pases de salida pendientes */
        const firtsFilter = data.filter((el) => el.paseDeSalida && el.paseDeSalida.estado == false)

        /* Si no tiene pases de salida pendientes buscara los que no tengan pase de salida primero y que esten en pendientes */
        if(firtsFilter.length === 0) {
            const sinPaseDeSalida = data.filter((el) => !el.paseDeSalida && el.estado==='Pendiente')
            
            /* Si no encuentra en pendientes, tomara el ultimo registro digitado o ultimo pase de salida generado */
            if(sinPaseDeSalida.length === 0) {
                return res.send({data: data[0]})
            }
            return res.send({data: sinPaseDeSalida[0]})
        }

        /* Si cuenta con pase de salida y solo es uno devolverra el primero filtro */
        if(firtsFilter.length === 1) return res.send({data: firtsFilter[0]})
        
        /* Si cuenta con dos pases de salida primero priorizara los de proceso 1, y devolvere el segundo filtro */
        const secondFilter = firtsFilter.filter((el)=> el.proceso===1 && el.paseDeSalida && el.paseDeSalida.estado == false)
                
        return res.send({data: secondFilter[0]})
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

const getStats = async(req, res) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        const todayFilter = {
            fechaSalida: {
                gte: startOfDay,
                lt: endOfDay      
            }
        };

        const [total, pendientes] = await Promise.all([
            db.pasesDeSalida.count({ where: {
                ...todayFilter, 
                estado: true
            } }),
            db.pasesDeSalida.count({
                where: {
                    estado : false
                }
            })
        ]);

        return res.status(200).json({ total, pendientes });
    } catch(err) {
        console.log(err);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}

module.exports = {
    getBuscarPlaca, 
    updatePaseDeSalida, 
    getStats,
}