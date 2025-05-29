const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '.env')
});

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'biuro_app',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    },
    migrations: {
      directory: path.resolve(__dirname, 'db/migrations'),
    },
  },
};
