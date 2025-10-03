// websocket.js
const WebSocket = require("ws");
const { createClient } = require("redis");
const obtenerPeso = require("../controllers/basculaLive.controller");
const { setLoggerSystema } = require("../utils/logger");
const { executeView, executeInfoTables } = require("../lib/hanaActions");
const { getRedisClient } = require("../lib/redisClient");
const { getComprobarManifiestosHelper } = require("../controllers/bodegapt.controller");

/**
 * END ----------------------------------------------------------------------------
 * END - PUBLISHER PARA EJECUTAR EN OTRAS PARTES DEL PROYECTO
 * END ----------------------------------------------------------------------------
 */

let publisher;
let subscriber;

async function getPublisher() {
  if (!publisher) {
    publisher = createClient({ url: `redis://${process.env.REDIS_HOST}:6379` });
    await publisher.connect();
  }
  return publisher;
}

async function getSubscriber() {
  if (!subscriber) {
    subscriber = createClient({ url: `redis://${process.env.REDIS_HOST}:6379` });
    await subscriber.connect();
  }
  return subscriber;
}

const setupWebSocket = (server) => {
  const wssPeso = new WebSocket.Server({ noServer: true });
  const wssManifiestos = new WebSocket.Server({ noServer: true });
  
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

  publisher = createClient({ url: `redis://${process.env.REDIS_HOST}:6379` });
  subscriber = createClient({ url: `redis://${process.env.REDIS_HOST}:6379` });

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
        await store.set('sap:manifiestosView', resultString);
        await store.set('sap:manifiestosData', JSON.stringify(queryFirtsTime));
        await publisher.publish("manifiestos:msg", JSON.stringify(queryFirtsTime));
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
   * TODO: Falta construccion para evitar sobrecarga en ambos lados con la pool.
   * ! **** EN BETA ****
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
        const queryManifiestos = cachedTable ? JSON.parse(cachedTable) : await manifiestosSinAsignar();
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(queryManifiestos));
        }
      } else {       
        // Intentar obtener los datos que acabamos de guardar
        const result = await store.get('sap:manifiestosView');
        if (result && ws.readyState === WebSocket.OPEN) {
          const queryManifiestos = cachedTable ? JSON.parse(cachedTable) : await manifiestosSinAsignar();
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

module.exports = {
  setupWebSocket,
  publisher, 
  subscriber 
};