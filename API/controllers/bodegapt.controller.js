const db = require("../lib/prisma");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const { getPublisher, getManifiestosAsignados } = require("../sockets/websocketPeso");
const { manifiestosSinAsignar } = require("../sockets/websocketPeso");
const { executeProcedure } = require("../lib/hanaActions");


/**
 * END - CONTROLLERS GENERALES PARA AMBOS
 */

const getUserFront = async(req,res) => {
  try{
    const usuario = await getUserNombre(req);
    return res.status(200).send(usuario)
  }catch(err){
    console.log(err)
    return res.send({err: 'Error interno de sistema.'})
  }
}

/**
 * END - CONTROLLERS DE USUARIO DE SUPERVISOR
 */

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

const getUserNombreByID = async (byId) => {
  const usuario = await db.usuarios.findFirst({
    include: {
      UsuariosBPT: true,
    },
    where: {
      UsuariosBPT: {
        is: {
          id: byId, // aquí filtras por el id dentro de UsuariosBPT
        },
      },
    },
  });
  return { id: usuario.id, nombre: usuario.name };
};

const crearManifiestos = async (req, res) => {
  try {
    const { manifiestos, usuarioAsignado } = req.body;
    
    const { idBpt, nombre } = await getUserNombre(req);

    // Validar que el array no esté vacío
    if (!manifiestos || manifiestos.length === 0) {
      return res.status(400).json({ err: 'Debe enviar al menos un manifiesto' });
    }

    // Extraer todos los DocNum para validar
    const docNums = manifiestos.map(m => parseInt(m.DocNum));

    // Verificar si algún manifiesto ya existe
    const manifiestosDuplicados = await db.manifiestos.findMany({
      where: {
        DocNum: { in: docNums },
        estadoPicking: "AGN"
      },
      select: { DocNum: true }
    });

    if (manifiestosDuplicados.length > 0) {
      const duplicados = manifiestosDuplicados.map(m => m.DocNum).join(', ');
      return res.status(400).json({ 
        err: `Los siguientes manifiestos ya han sido asignados: ${duplicados}` 
      });
    }

    const getPickero =  await getUserNombreByID(usuarioAsignado);
    
    // Usar transacción para crear manifiestos y pickings atómicamente
    const resultado = await db.$transaction(async (tx) => {
      const resultados = [];

      for (const manifiesto of manifiestos) {
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
          Bodega
        } = manifiesto;

        // 1. Crear el manifiesto
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
            estadoPicking: "AGN",
            pickingActualId: null
          },
        });

        // 2. Crear el picking inicial
        const nuevoPicking = await tx.picking.create({
          data: {
            manifiestosDocNum: DocNum,
            usuarioBPTPickingId: parseInt(usuarioAsignado),
            asignadoPorBPTId: parseInt(idBpt),
            asignadoPorNombre: nombre,
            estado: "PND",
            numeroIntentos: 1,
            esReasignacion: false,
            nombrePickero: getPickero.nombre, 
          }
        });

        // 3. Actualizar el manifiesto con el pickingActualId
        await tx.manifiestos.update({
          where: { DocNum },
          data: { pickingActualId: nuevoPicking.id }
        });

        resultados.push({ manifiesto: nuevoManifiesto, picking: nuevoPicking });
      }

      return resultados;
    });

    const picking = await db.picking.findMany({
      where: {
        usuarioBPTPickingId: parseInt(usuarioAsignado),
      }
    })

    // Publicar actualizaciones
    const pb = await getPublisher();
    const manifiestosNoAsignados = await manifiestosSinAsignar();
    const newDataFirtsConection = await getManifiestosAsignados();
    await pb.publish("asignados:msg", JSON.stringify(newDataFirtsConection));
    await pb.publish("manifiestos:msg", JSON.stringify(manifiestosNoAsignados));
    await pb.publish("picking:msg", JSON.stringify({
      userId: `${usuarioAsignado}`,
      data: picking,
    }));

    return res.status(201).json({
      msg: `${manifiestos.length} manifiesto(s) asignado(s) correctamente.`,
      cantidad: manifiestos.length,
      resultados: resultado.map(r => ({ DocNum: r.manifiesto.DocNum }))
    });

  } catch (error) {
    console.error('Error al crear manifiestos:', error);
    return res.status(500).json({ err: 'Error interno del servidor' });
  }
};

const getLogsManifiestos = async(req, res) => {
  try{
    const DocNum = parseInt(req.params.DocNum)
    const verLogs = await db.manifiestosLogs.findMany({
      where: {
        DocNum: DocNum
      },
      orderBy: {
        createAt: 'desc'
      }
    })

    return res.status(200).send({
      data: verLogs
    })
  }catch(err){
    return res.status(400).send({err: 'Error interno del sistema.'})
  }
}

/**
 * END - CONTROLLERS DE USUARIO DE PICKING / PICKERO
 */

const getManifiestoDetalles = async (req, res) => {
  try{
    const DocNum = parseInt(req.params.DocNum)
    const getProducts = await executeProcedure('Imprimir_manifiesto', {ID: DocNum})
    const refactor = getProducts.map(item => ({
      itemCode: item.ItemCode,
      propiedad: item.PROPIEDAD,
      Descripcion: item.Dscription,
      Cantidad: item.Quantity, 
      PesoLb: item.Peso,
      FechaEntrega: item.FechaDeEntrega,
      Ruta: item.Ruta, 
      Medida: item.unitMsr,
      PesoTotal: item.Peso * item.Quantity, 
    }))

    const agrupado = refactor.reduce((acc, item) => {
      const propiedad = item.propiedad;
      
      if (!acc[propiedad]) {
        acc[propiedad] = {
          items: [],
          pesoTotalAcumulado: 0
        };
      }
      
      acc[propiedad].items.push(item);
      acc[propiedad].pesoTotalAcumulado += item.PesoTotal;
      
      return acc;
    }, {});

    const resultado = Object.entries(agrupado).map(([propiedad, data]) => ({
      propiedad: propiedad,
      pesoTotalAcumulado: data.pesoTotalAcumulado,
      items: data.items,
    }));

    return res.send(resultado)
  }catch(err){
    console.log(err)
    return res.send({err: 'Error interno de sistema.'})
  }
}

module.exports = {
    getUserForAsignar, 
    crearManifiestos,
    getLogsManifiestos, 
    getUserFront,
    getManifiestoDetalles
}