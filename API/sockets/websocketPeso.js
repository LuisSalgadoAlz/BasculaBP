// websocket.js
const WebSocket = require("ws");
const { createClient } = require("redis");
const obtenerPeso = require("../controllers/basculaLive.controller");
const { setLoggerSystema } = require("../utils/logger");
const { executeView, executeInfoTables } = require("../lib/hanaActions");
const { getRedisClient } = require("../lib/redisClient");

const setupWebSocket = (server) => {
  const wssPeso = new WebSocket.Server({ noServer: true });
  const wssManifiestos = new WebSocket.Server({ noServer: true });
  
  // Variables para controlar los intervalos  
  let intervalPeso = null;
  let intervalManifiestos = null;
  
  /**
   * END ----------------------------------------------------------------------------
   * END: Clientes de redis
   * END ----------------------------------------------------------------------------
   */
  const publisher = createClient({ url: "redis://localhost:6379" });
  const subscriber = createClient({ url: "redis://localhost:6379" });

  Promise.all([publisher.connect(), subscriber.connect()]).then(async () => {
    console.log(`[Worker]: ON`);
    const store = await getRedisClient()
    
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
   * TODO: Falta construccion para evitar sobrecarga en ambos lados con la pool.
   * ! **** EN BETA ****
   */

  wssManifiestos.on("connection", async (ws) => {
    console.log(`[Worker]: Cliente conectado a /manifiestos (Total: ${wssManifiestos.clients.size})`);
    const queryManifiestos = await executeView('IT_MANIFIESTOS_ACTIVOS');

    /**
     * END --------------------------------------------------------------------------
     * END - Cada nuevo cliente que se conecte se le enviaran los datos frescos
     * END --------------------------------------------------------------------------  
     */
    try{
      const store = await getRedisClient();
      const result = await executeInfoTables('@MANIFIESTO');
      const resultString = JSON.stringify(result);
        
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(queryManifiestos));
        console.log(`[Worker]: Datos obtenidos y enviados al nuevo cliente`);
      }
        
      // Guardar en caché para futuros clientes
      await store.set('sap:manifiestosView', resultString);
    }catch(err){
      console.error(`[Worker]: Error al enviar datos iniciales:`, err);
    }

    /**
     * END --------------------------------------------------------------------------
     * END - Iniciar intervalo cuando se conecta unicamente el primir cliente.
     * END --------------------------------------------------------------------------  
     */
    // Iniciar intervalo cuando se conecta el primer cliente
    if (wssManifiestos.clients.size === 1 && (process.env.NODE_APP_INSTANCE === '0' || !process.env.NODE_APP_INSTANCE)) {
      console.log(`[Worker]: Iniciando intervalo de manifiestos`);
      
      intervalManifiestos = setInterval(async () => {
        try {
          const store = await getRedisClient();
          const result = await executeInfoTables('@MANIFIESTO');
          const cachedData = await store.get('sap:manifiestosView');
          let queryFirtsTime = [{}]
          // Si no hay datos en caché, guardar y publicar
          if (cachedData === null) {
            await store.set('sap:manifiestosView', JSON.stringify(result));
            queryFirtsTime = await executeView('IT_MANIFIESTOS_ACTIVOS');
            await publisher.publish("manifiestos:msg", JSON.stringify(queryFirtsTime));
            console.log('[Worker]: Datos iniciales guardados y publicados');
            return;
          }
          
          // Comparar datos actuales con caché
          const resultString = JSON.stringify(result);
          if (cachedData !== resultString) {
            // Hay cambios: actualizar caché y publicar
            queryFirtsTime = await executeView('IT_MANIFIESTOS_ACTIVOS');
            await store.set('sap:manifiestosView', resultString);
            await publisher.publish("manifiestos:msg", JSON.stringify(queryFirtsTime));
            console.log('[Worker]: Cambios detectados - publicando actualización');
          } else {
            console.log('[Worker]: No hay cambios - omitiendo publicación');
          }
        } catch (err) {
          console.error('[Worker]: Error en intervalo de manifiestos:', err);
        }
      }, 5000);
    }

    /**
     * END ----------------------------------------------------------------------------
     * END - FUNCION CUANDO SE DESCONECTEN / CIERREN SE LIMPIA EL CACHE DE VERIFICACION
     * END - ADEMAS DE LIMPIAR EL INTERVALO PARA NO CONSUMIR RECURSOS
     * END ----------------------------------------------------------------------------
     */
    ws.on("close", async() => {
      console.log(`[Worker]: Cliente desconectado de /manifiestos (Restantes: ${wssManifiestos.clients.size})`);
      
      // Si no quedan clientes conectados, detener el intervalo y limpiar Redis
      if (wssManifiestos.clients.size === 0) {
        console.log(`[Worker]: No hay más clientes - deteniendo intervalo y limpiando Redis`);
        
        if (intervalManifiestos) {
          clearInterval(intervalManifiestos);
          intervalManifiestos = null;
        }
        
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
    
    const store = await getRedisClient();
    await store.del("sap:manifiestosView");
    
    publisher.quit();
    subscriber.quit();
    wssPeso.close();
    wssManifiestos.close();
  });
};

module.exports = setupWebSocket;