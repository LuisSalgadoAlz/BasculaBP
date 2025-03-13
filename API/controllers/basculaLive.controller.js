const net = require("net");

function obtenerPeso() {
    const host = "192.9.100.186";
    const port = 10000;
    return new Promise((resolve, reject) => {
    const client = new net.Socket();

    client.connect(port, host, () => {
      console.log(`Conectado a ${host}:${port}`);
      client.write("w\r\n"); // Enviar el comando
    });

    client.on("data", (data) => {
      const respuesta = data.toString().trim();
      if (respuesta !== "w") { 
        resolve(respuesta);
        client.destroy(); // Cerrar la conexión
      }
    });

    client.on("error", (err) => {
      reject(`Error: ${err.message}`);
      client.destroy();
    });

    client.on("close", () => {
      console.log("Conexión cerrada");
    });
  });
}

module.exports = obtenerPeso;