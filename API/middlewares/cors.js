const originesPermitidos = ["http://localhost:5500", "null", "http://127.0.0.1:5500"];

const verificarOrigen = (req, res, next) => {
  const { origin } = req.headers;
  if (originesPermitidos.includes(origin)) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }
  next();
};

module.exports = verificarOrigen;