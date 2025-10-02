// config/database.js
const hana = require("@sap/hana-client");

let hanaConn = null;

const connectHana = () => {
  return new Promise((resolve, reject) => {
    if (hanaConn && hanaConn.connected) {   // 👈 aquí
      resolve(hanaConn);
      return;
    }

    hanaConn = hana.createConnection();
    
    const hanaParams = {
      serverNode: `${process.env.HANA_HOST}:${process.env.HANA_PORT}`,
      uid: process.env.HANA_USER,
      pwd: process.env.HANA_PASS,
    };

    hanaConn.connect(hanaParams, (err) => {
      if (err) {
        console.error("[HANADB]: Error conectando a HANA:", err);
        reject(err);
      } else {
        /* Lectura HANA DB */
        console.log("[HANADB]: Conexión exitosa a SAP HANA");
        resolve(hanaConn);
      }
    });
  });
};

const getConnection = async () => {
  if (!hanaConn || !hanaConn.isValid()) {
    await connectHana();
  }
  return hanaConn;
};



module.exports = { getConnection };