import pool from '../db.js';

// Register admin (temporary - should be removed in production)
export const registerAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await pool.query(
      'INSERT INTO admins (username, password) VALUES ($1, $2) RETURNING id, username, created_at',
      [username, password]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error registering admin:', err);
    if (err.code === '23505') {
      res.status(400).json({ error: 'Username already exists' });
    } else {
      res.status(500).json({ error: 'Failed to register admin' });
    }
  }
};

// Login admin
export const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await pool.query(
      'SELECT * FROM admins WHERE username = $1 AND password = $2',
      [username, password]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const admin = result.rows[0];
    res.json({ 
      id: admin.id, 
      username: admin.username,
      message: 'Login successful' 
    });
  } catch (err) {
    console.error('Error logging in admin:', err);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Verify admin (middleware helper)
export const verifyAdmin = async (req, res, next) => {
  const { adminId } = req.headers;
  
  if (!adminId) {
    return res.status(401).json({ error: 'Admin ID required' });
  }
  
  try {
    const result = await pool.query('SELECT id FROM admins WHERE id = $1', [adminId]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid admin' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Verification failed' });
  }
};
