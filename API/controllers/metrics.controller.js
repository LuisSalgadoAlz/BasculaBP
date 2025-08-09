const pm2 = require("pm2");
const os = require("os");
const db = require("../lib/prisma");

const typesOfLogs = ['Vacio', 'COMPLETO', 'ADVERTENCIA', 'ERROR']

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

const getLogs = async (req, res) => {   
  const cat = parseInt(req.query.cat) || '';
  const user = req.query.user || '';
  const search = req.query.search || '';
  const date = req.query.date || '';
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;
  const skip = (page - 1) * limit;

  // Filtro de fecha
  let dateFilter = {};
  const now = new Date();

  switch (date) {
    case 'today':
      dateFilter = {
        gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
      };
      break;
    case 'yesterday':
      dateFilter = {
        gte: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
        lt: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      };
      break;
    case 'last7days':
      dateFilter = {
        gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      };
      break;
    case 'last30days':
      dateFilter = {
        gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      };
      break;
  }

  const where = {
    ...(search ? { Evento: { contains: search } } : {}),
    ...(cat ? { categoria: cat } : {}),
    ...(user ? { usuario: user } : {}),
    ...(date ? { Fecha: dateFilter } : {}),
  };

  const data = await db.logs.findMany({ 
    where,
    orderBy: { id: 'desc' }, 
    skip,
    take: limit,
    omit: {id:true}
  });

  const totalData = await db.logs.count({ 
    where,
  });

  const refactor = data.map((item) => ({
    ...item, 
    Fecha: new Date(item.Fecha).toLocaleString(), 
    categoria: typesOfLogs[item.categoria]
  }));
  
  res.send({
    data: refactor,
    pagination: {
      totalData,
      totalPages: Math.ceil(totalData / limit),
      currentPage: page,
      limit,
    },
  });
}



const getStatsForLogs = async(req, res) => {
  try{
    const [logs, completos, advertencia, errores] = await Promise.all([
      db.logs.count(),
      db.logs.count({where:{
        categoria: 1
      }}), 
      db.logs.count({where:{
        categoria: 2
      }}),
      db.logs.count({where:{
        categoria: 3
      }}),  
    ])

    res.json({logs, completos, advertencia, errores})
  } catch (err) {
    console.log(err)
    res.status(500).send({msg: "Error en el Servidor"})
  }
}

const getUsuariosForSelect = async(req, res) => {
  try{
    const data = await db.logs.findMany({
      select:{
        usuario: true, 
      }, 
      distinct: ['usuario']
    })
    res.json(data)
  }catch (err) {
    console.log(err)
  }
}

module.exports = { getPM2Metrics, getSpaceForTable, getLogs, getStatsForLogs, getUsuariosForSelect };
