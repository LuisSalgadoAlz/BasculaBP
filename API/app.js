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
const setupWebSocket = require("./sockets/websocketPeso");


const server = http.createServer(app);

/* Esto hace que el req.body no sea undefined */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());


app.use('/login/', logUser);
app.use('/usuarios', router);
app.use('/peso', basculaLive)
app.use('/socios', socios)
app.use('/motoristas', motoristas)
app.use('/tipoDePeso', tipodepeso)
app.use('/empresas', empresas)

setupWebSocket(server);

server.listen(process.env.PORT, process.env.HOST, () => {
  console.log(`Ejecutando API en http://${process.env.HOST}:${process.env.PORT}/`);
});
