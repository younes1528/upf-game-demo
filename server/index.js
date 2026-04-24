import app from './app.js';
import { initDatabase } from './db.js';

const PORT = process.env.PORT || 5000;

// Initialize database
initDatabase();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
