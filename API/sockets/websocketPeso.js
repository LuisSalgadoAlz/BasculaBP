// websocket.js
const WebSocket = require("ws");
const obtenerPeso = require("../controllers/basculaLive.controller");

const setupWebSocket = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    const intervalId = setInterval(async () => {
      const peso = await obtenerPeso();
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(`${peso}`);
        }
      });
    }, 100);

    ws.on("close", () => {
      console.log("Cliente WebSocket desconectado");
      clearInterval(intervalId); // Asegúrate de detener el intervalo si el cliente se desconecta
    });
  });
};

module.exports = setupWebSocket;
