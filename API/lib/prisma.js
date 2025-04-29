const { PrismaClient } = require('@prisma/client');

let db;

if (process.env.NODE_ENV === 'production') {
  db = new PrismaClient();
} else {
  // Evita crear múltiples instancias en desarrollo
  if (!global.db) {
    global.db = new PrismaClient();
  }
  db = global.db; // aquí estaba el error
}

module.exports = db;
