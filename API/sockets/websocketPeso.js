// websocket.js
const WebSocket = require("ws");
const obtenerPeso = require("../controllers/basculaLive.controller");

const setupWebSocket = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    const intervalId = setInterval(async () => {
      try {
        const peso = await obtenerPeso();
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(`${peso}`);
          }
        });
      } catch (err) {
        console.error("Error al obtener el peso:", err.message);
      }
    }, 100);
  
    ws.on("close", () => {
      clearInterval(intervalId);
    });
  });
};

module.exports = setupWebSocket;
