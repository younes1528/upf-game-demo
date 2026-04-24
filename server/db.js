import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Initialize database tables
export const initDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS participants (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        confirmed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS matches (
        id SERIAL PRIMARY KEY,
        participant1_id INTEGER REFERENCES participants(id) ON DELETE CASCADE,
        participant2_id INTEGER REFERENCES participants(id) ON DELETE CASCADE,
        winner_id INTEGER REFERENCES participants(id),
        points INTEGER DEFAULT 0,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add status column if it doesn't exist (for existing tables)
    await pool.query(`
      ALTER TABLE matches
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'scheduled'
    `);

    // Update existing matches without status to 'scheduled'
    await pool.query(`
      UPDATE matches
      SET status = 'scheduled'
      WHERE status IS NULL
    `);

    // Add queue_position column to participants table
    await pool.query(`
      ALTER TABLE participants
      ADD COLUMN IF NOT EXISTS queue_position INTEGER DEFAULT NULL
    `);

    // Add selection_status column to participants table
    await pool.query(`
      ALTER TABLE participants
      ADD COLUMN IF NOT EXISTS selection_status VARCHAR(20) DEFAULT 'pending'
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database tables initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
};

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully at:', res.rows[0].now);
    initDatabase();
  }
});

export default pool;
