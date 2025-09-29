// websocket.js
const WebSocket = require("ws");
const { createClient } = require("redis");
const obtenerPeso = require("../controllers/basculaLive.controller");
const { setLoggerSystema } = require("../utils/logger");
const { executeView } = require("../lib/hanaActions");

const setupWebSocket = (server) => {
  const wssPeso = new WebSocket.Server({ noServer: true });
  const wssManifiestos = new WebSocket.Server({ noServer: true });

  /**
   * ? Clientes de redis
   */
  const publisher = createClient({ url: "redis://localhost:6379" });
  const subscriber = createClient({ url: "redis://localhost:6379" });

  Promise.all([publisher.connect(), subscriber.connect()]).then(async () => {
    console.log(`[Worker ${process.pid}] Redis conectado`);

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

      setInterval(async () => {
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

      setInterval(async() => {
        const result = await executeView('IT_MANIFIESTOS_ACTIVOS');
        await publisher.publish("manifiestos:msg", JSON.stringify(result));
      }, 10000);
    }
  });

  /**
   *  END - Canal Principal de bascula
   */
  wssPeso.on("connection", (ws) => {
    console.log(`[Worker ${process.pid}] Cliente conectado a /peso (Total: ${wssPeso.clients.size})`);

    ws.on("close", () => {
      console.log(`[Worker ${process.pid}] Cliente desconectado de /peso`);
    });
  });

  /**
   * TODO: Falta construccion para evitar sobrecarga en ambos lados con la pool.
   * ! **** EN BETA ****
   */

  wssManifiestos.on("connection", (ws) => {
    console.log(`[Worker ${process.pid}] Cliente conectado a /manifiestos`);

    ws.send(JSON.stringify({ 
      msg: "Bienvenido al canal /manifiestos",
      worker: process.pid 
    }));
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
   * END - Manejo de rutas del websocket
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

  // Limpieza
  process.on('SIGTERM', () => {
    publisher.quit();
    subscriber.quit();
    wssPeso.close();
    wssManifiestos.close();
  });
};

module.exports = setupWebSocket;