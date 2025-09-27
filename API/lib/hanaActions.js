const { getConnection } = require('../config/hana');

const executeView = async (viewName, filters = {}) => {
  try {
    const conn = await getConnection();
    
    // Vista simple
    let query = `SELECT * FROM ${process.env.HANA_DATABASE}.${viewName}`;
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
          console.error('Error ejecutando vista:', err);
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
    executeView
}