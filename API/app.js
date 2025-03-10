const express = require("express");
require("dotenv").config();
const verificarOrigen = require("./middlewares/cors");
const router = require("./routes/usuarios.routes");

const app = express();

/* Esto hace que el req.body no sea undefined */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", verificarOrigen, (req, res) => {
  res.send({
    msg: "Origen Permitidoss",
    header: req.headers.origin,
  });
});


app.use('/usuarios', router);


app.listen(process.env.PORT, () => {
  console.log(`Ejecutando API en http://localhost:${process.env.PORT}/`);
});
