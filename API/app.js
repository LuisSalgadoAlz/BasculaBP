const express = require("express");
require("dotenv").config();
const router = require("./routes/usuarios.routes");
const app = express();
const cors = require("cors");
const logUser = require("./routes/login.routes");
const verificarToken = require("./middlewares/authJWT");


/* Esto hace que el req.body no sea undefined */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());


app.use('/login/', logUser);
app.use('/usuarios', router);

app.listen(process.env.PORT, () => {
  console.log(`Ejecutando API en http://localhost:${process.env.PORT}/`);
});
