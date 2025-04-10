const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");
const db = new PrismaClient();
const jwt = require('jsonwebtoken');

const getAllData = async (req, res) => {
  try {
    /* 0 Proveedor 1 Cliente */
    const tipo = req.query.tipo !== undefined ? parseInt(req.query.tipo) : null;
    const placa = req.query.placa != undefined ? req.query.placa : null;
    const socio =
      req.query.socio != undefined ? parseInt(req.query.socio) : null;
    const empresa =
      req.query.empresa != undefined ? parseInt(req.query.empresa) : null;
    const motorista =
      req.query.motorista != undefined ? parseFloat(req.query.motorista) : null;
      
    const [
      Clientes,
      Origen,
      Destino,
      Transportes,
      Vehiculo,
      Motoristas,
      Producto,
      Movimientos,
      TransladosI, 
      TransladosE, 
    ] = await Promise.all([
      db.socios.findMany({
        select: { id: true, nombre: true },
        where: {
          estado: true,
          ...(tipo == 0 || tipo == 1 ? { tipo: tipo } : {}),
          rEmpresa: {
            some: {
              ...(empresa ? { id: empresa } : {}),
              rVehiculoEmpresa: {
                some: {
                  ...(placa ? { placa: placa } : {}),
                },
              },
              rMotoristaEmpresa: {
                some: {
                  ...(motorista ? { id: motorista } : {}),
                },
              },
            },
          },
        },
      }),
      db.direcciones.findMany({
        select: { id: true, nombre: true },
        where: {
          estado: true,
          drClientes: {
            is: {
              ...(socio ? { id: socio } : {}),
              ...(tipo == 0 || tipo == 1 ? { tipo: tipo } : {}),
            },
          },
          OR: [{ tipo: 0 }, { tipo: 2 }],
        },
      }),
      db.direcciones.findMany({
        select: { id: true, nombre: true },
        where: {
          estado: true,
          drClientes: {
            is: {
              ...(socio ? { id: socio } : {}),
              ...(tipo == 0 || tipo == 1 ? { tipo: tipo } : {}),
            },
          },
          OR: [{ tipo: 1 }, { tipo: 2 }],
        },
      }),
      db.empresa.findMany({
        select: { id: true, nombre: true },
        where: {
          estado: true,
          rClientes: {
            is: {
              ...(socio ? { id: socio } : {}),
              ...(tipo == 0 || tipo == 1 ? { tipo: tipo } : {}),
            },
          },
          rVehiculoEmpresa: {
            some: {
              ...(placa ? { placa: placa } : {}),
            },
          },
          rMotoristaEmpresa: {
            some: {
              ...(motorista ? { id: motorista } : {}),
            },
          },
        },
      }),
      db.vehiculo.findMany({
        select: { placa: true },
        where: {
          estado: true,
          rEmpresaVehiculo: {
            ...(empresa ? { id: empresa } : {}),
            rClientes: {
              ...(socio ? { id: socio } : {}),
              ...(tipo == 0 || tipo == 1 ? { tipo: tipo } : {}),
            },
          },
        },
        distinct: ["placa"],
      }),
      db.motoristas.findMany({
        select: { id: true, nombre: true },
        where: {
          estado: true,
          rEmpresaM: {
            ...(empresa ? { id: empresa } : {}),
            rClientes: {
              ...(socio ? { id: socio } : {}),
              ...(tipo == 0 || tipo == 1 ? { tipo: tipo } : {}),
            },
          },
        },
      }),
      db.producto.findMany({
        select: { id: true, nombre: true },
      }),
      db.movimientos.findMany({
        select: { id: true, nombre: true },
      }),
      db.translado.findMany({
        select:{id: true, nombre: true},
        where:{tipo: 0}
      }), 
      db.translado.findMany({
        select:{id: true, nombre: true},
      })
    ]);
    const Placa = Vehiculo.map((el) => ({
      id: el.placa,
      nombre: el.placa,
    }));
    const Flete = Movimientos;
    res
      .status(200)
      .json({
        Clientes,
        Origen,
        Destino,
        Transportes,
        Placa,
        Motoristas,
        Producto,
        Flete,
        TransladosI,
        TransladosE, 
      });
  } catch (err) {
    console.log(err);
  }
};

const postBoletasNormal = async (req, res) => {
  try {
    const {
      idCliente,
      boletaType, 
      proceso, 
      idOrigen,
      idDestino,
      manifiesto,
      pesoTeorico,
      estado,
      idUsuario,
      idMotorista,
      fechaInicio,
      pesoInicial,
      idPlaca,
      idEmpresa,
      idMovimiento,
      idProducto,
      observaciones, 
      ordenDeCompra, 
      idTrasladoOrigen, 
      idTrasladoDestino
    } = req.body;
    

    const verificado = jwt.verify(idUsuario, process.env.SECRET_KEY);

    const despachador =  await db.usuarios.findUnique({
      where: {
        usuarios: verificado['usuarios']
      }
    })

    const placaData = await db.vehiculo.findFirst({
      select: {
        id:true,
        placa: true
      },
      where : { 
        placa : idPlaca, 
        rEmpresaVehiculo : {
          id: idEmpresa
        }
      }
    })

    const empresa = await db.empresa.findUnique({where :{id: parseInt(idEmpresa)}})
    const motorista = await db.motoristas.findUnique({where :{id: parseInt(idMotorista)}})
    const socio = await db.socios.findUnique({where :{id: parseInt(idCliente)}})
    const producto = await db.producto.findUnique({where: {id: parseInt(idProducto)}})
    const move = await db.movimientos.findUnique({where:{id: parseInt(idMovimiento)}})

    const isTraslado = (move.nombre == 'Traslado Interno' || move.nombre == 'Traslado Externo') ? true: false;

    const origen = !isTraslado && await db.direcciones.findUnique({where :{id: parseInt(idOrigen)}})
    const destino = !isTraslado && await db.direcciones.findUnique({where :{id: parseInt(idDestino)}})
    const transladoOrigen = isTraslado && await db.translado.findUnique({where: {id: parseInt(idTrasladoOrigen)}})
    const transladoDestino = isTraslado && await db.translado.findUnique({where: {id: parseInt(idTrasladoDestino)}})

    const nuevaBoleta = await db.boleta.create({
      data: {
        idSocio : parseInt(idCliente),
        placa: placaData.placa,
        empresa: empresa.nombre, 
        motorista: motorista.nombre, 
        socio: socio.nombre, 
        origen: origen.nombre, 
        destino: destino.nombre, 
        boletaType : parseInt(boletaType), 
        idOrigen: !isTraslado ? parseInt(idOrigen) : null,
        idDestino: !isTraslado ? parseInt(idDestino) : null,
        manifiesto: parseInt(manifiesto),
        pesoTeorico: parseFloat(pesoTeorico),
        estado: estado,
        idUsuario: parseFloat(despachador['id']),
        usuario : despachador['usuarios'], 
        idMotorista: parseInt(idMotorista),
        fechaInicio: fechaInicio,
        pesoInicial: parseFloat(pesoInicial),
        idPlaca: placaData.id,
        idEmpresa : parseInt(idEmpresa),
        idMovimiento: parseInt(idMovimiento),
        movimiento: move.nombre, 
        idProducto: parseInt(idProducto),
        producto: producto.nombre, 
        observaciones,
        idTrasladoOrigen : isTraslado ? parseInt(idTrasladoOrigen) : null, 
        idTrasladoDestino : isTraslado ? parseInt(idTrasladoDestino) : null, 
        trasladoOrigen: transladoOrigen.nombre, 
        trasladoDestino: transladoDestino.nombre, 
        proceso,
        ordenDeCompra: parseInt(ordenDeCompra), 
      },
    });

    res.status(201).json({ msg: "Boleta creado exitosamente", boleta: nuevaBoleta });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: `Error al crear usuario: ${error.message}` });
  }
};

const getDataBoletas = async(req, res) => {
    const data = await db.boleta.findMany({
      select : {
        id: true, 
        estado: true, 
        proceso: true, 
        empresa: true, 
        motorista: true, 
        socio: true, 
        placa: true,
        fechaInicio: true,
        proceso: true
      }, 
      where : {
        estado : 'Pendiente'
      }
    })

    const dataUTCHN = data.map((el) => ({
        Id: el.id,
        Placa : el.placa, 
        Proceso: el.proceso == 0 ? 'Entrada de material':'Salida de material' ,
        Cliente : el.socio, 
        Transporte: el.empresa, 
        Motorista: el.motorista,  
        Fecha : el.fechaInicio.toLocaleString()
    }))

    res.send(dataUTCHN)
}

const getStatsBoletas = async(req, res) => {
  try{
    const [entrada, salida, pendientes] = await Promise.all([
      db.boleta.count({
        where : { proceso : 0 }
      }), 
      db.boleta.count({
        where : {proceso : 1}
      }), 
      db.boleta.count({
        where: {estado : 'Pendiente'}
      })
    ])
    res.status(201).send({entrada, salida, pendientes})
  }catch(err) {
    res.status(501).send({msg: 'Error en el server'})
  }

}

module.exports = {
  getAllData,
  postBoletasNormal,
  getDataBoletas, 
  getStatsBoletas
};
