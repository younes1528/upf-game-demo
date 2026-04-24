import app from '../server/app.js';
import { initDatabase } from '../server/db.js';

// Initialize database
initDatabase();

export default app;
