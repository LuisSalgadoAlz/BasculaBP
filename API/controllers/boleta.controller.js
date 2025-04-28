const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");
const db = new PrismaClient();
const jwt = require("jsonwebtoken");
const imprimirEpson = require("./impresiones.controller");

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
    Clientes.push({ id:-998, nombre: 'Cliente X'} , { id:-999, nombre: 'Proveedor X'})
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
    console.log(err);
  }
};

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

    console.log(despachador['id'])

    const isComodin =  idCliente ==-998;
    const placaData = !isComodin && await db.vehiculo.findFirst({
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

    const producto = await db.producto.findUnique({
      where: { id: parseInt(idProducto) },
    });
    const move = await db.movimientos.findUnique({
      where: { id: parseInt(idMovimiento) },
    });
    
    const socio = !isComodin && await db.socios.findUnique({  where: { id: parseInt(idCliente) },});
    const motorista =!isComodin && await db.motoristas.findUnique({ where: { id: parseInt(idMotorista) },});
    const empresa = !isComodin && await db.empresa.findUnique({where: { id: parseInt(idEmpresa) },}); 
    const destino = !isComodin && (await db.direcciones.findUnique({ where: { id: parseInt(idDestino) } }));

    const nuevaBoleta = await db.boleta.create({
      data: {
        idSocio: !isComodin ? parseInt(idCliente): null,
        pesoNeto: parseFloat(pesoFinal) - parseFloat(pesoInicial), 
        pesoFinal: parseFloat(pesoFinal),
        placa: !isComodin ? placaData.placa : idPlaca,
        empresa: !isComodin ? empresa.nombre : idEmpresa,
        motorista: !isComodin ? motorista.nombre : idMotorista,
        socio: !isComodin ? socio.nombre : Cliente,
        origen: 'Baprosa',
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
        ordenDeTransferencia: null
      },
    });

    imprimirEpson(nuevaBoleta);
 
    res
      .status(201)
      .json({ msg: "Boleta creado exitosamente", boleta: nuevaBoleta });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: `Error al crear usuario: ${error.message}` });
  }
};

const getDataBoletas = async (req, res) => {
  try{
  const search  = req.query.search || '';
  const searchDate = req.query.searchDate || '';
  const page = parseInt(req.query.page) || 1 ;  
  const limit = parseInt(req.query.limit) || 7;
  const skip = (page - 1) * limit;  

  const [year, month, day] = searchDate.split('-').map(Number);
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
    },
    where: {  
      estado: "Pendiente",
      ...(searchDate ? { fechaInicio: { gte: startOfDay, lte: endOfDay} } : {}  ),  
      OR : [
        {
          placa:{contains: search}
        }, 
        {
          empresa:{contains: search},
        }, 
        {
          motorista:{contains: search},
        }, 
        {
          socio:{contains: search},
        }
      ]
    },
    skip: skip,
    take: limit,
  });

  const totalData = await db.boleta.count({
    where: {  
      estado: "Pendiente",
      ...(searchDate ? { fechaInicio: { gte: startOfDay, lte: endOfDay} } : {}  ),
      OR : [
        {
          placa:{contains: search}
        }, 
        {
          empresa:{contains: search},
        }, 
        {
          motorista:{contains: search},
        }, 
        {
          socio:{contains: search},
        }
      ]
    },
  })

  const dataUTCHN = data.map((el) => ({
    Id: el.id,
    Placa: el.placa,
    Cliente: el.socio,
    Transporte: el.empresa,
    Motorista: el.motorista,
    Fecha: el.fechaInicio.toLocaleString(),
  }));

  res.send({data: dataUTCHN, pagination: {
    totalData,
    totalPages: Math.ceil(totalData / limit),
    currentPage: page,
    limit,
  }});
  } catch(err) {
    console.log(err)
  }
};

const postClientePlacaMoto = async (req, res) => {
  try{
    const { idCliente, idUsuario, idMotorista, pesoInicial, idPlaca, idEmpresa, } = req.body;

    const empresa = await db.empresa.findUnique({where: { id: parseInt(idEmpresa) },});
    const motorista = await db.motoristas.findUnique({where: { id: parseInt(idMotorista) }, });
    const socio = await db.socios.findUnique({where: { id: parseInt(idCliente) }, });
    const placaData = await db.vehiculo.findFirst({
      select: { id: true, placa: true, },
      where: { placa: idPlaca, rEmpresaVehiculo: { id: idEmpresa, },},
    });
    
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
        estado: 'Pendiente',
        idUsuario: parseFloat(despachador["id"]),
        usuario: despachador["usuarios"],
        idMotorista: parseInt(idMotorista),
        fechaInicio: new Date(),
        pesoInicial: parseFloat(pesoInicial),
        idPlaca: placaData.id,
        idEmpresa: parseInt(idEmpresa),
      }
    })
    res.status(201).send({msg: 'Boleta creada en estado pendiente', Bol: newBol})
  }catch(err){
    console.log(err)
  }
};

const postClientePlacaMotoComodin = async (req, res) => {
  try{
    const { idCliente, idUsuario, idMotorista, pesoInicial, idPlaca, idEmpresa, socio } = req.body;
    
    const verificado = jwt.verify(idUsuario, process.env.SECRET_KEY);
    const despachador = await db.usuarios.findUnique({
      where: {
        usuarios: verificado["usuarios"],
      },
    });
    
    const newBol = await db.boleta.create({
      data: {
        placa: idPlaca,
        empresa: idEmpresa,
        motorista: idMotorista,
        socio: idCliente==-998 ? socio : socio,
        boletaType: 0,
        estado: 'Pendiente',
        idUsuario: parseFloat(despachador["id"]),
        usuario: despachador["usuarios"],
        fechaInicio: new Date(),
        pesoInicial: parseFloat(pesoInicial),
        boletaType: idCliente == -998 ? 3 : 4
      }
    })
    res.status(201).send({msg: 'Boleta creada en estado pendiente', Bol: newBol})
  }catch(err){
    console.log(err)
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

const getStatsBoletas = async (req, res) => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth(); // ya está en base 0
  const day = now.getUTCDate();

  const startOfDay = new Date(Date.UTC(year, month, day, 0, 0, 0));
  const endOfDay = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
  
  try {
    const [entrada, salida, pendientes] = await Promise.all([
      db.boleta.count({ where: { 
        proceso: 0,
        fechaFin: { gte: startOfDay, lte: endOfDay },
      },
      }),
      db.boleta.count({
        where: { 
          proceso: 1, 
          fechaFin: {gte: startOfDay, lte: endOfDay}
        },
      }),
      db.boleta.count({
        where: { estado: "Pendiente" },
      }),
    ]);
    res.status(201).send({ entrada, salida, pendientes });
  } catch (err) {
    res.status(501).send({ msg: "Error en el server" });
  }
};

const getBoletaID =  async(req, res) => {
  try{
    const data = await db.boleta.findUnique({
      where: {
        id: parseInt(req.params.id)
      }, 
      include : {
        clienteBoleta : {
          select : {
            tipo : true,
          }
        }
      }
    })

    
    return res.json(data)
  }catch(err) {
    return res.status(401).send('Error en el api')
  }
}

const getBoletasCompletadasDiarias = async(req, res) => {
  try{
    const search  = req.query.search || '';
    const searchDate = req.query.searchDate || '';
    const page = parseInt(req.query.page) || 1 ;  
    const limit = parseInt(req.query.limit) || 7;
    const skip = (page - 1) * limit;  
    
    if (searchDate !== '') {
      const [year, month, day] = searchDate.split('-').map(Number);
      startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
      endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
    } else {
      const now = new Date();
      const year = now.getUTCFullYear();
      const month = now.getUTCMonth();
      const day = now.getUTCDate();
      startOfDay = new Date(Date.UTC(year, month, day, 0, 0, 0));
      endOfDay = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
    }

    const data = await db.boleta.findMany({
      select: {
        id: true,
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
        estado: {not: "Pendiente"},
        fechaFin: { gte: startOfDay, lte: endOfDay },
        OR : [
          {
            placa:{contains: search}
          }, 
          {
            empresa:{contains: search},
          }, 
          {
            motorista:{contains: search},
          }, 
          {
            socio:{contains: search},
          }
        ]
      },
      skip: skip,
      take: limit,
    });
  
    const totalData = await db.boleta.count({
      where: {  
        estado: {not: "Pendiente"},
        fechaFin: { gte: startOfDay, lte: endOfDay },
        OR : [
          {
            placa:{contains: search}
          }, 
          {
            empresa:{contains: search},
          }, 
          {
            motorista:{contains: search},
          }, 
          {
            socio:{contains: search},
          }
        ]
      },
    })
  
    const dataUTCHN = data.map((el) => ({
      Id: el.id,
      Boleta: el.id,
      Proceso: el.proceso == 0 ? 'Entrada' : 'Salida', 
      Placa: el.placa,
      Cliente: el.socio,
      Transporte: el.empresa,
      PesoNeto: el.pesoNeto, 
      Desviacion: el.desviacion, 
      estado: el.estado,
      fecha: el.fechaFin.toLocaleString(),
    }));
  
    res.send({data: dataUTCHN, pagination: {
      totalData,
      totalPages: Math.ceil(totalData / limit),
      currentPage: page,
      limit,
    }});
    } catch(err) {
      console.log('Error en el api', err)
    }
}

const updateBoletaOut = async(req, res) => {
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
      desviacion
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

    

    const origen = (!isTraslado && proceso==0) && (await db.direcciones.findUnique({ where: { id: parseInt(idOrigen) } }));
    const destino = (!isTraslado && proceso==1) && (await db.direcciones.findUnique({ where: { id: parseInt(idDestino) } }));
    const transladoOrigen = isTraslado && (await db.translado.findUnique({ where: { id: parseInt(idTrasladoOrigen) },}));
    const transladoDestino = isTraslado && (await db.translado.findUnique({   where: { id: parseInt(idTrasladoDestino) }, }));

    const nuevaBoleta = await db.boleta.update({
      where: {
        id : parseInt(req.params.id)
      }, 
      data: {
        idSocio: parseInt(idCliente),
        placa: placaData.placa,
        empresa: empresa.nombre,
        motorista: motorista.nombre,
        socio: socio.nombre,
        origen: !isTraslado ? (proceso==0 ? origen.nombre : 'Baprosa') : null,
        destino: !isTraslado ? (proceso==1 ? destino.nombre : 'Baprosa') : null,
        boletaType: parseInt(boletaType),
        idOrigen: !isTraslado ? proceso==0 ? parseInt(idOrigen) : null : null,
        idDestino: !isTraslado ? proceso==1 ? parseInt(idDestino) : null : null,
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
        ordenDeCompra: proceso == 0 ? parseInt(ordenDeCompra) : null,
        ordenDeTransferencia: isTraslado
          ? parseInt(ordenDeTransferencia)
          : null,
      },
    });
    imprimirEpson(nuevaBoleta);
    res
      .status(201)
      .json({ msg: "Boleta creado exitosamente" , boleta: nuevaBoleta});
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: `Error al crear usuario: ${error.message}` });
  }
}

const updateBoletaOutComdin = async(req, res) => {
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
      desviacion
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

    const isTraslado = move.nombre == "Traslado Interno" || move.nombre == "Traslado Externo"  ? true  : false;

    

    const origen = !isTraslado && idOrigen;
    const destino =  !isTraslado && idDestino;
    const transladoOrigen = isTraslado &&  (await db.translado.findUnique({where: { id: parseInt(idTrasladoOrigen) }, }));
    const transladoDestino = isTraslado && (await db.translado.findUnique({ where: { id: parseInt(idTrasladoDestino) }, }));


    const nuevaBoleta = await db.boleta.update({
      where: {
        id : parseInt(req.params.id)
      }, 
      data: {
        placa: idPlaca,
        empresa: idEmpresa,
        motorista: idMotorista,
        origen: !isTraslado ? proceso == 0 ? origen : 'Baprosa' : null ,
        destino: !isTraslado ? proceso == 1 ? destino : 'Baprosa' : null,
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
        ordenDeCompra: proceso == 0 ? parseInt(ordenDeCompra) : null,
        ordenDeTransferencia: isTraslado
          ? parseInt(ordenDeTransferencia)
          : null,
      },
    });

    imprimirEpson(nuevaBoleta);

    res
      .status(201)
      .json({ msg: "Boleta creado exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: `Error al crear usuario: ${error.message}` });
  }
}

const updateBoleta = async (req, res) => {
  const { idCliente } = req.body;

  if (idCliente == -998 || idCliente == -999) {
    return updateBoletaOutComdin(req, res);
  } else {
    return updateBoletaOut(req, res);
  }
}

const getBoletasHistorial = async (req, res) => {
  try{
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
        proceso: true,
      }, 
      where: {
        estado: {
          not: 'Pendiente'
        }
      }
    });
  
    const dataUTCHN = data.map((el) => ({
      Id: el.id,
      Placa: el.placa,
      Cliente: el.socio,
      Transporte: el.empresa,
      Motorista: el.motorista,
      Fecha: el.fechaInicio.toLocaleString(),
    }));
  
    res.send(dataUTCHN);
  } catch (err) {
    res.status(500).send({msg: 'Error interno API'})
  }
}

const getReimprimir = async (req, res) => {
  try{
    const id = req.params.id
    const boleta = await  db.boleta.findUnique({
      where: {
        id: parseInt(id)
      }
    })

    imprimirEpson(boleta)
    res.send({msg:"Impresion correcta"})
  } catch(err) {
    console.log(err)
  }

}

/* Para el calentario */
/**
 * Primera parte fechas
 */

const getBoletasMes = async(req, res) => {
  try{
    const start = req.query.start || '';
    const end = req.query.end || '';

  const result = await db.$queryRaw`
    SELECT CONVERT(DATE, fechaFin) as fecha, COUNT(*) as cantidad
    FROM boleta
    WHERE fechaFin >= ${start} AND fechaFin <= ${end}
    GROUP BY CONVERT(DATE, fechaFin)
    ORDER BY fecha
  `;

  const makeCalendar = result.map((item) => ({
    title: `Boletas creadas: ${item.cantidad}`,
    start: new Date(new Date(item.fecha).getTime() + (new Date(item.fecha).getTimezoneOffset() * 60000)),
    allDay: true,
    display: 'auto',
    textColor: 'black',
    backgroundColor: 'transparent', 
    borderColor: 'transparent', // Cambiado a transparente
  }));
  
    res.send(makeCalendar)
  }catch(err) {
    console.log(err)
  }
}

const getTimeLineForComponent = async(req, res) => {
  try{
    const fecha = req.query.fecha || '';
    const convertDate = fecha && new Date(fecha).toISOString()

    // Sumamos 1 día
    const fechaObj = new Date(convertDate);
    const fechaMasUno = new Date(fechaObj);
    fechaMasUno.setDate(fechaObj.getDate() + 1);
  
    // Ahora hacemos la consulta
    const data = await db.boleta.findMany({
      where: {
        fechaInicio: {
          gte: convertDate,                     // fecha inicial
          lt: fechaMasUno.toISOString()   // fecha + 1 día
        }
      }
    });
    const groups = data.map((el)=>({
      id: el.id, 
      title: el.placa + '-' + el.socio
    }))

    const items = data.map((el)=>({
      id: el.id, 
      group:el.id, 
      title:el.placa,
      start_time: el.fechaInicio, 
      end_time: el.fechaFin
    }))

    res.send({groups, items})
  }catch (err) {
    console.log(err)
  }
}

const updateCancelBoletas = async(req, res) => {
  const { Id, Motivo } = req.body;
  console.log(req.body)
  try {
    const updateBoleta = await db.boleta.update({
      where: {
        id: parseInt(Id)
      },
      data: {
        boletaType: 5,
        observaciones: Motivo,
        fechaFin: new Date(),
        estado: "Cancelada" 
      },
    })
    res.send({msg: 'Cancelada correctamente', boletas: updateBoleta})
  } catch(err) {
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
  updateCancelBoletas
};
