import pool from '../db.js';

// Get all participants
export const getParticipants = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM participants ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching participants:', err);
    res.status(500).json({ error: 'Failed to fetch participants' });
  }
};

// Register a participant
export const registerParticipant = async (req, res) => {
  try {
    const { name, email } = req.body;
    const result = await pool.query(
      'INSERT INTO participants (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error registering participant:', err);
    if (err.code === '23505') {
      res.status(400).json({ error: 'Email already registered' });
    } else {
      res.status(500).json({ error: 'Failed to register participant' });
    }
  }
};

// Confirm a participant
export const confirmParticipant = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'UPDATE participants SET confirmed = TRUE WHERE id = $1 RETURNING *',
      [id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error confirming participant:', err);
    res.status(500).json({ error: 'Failed to confirm participant' });
  }
};

// Delete a participant
export const deleteParticipant = async (req, res) => {
  try {
    const { id } = req.params;
    // First delete related matches
    await pool.query('DELETE FROM matches WHERE participant1_id = $1 OR participant2_id = $1', [id]);
    // Then delete the participant
    await pool.query('DELETE FROM participants WHERE id = $1', [id]);
    res.json({ message: 'Participant deleted' });
  } catch (err) {
    console.error('Error deleting participant:', err);
    res.status(500).json({ error: 'Failed to delete participant' });
  }
};

// Delete all participants
export const deleteAllParticipants = async (req, res) => {
  try {
    // First delete all matches
    await pool.query('DELETE FROM matches');
    // Then delete all participants
    await pool.query('DELETE FROM participants');
    res.json({ message: 'All participants deleted' });
  } catch (err) {
    console.error('Error deleting all participants:', err);
    res.status(500).json({ error: 'Failed to delete all participants' });
  }
};

// Get participant by email
export const getParticipantByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const result = await pool.query('SELECT * FROM participants WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Participant not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching participant by email:', err);
    res.status(500).json({ error: 'Failed to fetch participant' });
  }
};
