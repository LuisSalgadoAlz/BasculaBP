const express = require("express");
require("dotenv").config();
const router = require("./routes/usuarios.routes");
const app = express();
const cors = require("cors");
const logUser = require("./routes/login.routes");
const basculaLive = require("./routes/basculaLive.routes");
const socios = require("./routes/socios.routes");
const motoristas = require("./routes/motorista.routes")
const producto = require("./routes/productos.routes")
const tipodepeso = require("./routes/tipoDePeso.routes")
const empresas = require("./routes/empresas.routes")

/* Esto hace que el req.body no sea undefined */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());


app.use('/login/', logUser);
app.use('/usuarios', router);
app.use('/peso', basculaLive)
app.use('/socios', socios)
app.use('/motoristas', motoristas)
app.use('/producto', producto)
app.use('/tipoDePeso', tipodepeso)
app.use('/empresas', empresas)

app.listen(process.env.PORT, () => {
  console.log(`Ejecutando API en http://localhost:${process.env.PORT}/`);
});
