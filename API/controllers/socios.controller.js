const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");
const db = new PrismaClient();

const getSocios = async (req, res) => {
  const data = await db.socios.findMany();
  const clenData = data.map((el) => ({
    id: el.id,
    Nombre: el.nombre,
    Tipo: el.tipo == 0 ? "Proveedor" : "Cliente",
    Telefono: el.telefono,
    Correo: el.correo,
    Estado: el.estado,
  }));
  res.json(clenData);
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

module.exports = {
  getSocios,
  postSocios,
  getStats,
  getSocioPorID,
  updateSocios,
};
