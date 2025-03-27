const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");
const db = new PrismaClient();

const getSociosParaSelect = async (req, res) => {
  try {
    const data = await db.socios.findMany({
      where: {
        estado: true
      }
    });
    res.json(data);
  } catch (err) {
    console.log(err)
  }
};


/* Listar usuarios */
const getEmpresas = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 7;
  const skip = (page-1) * limit;

  const search = req.query.search

  try{
    const data = await db.empresa.findMany({
      omit: {idSocios: true},
      include: {
        rClientes : { 
          select : {
            nombre: true
          }
        },
      },
      where : {
        nombre : {
          contains : search
        }
      }, 
      skip : skip, 
      take : limit,
    });

    const totalEmpresas = await db.empresa.count({
      where : {
        nombre : {
          contains : search
        }
      }, 
    })

    const totalPages = Math.ceil(totalEmpresas / limit)

    const resultado = data.map(({ rClientes: { nombre: nombreSocio }, ...resto }) => ({
      ...resto,
      "Socio" : nombreSocio
    }));
    
    res.json({
      data : resultado, 
      pagination: {
        totalEmpresas, 
        totalPages, 
        limit
      }
    })
  }catch(err) {
    console.log(err)
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
        idSocios
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
