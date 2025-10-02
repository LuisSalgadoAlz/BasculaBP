const { createClient } = require('redis');

let client = null;
let isConnecting = false;

const getRedisClient = async () => {
  // Si ya tenemos un cliente conectado, lo devolvemos
  if (client && client.isReady) {
    return client;
  }

  // Si ya se está conectando, esperamos
  if (isConnecting) {
    while (isConnecting) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    return client;
  }

  try {
    isConnecting = true;
    
    if (!client) {
      client = createClient({
        url: 'redis://localhost:6379'
      });

      // Manejar eventos de conexión
      client.on('error', (err) => {
        console.error('Redis: Error', err);
      });

      client.on('connect', () => {
        /* Lectura de Redis */
        console.log('[LREDIS]: ON');
      });

      client.on('disconnect', () => {
        console.log('Redis: Desconectado');
      });
    }

    if (!client.isReady) {
      await client.connect();
    }

    return client;
  } catch (error) {
    console.error('Error connecting to Redis:', error);
    throw error;
  } finally {
    isConnecting = false;
  }
};

const closeRedisClient = async () => {
  if (client && client.isReady) {
    await client.quit();
    client = null;
  }
};

module.exports = { 
  getRedisClient,
  closeRedisClient
};

process.on('SIGINT', async () => {
  await closeRedisClient();
  process.exit(0);
});