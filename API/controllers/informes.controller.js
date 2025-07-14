const db = require("../lib/prisma");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const { QUINTALTONELADA, GRANZA, IMPORTACIONES } = require("../utils/variablesInformes");

const buquesBoletas = async(req, res) => {
    try{
        const resultado = await db.boleta.groupBy({
            by: ['socio', 'idSocio'], 
            where:{
                idMovimiento: IMPORTACIONES, 
                idProducto: GRANZA,
                estado:{
                    not: {
                        in: ['Pendiente', 'Cancelada'],
                    },
                }
            },
            orderBy:{
                idSocio: 'asc'
            } 
        })
        res.send(resultado)
    }catch(err){
        console.log(err)
    }
}

const getResumenBFH = async(req, res) => {
    try{
        const buque = req.query.buque || null;
        
        const rawData = await db.boleta.findMany({
            where: {
                idMovimiento: IMPORTACIONES, 
                idProducto: GRANZA,
                idSocio: parseInt(buque), 
                estado: {
                    not: {
                        in: ['Pendiente', 'Cancelada'],
                    },
                }
            },
            select: {
                socio: true,
                fechaFin: true, 
                pesoNeto: true,
                pesoTeorico: true,
                desviacion: true,   
            }
        });

        const grouped = rawData.reduce((acc, item) => {
            // Convertir fecha UTC a zona horaria de Honduras (UTC-6)
            const fechaUTC = new Date(item.fechaFin);
            const fechaHonduras = new Date(fechaUTC.getTime() - (6 * 60 * 60 * 1000));
            const fechaLocal = fechaHonduras.toISOString().split('T')[0];
            
            const key = `${item.socio}-${fechaLocal}`;
            
            if (!acc[key]) {
                acc[key] = {
                    socio: item.socio,
                    fecha: fechaLocal,
                    total: 0, 
                    pesoNeto: 0, 
                    pesoTeorico: 0,
                    desviacion: 0,   
                };
            }
            acc[key].total++;
            acc[key].pesoNeto += item.pesoNeto;
            acc[key].pesoTeorico += item.pesoTeorico;
            acc[key].desviacion += item.desviacion; 
            return acc;
        }, {});

        const result = Object.values(grouped);
        if(result.length==0) return res.status(200).send([{
            socio: 'No seleccionado',
            fecha: 'No seleccionado', 
            total: 'No seleccionado', 
            pesoNeto: 'No seleccionado',
            pesoTeorico: 'No seleccionado',
            desviacion: 'No seleccionado',  
        }])
        return res.status(200).send(result);
    } catch(err) {
        console.log(err);
        res.status(500).send({ error: 'Error interno del servidor' });
    }
}

const getBuqueStats = async(req, res) => {
    try{
        const buque = req.query.buque || null;
        const total = await db.boleta.groupBy({
            by: ['idSocio'],
            where: {
                idSocio: parseInt(buque), 
                estado: {
                    not: {
                        in: ['Pendiente', 'Cancelada'],
                    },
                }, 
                idMovimiento: IMPORTACIONES, 
                idProducto: GRANZA,
            }, 
            _sum:{
                pesoNeto: true, 
                pesoTeorico: true, 
                desviacion: true,
            }
        })
        if(total.length==0) return res.status(200).send({err: 'Buque no seleecionado'})
        const {_sum} = total[0]
        const refactorData = {
            pesoNeto: (_sum.pesoNeto/QUINTALTONELADA).toFixed(2), 
            pesoTeorico: (_sum.pesoTeorico/QUINTALTONELADA).toFixed(2),
            desviacion: (_sum.desviacion/QUINTALTONELADA).toFixed(2),
            porcentaje: ((_sum.desviacion/QUINTALTONELADA)/(_sum.pesoTeorico/QUINTALTONELADA)*100).toFixed(2)
        }
        return res.status(200).send({...refactorData})
    }catch(err) {
        console.log(err)
    }
}

const getBuqueDetalles = async(req, res) =>{
    try{
        const buque = req.query.buque || null;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        if(!buque || buque===undefined) return res.status(200).send({
            data: [{
                Nviajes: 'No seleccionado',
                pesoTeorico: 'No seleccionado', 
                pesoNeto: 'No seleccionado',
                desviacion: 'No seleccionado', 
            }],
            pagination: {
                totalData: 1,
                totalPages: 1,
                currentPage: 1,
                limit:1,
            },
        })
        
        const where = {
            idSocio: parseInt(buque),
            idMovimiento: IMPORTACIONES,
            idProducto: GRANZA,
            estado: {
                not: {
                    in: ['Pendiente', 'Cancelada'],
                },
            },  
        }

        const [data, totalData] = await Promise.all([
            db.boleta.findMany({
            select:{
                Nviajes: true,
                pesoTeorico:true, 
                pesoNeto: true,
                desviacion:true,
                bodegaPuerto: true, 
            }, 
            where, 
            orderBy:{
                Nviajes: 'asc',
            },
            skip,
            take: limit,
            }), 
            db.boleta.count({where})
        ])

        if(data.length==0) return res.status(200).send(
            {
                data: [{
                    Nviajes: 'No seleccionado',
                    pesoTeorico: 'No seleccionado', 
                    pesoNeto: 'No seleccionado',
                    desviacion: 'No seleccionado', 
                }],
                pagination: {
                    totalData: 1,
                    totalPages: 1,
                    currentPage: 1,
                    limit:1,
                },
            }
        )

        return res.send({
            data: data,
            pagination: {
                totalData,
                totalPages: Math.ceil(totalData / limit),
                currentPage: page,
                limit,
            },
        });
    }catch(err) {
        console.log(err)
    }
}

const exportR1Importaciones =  async(req, res) => {
  try {
    const buque = req.query.buque;
    if(!buque && buque===undefined) return res.send({err: 'No se selecciono buque. Intente denuevo'})
    
    const data = await db.boleta.findMany({
        select:{
            fechaInicio: true,
            fechaFin: true,
            Nviajes: true,
            NSalida: true,
        }, 
        where:{
        idSocio: parseInt(buque), 
        idMovimiento: IMPORTACIONES, 
        idProducto: GRANZA,
        estado:{
                not: {
                    in: ['Pendiente', 'Cancelada'],
                },
            }, 
        }, 
        orderBy: {
            Nviajes: 'asc'
        },
    })
    return res.send({msg: data})
  }catch (err) {
    console.error("Error generando el reporte Excel R1:", err);
  }
}

module.exports = {
    buquesBoletas, 
    getResumenBFH,
    getBuqueDetalles, 
    getBuqueStats,
    exportR1Importaciones,  
}