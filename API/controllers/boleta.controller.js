const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");
const db = new PrismaClient();

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
      });
  } catch (err) {
    console.log(err);
  }
};

const postBoletasNormal = async (req, res) => {
  try {
    const {
      idCliente,
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
    } = req.body;

    const nuevaBoleta = await db.boleta.create({
      data: {
        idCliente : parseInt(idCliente),
        idOrigen: parseInt(idOrigen),
        idDestino: parseInt(idDestino),
        manifiesto: parseInt(manifiesto),
        pesoTeorico: parseFloat(pesoTeorico),
        estado: estado,
        idUsuario: parseFloat(idUsuario),
        idMotorista: parseInt(idMotorista),
        fechaInicio: fechaInicio,
        pesoInicial: parseFloat(pesoInicial),
        idPlaca: parseInt(2064),
        idEmpresa : parseInt(idEmpresa),
        idMovimiento: parseInt(idMovimiento),
        idProducto: parseInt(idProducto),
        observaciones,
      },
    });

    res
      .status(201)
      .json({ msg: "Boleta creado exitosamente", boleta: nuevaBoleta });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: `Error al crear usuario: ${error.message}` });
  }
};

const getDataBoletas = async(req, res) => {
    const data = await db.boleta.findMany()

    const dataUTCHN = data.map((el) => ({
        ...el, 
        fechaInicio : el.fechaInicio.toLocaleString()
    }))

    res.send(dataUTCHN)
}

module.exports = {
  getAllData,
  postBoletasNormal,
  getDataBoletas
};
