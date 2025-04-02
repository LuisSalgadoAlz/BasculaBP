const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");
const db = new PrismaClient();

const getSociosParaSelect = async (req, res) => {
  try {
    const data = await db.socios.findMany({
      where: {
        estado: true,
      },
    });
    res.json(data);
  } catch (err) {
    console.log(err);
  }
};

/* Listar usuarios */
const getEmpresas = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 7;
  const estado = req.query.estado;
  const skip = (page - 1) * limit;

  const search = req.query.search;

  try {
    const data = await db.empresa.findMany({
      omit: { idSocios: true },
      include: {
        rClientes: {
          select: {
            nombre: true,
          },
        },
      },
      where: {
        nombre: {
          contains: search,
        },
        ...(estado == "activa"
          ? { estado: true }
          : estado == "inactiva"
          ? { estado: false }
          : {}),
      },

      skip: skip,
      take: limit,
    });

    const totalEmpresas = await db.empresa.count({
      where: {
        nombre: {
          contains: search,
        },
        ...(estado == "activa"
          ? { estado: true }
          : estado == "inactiva"
          ? { estado: false }
          : {}),
      },
    });

    const totalPages = Math.ceil(totalEmpresas / limit);

    const resultado = data.map(
      ({ rClientes: { nombre: nombreSocio }, ...resto }) => ({
        ...resto,
        Socio: nombreSocio,
      })
    );

    res.json({
      data: resultado,
      pagination: {
        totalEmpresas,
        totalPages,
        limit,
      },
    });
  } catch (err) {
    console.log(err);
  }
};

const getStats = async (req, res) => {
  try {
    const [totalEmpresas, totalActivas] = await Promise.all([
      db.empresa.count(),
      db.empresa.count({ where: { estado: true } }),
    ]);

    res.json({ totalEmpresas, totalActivas });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error al obtener las estadísticas de empresas" });
  }
};

const postEmpresas = async (req, res) => {
  try {
    const { nombre, email, telefono, descripcion, idSocios } = req.body;

    // Crear el nuevo usuario
    const nuevaEmpresa = await db.empresa.create({
      data: {
        nombre,
        email,
        telefono,
        descripcion,
        estado: true,
        idSocios,
      },
    });

    // Responder con el usuario creado
    res
      .status(201)
      .json({ msg: "Usuario creado exitosamente", usuario: nuevaEmpresa });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: `Error al crear usuario: ${error.message}` });
  }
};

const getEmpresaPorId = async (req, res) => {
  try {
    const esData = await db.empresa.findUnique({
      where: {
        id: parseInt(req.params.id),
      },
    });
    res.json(esData);
  } catch (err) {
    console.log(err);
  }
};

const updateEmpresasPorId = async (req, res) => {
  const { nombre, email, telefono, descripcion, estado, idSocios } = req.body;
  try {
    const updateEmpresas = await db.empresa.update({
      where: {
        id: parseInt(req.params.id),
      },
      data: {
        nombre,
        email,
        telefono,
        descripcion,
        estado:
          estado == "true"
            ? true
            : estado === true || estado === true
            ? estado
            : false,
        idSocios: parseInt(idSocios),
      },
    });
    res.status(200).send("proceso exitoso");
  } catch (error) {
    res.status(401).send(`error ${error}`);
  }
};

/*
 * Parte de los vehiculos
 */

const getVehiculosPorEmpresa = async (req, res) => {
  const { id } = req.params;
  try {
    const vehiculos = await db.vehiculo.findMany({
      omit: {
        idEmpresa: true,
      },
      where: {
        idEmpresa: parseInt(id),
      },
    });

    if (!vehiculos) {
      return res.status(404).json({ message: "Socio no encontrado" });
    }

    const dataClean = vehiculos.map((el) => ({
      ...el,
      estado: el.estado ? "Activa" : "Inactiva",
    }));
    return res.status(200).json(dataClean);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

const postVehiculosDeEmpresa = async (req, res) => {
  try {
    const { placa, modelo, marca, tipo, pesoMaximo, id } = req.body; // Crear el nuevo usuario
    const nuevoVehiculo = await db.vehiculo.create({
      data: {
        placa,
        modelo,
        marca,
        tipo,
        pesoMaximo: pesoMaximo ? parseInt(pesoMaximo) : 0,
        estado: true,
        idEmpresa: parseInt(id),
      },
    });

    return res
      .status(201)
      .json({ msg: "Vehiculo creado exitosamente", vehiculo: nuevoVehiculo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: `Error al crear vehiculo: ${error.message}` });
  }
};

const getVehiculosPorID = async (req, res) => {
  const placa = req.query.placa;
  const idEmpresa = parseInt(req.query.id);

  try {
    const empresa = await db.empresa.findMany({
      select: {
        id: true,
        nombre: true,
      },
      where: {
        rVehiculoEmpresa: {
          some: {
            placa: placa,
          },
        },
      },
    });

    if (!empresa || empresa.length == 0) {
      return res
        .status(201)
        .json({ msgCheck: "Placa no encontrada, puede registrar" });
    }

    const existe = empresa.filter((el) => el.id == idEmpresa);
    const extState = existe.length == 0 ? false : true;
    const otros = empresa.filter((el) => el.id != idEmpresa);
    const listadoDeNombres = otros.map((e) => e.nombre).join(", ");

    return res
      .status(201)
      .json({ msgList: listadoDeNombres, existHere: extState });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

const updateVehiculosPorID = async (req, res) => {
  const { placa, modelo, marca, tipo, pesoMaximo, id, estado } = req.body;
  try {
    const updateVehiculos = await db.vehiculo.update({
      where: {
        id: parseInt(id),
      },
      data: {
        placa,
        modelo,
        marca,
        tipo,
        pesoMaximo: pesoMaximo ? parseInt(pesoMaximo) : 0,
        estado: estado == 1 ? true : false,
        idEmpresa: parseInt(req.params.idEmpresa),
      },
    });
    res.status(200).send("proceso exitoso");
  } catch (error) {
    console.log(error);
    res.status(401).send(`error ${error}`);
  }
};

/**
 * Parte de los motoristas
 */
const getMotoristaPorEmpresa = async (req, res) => {
  const { id } = req.params;
  try {
    const motoristas = await db.motoristas.findMany({
      omit: {
        idEmpresa: true,
      },
      where: {
        idEmpresa: parseInt(id),
      },
    });

    if (!motoristas) {
      return res.status(404).json({ message: "Socio no encontrado" });
    }

    const dataClean = motoristas.map((el) => ({
      ...el,
      estado: el.estado ? "Activa" : "Inactiva",
    }));
    return res.status(200).json(dataClean);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

const postMotoristasDeLaEmpresa = async (req, res) => {
  try {
    const { nombre, telefono, correo, id } = req.body;
    const exist = await db.motoristas.count({
      where:{ 
        correo : correo
      }
    })

    if (exist == 0) {
      const nuevoMotorista = await db.motoristas.create({
        data: {
          nombre, 
          telefono, 
          correo, 
          estado :  true,
          idEmpresa: parseInt(id),
        },
      });
  
      return res.status(201).json({ msg: "Motorista creado exitosamente", motorista: nuevoMotorista });
    }

    return res.status(201).send({msgErr: 'Correo duplicado'})
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: `Error al crear motoristas: ${error.message}` });
  }
};

const updateMotoristasPorID = async (req, res) => {
  const { nombre, telefono, correo, id, estado } = req.body; // Crear el nuevo usuario
  try {
    const exist = await db.motoristas.count({
      where: {
        correo : correo, 
        id : {not: parseInt(id)}
      }
    })

    if (exist==0) {
      const updateMotorista = await db.motoristas.update({
        where: {
          id: parseInt(id),
        },
        data: {
          nombre, 
          telefono, 
          correo,
          idEmpresa: parseInt(req.params.idEmpresa),
          estado: estado == 1 ? true : false,
        },
      });
      return res.status(201).send({msg: "Proceso exitoso"});
    }
    return res.status(201).send({msgErr: "Correo ya existe en otro motorista, ingrese otro"})
  } catch (error) {
    console.log(error);
    res.status(401).send(`error ${error}`);
  }
};

module.exports = {
  getEmpresas,
  postEmpresas,
  getStats,
  getSociosParaSelect,
  getEmpresaPorId,
  updateEmpresasPorId,
  getVehiculosPorEmpresa,
  postVehiculosDeEmpresa,
  getVehiculosPorID,
  updateVehiculosPorID,
  getMotoristaPorEmpresa,
  postMotoristasDeLaEmpresa,
  updateMotoristasPorID
};
