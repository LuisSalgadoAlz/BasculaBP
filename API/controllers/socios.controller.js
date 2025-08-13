const db = require('../lib/prisma')
const dotenv = require("dotenv");
const {setLogger} = require('../utils/logger');
const jwt = require("jsonwebtoken");

const getSocios = async (req, res) => {
  try{
    const page = parseInt(req.query.page) || 1 ;  
    const limit = parseInt(req.query.limit) || 7;  
    const tipo = parseInt(req.query.tipo);
    const estado = req.query.estado;
    const skip = (page - 1) * limit;  

    const search = req.query.search || ''; 

    const data = await db.socios.findMany({
      where: {
        nombre: {
          contains: search,  // Búsqueda parcial
        },
        ...((tipo==0 || tipo ==1) ? { tipo: tipo } : {}), 
        ...(estado =='activa' ? {estado : true} : estado =='inactiva' ? {estado : false} : {})
      },
      skip: skip,
      take: limit,
    });
    
    const totalSocios = await db.socios.count({
      where: {
        nombre: {
          contains: search,  
        }, 
        ...((tipo==0 || tipo ==1) ? { tipo: tipo } : {}), 
        ...(estado =='activa' ? {estado : true} : estado =='inactiva' ? {estado : false} : {})
      }
    });

    const totalPages = Math.ceil(totalSocios / limit);

    const clenData = data.map((el) => ({
      id: el.id,
      Nombre: el.nombre,
      Tipo: el.tipo == 0 ? "Proveedor" : "Cliente",
      Telefono: el.telefono,
      Correo: el.correo,
      Estado: el.estado,
    }));
    
    res.json({
      data: clenData,
      pagination: {
        totalSocios,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (err) {
    console.log(err)
    setLogger('SOCIOS', 'ERROR OBTENER SOCIOS', req, null, 3)  
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

const getSocioPorID = async (req, res) => {
  try {
    const { id } = req.params;

    const socio = await db.socios.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    return res.status(200).json(socio);
  } catch (error) {
    console.error(error);
    setLogger('SOCIOS', 'ERROR OBTENER SOCIO', req, null, 3)  
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

const getStats = async (req, res) => {
  try {
    const [totalSocios, totalProveedores, totalClientes, ActivosProveedores, ActivosClientes, totales] = await Promise.all([
      db.socios.count(), // Cuenta el total de socios
      db.socios.count({ where: { tipo: 0 } }), // Cuenta los proveedores
      db.socios.count({ where: { tipo: 1 } }), // Cuenta los clientes
      db.socios.count({where: {tipo: 0, estado: true}}),
      db.socios.count({where: {tipo: 1, estado: true}}),
      db.socios.count({where: { estado: true}}),
    ]);

    res.json({ totalSocios, totalProveedores, totalClientes, ActivosProveedores, ActivosClientes, totales });
  } catch (error) {
    console.error(error);
    setLogger('SOCIOS', 'ERROR OBTENER ESTADISTICAS', req, null, 3)  
    res
      .status(500)
      .json({ message: "Error al obtener las estadísticas de socios" });
  }
};

/**
 * Logger establecido
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const postSocios = async (req, res) => {
  try {
    const { nombre, tipo, telefono, correo } = req.body;

    const exist = correo.trim()!='' && await db.socios.count({where: {correo : correo}})
    
    if (exist==0) {
      const nuevoSocio = await db.socios.create({
        data: {
          nombre,
          tipo: parseInt(tipo),
          ...(telefono.trim()!='' && { telefono }),
          ...(correo.trim()!='' && { correo }), 
          estado: true,
        },
      });
      
      /**
       * Logger del sistema
       */
      setLogger('SOCIOS', 'CREAR SOCIO', req, null, 1, nuevoSocio.id)  

      return res.status(201).json({ msg: "Socio creado exitosamente", socio: nuevoSocio });
    }
    setLogger('SOCIOS', 'AGREGAR: SOCIO DUPLICADO', req, null, 2) 
    return res.status(201).json({msgErr:'Correo ya existe en otro socio'})
  } catch (error) {
    setLogger('SOCIOS', 'ERROR CREAR SOCIO', req, null, 3)  
    res.status(500).json({ msg: `Error al crear usuario: ${error.message}` });
  }
};

const updateSocios = async (req, res) => {
  const { nombre, tipo, telefono, correo, estado } = req.body;
  try {
    const where = {
      correo: correo,
      id: {
        not: parseInt(req.params.id)
      }
    }
    const count = correo ?  await db.socios.count({ where }) : 0;

    if (count==0) {
      const upSocios = await db.socios.update({
        where: {
          id: parseInt(req.params.id),
        },
        data: {
          nombre,
          tipo: parseInt(tipo),
          telefono,
          correo,
          estado:
            estado == "true"
              ? true
              : estado === true || estado === true
              ? estado
              : false,
        },
      });

      /**
       * Logger del sistema
       */
      setLogger('SOCIOS', 'MODIFICAR SOCIO', req, null, 1, upSocios.id)  

      return res.status(200).send({msg:'Proceso Exitoso'});
    } 
    
    setLogger('SOCIOS', 'MODIFICAR: SOCIO DUPLICADO', req, null, 2) 

    return res.status(200).send({msgErr: 'correo ya existe en otro socio'});
  } catch (error) {
    setLogger('SOCIOS', 'ERROR MODIFICAR SOCIO', req, null, 3) 
    res.status(401).send(`error ${error}`);
  }
};

const getDireccionesPorSocios = async (req, res) => {
  try {
    const { id } = req.params;

    const direcciones = await db.direcciones.findMany({
      select: {
        id: true,
        nombre: true,
        tipo : true,
        descripcion : true,
        estado : true
      },
      where: {
        idCliente: parseInt(id),
      },
    });

    if (!direcciones) {
      return res.status(404).json({ message: "Socio no encontrado" });
    }

    const dataClean = direcciones.map((el)=>({
      ...el, 
      'estado' : el.estado ? 'Activa' : 'Inactiva'
    }))
    
    return res.status(200).json(dataClean);
  } catch (error) {
    console.error(error);
    setLogger('DIRECCION', 'ERROR OBTENER DIRECCION SOCIO', req, null, 3) 
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

const postDirecciones = async (req, res) => {
  try {
    const { nombre, tipo, id, descripcion } = req.body;

    const nuevaDireccion = await db.direcciones.create({
      data: {
        nombre,
        tipo: parseInt(tipo),
        idCliente: parseInt(id),
        descripcion,
        estado: true,
      },
    });

    setLogger('DIRECCION', 'AGREGAR DIRECCION', req, null, 1, nuevaDireccion.id)  

    res
      .status(201)
      .json({ msg: "Direccion creado exitosamente", direcciones: nuevaDireccion });
  } catch (error) {
    setLogger('DIRECCION', 'ERROR AGREGAR DIRECCION', req, null, 3)  
    res.status(500).json({ msg: `Error al crear direccion: ${error.message}` });
  }
};

const getDireccionesPorID = async (req, res) => {
  try {
    const direccion = await db.direcciones.findUnique({
      where: {
        id: parseInt(req.params.id),
      },
    });

    if (!direccion) {
      return res.status(404).json({ message: "Socio no encontrado" });
    }

    return res.status(200).json(direccion);
  } catch (error) {
    console.error(error);
    setLogger('DIRECCION', 'ERROR OBTENER DIRECCION POR ID', req, null, 3) 
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

const putDireccionesPorID = async (req, res) => {
  const { nombre, tipo, estado, idCliente, id, descripcion } = req.body;
  try {
    const upDirecciones = await db.direcciones.update({
      where: {
        id: parseInt(id),
      },
      data: {
        nombre,
        tipo: parseInt(tipo),
        idCliente: parseInt(idCliente),
        descripcion,
        estado:
          estado == "true"
            ? true
            : estado === true || estado === true
            ? estado
            : false,
      },
    });

    setLogger('DIRECCION', 'MODIFICAR DIRECCION', req, null, 1, upDirecciones.id)  

    res.status(200).send("proceso exitoso");
  } catch (error) {
    setLogger('DIRECCION', 'ERROR MODIFICAR DIRECCION', req, null, 3)  
    res.status(401).send(`error ${error}`);
  }
};

const postCrearFacturasPorSocios  = async(req, res) =>{
  const { factura, codigoProveedor, proveedor, cantidad, idSocio } = req.body;
  const verificado = jwt.verify(req.header('Authorization'), process.env.SECRET_KEY);
  
  const exits = await db.facturas.count({
    where: {
      id: parseInt(factura),
      Proceso: {
        in: [1, 2]
      }
    }
  })

  
  if(exits!==0) return res.send({err: 'Factura ya existe.'})


  const [getUser, getSocio] = await Promise.all([
    db.usuarios.findUnique({
      where: {
        usuarios: verificado.usuarios,
      }
    }),
    db.socios.findUnique({
      where: {
        id: parseInt(idSocio)
      }
    })
  ])

  try {
    const crearNuevaFactura = await db.facturas.create({
      data:{
        id: parseInt(factura),
        codigoProveedor,
        Proveedor: proveedor,
        Cantidad: parseFloat(cantidad),
        idSocio: parseInt(getSocio.id),
        socio: getSocio.nombre, 
        createdByUserID: parseInt(getUser.id), 
        createdByUserName: getUser.name,
        Proceso:1, 
      }
    })
    return res.send({msg: 'Factura Creada exitosamente.', data:crearNuevaFactura})
  }catch(err){
    console.log(err)
  }
}

module.exports = {
  getSocios,
  postSocios,
  getStats,
  getSocioPorID,
  updateSocios,
  getDireccionesPorSocios,
  postDirecciones,
  getDireccionesPorID, 
  putDireccionesPorID, 
  postCrearFacturasPorSocios,
};
