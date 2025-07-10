const db = require('../lib/prisma')
const dotenv = require("dotenv");

const getBuscarPlaca = async (req, res) => {
    try {
        const placa = (req.query.placa || '').trim().toUpperCase();
        
        if (!placa) {
            return res.send({ err: 'Ingresar una placa válida.' });
        }

        const boletas = await db.boleta.findMany({
            select: {
                id: true,
                numBoleta: true,
                proceso: true,
                placa: true,
                producto: true,
                origen: true,
                destino: true,
                trasladoOrigen: true,
                trasladoDestino: true,
                movimiento: true,
                manifiesto: true,
                ordenDeCompra: true,
                ordenDeTransferencia: true,
                estado: true,
                fechaInicio: true,
                fechaFin: true,
                tolva: {
                    select: {
                        fechaEntrada: true,
                        fechaSalida: true,
                    }
                },
                paseDeSalida: {
                    select: {
                        id: true,
                        numPaseSalida: true,
                        estado: true,
                        fechaSalida: true,
                    }
                },
            },
            where: { placa },
            orderBy: { id: 'desc' },
            take: 2,
        });

        if (boletas.length === 0) {
            return res.send({ err: 'Boleta no encontrada con esa placa.' });
        }

        // Normalizar paseDeSalida y encontrar el resultado óptimo
        const resultado = findOptimalBoleta(boletas);
        if(!resultado) return res.send({ err: 'Actualmente no hay boletas activas vinculadas a esta placa.' })
        
        return res.send({ data: resultado });

    } catch (err) {
        console.error('Error en getBuscarPlaca:', err);
        return res.send({ err: 'Error interno del servidor' });
    }
};

const findOptimalBoleta = (boletas) => {
    // Normalizar los datos
    const boletasNormalizadas = boletas.map(boleta => ({
        ...boleta,
        paseDeSalida: Array.isArray(boleta.paseDeSalida)
            ? boleta.paseDeSalida.find(p => p.estado === false) || boleta.paseDeSalida[0]
            : boleta.paseDeSalida
    }));

    // Prioridad 1: Boletas con pase de salida pendiente (estado = false)
    const conPasePendiente = boletasNormalizadas.filter(
        boleta => boleta.paseDeSalida && boleta.paseDeSalida.estado === false
    );

    if (conPasePendiente.length > 0) {
        // Si hay múltiples, priorizar proceso = 1
        const conProceso1 = conPasePendiente.filter(boleta => boleta.proceso === 1);
        return conProceso1.length > 0 ? conProceso1[0] : conPasePendiente[0];
    }

    // Prioridad 2: Boletas sin pase de salida pero con estado pendiente
    const sinPasePendiente = boletasNormalizadas.filter(
        boleta => !boleta.paseDeSalida && boleta.estado === 'Pendiente'
    );

    if (sinPasePendiente.length > 0) {
        return sinPasePendiente[0];
    }

    // Prioridad 3: Cualquier boleta disponible
    return null;
};

const updatePaseDeSalida = async(req, res) => {
    try{
        const id = req.params.id || null;
        const {obs} = req.body;

        if (!id) return res.status(400).send({err: 'No se ingreso una ID'})
    
        const updatePaseSalida = await db.pasesDeSalida.update({
            data: {
                estado: true,
                fechaSalida: new Date(), 
                observaciones : obs,
            }, 
            where: {
                id: parseInt(id),
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