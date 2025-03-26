const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");
const db = new PrismaClient();

const getSocios = async (req, res) => {
  const page = parseInt(req.query.page) || 1 ;  
  const limit = parseInt(req.query.limit) || 10;  
  const skip = (page - 1) * limit;  
 
  const search = req.query.search || ''; 

  const data = await db.socios.findMany({
    where: {
      nombre: {
        contains: search,  // Búsqueda parcial
      }
    },
    skip: skip,
    take: limit,
  });
  
  const totalSocios = await db.socios.count({
    where: {
      nombre: {
        contains: search,  
      }
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
};

const getSocioPorID = async (req, res) => {
  try {
    const { id } = req.params;

    const socio = await db.socios.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!socio) {
      return res.status(404).json({ message: "Socio no encontrado" });
    }

    return res.status(200).json(socio);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

const getStats = async (req, res) => {
  try {
    const [totalSocios, totalProveedores, totalClientes] = await Promise.all([
      db.socios.count(), // Cuenta el total de socios
      db.socios.count({ where: { tipo: 0 } }), // Cuenta los proveedores
      db.socios.count({ where: { tipo: 1 } }), // Cuenta los clientes
    ]);

    res.json({ totalSocios, totalProveedores, totalClientes });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error al obtener las estadísticas de socios" });
  }
};

const postSocios = async (req, res) => {
  try {
    const { nombre, tipo, telefono, correo } = req.body;

    const nuevoSocio = await db.socios.create({
      data: {
        nombre,
        tipo: parseInt(tipo),
        telefono,
        correo,
        estado: true,
      },
    });

    res
      .status(201)
      .json({ msg: "Socio creado exitosamente", socio: nuevoSocio });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: `Error al crear usuario: ${error.message}` });
  }
};

const updateSocios = async (req, res) => {
  const { nombre, tipo, telefono, correo, estado } = req.body;
  try {
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
    res.status(200).send("proceso exitoso");
  } catch (error) {
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

    res
      .status(201)
      .json({ msg: "Direccion creado exitosamente", direcciones: nuevaDireccion });
  } catch (error) {
    console.error(error);
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
    res.status(200).send("proceso exitoso");
  } catch (error) {
    res.status(401).send(`error ${error}`);
  }
};

module.exports = {
  getSocios,
  postSocios,
  getStats,
  getSocioPorID,
  updateSocios,
  getDireccionesPorSocios,
  postDirecciones,
  getDireccionesPorID, 
  putDireccionesPorID
};
