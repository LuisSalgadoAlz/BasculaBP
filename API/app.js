const express = require("express");
require("dotenv").config();
const router = require("./routes/usuarios.routes");
const app = express();
const cors = require("cors");

/* Esto hace que el req.body no sea undefined */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
/* Cors necesarios */
app.use(cors());
app.use('/usuarios', router);


app.listen(process.env.PORT, () => {
  console.log(`Ejecutando API en http://localhost:${process.env.PORT}/`);
});
