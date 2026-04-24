import app from '../server/app.js';
import { initDatabase } from '../server/db.js';

// Initialize database
await initDatabase();

export default async function handler(req, res) {
  return app(req, res);
}
