// config/config.js
require('dotenv').config();  // Load environment variables from .env file

module.exports = {
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Alina123@',
  database: process.env.DB_NAME || 'movies',
  host: process.env.DB_HOST || 'localhost',
  dialect: process.env.DB_DIALECT || 'mysql',
  pool: {
    max: parseInt(process.env.DB_POOL_MAX) || 10000,
    min: parseInt(process.env.DB_POOL_MIN) >= 0 ? parseInt(process.env.DB_POOL_MIN) : 0, // Ensure 'min' is a non-negative integer
    acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
    idle: parseInt(process.env.DB_POOL_IDLE) || 10000
  }
};
