const express = require("express");
require("dotenv").config();
const http = require("http"); // Necesario para usar con WebSocket
const router = require("./routes/usuarios.routes");
const app = express();
const cors = require("cors");
const logUser = require("./routes/login.routes");
const basculaLive = require("./routes/basculaLive.routes");
const socios = require("./routes/socios.routes");
const motoristas = require("./routes/motorista.routes")
const tipodepeso = require("./routes/tipoDePeso.routes")
const empresas = require("./routes/empresas.routes");
const admin = require('./routes/admin.routes')
const soporte = require("./routes/soporte.route")
const setupWebSocket = require("./sockets/websocketPeso");
const boletas = require("./routes/boleta.routes");
const informes = require("./routes/informes.routes")
const tolva = require("./routes/tolva.routes");
const guardia = require("./routes/guardia.routes");
const path = require("path");

const server = http.createServer(app);

/* Esto hace que el req.body no sea undefined */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());


app.use('/api/login/', logUser);
app.use('/api/usuarios', router);
app.use('/api/peso', basculaLive)
app.use('/api/socios', socios)
app.use('/api/motoristas', motoristas)
app.use('/api/tipoDePeso', tipodepeso)
app.use('/api/empresas', empresas)
app.use('/api/boletas', boletas)
app.use('/api/admin', admin)
app.use('/api/soporte', soporte)
app.use('/api/tolva/', tolva)
app.use('/api/guardia/', guardia)
app.use('/api/informes/', informes)

const distPath = path.join(__dirname, process.env.DIST_PATH || "../bascula/dist");

app.use(express.static(distPath));

// Para que React maneje rutas tipo /boletas, /dashboard, etc.
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

setupWebSocket(server);

server.listen(process.env.PORT, process.env.HOST, () => {
  console.log(`Ejecutando API en http://${process.env.HOST}:${process.env.PORT}/`);
});
