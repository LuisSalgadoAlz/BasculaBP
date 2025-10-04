// websocket.js
const WebSocket = require("ws");
const { createClient } = require("redis");
const obtenerPeso = require("../controllers/basculaLive.controller");
const { setLoggerSystema } = require("../utils/logger");
const { executeInfoTables, executeView } = require("../lib/hanaActions");
const { getRedisClient } = require("../lib/redisClient");


const DEFINELOGS = {
  'U_Status': 'ESTADO',
  'Tipo': 'CANAL',
  'U_FechaEntrega': 'FechaEntrega',
  'U_PesoTotal': 'Peso',
  'U_Tipo': 'TipoDocumento',
  'U_CamionPlaca': 'Placa',
  'U_IDChofer': 'IdInterno',
  'U_Chofer': 'Chofer',
  'Bodega': 'Bodega',
}

/**
 * END ----------------------------------------------------------------------------
 * END - PUBLISHER PARA EJECUTAR EN OTRAS PARTES DEL PROYECTO
 * END ----------------------------------------------------------------------------
 */

let publisher = createClient({ url: `redis://${process.env.HOST}:6379` });
let subscriber = createClient({ url: `redis://${process.env.HOST}:6379` });

async function getPublisher() {
  return publisher;
}

async function getSubscriber() {
  return subscriber;
}

const setupWebSocket = (server) => {
  const wssPeso = new WebSocket.Server({ noServer: true });
  const wssManifiestos = new WebSocket.Server({ noServer: true });
  const wssAsignados = new WebSocket.Server({ noServer: true });

  // Variables para controlar los intervalos  
  let intervalPeso = null;
  let intervalManifiestos = null;
  
  // Lock para prevenir ejecuciones concurrentes
  let isExecutingManifiestos = false;
  let pendingManifiestosExecution = false;


  // Configuracion intervalo
  let intervaloManifiestoV2 = true;

  /**
   * END ----------------------------------------------------------------------------
   * END: Clientes de redis
   * END ----------------------------------------------------------------------------
   */

  Promise.all([publisher.connect(), subscriber.connect()]).then(async () => {
    console.log(`[Worker]: ON`);    
    // Suscribirse / conectarse a eventos de peso
    await subscriber.subscribe("peso:data", (message) => {
      // Enviar a todos los clientes de ESTE worker
      wssPeso.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    });

    // solo un worker obtiene el trabajo de distribuir todos los mensajes
    if (process.env.NODE_APP_INSTANCE === '0' || !process.env.NODE_APP_INSTANCE) {
      let errorRegister = 0;
      let ultimoPeso = null;

      intervalPeso = setInterval(async () => {
        try {
          const peso = await obtenerPeso();
          if (peso !== ultimoPeso) {   // solo publicar si cambia
            await publisher.publish("peso:data", `${peso}`);
            ultimoPeso = peso;
          }
          errorRegister = 0;
        } catch (err) {
          if (errorRegister === 0) {
            setLoggerSystema("SOCKET", "ERROR OBTENCION DE PESO UNDEFINED", 3);
            errorRegister++;
          }
        }
      }, 100);
    }

    /**
     * END --------------------------------------------------------------------------
     * END - Iniciar intervalo cuando se conecta unicamente el primir cliente.
     * END --------------------------------------------------------------------------  
     */
    // Iniciar intervalo cuando se conecta el primer cliente
    if (process.env.NODE_APP_INSTANCE === '0' || !process.env.NODE_APP_INSTANCE) {
      console.log(`[Worker]: Iniciando intervalo de manifiestos`);
      
      intervalManifiestos = setInterval(() => {
        if(intervaloManifiestoV2) {
          executeManifiestosQuery();
        }else{
          console.log(`[Worker]: Esperando clientes`);
        }
      }, 5000);
    }
  });

  /**
   * END ---------------------------------------------------------------------------- 
   * END - Canal Principal de bascula - LECTURA DE PESO
   * END ----------------------------------------------------------------------------
   */
  wssPeso.on("connection", (ws) => {
    console.log(`[Worker]: Cliente conectado a /peso (Total: ${wssPeso.clients.size})`);

    ws.on("close", () => {
      console.log(`[Worker]: Cliente desconectado de /peso`);
    });
  });

  /**
   * END ----------------------------------------------------------------------------
   * END - Función para ejecutar consultas de manifiestos anti concurrencia
   * END ----------------------------------------------------------------------------
   */
  async function executeManifiestosQuery() {
    // Si ya se está ejecutando, marcar que hay una ejecución pendiente y salir
    if (isExecutingManifiestos) {
      pendingManifiestosExecution = true;
      return;
    }

    try {
      isExecutingManifiestos = true;
      pendingManifiestosExecution = false;

      const store = await getRedisClient();
      const result = await executeInfoTables('@MANIFIESTO');
      const cachedData = await store.get('sap:manifiestosView');
      
      // Si no hay datos en caché, guardar y publicar
      if (cachedData === null) {
        const queryFirtsTime = await manifiestosSinAsignar();
        await store.set('sap:manifiestosData', JSON.stringify(queryFirtsTime));
        await store.set('sap:manifiestosView', JSON.stringify(result));
        await publisher.publish("manifiestos:msg", JSON.stringify(queryFirtsTime));
        return;
      }
      
      // Comparar datos actuales con caché
      const resultString = JSON.stringify(result);
      if (cachedData !== resultString) {
        // Hay cambios: actualizar caché y publicar
        const queryFirtsTime = await manifiestosSinAsignar();
        const updateChanges = await manifiestosAsinados();
        const newDataFirtsConection = await getManifiestosAsignados();
        console.log(`[Worker]: ${updateChanges}`)
        await store.set('sap:manifiestosView', resultString);
        await store.set('sap:manifiestosData', JSON.stringify(queryFirtsTime));
        await publisher.publish("manifiestos:msg", JSON.stringify(queryFirtsTime));
        await publisher.publish("asignados:msg", JSON.stringify(newDataFirtsConection));
        console.log('[Worker]: Cambios detectados SAP - publicando actualización');
      }
    } catch (err) {
      console.error('[Worker]: Error en consulta de manifiestos:', err);
    } finally {
      isExecutingManifiestos = false;
      
      // Si hubo una ejecución pendiente mientras procesábamos, ejecutar ahora
      if (pendingManifiestosExecution) {
        setImmediate(() => executeManifiestosQuery());
      }
    }
  }

  /**
   * END ----------------------------------------------------------------------------
   * END - Ruta de manifiestos sin asignar
   * END ----------------------------------------------------------------------------
   */

  wssManifiestos.on("connection", async (ws) => {
    /**
     * END --------------------------------------------------------------------------
     * END - Cada nuevo cliente que se conecte se le enviaran los datos frescos
     * END --------------------------------------------------------------------------  
     */
    try {
      const store = await getRedisClient();
      const cachedView = await store.get('sap:manifiestosView');
      const cachedTable =  await store.get('sap:manifiestosData')
      intervaloManifiestoV2 = true;

      // Si hay datos en caché, usar esos para el nuevo cliente
      if (cachedView) {
        const queryManifiestos = await manifiestosSinAsignar();
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(queryManifiestos));
        }
      } else {       
        // Intentar obtener los datos que acabamos de guardar
        const result = await store.get('sap:manifiestosView');
        if (result && ws.readyState === WebSocket.OPEN) {
          const queryManifiestos = await manifiestosSinAsignar();
          ws.send(JSON.stringify(queryManifiestos));
        }
      }
    } catch (err) {
      console.error(`[Worker]: Error al enviar datos iniciales`);
    }

    /**
     * END ----------------------------------------------------------------------------
     * END - FUNCION CUANDO SE DESCONECTEN / CIERREN SE LIMPIA EL CACHE DE VERIFICACION
     * END - ADEMAS DE LIMPIAR EL INTERVALO PARA NO CONSUMIR RECURSOS
     * END ----------------------------------------------------------------------------
     */
    ws.on("close", async() => { 
      // Si no quedan clientes conectados, detener el intervalo y limpiar Redis
      if (wssManifiestos.clients.size === 0) {
        // Reset de flags
        isExecutingManifiestos = false;
        pendingManifiestosExecution = false;

        if (intervalManifiestos) intervaloManifiestoV2 = false;
        
        const store = await getRedisClient();
        await store.del("sap:manifiestosView");
        console.log(`[Worker]: Redis limpiado`);
      }
    });
  });

  // Suscribirse a mensajes de manifiestos
  subscriber.subscribe("manifiestos:msg", (message) => {
    wssManifiestos.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  /**
   * END ----------------------------------------------------------------------------
   * END - Ruta de manifiestos sin asignar
   * END ----------------------------------------------------------------------------
   */
  
  wssAsignados.on("connection", async (ws) => {
    /**
     * END --------------------------------------------------------------------------
     * END - Cada nuevo cliente que se conecte se le enviaran los datos frescos
     * END --------------------------------------------------------------------------  
     */
    try {
      const store = await getRedisClient();
      const newDataFirtsConection = await getManifiestosAsignados();
      ws.send(JSON.stringify(newDataFirtsConection));
      
    } catch (err) {
      console.error(`[Worker]: Error al enviar datos iniciales`);
    }

    /**
     * END ----------------------------------------------------------------------------
     * END - FUNCION CUANDO SE DESCONECTEN / CIERREN SE LIMPIA EL CACHE DE VERIFICACION
     * END - ADEMAS DE LIMPIAR EL INTERVALO PARA NO CONSUMIR RECURSOS
     * END ----------------------------------------------------------------------------
     */
    ws.on("close", async() => { 
      // TODO Falta
      if (wssManifiestos.clients.size === 0) {
        // Reset de flags
        console.log(`[Worker]: Redis limpiado`);
      }
    });
  });

  subscriber.subscribe("asignados:msg", (message) => {
    wssAsignados.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  
  /**
   * END ----------------------------------------------------------------------------
   * END - Manejo de rutas del websocket
   * END ----------------------------------------------------------------------------
   */
  server.on("upgrade", (req, socket, head) => {
    if (req.url === "/" || req.url === "/peso") {
      wssPeso.handleUpgrade(req, socket, head, (ws) => {
        wssPeso.emit("connection", ws, req);
      });
    } else if (req.url === "/manifiestos") {
      wssManifiestos.handleUpgrade(req, socket, head, (ws) => {
        wssManifiestos.emit("connection", ws, req);
      });
    }else if (req.url === "/asignados") {
      wssAsignados.handleUpgrade(req, socket, head, (ws) => {
        wssAsignados.emit("connection", ws, req);
      });
    } else {
      socket.destroy();
    }
  });

  /**
   * END ----------------------------------------------------------------------------
   * END - Limpieza total
   * END ----------------------------------------------------------------------------
   */
  process.on('SIGTERM', async () => {
    if (intervalPeso) clearInterval(intervalPeso);
    if (intervalManifiestos) clearInterval(intervalManifiestos);
    
    isExecutingManifiestos = false;
    pendingManifiestosExecution = false;
    
    const store = await getRedisClient();
    await store.del("sap:manifiestosView");
    
    publisher.quit();
    subscriber.quit();
    wssPeso.close();
    wssManifiestos.close();
  });
};


/**
 * END - Helpers
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

const getManifiestosTodosLosDatosHelper = async(arrManifiestos) => {
  try{
    const manifiestos = await db.manifiestos.findMany({
      select: {
        U_Status: true,
        DocNum: true,
        Tipo: true,
        U_FechaEntrega: true, 
        U_PesoTotal: true, 
        U_Tipo: true, 
        U_CamionPlaca: true, 
        U_IDChofer: true, 
        U_Chofer: true, 
        Bodega: true, 
        estadoPicking: true, 
      }, 
      where:{
        estadoPicking: {
          in: ['AGN', 'EPK', 'FPK']
        }, 
        DocNum: {
          in: arrManifiestos
        }
      }
    })

    return manifiestos
  }catch(err){
    console.log(err)
    return res.status(400).send({err: 'Error interno del sistema.'})
  }
}

/**
 * END ----------------------------------------------------------------------------
 * END - HELPER PARA FILTRAR MANIFIESTOS YA ASIGNADOS
 * END ----------------------------------------------------------------------------
 */

const manifiestosSinAsignar = async() => {
  const manifiesto = await executeView('IT_MANIFIESTOS_ACTIVOS');
  const arrManifiestos = manifiesto.map(el => el.DocNum)
  const filtered = await getComprobarManifiestosHelper(arrManifiestos)
  return manifiesto.filter(el => !filtered.includes(el.DocNum))
}

const manifiestosAsinados = async() => {
  const manifiesto = await executeView('IT_MANIFIESTOS_ACTIVOS');
  const arrManifiestos = manifiesto.map(el => el.DocNum)
  const filtered = await getManifiestosTodosLosDatosHelper(arrManifiestos)
  
  const refactorFiltered = filtered.map(el => ({
    U_Status: el.U_Status,
    DocNum: el.DocNum,
    Tipo: el.Tipo,
    U_FechaEntrega: new Date(el.U_FechaEntrega).toISOString().slice(0, 10),
    U_PesoTotal: parseFloat(el.U_PesoTotal),
    U_Tipo: el.U_Tipo,
    U_CamionPlaca: el.U_CamionPlaca,
    U_IDChofer: el.U_IDChofer,
    U_Chofer: el.U_Chofer,
  }));

  const arrFiltered = filtered.map(el => el.DocNum)

  const forComparacion = manifiesto.filter(item => arrFiltered.includes(item.DocNum));
  const refactorForComparacion = forComparacion.map(el => ({
    U_Status: el.U_Status,
    DocNum: el.DocNum,
    Tipo: el.Tipo,
    U_FechaEntrega: new Date(el.U_FechaEntrega).toISOString().slice(0, 10),
    U_PesoTotal: parseFloat(el.U_PesoTotal),
    U_Tipo: el.U_Tipo,
    U_CamionPlaca: el.U_CamionPlaca,
    U_IDChofer: el.U_IDChofer,
    U_Chofer: el.U_Chofer,
  }));

  const diferentes = [];

  refactorFiltered.forEach(obj1 => {
    const obj2 = refactorForComparacion.find(o => o.DocNum === obj1.DocNum);
    
    if (obj2 && JSON.stringify(obj1) !== JSON.stringify(obj2)) {
      diferentes.push({
        filtered: obj1,
        comparacion: obj2
      });
    }
  });

  let msg = 'No se detectaron cambios en los manifiestos asignados'

  if (diferentes.length !== 0) {
    // Preparar operaciones en paralelo
    msg = 'Se detectaron cambios en los manifiestos asignados, procediendo a actualizarlos...'
    const updatePromises = diferentes.map(item => 
      db.manifiestos.update({
        where: { DocNum: item.comparacion.DocNum },
        data: {
          U_Status: item.comparacion.U_Status,
          Tipo: item.comparacion.Tipo,
          U_FechaEntrega: new Date(item.comparacion.U_FechaEntrega),
          U_PesoTotal: item.comparacion.U_PesoTotal,
          U_Tipo: item.comparacion.U_Tipo,
          U_CamionPlaca: item.comparacion.U_CamionPlaca,
          U_IDChofer: item.comparacion.U_IDChofer,
          U_Chofer: item.comparacion.U_Chofer,
        }
      })
    );

    // Preparar logs
    const logsData = diferentes.map(item => {
      const cambios = [];
      Object.keys(item.filtered).forEach(key => {
        if (item.filtered[key] !== item.comparacion[key]) {
          cambios.push(`${DEFINELOGS[key]}: "${item.filtered[key]}" → "${item.comparacion[key]}"`);
        }
      });

      return {
        DocNum: item.filtered.DocNum,
        Observacion: `Actualización : ${cambios.join(', ')}`
      };
    });

    try {
      // Ejecutar todas las actualizaciones en paralelo
      await Promise.all(updatePromises);
      
      // Insertar logs en batch
      await db.manifiestosLogs.createMany({
        data: logsData,
      });

    } catch (error) {
      console.error('Error en actualizaciones masivas:', error);
      throw error;
    }
  }

  return msg;
}

const getManifiestosAsignados = async () => {
  try {
    const manifiestos = await db.manifiestos.findMany({
      include: {
        userAsignado: {
          include: {
            usuarioRef: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        _count: {
          select: {
            logs: true
          }
        }
      },
      orderBy: {
        U_FechaEntrega: 'desc'
      }
    });

    const refactorManifiestos = manifiestos.map(el => ({
      ...el,
      userAsignado: el.userAsignado.usuarioRef.name,
      logs: el._count.logs,
      usuarioRef: undefined, 
      _count: undefined, 
      createdAt: undefined,
      updatedAt: undefined,
      pickingActualId: undefined, 
    }));

    return refactorManifiestos
  }catch(err){
    console.log(err)
  }
}


module.exports = {
  setupWebSocket,
  getPublisher,
  getSubscriber,
  manifiestosSinAsignar,
  getManifiestosAsignados    
};