const { getConnection } = require('../config/hana');

const executeView = async (viewName, filters = {}) => {
  try {
    const conn = await getConnection();
    
    // Vista simple
    let query = `SELECT * FROM ${process.env.HANA_DATABASE}."${viewName}"`;
    let params = [];
    
    // Agregar filtros si existen
    if (Object.keys(filters).length > 0) {
      const conditions = Object.keys(filters).map(key => `${key} = ?`);
      query += ` WHERE ${conditions.join(' AND ')}`;
      params = Object.values(filters);
    }
    
    return new Promise((resolve, reject) => {
      conn.exec(query, params, (err, result) => {
        if (err) {
          console.error('[LERROR]: Error ejecutando vista');
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  } catch (error) {
    throw error;
  }
};

const executeInfoTables = async (viewName) => {
  try {
    const conn = await getConnection();
    
    let query = `SELECT RAW_RECORD_COUNT_IN_DELTA FROM M_CS_TABLES WHERE SCHEMA_NAME = '${process.env.HANA_DATABASE}' AND TABLE_NAME = '${viewName}'`;
    let params = [];
        
    return new Promise((resolve, reject) => {
      conn.exec(query, params, (err, result) => {
        if (err) {
          console.error('Error ejecutando informacion de tabla:', err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  } catch (error) {
    throw error;
  }
};

// Ejecutar procedimiento almacenado
const executeProcedure = async (procedureName, inputParams = {}) => {
  try {
    const conn = await getConnection();
    
    // Construir CALL statement con parámetros
    const paramPlaceholders = Object.keys(inputParams).map(() => '?').join(', ');
    const query = `CALL ${process.env.HANA_DATABASE}.${procedureName}(${paramPlaceholders})`;
    const params = Object.values(inputParams);
    
    return new Promise((resolve, reject) => {
      conn.exec(query, params, (err, result) => {
        if (err) {
          console.error('[LERROR]: Error ejecutando procedimiento:', err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  } catch (error) {
    throw error;
  }
};

module.exports = {
    executeView, 
    executeInfoTables,
    executeProcedure,
}