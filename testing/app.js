const express = require("express");
const net = require("net");

const app = express();
const PORT = 3000;

// Dirección IP y puerto de la balanza
const host = "192.9.100.186";
const port = 10000;

// Función para obtener el peso de la balanza
function obtenerPeso() {
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

// Endpoint para obtener el peso
app.get("/peso", async (req, res) => {
  try {
    const peso = await obtenerPeso();
    res.json({ peso });
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
