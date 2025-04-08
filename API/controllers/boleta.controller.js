const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");
const db = new PrismaClient();

const getAllData = async (req, res) => {
    try {
        /* 0 Proveedor 1 Cliente */
        const tipo = req.query.tipo !== undefined ? parseInt(req.query.tipo) : null;
        const placa = req.query.placa != undefined ? req.query.placa : null;
        const socio = req.query.socio != undefined ? parseInt(req.query.socio) : null;
        const empresa = req.query.empresa != undefined ? parseInt(req.query.empresa) : null;
        const motorista = req.query.motorista != undefined ? parseFloat(req.query.motorista) : null;

        const [Clientes, Origen, Destino,Transportes, Vehiculo, Motoristas, Producto, Movimientos] = await Promise.all([
            db.socios.findMany({
                select: {id: true, nombre: true},
                where : {
                    estado : true, 
                    ...(tipo==0 || tipo==1 ? {tipo :tipo} : {}), 
                    rEmpresa : {
                        some : {
                            ...(empresa ? {id : empresa} : {}),
                            rVehiculoEmpresa : {
                                some : {
                                    ...(placa ? {placa : placa} : {})
                                }
                            }, 
                            rMotoristaEmpresa : {
                                some : {
                                    ...(motorista ? {id : motorista} : {})
                                }
                            }
                        }
                    }
                }
            }),
            db.direcciones.findMany({
                select: {id: true, nombre: true},
                where: {
                    estado: true, 
                    drClientes: {
                        is: {
                            ...(socio ? {id : socio }: {}),
                            ...(tipo==0 || tipo==1 ? {tipo :tipo} : {})
                        }
                    },
                    OR: [
                        { tipo: 0 },
                        { tipo: 2 }
                    ]
                } 
            }),
            db.direcciones.findMany({
                select: {id: true, nombre: true},
                where: {
                    estado : true, 
                    drClientes: {
                        is: {
                            ...(socio ? {id : socio }: {}),
                            ...(tipo==0 || tipo==1 ? {tipo :tipo} : {})
                        }
                    },
                    OR: [
                        { tipo: 1 },
                        { tipo: 2 }
                    ]
                } 
            }),
            db.empresa.findMany({
                select: {id: true, nombre: true}, 
                where : {
                    estado : true, 
                    rClientes : {
                        is: {
                            ...(socio ? {id : socio }: {}), 
                            ...(tipo==0 || tipo==1 ? {tipo :tipo} : {})
                        }
                    },
                    rVehiculoEmpresa :{
                        some:{
                            ...(placa ? {placa : placa} : {})
                        }
                    }, 
                    rMotoristaEmpresa: {
                        some : {
                            ...(motorista ? {id : motorista} : {})
                        }
                    }
                }
            }), 
            db.vehiculo.findMany({
                select : {placa :  true}, 
                where : {   
                    estado: true, 
                    rEmpresaVehiculo : {
                        ...(empresa ? {id : empresa} : {}), 
                        rClientes : {
                            ...(socio ? {id : socio }: {}),
                            ...(tipo==0 || tipo==1 ? {tipo :tipo} : {})
                        }, 
                    }
                },
                distinct : ['placa']
            }), 
            db.motoristas.findMany({
                select : {id: true, nombre : true},
                where : {   
                    estado: true, 
                    rEmpresaM : {
                        ...(empresa ? {id : empresa} : {}),
                        rClientes : {
                            ...(socio ? {id : socio }: {}),
                            ...(tipo==0 || tipo==1 ? {tipo :tipo} : {}), 
                        }
                    }
                } 
            }), 
            db.producto.findMany({
                select : {id: true, nombre : true}, 
            }), 
            db.movimientos.findMany({
                select : {id: true, nombre: true},
            })
        ]);
        const Placa = Vehiculo.map((el)=>({
            id: el.placa, 
            nombre : el.placa
        }))
        const Flete = Movimientos;
        res.status(200).json({Clientes, Origen, Destino,Transportes, Placa, Motoristas, Producto, Flete});
    }catch (err) {
        console.log(err)
    }
}

module.exports = {
    getAllData,
}