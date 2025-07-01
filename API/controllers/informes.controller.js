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
        const rawData = await db.boleta.findMany({
            where: {
                idMovimiento: 2, 
                idProducto: 18,
                idSocio: 1036, 
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
        res.status(200).send(result);
    } catch(err) {
        console.log(err);
        res.status(500).send({ error: 'Error interno del servidor' });
    }
}

const getBuqueDetalles = async(req, res) =>{
    try{
        const data = await db.boleta.findMany({
            select:{
                Nviajes: true,
                pesoTeorico:true, 
                pesoNeto: true,
                desviacion:true, 
            }, 
            where:{
                idSocio: 1036,
                estado: {
                    not: {
                        in: ['Pendiente', 'Cancelada'],
                    },
                },  
            },
            orderBy:{
                Nviajes: 'asc'
            }
        })
        res.status(200).send(data)
    }catch(err) {
        console.log(err)
    }
}

module.exports = {
    buquesBoletas, 
    getResumenBFH,
    getBuqueDetalles,  
}