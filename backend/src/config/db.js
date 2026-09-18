const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
const env = require('./env');

let pool = null;
let pgliteInstance = null;

async function getDb() {
  if (env.DATABASE_URL) {
    if (!pool) {
      pool = new Pool({
        connectionString: env.DATABASE_URL,
        ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      });
      console.log('Connected to PostgreSQL via DATABASE_URL');
    }
    return {
      type: 'postgres',
      query: async (text, params) => pool.query(text, params),
      exec: async (text) => pool.query(text),
    };
  }

  // Fallback to PGlite (embedded pure PostgreSQL)
  if (!pgliteInstance) {
    const { PGlite } = require('@electric-sql/pglite');
    const dataDir = path.resolve(__dirname, '../../data/pglite_db');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    pgliteInstance = new PGlite(dataDir);
    console.log(`Connected to persistent PostgreSQL instance at ${dataDir}`);
  }

  return {
    type: 'pglite',
    query: async (text, params) => {
      const res = await pgliteInstance.query(text, params);
      return {
        rows: res.rows || [],
        rowCount: res.rows ? res.rows.length : (res.affectedRows || 0),
      };
    },
    exec: async (text) => {
      await pgliteInstance.exec(text);
      return { rowCount: 0 };
    },
  };
}

async function query(text, params = []) {
  const db = await getDb();
  return db.query(text, params);
}

async function exec(text) {
  const db = await getDb();
  return db.exec(text);
}

module.exports = {
  getDb,
  query,
  exec,
};
