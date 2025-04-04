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

        const dataAndFilter = await db.socios.findMany({
            select: {
              id: true, 
              nombre: true, 
              drSocios: {
                select: {
                  id: true, 
                  nombre: true
                }
              },
              rEmpresa: {
                select: {
                  id: true, 
                  nombre: true,
                  rMotoristaEmpresa: {
                    select: {
                      id: true, 
                      nombre: true
                    },
                  }, 
                  rVehiculoEmpresa: {
                    select: {
                      id: true, 
                      placa: true
                    }
                  }
                },
                where : {
                    id: empresa,
                    rVehiculoEmpresa : {
                        some:{
                            ...(placa ? {placa : placa } : {})
                        }
                    }
                }
              },
            },
            where: { 
              estado: true, 
              ...(tipo !== '' ? {tipo: {equals: tipo}} : {}),
              ...(socio ? {id: socio} : {}),
              rEmpresa: {
                some: {
                  ...(placa ? {
                    rVehiculoEmpresa: {
                      some: {
                        placa: placa
                      }
                    }
                  } : {})
                }
              }
            }
          });

        res.status(200).json(dataAndFilter);
    }catch (err) {
        console.log(err)
    }
}

module.exports = {
    getAllData,
}