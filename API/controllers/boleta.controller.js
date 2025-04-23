const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");
const e = require("express");
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
    const origen = !isComodin && (await db.direcciones.findUnique({ where: { id: parseInt(idOrigen) } }));
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
        origen: !isComodin ? origen.nombre : idOrigen,
        destino: !isComodin ? destino.nombre : idDestino,
        boletaType: 1,
        idOrigen: !isComodin ? parseInt(idOrigen) : null,
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
        idTrasladoOrigen: null,
        idTrasladoDestino: null,
        trasladoOrigen: null,
        trasladoDestino: null,
        proceso,
        ordenDeCompra: parseInt(ordenDeCompra),
        ordenDeTransferencia: null
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

const getDataBoletas = async (req, res) => {
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
      estado: "Pendiente",
    },
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
  try {
    const [entrada, salida, pendientes] = await Promise.all([
      db.boleta.count({ where: { proceso: 0,},
      }),
      db.boleta.count({
        where: { proceso: 1 },
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

    

    const origen =
      !isTraslado &&
      (await db.direcciones.findUnique({ where: { id: parseInt(idOrigen) } }));
    const destino =
      !isTraslado &&
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
        origen: origen.nombre,
        destino: destino.nombre,
        boletaType: parseInt(boletaType),
        idOrigen: !isTraslado ? parseInt(idOrigen) : null,
        idDestino: !isTraslado ? parseInt(idDestino) : null,
        manifiesto: parseInt(manifiesto),
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
        ordenDeCompra: parseInt(ordenDeCompra),
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
        origen: !isTraslado ? origen : null ,
        destino: !isTraslado ? destino : null,
        idOrigen: null,
        idDestino: null,
        manifiesto: parseInt(manifiesto),
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
        ordenDeCompra: parseInt(ordenDeCompra),
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


/**
 * TODO: Esta consulta se hara en impriones 
 */

const actualizarImpresion = async (id) => {
  try{
    const updateBoletaImpresion = await db.boleta.update({
      where : {
        id : parseInt(id)
      }, 
      data : {
        impreso : new Date()
      }
    })
    res.status(201).json({ msg: "Boleta creado exitosamente"});
  }catch (err) {
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
};
