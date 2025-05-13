// websocket.js
const WebSocket = require("ws");
const obtenerPeso = require("../controllers/basculaLive.controller");
const { setLoggerSystema } = require("../utils/logger");

const setupWebSocket = (server) => {
  const wss = new WebSocket.Server({ server });
  wss.on("connection", (ws) => {
    let errorRegister=0;
    const intervalId = setInterval(async () => {
      try {
        const peso = await obtenerPeso();
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(`${pesso}`);
          }
        });
        errorRegister = 0;
      } catch (err) {
        if (errorRegister===0){
          setLoggerSystema('SOCKET', 'ERROR OBTENCION DE PESO UNDEFINED', 3)
          errorRegister++;
        }
      }
    }, 100);
  
    ws.on("close", () => {
      clearInterval(intervalId);
    });
  });
};

module.exports = setupWebSocket;
