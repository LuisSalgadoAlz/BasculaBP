const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");
const db = new PrismaClient();

const getSociosParaSelect = async (req, res) => {
  try {
    const data = await db.socios.findMany();
    res.json(data);
  } catch (err) {
    console.log(err)
  }
};


/* Listar usuarios */
const getEmpresas = async (req, res) => {
  const data = await db.empresa.findMany();
  res.json(data);
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
    const { nombre, email, telefono, descripcion } = req.body;

    // Crear el nuevo usuario
    const nuevaEmpresa = await db.empresa.create({
      data: {
        nombre,
        email,
        telefono,
        descripcion,
        estado: true,
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

module.exports = {
  getEmpresas,
  postEmpresas,
  getStats, 
  getSociosParaSelect
};
