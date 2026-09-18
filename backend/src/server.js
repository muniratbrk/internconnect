const http = require('http');
const app = require('./app');
const env = require('./config/env');
const runMigrations = require('./db/migrate');
const seedDatabase = require('./db/seed');
const { query } = require('./config/db');

const server = http.createServer(app);

async function startServer() {
  try {
    // 1. Ensure migrations are up to date
    await runMigrations();

    // 2. Auto-seed if database is empty
    const userCount = await query('SELECT COUNT(*) AS count FROM users');
    if (parseInt(userCount.rows[0].count, 10) === 0) {
      console.log('No users found in database. Running initial seed...');
      await seedDatabase();
    }

    server.listen(env.PORT, () => {
      console.log(`=========================================`);
      console.log(`🚀 InternConnect Server running on port ${env.PORT}`);
      console.log(`📡 API Health: http://localhost:${env.PORT}/api/health`);
      console.log(`🌐 Allowed Client: ${env.CLIENT_URL}`);
      console.log(`=========================================`);
    });
  } catch (error) {
    console.error('Failed to start InternConnect server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { app, server };
