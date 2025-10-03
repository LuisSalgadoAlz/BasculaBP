const db = require("../lib/prisma");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

const getUserForAsignar = async (req, res) => {
  try {
    const users = await db.Usuarios.findMany({
      select: {
        id: true,
        name: true,
        UsuariosBPT: {
          select: {
            id: true,
            canal: true,
          },
        }
      },
      where: {
        UsuariosBPT: {
          isNot: null, // asegura que sí tenga relación
          is: {
            canal: {
              in: [3, 4],
            },
          },
        },
      },
    });

    const refactorUsers = users.map((item) => ({
      id: item.UsuariosBPT.id,
      name: item.name,
    }))

    return res.send(refactorUsers);
  } catch (err) {
    console.error(err);
    return res.status(400).send({ err: "Error interno del sistema." });
  }
};

const getUserNombre = async(req) => {
    const verificado = jwt.verify(req.header('Authorization'), process.env.SECRET_KEY)
    const usuario = await db.usuarios.findUnique({
        include: {
            UsuariosBPT: true
        },
        where: {
            usuarios: verificado["usuarios"],
        },
    });

    
    return {
        id: usuario.id, 
        nombre: usuario.name,
        idBpt: usuario.UsuariosBPT.id, 
        canal: usuario.UsuariosBPT.canal
    }
}

const crearManifiesto = async (req, res) => {
  try {
    const {
      DocNum,
      U_Status,
      Tipo,
      U_IDRuta,
      U_FechaEntrega,
      U_PesoTotal,
      U_Tipo,
      U_CamionPlaca,
      U_IDChofer,
      U_Chofer,
      Bodega,
      usuarioAsignado
    } = req.body;
    
    console.log(req.body);

    const { idBpt, nombre } = await getUserNombre(req);

    // Usar transacción para crear manifiesto y picking atómicamente
    const resultado = await db.$transaction(async (tx) => {
      // 1. Crear el manifiesto (sin pickingActualId aún)
      const nuevoManifiesto = await tx.manifiestos.create({
        data: {
          DocNum,
          U_Status,
          Tipo,
          U_IDRuta,
          U_FechaEntrega: new Date(U_FechaEntrega.replace(" ", "T").split(".")[0]),
          U_PesoTotal: parseFloat(U_PesoTotal),
          U_Tipo,
          U_CamionPlaca,
          U_IDChofer,
          U_Chofer,
          Bodega,
          usuarioBPTId: parseInt(idBpt),
          userAsignadoId: parseInt(usuarioAsignado),
          estadoPicking: "AGN", // Asignado (porque comienza con un usuario)
          pickingActualId: null
        },
      });

      // 2. Crear el picking inicial
      const nuevoPicking = await tx.picking.create({
        data: {
          manifiestosDocNum: DocNum,
          usuarioBPTPickingId: parseInt(usuarioAsignado),
          asignadoPorBPTId: parseInt(idBpt),
          asignadoPorNombre: nombre, // Para auditoría
          estado: "PND", // Pendiente de iniciar
          numeroIntentos: 1,
          esReasignacion: false
        }
      });

      // 3. Actualizar el manifiesto con el pickingActualId
      await tx.manifiestos.update({
        where: { DocNum },
        data: { pickingActualId: nuevoPicking.id }
      });

      return { manifiesto: nuevoManifiesto, picking: nuevoPicking };
    });

    return res.status(201).json({
      msg: 'Manifiesto creado exitosamente',
      data: resultado
    });

  } catch (error) {
    console.error('Error al crear manifiesto:', error);
    return res.status(500).json({err: 'Error interno del servidor'});
  }
};

/**
 * END - Funcion que indicara que manifiestos ya han sido asignados
 * @param {*} req 
 * @param {*} res 
 */
const getComprobarManifiestosHelper = async(arrManifiestos) => {
  try{
    const manifiestos = await db.manifiestos.findMany({
      select: { DocNum: true }, 
      where: { 
        DocNum: {
          in: arrManifiestos
        } 
      }
    })

    return manifiestos.map(el => el.DocNum)

  }catch(err){
    console.log(err)
    return res.status(400).send({err: 'Error interno del sistema.'})
  }
}

module.exports = {
    getUserForAsignar, 
    crearManifiesto, 
    getComprobarManifiestosHelper
}