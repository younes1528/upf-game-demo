import express from 'express';
import cors from 'cors';
import {
  getParticipants,
  registerParticipant,
  confirmParticipant,
  deleteParticipant,
  deleteAllParticipants,
  getParticipantByEmail
} from './routes/participants.js';
import {
  getMatches,
  generateMatches,
  startMatch,
  setWinner,
  clearMatches,
  getLeaderboard
} from './routes/matches.js';
import {
  registerAdmin,
  loginAdmin
} from './routes/admin.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// ADMIN ENDPOINTS
app.post('/api/admin/register', registerAdmin);
app.post('/api/admin/login', loginAdmin);

// PARTICIPANT ENDPOINTS
app.get('/api/participants', getParticipants);
app.post('/api/participants', registerParticipant);
app.put('/api/participants/:id/confirm', confirmParticipant);
app.delete('/api/participants/:id', deleteParticipant);
app.delete('/api/participants', deleteAllParticipants);
app.get('/api/participants/email/:email', getParticipantByEmail);

// MATCH ENDPOINTS
app.get('/api/matches', getMatches);
app.post('/api/matches/generate', generateMatches);
app.put('/api/matches/:id/start', startMatch);
app.put('/api/matches/:id/winner', setWinner);
app.delete('/api/matches', clearMatches);
app.get('/api/leaderboard', getLeaderboard);

export default app;
