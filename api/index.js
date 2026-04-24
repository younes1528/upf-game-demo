import app from '../server/app.js';
import { initDatabase } from '../server/db.js';

// Initialize database
let dbInitialized = false;

async function ensureDb() {
  if (!dbInitialized) {
    await initDatabase();
    dbInitialized = true;
  }
}

export default async function handler(req, res) {
  await ensureDb();
  return app(req, res);
}
