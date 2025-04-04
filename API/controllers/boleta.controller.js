const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");
const db = new PrismaClient();

const getAllData = async (req, res) => {
    try {
        /* 0 Proveedor 1 Cliente */
        const tipo = req.query.tipo !== undefined ? parseInt(req.query.tipo) : undefined;
        const socio = req.query.socio !== undefined ? parseInt(req.query.socio) : undefined;
        const placa = req.query.placa !== undefined ? req.query.placa : undefined
        const empresa = req.query.empresa !== undefined ? parseInt(req.query.empresa) : undefined
        const mts = req.query.motorista !== undefined ? parseInt(req.query.motorista) : undefined;

        const [socios, direcciones,empresas, vehiculos, motoristas] = await Promise.all([
            db.socios.findMany({
                select: {id: true, nombre: true},
                where: {
                    ...(tipo ? { tipo : tipo } : {}),
                    rEmpresa: {
                        some: {
                            ...(empresa ? {id: empresa} : {}),
                            rVehiculoEmpresa : {
                                some : {...(placa ? {placa : placa} : {})}
                            }, 
                            rMotoristaEmpresa : {
                                some : {...mts ? {id: mts} : {}}
                            }
                        },
                    }
                } 
            }),
            db.direcciones.findMany({
                select : {id: true, nombre: true}, 
                where : {idCliente: socio}
            }),
            db.empresa.findMany({
                select: {id: true, nombre: true}, 
                where: {
                    rClientes: {
                        is: {...(socio ? {id: socio} : {})}
                    }, 
                    rVehiculoEmpresa : {
                        some : {...(placa ? {placa : placa} : {})}
                    }, 
                    rMotoristaEmpresa : {
                        some : {...mts ? {id: mts} : {}}
                    }
                }
            }), 
            db.vehiculo.findMany({
                select : {id: true, placa : true}, 
                where : { 
                    rEmpresaVehiculo : {
                        is : {
                            ...(empresa ? {id:empresa} : {}), 
                            rClientes : {
                                is : {
                                    ...(socio ? {id: socio} : {})
                                }
                            }
                        }, 
                    }
                }
            }), 
            db.motoristas.findMany({
                select : {id: true, nombre : true}, 
                where : {
                    rEmpresaM : {
                        is : {
                            ...(empresa ? {id:empresa} : {}), 
                            rClientes : {
                                is : {
                                    ...(socio ? {id: socio} : {})
                                }
                            }
                        }
                    }
                }
            })
        ]);
        res.status(200).json({socios, direcciones, empresas, vehiculos, motoristas});
    }catch (err) {
        console.log(err)
    }
}

module.exports = {
    getAllData,
}