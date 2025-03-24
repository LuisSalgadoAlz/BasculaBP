const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");
const db = new PrismaClient();

const getSocios = async (req, res) => {
  const data = await db.socios.findMany();
  const clenData = data.map((el)=>({
    'id' : el.id,  
    'Nombre' : el.nombre,
    'Tipo' : el.tipo == 0 ? 'Proveedor' : 'Cliente', 
    'Telefono' : el.telefono, 
    'Correo' : el.correo,
    'Estado' : el.estado
  }))
  res.json(clenData);
};

const getStats = async (req, res) => {
    try {
        const [totalSocios, totalProveedores, totalClientes] = await Promise.all([
            db.socios.count(),  // Cuenta el total de socios
            db.socios.count({ where: { tipo: 0 } }),  // Cuenta los proveedores
            db.socios.count({ where: { tipo: 1 } }),  // Cuenta los clientes
        ]);

        res.json({ totalSocios, totalProveedores, totalClientes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener las estadísticas de socios" });
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
module.exports = { getSocios, postSocios, getStats };
