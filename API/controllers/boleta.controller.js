const db = require("../lib/prisma");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const { imprimirEpson, imprimirQRTolva, comprobanteDeCarga, imprimirWorkForce, imprimirTikets, getReimprimirWorkForce } = require("./impresiones.controller");
const enviarCorreo = require("../utils/enviarCorreo");
const {alertaDesviacion, alertaCancelacion} = require("../utils/cuerposCorreo");
const {setLogger} = require('../utils/logger');

const generarNumBoleta = async () => {
  const ultimo = await db.boleta.findFirst({
    orderBy: { numBoleta: 'desc' },
    select: { numBoleta: true },
  });

  return (ultimo?.numBoleta || 0) + 1;
};

/**
 * Se grego los loggeres
 * @param {*} req 
 * @param {*} res 
 */
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
      MovimientosE,
      MovimientosS,
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
              estado: true,
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
            estado: true,
            ...(empresa ? { id: empresa } : {}),
            rClientes: {
              estado: true,
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
            estado: true,
            ...(empresa ? { id: empresa } : {}),
            rClientes: {
              estado: true,
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
      db.movimientos.findMany({
        select: { id: true, nombre: true },
      }),
      db.translado.findMany({
        select: { id: true, nombre: true },
        where: { tipo: 0 },
      }),
      db.translado.findMany({
        select: { id: true, nombre: true },
      }),
    ]);
    const Placa = Vehiculo.map((el) => ({
      id: el.placa,
      nombre: el.placa,
    }));
    Clientes.push(
      { id: -998, nombre: "Cliente X" },
      { id: -999, nombre: "Proveedor X" }
    );
    const Flete = MovimientosE;
    const FleteS = MovimientosS;
    res.status(200).json({
      Clientes,
      Origen,
      Destino,
      Transportes,
      Placa,
      Motoristas,
      Producto,
      Flete,
      FleteS,
      TransladosI,
      TransladosE,
    });
  } catch (err) {
    setLogger('BOLETA', 'OBTENER DATOS PARA SELECTS', req, null, 3)  
    console.log(err);
  }
};

/**
 * Aqui tambien se coloco el generador de numeros de boleta
 * Ademas del logger
 * @param {*} req 
 * @param {*} res 
 */
const postBoletasNormal = async (req, res) => {
  try {
    const {
      idCliente,
      proceso,
      idOrigen,
      idDestino,
      manifiesto,
      pesoTeorico,
      estado,
      idUsuario,
      idMotorista,
      pesoInicial,
      idPlaca,
      idEmpresa,
      pesoFinal,
      idMovimiento,
      idProducto,
      observaciones,
      ordenDeCompra,
      Cliente,
    } = req.body;

    const verificado = jwt.verify(idUsuario, process.env.SECRET_KEY);
    const despachador = await db.usuarios.findUnique({
      where: {
        usuarios: verificado["usuarios"],
      },
    });

    const isComodin = idCliente == -998;
    const placaData =
      !isComodin &&
      (await db.vehiculo.findFirst({
        select: {
          id: true,
          placa: true,
        },
        where: {
          placa: idPlaca,
          rEmpresaVehiculo: {
            id: idEmpresa,
          },
        },
      }));

    const producto = await db.producto.findUnique({
      where: { id: parseInt(idProducto) },
    });
    const move = await db.movimientos.findUnique({
      where: { id: parseInt(idMovimiento) },
    });

    const socio =
      !isComodin &&
      (await db.socios.findUnique({ where: { id: parseInt(idCliente) } }));
    const motorista =
      !isComodin &&
      (await db.motoristas.findUnique({
        where: { id: parseInt(idMotorista) },
      }));
    const empresa =
      !isComodin &&
      (await db.empresa.findUnique({ where: { id: parseInt(idEmpresa) } }));
    const destino =
      !isComodin &&
      (await db.direcciones.findUnique({ where: { id: parseInt(idDestino) } }));

    const numBoleta = await generarNumBoleta();  

    const nuevaBoleta = await db.boleta.create({
      data: {
        idSocio: !isComodin ? parseInt(idCliente) : null,
        numBoleta, 
        pesoNeto: parseFloat(pesoFinal) - parseFloat(pesoInicial),
        pesoFinal: parseFloat(pesoFinal),
        placa: !isComodin ? placaData.placa : idPlaca,
        empresa: !isComodin ? empresa.nombre : idEmpresa,
        motorista: !isComodin ? motorista.nombre : idMotorista,
        socio: !isComodin ? socio.nombre : Cliente,
        origen: "Baprosa",
        destino: !isComodin ? destino.nombre : idDestino,
        boletaType: 1,
        idOrigen: null,
        idDestino: !isComodin ? parseInt(idDestino) : null,
        manifiesto: parseInt(manifiesto),
        pesoTeorico: parseFloat(pesoTeorico),
        estado: estado,
        idUsuario: parseFloat(despachador["id"]),
        usuario: despachador["usuarios"],
        idMotorista: parseInt(idMotorista),
        fechaInicio: new Date(),
        fechaFin: new Date(),
        pesoInicial: parseFloat(pesoInicial),
        idPlaca: !isComodin ? placaData.id : null,
        idEmpresa: parseInt(idEmpresa),
        idMovimiento: parseInt(idMovimiento),
        movimiento: move.nombre,
        idProducto: parseInt(idProducto),
        producto: producto.nombre,
        observaciones,
        pesoTeorico: 0,
        desviacion: 0,
        idTrasladoOrigen: null,
        idTrasladoDestino: null,
        trasladoOrigen: null,
        trasladoDestino: null,
        proceso,
        ordenDeCompra: parseInt(ordenDeCompra),
        ordenDeTransferencia: null,
      },
    });

    setLogger('BOLETA', 'AGREGAR BOLETA CASULLA', req, null, 1, nuevaBoleta.id)  

    /* Imprimir Boleta */
    const response = await imprimirWorkForce(nuevaBoleta)
    
    if (response) {
      return res.status(201).json({ msg: "Boleta creado exitosamente e impresa con exito" });
    }
    
    return res.status(201).json({ msg: "Boleta creado exitosamente, pero revise su impresora" });
  
  } catch (error) {
    console.error(error);
    setLogger('BOLETA', 'AGREGAR BOLETA CASULLA', req, null, 3)  
    res.status(500).json({ msg: `Error al crear usuario: ${error.message}` });
  }
};

const getDataBoletas = async (req, res) => {
  try {
    const search = req.query.search || "";
    const searchDate = req.query.searchDate || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 7;
    const skip = (page - 1) * limit;

    const [year, month, day] = searchDate.split("-").map(Number);
    const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

    const data = await db.boleta.findMany({
      select: {
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
      where: {
        estado: "Pendiente",
        ...(searchDate
          ? { fechaInicio: { gte: startOfDay, lte: endOfDay } }
          : {}),
        OR: [
          {
            placa: { contains: search },
          },
          {
            empresa: { contains: search },
          },
          {
            motorista: { contains: search },
          },
          {
            socio: { contains: search },
          },
        ],
      },
      skip: skip,
      take: limit,
    });

    const totalData = await db.boleta.count({
      where: {
        estado: "Pendiente",
        ...(searchDate
          ? { fechaInicio: { gte: startOfDay, lte: endOfDay } }
          : {}),
        OR: [
          {
            placa: { contains: search },
          },
          {
            empresa: { contains: search },
          },
          {
            motorista: { contains: search },
          },
          {
            socio: { contains: search },
          },
        ],
      },
    });

    const dataUTCHN = data.map((el) => ({
      Id: el.id,
      Proceso: el.proceso === 0 ? 'Entrada': 'Salida', 
      Placa: el.placa,
      Cliente: el.socio,
      Transporte: el.empresa,
      Motorista: el.motorista,
      Fecha: el.fechaInicio.toLocaleString(),
    }));

    res.send({
      data: dataUTCHN,
      pagination: {
        totalData,
        totalPages: Math.ceil(totalData / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (err) {
    setLogger('BOLETA', 'OBTENER BOLETAS PENDIENTES', req, null, 3)  
    console.log(err);
  }
};

/**
 * !Imporante, falta probar
 * @param {*} req 
 * @param {*} res 
 */
const postClientePlacaMoto = async (req, res) => {
  try {
    const {
      proceso,
      idCliente,
      idUsuario,
      idMotorista,
      pesoInicial,
      idPlaca,
      idEmpresa,
      idProducto, 
      idOrigen, 
      NSalida, 
      NViajes, 
      idMovimiento, 
      idTrasladoOrigen
    } = req.body;

    const empresa = await db.empresa.findUnique({
      where: { id: parseInt(idEmpresa) },
    });
    const motorista = await db.motoristas.findUnique({
      where: { id: parseInt(idMotorista) },
    });
    const socio = await db.socios.findUnique({
      where: { id: parseInt(idCliente) },
    });
    const placaData = await db.vehiculo.findFirst({
      select: { id: true, placa: true },
      where: { placa: idPlaca, rEmpresaVehiculo: { id: idEmpresa } },
    });
    
    const producto = proceso === 0 && await db.producto.findUnique({where:{id:idProducto}})
    const origen = (proceso === 0 && (idMovimiento!=10 && idMovimiento!=11)) && await db.direcciones.findUnique({where: {id:idOrigen}})
    const movimiento = proceso===0 && await db.movimientos.findUnique({where: {id: idMovimiento}})
    const trasladoOrigen = (proceso === 0 &&(idMovimiento==10||idMovimiento==11)) && await db.translado.findUnique({where: {id: idTrasladoOrigen}})
    const verificado = jwt.verify(idUsuario, process.env.SECRET_KEY);
    const despachador = await db.usuarios.findUnique({
      where: {
        usuarios: verificado["usuarios"],
      },
    });

    const newBol = await db.boleta.create({
      data: {
        idSocio: parseInt(idCliente),
        placa: placaData.placa,
        empresa: empresa.nombre,
        motorista: motorista.nombre,
        socio: socio.nombre,
        boletaType: 0,
        estado: "Pendiente",
        idUsuario: parseFloat(despachador["id"]),
        usuario: despachador["usuarios"],
        idMotorista: parseInt(idMotorista),
        fechaInicio: new Date(),
        pesoInicial: parseFloat(pesoInicial),
        idPlaca: placaData.id,
        idEmpresa: parseInt(idEmpresa),
        proceso, 
        ...(proceso==0 && { 
          movimiento: movimiento.nombre, 
          idProducto, 
          idMovimiento, 
          producto: producto.nombre, 
          ...((idMovimiento==10 || idMovimiento==11) && {
            idTrasladoOrigen, 
            trasladoOrigen: trasladoOrigen.nombre,
          }), 
          ...((idMovimiento!=10 && idMovimiento!=11) && {
            idOrigen, 
            origen: origen.nombre,
          }), 
          ...(idProducto === 18 && {
            Nviajes: parseInt(NViajes), 
            NSalida: parseInt(NSalida), 
          }),
        })
      },
    });

    if(idProducto===17 || idProducto===18) {
      imprimirTikets(newBol, despachador['name'])
    } 
    setLogger('BOLETA', 'AGREGAR BOLETA (ENTRADA DE DATOS)', req, null, 1, newBol.id)  

    res
      .status(201)
      .send({ msg: "Boleta creada en estado pendiente", Bol: newBol });
  } catch (err) {
    setLogger('BOLETA', 'AGREGAR BOLETA (ENTRADA DE DATOS)', req, null, 3)  
    console.log(err);
  }
};

/**
 * !Importante falta probar
 * @param {*} req 
 * @param {*} res 
 */
const postClientePlacaMotoComodin = async (req, res) => {
  try {
    const {
      idCliente,
      idUsuario,
      idMotorista,
      pesoInicial,
      idPlaca,
      idEmpresa,
      socio,
      idProducto, 
      idOrigen, 
      NSalida, 
      NViajes, 
      idMovimiento, 
      idTrasladoOrigen, 
      proceso
    } = req.body;

    const verificado = jwt.verify(idUsuario, process.env.SECRET_KEY);
    const despachador = await db.usuarios.findUnique({
      where: {
        usuarios: verificado["usuarios"],
      },
    });
    
    const producto = proceso === 0 && await db.producto.findUnique({where:{id:idProducto}})
    const movimiento = proceso===0 && await db.movimientos.findUnique({where: {id: idMovimiento}})
    const trasladoOrigen = (proceso === 0 && (idMovimiento==10||idMovimiento==11)) && await db.translado.findUnique({where: {id: idTrasladoOrigen}})
    const newBol = await db.boleta.create({
      data: {
        placa: idPlaca,
        proceso,  
        empresa: idEmpresa,
        motorista: idMotorista,
        socio: idCliente == -998 ? socio : socio,
        boletaType: 0,
        estado: "Pendiente",
        idUsuario: parseFloat(despachador["id"]),
        usuario: despachador["usuarios"],
        fechaInicio: new Date(),
        pesoInicial: parseFloat(pesoInicial),
        boletaType: idCliente == -998 ? 3 : 4,
        ...(proceso==0 && { 
          movimiento: movimiento.nombre, 
          idProducto, 
          idMovimiento, 
          producto: producto.nombre, 
          ...((idMovimiento==10 || idMovimiento==11) && {
            idTrasladoOrigen, 
            trasladoOrigen: trasladoOrigen.nombre,
          }), 
          ...((idMovimiento!=10 && idMovimiento!=11) && {
            origen: idOrigen,
          }), 
          ...(idProducto === 18 && {
            Nviajes: parseInt(NViajes), 
            NSalida: parseInt(NSalida), 
          }),
        })
      },
    });

    if(idProducto===17 || idProducto===18) {
      imprimirTikets(newBol, despachador['name'])
    }

    setLogger('BOLETA', 'AGREGAR BOLETA (ENTRADA DE DATOS | COMODIN)', req, null, 1, newBol.id)  

    res
      .status(201)
      .send({ msg: "Boleta creada en estado pendiente", Bol: newBol });
  } catch (err) {
    setLogger('BOLETA', 'AGREGAR BOLETA (ENTRADA DE DATOS | COMODIN)', req, null, 3)  
    console.log(err);
  }
};

const postBoleta = async (req, res) => {
  const { idCliente } = req.body;

  if (idCliente == -998 || idCliente == -999) {
    return postClientePlacaMotoComodin(req, res);
  } else {
    return postClientePlacaMoto(req, res);
  }
};

/**
 * Fechas en UTC corregidas ultimo cambio aqui
 * @param {*} req 
 * @param {*} res 
 */
const getStatsBoletas = async (req, res) => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth(); // ya está en base 0
  const day = now.getUTCDate();

  const startOfDay = new Date(Date.UTC(year, month, day, 6, 0, 0));
  const endOfDay = new Date(Date.UTC(year, month, day+1, 6, 0, 0, 0));
  
  try {
    const [entrada, salida, pendientes] = await Promise.all([
      db.boleta.count({
        where: {
          proceso: 0,
          fechaFin: { gte: startOfDay, lte: endOfDay },
        },
      }),
      db.boleta.count({
        where: {
          proceso: 1,
          fechaFin: { gte: startOfDay, lte: endOfDay },
        },
      }),
      db.boleta.count({
        where: { estado: "Pendiente" },
      }),
    ]);
    res.status(201).send({ entrada, salida, pendientes });
  } catch (err) {
    setLogger('BOLETA', 'OBTENER ESTADISTICAS DE BOLETA', req, null, 3)  
    res.status(501).send({ msg: "Error en el server" });
  }
};

const getBoletaID = async (req, res) => {
  try {
    const data = await db.boleta.findUnique({
      where: {
        id: parseInt(req.params.id),
      },
      include: {
        clienteBoleta: {
          select: {
            tipo: true,
          },
        },
      },
    });

    return res.json(data);
  } catch (err) {
    setLogger('BOLETA', 'OBTENER DATOS DE UNA BOLETA', req, null, 3)  
    return res.status(401).send("Error en el api");
  }
};

/**
 * Aqui ya se modifico
 * @param {*} req 
 * @param {*} res 
 */
const getBoletasCompletadasDiarias = async (req, res) => {
  try {
    const search = req.query.search || "";
    const searchDate = req.query.searchDate || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 7;
    const skip = (page - 1) * limit;

    if (searchDate !== "") {
      const [year, month, day] = searchDate.split("-").map(Number);
      startOfDay = new Date(Date.UTC(year, month - 1, day, 6, 0, 0));
      endOfDay = new Date(Date.UTC(year, month - 1, day + 1, 5, 59, 59, 999));
    } else {
      const now = new Date();
      const year = now.getFullYear(); // Año local
      const month = now.getMonth(); // Mes local (0 = enero)
      const day = now.getDate(); // Día local
      startOfDay = new Date(Date.UTC(year, month, day, 6, 0, 0));
      endOfDay = new Date(Date.UTC(year, month, day + 1, 5, 59, 59, 999));
    }

    const data = await db.boleta.findMany({
      select: {
        id: true,
        numBoleta: true, 
        estado: true,
        proceso: true,
        empresa: true,
        motorista: true,
        empresa: true,
        socio: true,
        placa: true,
        pesoNeto: true,
        desviacion: true,
        fechaFin: true,
        estado: true,
      },
      where: {
        estado: { not: "Pendiente" },
        fechaFin: { gte: startOfDay, lte: endOfDay },
        OR: [
          {
            placa: { contains: search },
          },
          {
            empresa: { contains: search },
          },
          {
            motorista: { contains: search },
          },
          {
            socio: { contains: search },
          },
        ],
      },
      orderBy:{
        numBoleta:'desc'
      }, 
      skip: skip,
      take: limit,
    });

    const totalData = await db.boleta.count({
      where: {
        estado: { not: "Pendiente" },
        fechaFin: { gte: startOfDay, lte: endOfDay },
        OR: [
          {
            placa: { contains: search },
          },
          {
            empresa: { contains: search },
          },
          {
            motorista: { contains: search },
          },
          {
            socio: { contains: search },
          },
        ],
      },
    });

    const dataUTCHN = data.map((el) => ({
      Id: el.id,
      Boleta: el.numBoleta,
      Proceso: el.proceso == 0 ? "Entrada" : "Salida",
      Placa: el.placa,
      Cliente: el.socio,
      Transporte: el.empresa,
      PesoNeto: el.pesoNeto,
      Desviacion: el.desviacion,
      estado: el.estado,
      fecha: el.fechaFin.toLocaleString(),
    }));

    res.send({
      data: dataUTCHN,
      pagination: {
        totalData,
        totalPages: Math.ceil(totalData / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (err) {
    setLogger('BOLETA', 'OBTENER BOLETAS COMPLETADAS POR FECHA', req, null, 3)  
    console.log("Error en el api", err);
  }
};

/**
 *  Aqui se puso el generador (updateBoletaOut)
 * @param {*} req 
 * @param {*} res 
 */

const updateBoletaOut = async (req, res) => {
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
      fechaFin,
      idPlaca,
      idEmpresa,
      idMovimiento,
      idProducto,
      observaciones,
      ordenDeCompra,
      idTrasladoOrigen,
      idTrasladoDestino,
      ordenDeTransferencia,
      pesoNeto,
      pesoFinal,
      desviacion,
    } = req.body;

    const verificado = jwt.verify(idUsuario, process.env.SECRET_KEY);

    const despachador = await db.usuarios.findUnique({
      where: {
        usuarios: verificado["usuarios"],
      },
    });

    const placaData = await db.vehiculo.findFirst({
      select: {
        id: true,
        placa: true,
      },
      where: {
        placa: idPlaca,
        rEmpresaVehiculo: {
          id: idEmpresa,
        },
      },
    });

    const empresa = await db.empresa.findUnique({
      where: { id: parseInt(idEmpresa) },
    });
    const motorista = await db.motoristas.findUnique({
      where: { id: parseInt(idMotorista) },
    });
    const socio = await db.socios.findUnique({
      where: { id: parseInt(idCliente) },
    });
    const producto = await db.producto.findUnique({
      where: { id: parseInt(idProducto) },
    });
    const move = await db.movimientos.findUnique({
      where: { id: parseInt(idMovimiento) },
    });

    const isTraslado =
      move.nombre == "Traslado Interno" || move.nombre == "Traslado Externo"
        ? true
        : false;

    const origen =
      !isTraslado &&
      proceso == 0 &&
      (await db.direcciones.findUnique({ where: { id: parseInt(idOrigen) } }));
    const destino =
      !isTraslado &&
      proceso == 1 &&
      (await db.direcciones.findUnique({ where: { id: parseInt(idDestino) } }));
    const transladoOrigen =
      isTraslado &&
      (await db.translado.findUnique({
        where: { id: parseInt(idTrasladoOrigen) },
      }));
    const transladoDestino =
      isTraslado &&
      (await db.translado.findUnique({
        where: { id: parseInt(idTrasladoDestino) },
      }));

    const numBoleta = await generarNumBoleta();
    
    const porTolerancia = await toleranciaPermititda()

    const nuevaBoleta = await db.boleta.update({
      where: {
        id: parseInt(req.params.id),
      },
      data: {
        idSocio: parseInt(idCliente),
        numBoleta, 
        placa: placaData.placa,
        empresa: empresa.nombre,
        motorista: motorista.nombre,
        socio: socio.nombre,
        origen: !isTraslado ? (proceso == 0 ? origen.nombre : "Baprosa") : null,
        destino: !isTraslado
          ? proceso == 1
            ? destino.nombre
            : "Baprosa"
          : null,
        boletaType: parseInt(boletaType),
        idOrigen: !isTraslado
          ? proceso == 0
            ? parseInt(idOrigen)
            : null
          : null,
        idDestino: !isTraslado
          ? proceso == 1
            ? parseInt(idDestino)
            : null
          : null,
        manifiesto: proceso == 1 ? parseInt(manifiesto) : null,
        pesoTeorico: parseFloat(pesoTeorico),
        estado: estado,
        idUsuario: parseFloat(despachador["id"]),
        usuario: despachador["usuarios"],
        idMotorista: parseInt(idMotorista),
        fechaFin: fechaFin,
        pesoFinal: parseFloat(pesoFinal),
        idPlaca: placaData.id,
        idEmpresa: parseInt(idEmpresa),
        idMovimiento: parseInt(idMovimiento),
        movimiento: move.nombre,
        idProducto: parseInt(idProducto),
        producto: producto.nombre,
        observaciones,
        idTrasladoOrigen: isTraslado ? parseInt(idTrasladoOrigen) : null,
        idTrasladoDestino: isTraslado ? parseInt(idTrasladoDestino) : null,
        trasladoOrigen: transladoOrigen.nombre,
        trasladoDestino: transladoDestino.nombre,
        proceso,
        pesoNeto: parseFloat(pesoNeto),
        desviacion: parseFloat(desviacion),
        porTolerancia,
        ordenDeCompra: proceso == 0 ? parseInt(ordenDeCompra) : null,
        ordenDeTransferencia: isTraslado
          ? parseInt(ordenDeTransferencia)
          : null,
      },
    });
      

    if (nuevaBoleta.desviacion > 200 || nuevaBoleta.estado=='Completo(Fuera de tolerancia)') {
      const stmpMail = alertaDesviacion(nuevaBoleta, despachador, enviarCorreo)
      console.log(stmpMail)
    }
    
    /* IMPRESION DE COMPROBANTE PARA MOTORISTA */

    if (idProducto===18) {
      comprobanteDeCarga(nuevaBoleta, despachador['name'])
    }

    setLogger('BOLETA', 'MODIFICAR BOLETA (SALIDA DE BOLETA)', req, null, 1, nuevaBoleta.id)  

    /* Imprimir Boleta */

    const response = await imprimirWorkForce(nuevaBoleta)
    
    if (response) {
      return res.status(201).json({ msg: "Boleta creado exitosamente e impresa con exito" });
    }
    
    return res.status(201).json({ msg: "Boleta creado exitosamente, pero revise su impresora" });
  
  } catch (error) {
    setLogger('BOLETA', 'MODIFICAR BOLETA (SALIDA DE BOLETA)', req, null, 3)  
    res.status(500).json({ msg: `Error al crear usuario: ${error.message}` });
  }
};

/**
 * Aqui tambien se coloco el generador (updateBoletaOutComdin)
 * Se agrego logger
 * @param {*} req 
 * @param {*} res 
 */

const updateBoletaOutComdin = async (req, res) => {
  try {
    const {
      idCliente,
      idPlaca,
      proceso,
      idOrigen,
      idDestino,
      manifiesto,
      pesoTeorico,
      estado,
      idUsuario,
      idMotorista,
      fechaFin,
      idEmpresa,
      idMovimiento,
      idProducto,
      observaciones,
      ordenDeCompra,
      idTrasladoOrigen,
      idTrasladoDestino,
      ordenDeTransferencia,
      pesoNeto,
      pesoFinal,
      desviacion,
    } = req.body;

    const verificado = jwt.verify(idUsuario, process.env.SECRET_KEY);

    const despachador = await db.usuarios.findUnique({
      where: {
        usuarios: verificado["usuarios"],
      },
    });

    const producto = await db.producto.findUnique({
      where: { id: parseInt(idProducto) },
    });
    const move = await db.movimientos.findUnique({
      where: { id: parseInt(idMovimiento) },
    });

    const isTraslado =
      move.nombre == "Traslado Interno" || move.nombre == "Traslado Externo"
        ? true
        : false;

    const origen = !isTraslado && idOrigen;
    const destino = !isTraslado && idDestino;
    const transladoOrigen =
      isTraslado &&
      (await db.translado.findUnique({
        where: { id: parseInt(idTrasladoOrigen) },
      }));
    const transladoDestino =
      isTraslado &&
      (await db.translado.findUnique({
        where: { id: parseInt(idTrasladoDestino) },
      }));

    const numBoleta = await generarNumBoleta();

    const porTolerancia = await toleranciaPermititda();

    const nuevaBoleta = await db.boleta.update({
      where: {
        id: parseInt(req.params.id),
      },
      data: {
        placa: idPlaca,
        numBoleta, 
        empresa: idEmpresa,
        motorista: idMotorista,
        origen: !isTraslado ? (proceso == 0 ? origen : "Baprosa") : null,
        destino: !isTraslado ? (proceso == 1 ? destino : "Baprosa") : null,
        idOrigen: null,
        idDestino: null,
        manifiesto: proceso == 1 ? parseInt(manifiesto) : null,
        pesoTeorico: parseFloat(pesoTeorico),
        estado: estado,
        idUsuario: parseFloat(despachador["id"]),
        usuario: despachador["usuarios"],
        idMotorista: null,
        fechaFin: fechaFin,
        pesoFinal: parseFloat(pesoFinal),
        idPlaca: null,
        idEmpresa: null,
        idMovimiento: parseInt(idMovimiento),
        movimiento: move.nombre,
        idProducto: parseInt(idProducto),
        producto: producto.nombre,
        observaciones,
        idTrasladoOrigen: isTraslado ? parseInt(idTrasladoOrigen) : null,
        idTrasladoDestino: isTraslado ? parseInt(idTrasladoDestino) : null,
        trasladoOrigen: transladoOrigen.nombre,
        trasladoDestino: transladoDestino.nombre,
        proceso,
        pesoNeto: parseFloat(pesoNeto),
        desviacion: parseFloat(desviacion),
        porTolerancia, 
        ordenDeCompra: proceso == 0 ? parseInt(ordenDeCompra) : null,
        ordenDeTransferencia: isTraslado
          ? parseInt(ordenDeTransferencia)
          : null,
      },
    });

    if (idProducto===18) {
      comprobanteDeCarga(nuevaBoleta, despachador['name'])
    }

    setLogger('BOLETA', 'MODIFICAR BOLETA (SALIDA DE BOLETA | COMODIN)', req, null, 1, nuevaBoleta.id)  


    /* Imprimir Boleta */
    const response = await imprimirWorkForce(nuevaBoleta)
    
    if (response) {
      return res.status(201).json({ msg: "Boleta creado exitosamente e impresa con exito" });
    }
    
    return res.status(201).json({ msg: "Boleta creado exitosamente, pero revise su impresora" });
  
  } catch (error) {
    setLogger('BOLETA', 'MODIFICAR BOLETA (SALIDA DE BOLETA | COMODIN)', req, null, 3)  
    res.status(500).json({ msg: `Error al crear usuario: ${error.message}` });
  }
};

const updateBoleta = async (req, res) => {
  const { idCliente } = req.body;

  if (idCliente == -998 || idCliente == -999) {
    return updateBoletaOutComdin(req, res);
  } else {
    return updateBoletaOut(req, res);
  }
};

/**
 * Aqui tambien se cambio
 * @param {*} req 
 * @param {*} res 
 */
const getBoletasHistorial = async (req, res) => {
  try {
    const movimiento = req.query.movimiento || "";
    const producto = req.query.producto || "";
    const dateIn = req.query.dateIn || null;
    const dateOut = req.query.dateOut || null;
    const socios = req.query.socios || "";

    const [y1, m1, d1] = dateIn.split("-").map(Number);
    const startOfDay = new Date(Date.UTC(y1, m1 - 1, d1, 6, 0, 0));
    const [y2, m2, d2] = dateOut.split("-").map(Number);
    const endOfDay = new Date(Date.UTC(y2, m2 - 1, d2 + 1, 6, 0, 0));

    const [entrada, salida, canceladas, completas, desviadas] = await Promise.all([
      db.boleta.count({
        where: {
          AND: [
            { estado: { not: "Pendiente" } },
            { estado: { not: "Cancelada" } },
          ],
          ...(socios ? {socio: socios} : {}),  
          proceso: 0,
          fechaFin: { gte: startOfDay, lte: endOfDay },
          ...(movimiento ? { movimiento: movimiento } : {}),
          ...(producto ? { producto: producto } : {}),
        },
      }),
      db.boleta.count({
        where: {
          AND: [
            { estado: { not: "Pendiente" } },
            { estado: { not: "Cancelada" } },
          ],
          ...(socios ? {socio: socios} : {}),  
          proceso: 1,
          fechaFin: { gte: startOfDay, lte: endOfDay },
          ...(movimiento ? { movimiento: movimiento } : {}),
          ...(producto ? { producto: producto } : {}),
        },
      }),
      db.boleta.count({
        where: {
          AND: [{ estado: { not: "Pendiente" } }, { estado: "Cancelada" }],
          ...(socios ? {socio: socios} : {}), 
          fechaFin: { gte: startOfDay, lte: endOfDay },
          ...(movimiento ? { movimiento: movimiento } : {}),
          ...(producto ? { producto: producto } : {}),
        },
      }),
      db.boleta.count({
        where: {
          AND: [{ estado: { not: "Pendiente" } }, { estado: "Completado" }],
          ...(socios ? {socio: socios} : {}), 
          fechaFin: { gte: startOfDay, lte: endOfDay },
          ...(movimiento ? { movimiento: movimiento } : {}),
          ...(producto ? { producto: producto } : {}),
        },
      }),
      db.boleta.count({
        where: {
          AND: [{ estado: { not: "Pendiente" } }, { estado: "Completo(Fuera de tolerancia)" }],
          ...(socios ? {socio: socios} : {}),  
          fechaFin: { gte: startOfDay, lte: endOfDay },
          ...(movimiento ? { movimiento: movimiento } : {}),
          ...(producto ? { producto: producto } : {}),
        },
      }),
    ]);

    const data = await db.boleta.findMany({
      select: {
        id: true,
        numBoleta: true, 
        estado: true,
        proceso: true,
        empresa: true,
        motorista: true,
        movimiento: true,
        producto: true,
        pesoNeto: true,
        pesoTeorico: true,
        desviacion: true,
        socio: true,
        placa: true,
        fechaFin: true,
        estado: true, 
        proceso: true,
      },
      where: {
        ...(socios ? {socio: socios} : {}), 
        fechaFin: { gte: startOfDay, lte: endOfDay },
        estado: {
          not: "Pendiente",
        },
        ...(movimiento ? { movimiento: movimiento } : {}),
        ...(producto ? { producto: producto } : {}),
      },
    });

    const dataUTCHN = data.map((el) => ({
      Boleta: el.numBoleta,
      Placa: el.placa,
      Cliente: el.socio,
      Transporte: el.empresa,
      Motorista: el.motorista,
      Moviento: el.movimiento,
      Producto: el.producto,
      PesoNeto: el.pesoNeto,
      PesoTeorico: el.pesoTeorico,
      Desviacion: el.desviacion,
      Estado: el.estado, 
      Fecha: el.fechaFin.toLocaleString(),
    }));

    res.send({ table: dataUTCHN, graphProcesos: [{entrada}, {salida}], graphEstados: [{canceladas}, {completas}, {desviadas}] });
  } catch (err) {
    console.log(err);
    setLogger('BOLETA', 'OBTENER BOLETAS EN EL REPORTE', req, null, 3)  
    res.status(500).send({ msg: "Error interno API" });
  }
};

/**
 * ! Importante esta funcion no se le puso logger 
 * ! Hasta que venga la impresora
 * @param {*} req 
 * @param {*} res 
 */
const getReimprimir = async (req, res) => {
  try {
    const id = req.params.id;
    const type = req.query.type;
    const boleta = await db.boleta.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    const types_colors = {yellow:['y'], pink:['p'], green:['g']}
    getReimprimirWorkForce(boleta, types_colors[type]);
    res.send({ msg: "Impresion correcta" });
  } catch (err) {
    console.log(err);
  }
};

/* Para el calentario */

/**
 * Primera parte fechas
 */

const getBoletasMes = async (req, res) => {
  try {
    const start = req.query.start || "";
    const end = req.query.end || "";

    const result = await db.$queryRaw`
    SELECT  CONVERT(DATE, fechaInicio AT TIME ZONE 'UTC' AT TIME ZONE 'Central America Standard Time') as fecha, COUNT(*) as cantidad
    FROM boleta
    WHERE fechaInicio >= ${start} AND fechaInicio <= ${end}
    GROUP BY CONVERT(DATE, fechaInicio AT TIME ZONE 'UTC' AT TIME ZONE 'Central America Standard Time')
    ORDER BY fecha
  `;

    const makeCalendar = result.map((item) => ({
      title: `Boletas creadas: ${item.cantidad}`,
      start: item.fecha.toISOString().split("T")[0],
      allDay: true,
      display: "auto",
      textColor: "black",
      backgroundColor: "transparent",
      borderColor: "transparent", // Cambiado a transparente
    }));

    res.send(makeCalendar);
  } catch (err) {
    setLogger('BOLETA', 'OBTENER ESTADISTICAS DE CANTIDAD DE BOLETAS POR MES', req, null, 3)  
    console.log(err);
  }
};

const getTimeLineForComponent = async (req, res) => {
  try {
    const fecha = req.query.fecha || "";
    const convertDate = fecha && new Date(fecha).toISOString();

    // Sumamos 1 día
    const fechaObj = new Date(convertDate);
    const fechaMasUno = new Date(fechaObj);
    fechaMasUno.setDate(fechaObj.getDate() + 1);

    // Ahora hacemos la consulta
    const data = await db.boleta.findMany({
      where: {
        fechaInicio: {
          gte: convertDate, // fecha inicial
          lt: fechaMasUno.toISOString(), // fecha + 1 día
        },
      },
    });
    const groups = data.map((el) => ({
      id: el.id,
      title: el.placa + (el.numBoleta ? "(#" + el.numBoleta  + ")" : ''),
    }));

    const items = data.map((el) => ({
      id: el.id,
      group: el.id,
      title: el.placa,
      start_time: el.fechaInicio,
      end_time: el.fechaFin,
    }));

    res.send({ groups, items });
  } catch (err) {
    setLogger('BOLETA', 'OBTENER ESTADISTICAS DE CANTIDAD DE BOLETAS POR MES', req, null, 3)  
    console.log(err);
  }
};

/**
 * Aqui tambien se colcoco el looger
 * @param {*} req 
 * @param {*} res 
 */
const updateCancelBoletas = async (req, res) => {
  const { Id, Motivo } = req.body;
  console.log(req.body);
  try {
    const numBoleta = await generarNumBoleta();
    const updateBoleta = await db.boleta.update({
      where: {
        id: parseInt(Id),
      },
      data: {
        boletaType: 5,
        numBoleta, 
        observaciones: Motivo,
        fechaFin: new Date(),
        estado: "Cancelada",
      },
    });

    const verificado =  jwt.verify(req.header('Authorization'), process.env.SECRET_KEY)
    const usuario = await db.usuarios.findUnique({
        where: {
        usuarios: verificado["usuarios"],
      },
    });

    alertaCancelacion(updateBoleta, usuario, enviarCorreo)
        
    setLogger('BOLETA', 'CANCELAR BOLETA', req, null, 1, updateBoleta.id)  

    res.send({ msg: "Cancelada correctamente", boletas: updateBoleta });
  } catch (err) {
    console.log(err);
  }
};

/**
 * Para reportes
 */

const getMovimientosYProductos = async (req, res) => {
  try {
    const [movimiento, producto, socios] = await Promise.all([
      db.movimientos.findMany({ select: { id: true, nombre: true } }),
      db.producto.findMany({ select: { id: true, nombre: true } }),
      db.boleta.findMany({ 
        select: { socio: true }, 
        distinct: ['socio']
      })
    ]);

    res.send({ movimiento, producto, socios });
  } catch (err) {
    setLogger('BOLETA', 'OBTENER DATOS PARA FILTROS DE REPORTES', req, null, 3)  
    console.log(err);
  }
};

const toleranciaPermititda = async() => {
  try{
    const {valor} = await db.config.findUnique({where:{id:1}})
    return valor
  }catch(err) {
    console.log(err)
  }
}

const getConfigTolerancia = async(req, res) => {
  try{
    const tolerancia = await db.config.findUnique({where:{id:1}})
    res.status(200).send(tolerancia)
  }catch(err) {
    console.log(err)
  }
}

module.exports = {
  getAllData,
  postBoletasNormal,
  getDataBoletas,
  getStatsBoletas,
  getBoletaID,
  updateBoleta,
  postBoleta,
  getBoletasHistorial,
  getReimprimir,
  getBoletasCompletadasDiarias,
  getBoletasMes,
  getTimeLineForComponent,
  updateCancelBoletas,
  getMovimientosYProductos,
  getConfigTolerancia, 
};
