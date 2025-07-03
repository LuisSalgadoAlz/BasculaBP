const db = require("../lib/prisma");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const { imprimirEpson, imprimirQRTolva, comprobanteDeCarga, imprimirWorkForce, imprimirTikets, getReimprimirWorkForce, reImprimirTikets } = require("./impresiones.controller");
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

    const proceso = parseInt(req.query.proceso) || 0;

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
      TI,
      TE,
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
        where: {estado: true, place: { in: [proceso, 2]}}
      }),
      db.movimientos.findMany({
        select: { id: true, nombre: true }, 
        where: {estado: true, place: { in: [proceso, 2]}}
      }),
      db.translado.findMany({
        select: { id: true, nombre: true, code:true },
        where: { tipo: 0 },
      }),
      db.translado.findMany({
        select: { id: true, nombre: true, code:true },
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

    const TransladosI = TI.map((item)=>({...item, nombre: `${item.nombre} (${item.code})`}))
    const TransladosE = TE.map((item)=>({...item, nombre: `${item.nombre} (${item.code})`}))
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

    let dateFilter = {};
    if (searchDate) {
      const [year, month, day] = searchDate.split("-").map(Number);
      const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
      const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
      dateFilter = { fechaInicio: { gte: startOfDay, lte: endOfDay } };
    }

    const baseWhere = {
      estado: "Pendiente",
      ...dateFilter,
      OR: [
        { placa: { contains: search } },
        { empresa: { contains: search } },
        { motorista: { contains: search } },
        { socio: { contains: search } },
      ],
    };

    const [data, totalData] = await Promise.all([
      db.boleta.findMany({
        select: {
          id: true,
          estado: true,
          proceso: true,
          empresa: true,
          motorista: true,
          socio: true,
          placa: true,
          producto: true,
          fechaInicio: true,
        },
        where: baseWhere,
        skip,
        take: limit,
      }),
      db.boleta.count({ where: baseWhere }),
    ]);

    const dataUTCHN = data.map((el) => ({
      Id: el.id,
      Proceso: el.proceso === 0 ? 'Entrada' : 'Salida',
      Placa: el.placa,
      Cliente: el.socio,
      Transporte: el.empresa,
      Motorista: el.motorista,
      Producto: el.producto || 'N/A',
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
    setLogger('BOLETA', 'OBTENER BOLETAS PENDIENTES', req, null, 3);
    console.error(err);
    res.status(500).send({ error: 'Error al obtener boletas' });
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
      idTrasladoOrigen, 
      sello1,
      sello2, 
      sello3, 
      sello4, 
      sello5, 
      sello6, 
      tolvaAsignada,
      Nbodega,
      FechaPuerto,
      manifiesto,  
    } = req.body;

    const [
      empresa,
      motorista,
      socio,
      placaData,
      producto,
      origen,
      movimiento,
      trasladoOrigen,
      despachador
    ] = await Promise.all([
      db.empresa.findUnique({ where: { id: parseInt(idEmpresa) } }),
      db.motoristas.findUnique({ where: { id: parseInt(idMotorista) } }),
      db.socios.findUnique({ where: { id: parseInt(idCliente) } }),
      db.vehiculo.findFirst({
        select: { id: true, placa: true },
        where: { placa: idPlaca, rEmpresaVehiculo: { id: idEmpresa } },
      }),
      proceso === 0 ? db.producto.findUnique({ where: { id: idProducto } }) : null,
      (proceso === 0 && (idMovimiento != 10 && idMovimiento != 11)) ? 
        db.direcciones.findUnique({ where: { id: idOrigen } }) : null,
      proceso === 0 ? db.movimientos.findUnique({ where: { id: idMovimiento } }) : null,
      (proceso === 0 && (idMovimiento == 10 || idMovimiento == 11)) ? 
        db.translado.findUnique({ where: { id: idTrasladoOrigen } }) : null,
      (async () => {
        const verificado = jwt.verify(idUsuario, process.env.SECRET_KEY);
        return db.usuarios.findUnique({ where: { usuarios: verificado["usuarios"] } });
      })()
    ]);

    const baseData = {
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
      proceso
    };

    if (proceso === 0) {
      Object.assign(baseData, {
        movimiento: movimiento.nombre,
        idProducto,
        idMovimiento,
        producto: producto.nombre
      });

      if (idMovimiento == 10 || idMovimiento == 11) {
        Object.assign(baseData, {
          idTrasladoOrigen,
          trasladoOrigen: trasladoOrigen.nombre,
          manifiesto: manifiesto == 0 ? null : parseInt(manifiesto)
        });
      } else {
        Object.assign(baseData, {
          idOrigen,
          origen: origen.nombre
        });
      }

      if (idProducto === 18) {
        Object.assign(baseData, {
          Nviajes: parseInt(NViajes),
          NSalida: parseInt(NSalida),
          bodegaPuerto: Nbodega,
          fechaDespachoPuerto: FechaPuerto ? new Date(FechaPuerto) : null,
          tolvaAsignada: parseInt(tolvaAsignada)
        });
      }

      // Datos específicos para movimiento 2
      if (idMovimiento == 2) {
        Object.assign(baseData, {
          sello1, sello2, sello3, sello4, sello5, sello6
        });
      }
    }

    const newBol = await db.boleta.create({ data: baseData });

    const debeImprimirQR = (idProducto === 17 && idMovimiento === 1) || (idProducto === 18 && idMovimiento === 2);
    if(debeImprimirQR) {
      imprimirQRTolva(newBol);
    }
    
    setLogger('BOLETA', 'AGREGAR BOLETA (ENTRADA DE DATOS)', req, null, 1, newBol.id);

    res
      .status(201)
      .send({ msg: "Boleta creada en estado pendiente", Bol: newBol });
  } catch (err) {
    setLogger('BOLETA', 'AGREGAR BOLETA (ENTRADA DE DATOS)', req, null, 3);
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
      proceso, 
      sello1,
      sello2, 
      sello3, 
      sello4, 
      sello5, 
      sello6,
      tolvaAsignada,
      Nbodega,
      FechaPuerto,
      manifiesto,  
    } = req.body;

    const [
      despachador,
      producto,
      movimiento,
      trasladoOrigen
    ] = await Promise.all([
      (async () => {
        const verificado = jwt.verify(idUsuario, process.env.SECRET_KEY);
        return db.usuarios.findUnique({ where: { usuarios: verificado["usuarios"] } });
      })(),
      // Consultas condicionales
      proceso === 0 ? db.producto.findUnique({ where: { id: idProducto } }) : null,
      proceso === 0 ? db.movimientos.findUnique({ where: { id: idMovimiento } }) : null,
      (proceso === 0 && (idMovimiento == 10 || idMovimiento == 11)) ? 
        db.translado.findUnique({ where: { id: idTrasladoOrigen } }) : null
    ]);

    const baseData = {
      placa: idPlaca,
      proceso,
      empresa: idEmpresa,
      motorista: idMotorista,
      socio: idCliente == -998 ? socio : socio,
      boletaType: idCliente == -998 ? 3 : 4,
      estado: "Pendiente",
      idUsuario: parseFloat(despachador["id"]),
      usuario: despachador["usuarios"],
      fechaInicio: new Date(),
      pesoInicial: parseFloat(pesoInicial)
    };

    if (proceso === 0) {
      Object.assign(baseData, {
        movimiento: movimiento.nombre,
        idProducto,
        idMovimiento,
        producto: producto.nombre
      });

      if (idMovimiento == 10 || idMovimiento == 11) {
        Object.assign(baseData, {
          idTrasladoOrigen,
          trasladoOrigen: trasladoOrigen.nombre,
          manifiesto: manifiesto == 0 ? null : parseInt(manifiesto)
        });
      } else {
        Object.assign(baseData, {
          origen: idOrigen
        });
      }

      if (idProducto === 18) {
        Object.assign(baseData, {
          Nviajes: parseInt(NViajes),
          NSalida: parseInt(NSalida),
          bodegaPuerto: Nbodega,
          fechaDespachoPuerto: FechaPuerto ? new Date(FechaPuerto) : null,
          tolvaAsignada: parseInt(tolvaAsignada)
        });
      }

      if (idMovimiento == 2) {
        Object.assign(baseData, {
          sello1, sello2, sello3, sello4, sello5, sello6
        });
      }
    }

    const newBol = await db.boleta.create({ data: baseData });

    const debeImprimirQR = (idProducto === 17 && idMovimiento === 1) || (idProducto === 18 && idMovimiento === 2);
    if(debeImprimirQR) {
      imprimirQRTolva(newBol);
    }

    setLogger('BOLETA', 'AGREGAR BOLETA (ENTRADA DE DATOS | COMODIN)', req, null, 1, newBol.id);

    res
      .status(201)
      .send({ msg: "Boleta creada en estado pendiente", Bol: newBol });
  } catch (err) {
    setLogger('BOLETA', 'AGREGAR BOLETA (ENTRADA DE DATOS | COMODIN)', req, null, 3);
    console.log(err);
  }
};

const postBoleta = async (req, res) => {
  const { idCliente } = req.body;
  try{
    /* const countPlacas = await db.boleta.count({ where:{ estado: 'Pendiente', placa: idPlaca, }})

    if(countPlacas!=0) {
      return res.status(200).send({err: 'Placa ya esta ingresada en pendientes, complete su proceso o cancele la boleta.'})
    } */

    if (idCliente == -998 || idCliente == -999) {
      return postClientePlacaMotoComodin(req, res);
    } else {
      return postClientePlacaMoto(req, res);
    }
  }catch(err){
    console.log(err)
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
        tolva: {
          select:{
            principal: {
              select: {nombre:true}
            }, 
            secundario:{
              select: {nombre:true}
            }, 
            terciario: {
              select: {nombre: true}
            }, 
          }
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

    let startOfDay, endOfDay;
    if (searchDate !== "") {
      const [year, month, day] = searchDate.split("-").map(Number);
      startOfDay = new Date(Date.UTC(year, month - 1, day, 6, 0, 0));
      endOfDay = new Date(Date.UTC(year, month - 1, day + 1, 5, 59, 59, 999));
    } else {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const day = now.getDate();
      startOfDay = new Date(Date.UTC(year, month, day, 6, 0, 0));
      endOfDay = new Date(Date.UTC(year, month, day + 1, 5, 59, 59, 999));
    }

    // Optimiza el filtro OR para reusarlo
    const filterOR = search
      ? [
          { placa: { contains: search } },
          { empresa: { contains: search } },
          { motorista: { contains: search } },
          { socio: { contains: search } },
        ]
      : undefined;

    const whereClause = {
      estado: { not: "Pendiente" },
      fechaFin: { gte: startOfDay, lte: endOfDay },
      ...(filterOR && { OR: filterOR }),
    };

    const [data, totalData] = await Promise.all([
      db.boleta.findMany({
        select: {
          id: true,
          numBoleta: true,
          estado: true,
          proceso: true,
          empresa: true,
          motorista: true,
          socio: true,
          placa: true,
          pesoNeto: true,
          desviacion: true,
          fechaFin: true,
        },
        where: whereClause,
        orderBy: { numBoleta: "desc" },
        skip,
        take: limit,
      }),
      db.boleta.count({ where: whereClause }),
    ]);

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
      fecha: el.fechaFin.toLocaleString("es-HN", { timeZone: "America/Tegucigalpa" }),
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
    setLogger("BOLETA", "OBTENER BOLETAS COMPLETADAS POR FECHA", req, null, 3);
    console.error("Error en el API:", err);
    res.status(500).send({ err: "Error interno del servidor" });
  }
};


/**
 * Generador de pases de salida
 * @param {*} req 
 * @param {*} res 
 */

const createPaseDeSalida = async(boleta) =>{
  try {
    const ultimoPase = await db.PasesDeSalida.findFirst({
      orderBy: { numPaseSalida: 'desc' },
      select: { numPaseSalida: true },
    });

    const createPase = await db.PasesDeSalida.create({
      data: {
        idBoleta:parseInt(boleta.id),
        numPaseSalida: (ultimoPase?.numPaseSalida || 0) + 1,
        estado: false, 
      }
    })
    return true
  }catch(err) {
    console.log(err)
    return false
  }
}

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
      allSellos
    } = req.body;

    const verificado = jwt.verify(idUsuario, process.env.SECRET_KEY);

    const [
      despachador,
      placaData,
      empresa,
      motorista,
      socio,
      producto,
      move,
      numBoleta,
      porTolerancia
    ] = await Promise.all([
      db.usuarios.findUnique({
        where: { usuarios: verificado["usuarios"] },
      }),
      db.vehiculo.findFirst({
        select: { id: true, placa: true },
        where: {
          placa: idPlaca,
          rEmpresaVehiculo: { id: idEmpresa },
        },
      }),
      db.empresa.findUnique({
        where: { id: parseInt(idEmpresa) },
      }),
      db.motoristas.findUnique({
        where: { id: parseInt(idMotorista) },
      }),
      db.socios.findUnique({
        where: { id: parseInt(idCliente) },
      }),
      db.producto.findUnique({
        where: { id: parseInt(idProducto) },
      }),
      db.movimientos.findUnique({
        where: { id: parseInt(idMovimiento) },
      }),
      generarNumBoleta(),
      toleranciaPermititda()
    ]);

    const isTraslado = move.nombre === "Traslado Interno" || move.nombre === "Traslado Externo";

    // Consultas condicionales para origen, destino y traslados
    const consultasCondicionales = [];
    
    // Solo consultar origen si no es traslado y proceso es 0
    if (!isTraslado && proceso == 0) {
      consultasCondicionales.push(
        db.direcciones.findUnique({ where: { id: parseInt(idOrigen) } })
      );
    } else {
      consultasCondicionales.push(Promise.resolve(null));
    }
    
    // Solo consultar destino si no es traslado y proceso es 1
    if (!isTraslado && proceso == 1) {
      consultasCondicionales.push(
        db.direcciones.findUnique({ where: { id: parseInt(idDestino) } })
      );
    } else {
      consultasCondicionales.push(Promise.resolve(null));
    }
    
    // Solo consultar traslados si es traslado
    if (isTraslado) {
      consultasCondicionales.push(
        db.translado.findUnique({ where: { id: parseInt(idTrasladoOrigen) } }),
        db.translado.findUnique({ where: { id: parseInt(idTrasladoDestino) } })
      );
    } else {
      consultasCondicionales.push(Promise.resolve(null), Promise.resolve(null));
    }

    const [origen, destino, transladoOrigen, transladoDestino] = await Promise.all(consultasCondicionales);

    // Preparar datos para la actualización
    const updateData = {
      idSocio: parseInt(idCliente),
      numBoleta,
      placa: placaData.placa,
      empresa: empresa.nombre,
      motorista: motorista.nombre,
      socio: socio.nombre,
      boletaType: parseInt(boletaType),
      pesoTeorico: parseFloat(pesoTeorico),
      estado,
      idUsuario: parseFloat(despachador["id"]),
      usuario: despachador["usuarios"],
      idMotorista: parseInt(idMotorista),
      fechaFin,
      pesoFinal: parseFloat(pesoFinal),
      idPlaca: placaData.id,
      idEmpresa: parseInt(idEmpresa),
      idMovimiento: parseInt(idMovimiento),
      movimiento: move.nombre,
      idProducto: parseInt(idProducto),
      producto: producto.nombre,
      observaciones,
      proceso,
      pesoNeto: parseFloat(pesoNeto),
      desviacion: parseFloat(desviacion),
      porTolerancia,
      ...allSellos
    };

    // Agregar campos condicionales
    if (!isTraslado) {
      updateData.origen = proceso == 0 ? origen?.nombre : "Baprosa";
      updateData.destino = proceso == 1 ? destino?.nombre : "Baprosa";
      updateData.idOrigen = proceso == 0 ? parseInt(idOrigen) : null;
      updateData.idDestino = proceso == 1 ? parseInt(idDestino) : null;
      updateData.manifiesto = proceso == 1 ? parseInt(manifiesto) : null;
      updateData.ordenDeCompra = proceso == 0 ? parseInt(ordenDeCompra) : null;
      updateData.idTrasladoOrigen = null;
      updateData.idTrasladoDestino = null;
      updateData.trasladoOrigen = null;
      updateData.trasladoDestino = null;
      updateData.ordenDeTransferencia = null;
    } else {
      updateData.origen = null;
      updateData.destino = null;
      updateData.idOrigen = null;
      updateData.idDestino = null;
      updateData.manifiesto = null;
      updateData.ordenDeCompra = null;
      updateData.idTrasladoOrigen = parseInt(idTrasladoOrigen);
      updateData.idTrasladoDestino = parseInt(idTrasladoDestino);
      updateData.trasladoOrigen = transladoOrigen?.nombre;
      updateData.trasladoDestino = transladoDestino?.nombre;
      updateData.ordenDeTransferencia = parseInt(ordenDeTransferencia);
    }

    const nuevaBoleta = await db.boleta.update({
      where: { id: parseInt(req.params.id) },
      data: updateData,
    });

    // Verificar desviación y enviar alerta si es necesario
    if (nuevaBoleta.desviacion > 200 || nuevaBoleta.estado === 'Completo(Fuera de tolerancia)' || nuevaBoleta.desviacion < -200) {
      const stmpMail = alertaDesviacion(nuevaBoleta, despachador, enviarCorreo);
      console.log(stmpMail);
    }

    // Generar comprobante para producto específico
    if (idProducto === 18) {
      comprobanteDeCarga(nuevaBoleta, despachador['name']);
    }

    setLogger('BOLETA', 'MODIFICAR BOLETA (SALIDA DE BOLETA)', req, null, 1, nuevaBoleta.id);

    // Crear pase de salida e imprimir en paralelo
    const [crearPase, response] = await Promise.all([
      createPaseDeSalida(nuevaBoleta),
      imprimirWorkForce(nuevaBoleta)
    ]);

    const message = response 
      ? "Boleta creado exitosamente e impresa con exito"
      : "Boleta creado exitosamente, pero revise su impresora";

    return res.status(201).json({ msg: message });

  } catch (error) {
    setLogger('BOLETA', 'MODIFICAR BOLETA (SALIDA DE BOLETA)', req, null, 3);
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
      allSellos,
    } = req.body;

    const verificado = jwt.verify(idUsuario, process.env.SECRET_KEY);

    // Realizar todas las consultas base en paralelo
    const [
      despachador,
      producto,
      move,
      numBoleta,
      porTolerancia
    ] = await Promise.all([
      db.usuarios.findUnique({
        where: { usuarios: verificado["usuarios"] },
      }),
      db.producto.findUnique({
        where: { id: parseInt(idProducto) },
      }),
      db.movimientos.findUnique({
        where: { id: parseInt(idMovimiento) },
      }),
      generarNumBoleta(),
      toleranciaPermititda()
    ]);

    const isTraslado = move.nombre === "Traslado Interno" || move.nombre === "Traslado Externo";

    // Consultas condicionales para traslados
    const consultasTraslado = [];
    
    if (isTraslado) {
      consultasTraslado.push(
        db.translado.findUnique({ where: { id: parseInt(idTrasladoOrigen) } }),
        db.translado.findUnique({ where: { id: parseInt(idTrasladoDestino) } })
      );
    } else {
      consultasTraslado.push(Promise.resolve(null), Promise.resolve(null));
    }

    const [transladoOrigen, transladoDestino] = await Promise.all(consultasTraslado);

    // Variables para origen y destino (mantener lógica original)
    const origen = !isTraslado && idOrigen;
    const destino = !isTraslado && idDestino;

    // Preparar datos para la actualización
    const updateData = {
      placa: idPlaca,
      numBoleta,
      empresa: idEmpresa,
      motorista: idMotorista,
      idOrigen: null,
      idDestino: null,
      pesoTeorico: parseFloat(pesoTeorico),
      estado,
      idUsuario: parseFloat(despachador["id"]),
      usuario: despachador["usuarios"],
      idMotorista: null,
      fechaFin,
      pesoFinal: parseFloat(pesoFinal),
      idPlaca: null,
      idEmpresa: null,
      idMovimiento: parseInt(idMovimiento),
      movimiento: move.nombre,
      idProducto: parseInt(idProducto),
      producto: producto.nombre,
      observaciones,
      proceso,
      pesoNeto: parseFloat(pesoNeto),
      desviacion: parseFloat(desviacion),
      porTolerancia,
      ...allSellos
    };

    // Agregar campos condicionales
    if (!isTraslado) {
      updateData.origen = proceso == 0 ? origen : "Baprosa";
      updateData.destino = proceso == 1 ? destino : "Baprosa";
      updateData.manifiesto = proceso == 1 ? parseInt(manifiesto) : null;
      updateData.ordenDeCompra = proceso == 0 ? parseInt(ordenDeCompra) : null;
      updateData.idTrasladoOrigen = null;
      updateData.idTrasladoDestino = null;
      updateData.trasladoOrigen = null;
      updateData.trasladoDestino = null;
      updateData.ordenDeTransferencia = null;
    } else {
      updateData.origen = null;
      updateData.destino = null;
      updateData.manifiesto = null;
      updateData.ordenDeCompra = null;
      updateData.idTrasladoOrigen = parseInt(idTrasladoOrigen);
      updateData.idTrasladoDestino = parseInt(idTrasladoDestino);
      updateData.trasladoOrigen = transladoOrigen?.nombre;
      updateData.trasladoDestino = transladoDestino?.nombre;
      updateData.ordenDeTransferencia = parseInt(ordenDeTransferencia);
    }

    const nuevaBoleta = await db.boleta.update({
      where: { id: parseInt(req.params.id) },
      data: updateData,
    });

    // Generar comprobante para producto específico
    if (idProducto === 18) {
      comprobanteDeCarga(nuevaBoleta, despachador['name']);
    }

    setLogger('BOLETA', 'MODIFICAR BOLETA (SALIDA DE BOLETA | COMODIN)', req, null, 1, nuevaBoleta.id);

    // Imprimir boleta
    const response = await imprimirWorkForce(nuevaBoleta);

    const message = response 
      ? "Boleta creado exitosamente e impresa con exito"
      : "Boleta creado exitosamente, pero revise su impresora";

    return res.status(201).json({ msg: message });

  } catch (error) {
    setLogger('BOLETA', 'MODIFICAR BOLETA (SALIDA DE BOLETA | COMODIN)', req, null, 3);
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

const getReimprimirTicket = async (req, res) => {
  try {
    const id = req.query.id;
    const boleta = await db.boleta.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    const despachador = await db.usuarios.findUnique({where: {usuarios:boleta.usuario}})
    try {
      imprimirQRTolva(boleta)
      res.send({ msg: "Impresion correcta" });
    }catch(err) {
      console.log(`Error al reimprimir ticket de tolva`)
      res.send({ msgErr: "No se pudo realizar la reimpresión del ticket" });
    }
  } catch (err){
    res.send({ msgErr: "No se pudo realizar la reimpresión del ticket" });
    console.log(err)
  }
}

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
      estado:el.estado
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
  getReimprimirTicket
};
