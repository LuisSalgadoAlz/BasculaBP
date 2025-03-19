const express = require("express");
require("dotenv").config();
const router = require("./routes/usuarios.routes");
const app = express();
const cors = require("cors");
const logUser = require("./routes/login.routes");
const basculaLive = require("./routes/basculaLive.routes");
const clientes = require("./routes/clientes.routes");
const transporte = require("./routes/transporte.routes")
const motoristas = require("./routes/motorista.routes")
const placas = require("./routes/placas.routes")
const procesos = require("./routes/procesos.routes")
const origen = require("./routes/origen.routes")
const destino = require("./routes/destino.routes")
const producto = require("./routes/productos.routes")

/* Esto hace que el req.body no sea undefined */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());


app.use('/login/', logUser);
app.use('/usuarios', router);
app.use('/peso', basculaLive)
app.use('/clientes', clientes)
app.use('/transportes', transporte)
app.use('/motoristas', motoristas)
app.use('/placas', placas)
app.use('/procesos', procesos)
app.use('/origen', origen)
app.use('/destino', destino)
app.use('/producto', producto)

app.listen(process.env.PORT, () => {
  console.log(`Ejecutando API en http://localhost:${process.env.PORT}/`);
});
