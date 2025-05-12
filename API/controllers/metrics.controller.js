const pm2 = require("pm2");
const os = require("os");
const db = require("../lib/prisma");

function obtenerCapacidadSistema() {
  const cpus = os.cpus();

  return {
    totalMemoria: os.freemem(), // en bytes
    cantidadCores: cpus.length,
    cores: cpus.map((core, index) => ({
      core: index,
      modelo: core.model,
      velocidadMHz: core.speed, // en MHz
    })),
  };
}

function obtenerMetricasPm2() {
  return new Promise((resolve, reject) => {
    pm2.connect((err) => {
      if (err) return reject(err);

      pm2.list((err, list) => {
        pm2.disconnect();
        if (err) return reject(err);

        const metrics = list.map((proc) => ({
          name: proc.name,
          pid: proc.pid,
          cpu: proc.monit.cpu,
          memory: proc.monit.memory, // bytes
        }));
        resolve(metrics);
      });
    });
  });
}

const getPM2Metrics = async (req, res) => {
  try {
    const metrics = await obtenerMetricasPm2();
    const statsSystem = obtenerCapacidadSistema();

    const refactorMetrics = metrics.map((item) => ({
      cpu: {
        usage: item.cpu,
        cores: 100,
        speed: "dsd",
      },
      memory: {
        total: (statsSystem.totalMemoria / 1000000000).toFixed(2),
        used: (item.memory / 1000000000).toFixed(2),
        free: (
          statsSystem.totalMemoria / 1000000000 -
          item.memory / 1000000000
        ).toFixed(2),
      },
      apiStatus: "Operacional",
      lastUpdated: new Date().toLocaleTimeString(),
    }));
    res.json(refactorMetrics);
  } catch (err) {
    res.status(500).json({ error: "Error getting PM2 metrics" });
  }
};

async function getSpaceForTable(req, res) {
  try {
    const tables = await db.$queryRaw`SELECT name FROM sys.tables`;
    const results = [];
    for (const { name } of tables) {
      const space = await db.$queryRaw`EXEC sp_spaceused ${name}`;
      results.push(...space);
    }
    const refactor = results.map((el)=>({
      Nombre: el.name, 
      Datos: el.rows, 
      'Espacio Reservado': el.reserved, 
      'Espacio Datos': el.data, 
      'Espacio Llaves': el.index_size, 
      'Espacio reservado (Libre)' : el.unused
    }))
    res.json(refactor);
  } catch (error) {
    console.error("Error al obtener espacio:", error);
  } 
}

module.exports = { getPM2Metrics, getSpaceForTable };
