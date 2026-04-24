import pool from '../db.js';

// Get all matches
export const getMatches = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        m.*,
        p1.name as participant1_name,
        p2.name as participant2_name,
        w.name as winner_name
      FROM matches m
      LEFT JOIN participants p1 ON m.participant1_id = p1.id
      LEFT JOIN participants p2 ON m.participant2_id = p2.id
      LEFT JOIN participants w ON m.winner_id = w.id
      ORDER BY m.display_order ASC, m.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching matches:', err);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
};

// Generate random matches from confirmed participants
export const generateMatches = async (req, res) => {
  try {
    const { maxParticipants } = req.body || {};
    
    // Get all confirmed participants
    const participantsResult = await pool.query(
      'SELECT * FROM participants WHERE confirmed = TRUE ORDER BY RANDOM()'
    );
    const participants = participantsResult.rows;

    if (participants.length < 2) {
      return res.status(400).json({ error: 'Need at least 2 confirmed participants' });
    }

    // Limit participants to maxParticipants if provided
    const selectedParticipants = maxParticipants 
      ? participants.slice(0, Math.min(maxParticipants, participants.length))
      : participants;

    // Delete existing matches
    await pool.query('DELETE FROM matches');

    // Reset queue positions and selection status for all participants
    await pool.query('UPDATE participants SET queue_position = NULL, selection_status = NULL');

    // Assign queue positions and selection status to selected participants
    for (let i = 0; i < selectedParticipants.length; i++) {
      await pool.query(
        'UPDATE participants SET queue_position = $1, selection_status = $2 WHERE id = $3',
        [i + 1, 'selected', selectedParticipants[i].id]
      );
    }

    // Mark non-selected participants as not_selected
    const selectedIds = selectedParticipants.map(p => p.id);
    await pool.query(
      'UPDATE participants SET selection_status = $1 WHERE id != ALL($2) AND confirmed = TRUE',
      ['not_selected', selectedIds]
    );

    // Create random pairings from selected participants
    const matches = [];
    for (let i = 0; i < selectedParticipants.length; i += 2) {
      if (i + 1 < selectedParticipants.length) {
        const participant1 = selectedParticipants[i];
        const participant2 = selectedParticipants[i + 1];
        const match = await pool.query(
          `INSERT INTO matches (participant1_id, participant2_id, status, display_order) 
           VALUES ($1, $2, 'scheduled', $3) RETURNING *`,
          [participant1.id, participant2.id, Math.floor(i / 2) + 1]
        );
        matches.push(match.rows[0]);
      }
    }

    res.json(matches);
  } catch (err) {
    console.error('Error generating matches:', err);
    res.status(500).json({ error: 'Failed to generate matches' });
  }
};

// Start a match (set to in_progress) - only one match can be in progress at a time
export const startMatch = async (req, res) => {
  try {
    const { id } = req.params;

    // First, set all matches back to scheduled (except completed ones)
    await pool.query(`
      UPDATE matches
      SET status = 'scheduled'
      WHERE status = 'in_progress'
    `);

    // Then set the selected match to in_progress
    const result = await pool.query(
      `UPDATE matches
       SET status = 'in_progress'
       WHERE id = $1 AND status != 'completed'
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Match not found or already completed' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error starting match:', err);
    res.status(500).json({ error: 'Failed to start match' });
  }
};

// Update match winner and points
export const setWinner = async (req, res) => {
  try {
    const { id } = req.params;
    const { winner_id, points } = req.body;
    const result = await pool.query(
      `UPDATE matches
       SET winner_id = $1, points = $2, status = 'completed'
       WHERE id = $3 RETURNING *`,
      [winner_id, points, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating match winner:', err);
    res.status(500).json({ error: 'Failed to update match winner' });
  }
};

// Clear all matches
export const clearMatches = async (req, res) => {
  try {
    await pool.query('DELETE FROM matches');
    res.json({ message: 'All matches cleared' });
  } catch (err) {
    console.error('Error clearing matches:', err);
    res.status(500).json({ error: 'Failed to clear matches' });
  }
};

// Get leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.email,
        COALESCE(SUM(m.points), 0) as total_points,
        COUNT(m.id) as matches_played
      FROM participants p
      LEFT JOIN matches m ON (p.id = m.participant1_id OR p.id = m.participant2_id)
      WHERE p.confirmed = TRUE
      GROUP BY p.id, p.name, p.email
      ORDER BY total_points DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};
