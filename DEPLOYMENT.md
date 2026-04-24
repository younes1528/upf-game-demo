# Deployment Guide

## Local Development

### Prerequisites
- Node.js installed
- PostgreSQL database (Neon or other)

### Setup
1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
DATABASE_URL='your_neon_database_url'
PORT=5000
```

3. Start backend server:
```bash
npm run server
```

4. Start frontend dev server:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173 (or 5174 if 5173 is in use)
- Backend API: http://localhost:5000

## Vercel Deployment

### Prerequisites
- GitHub account
- Vercel account
- PostgreSQL database (Neon recommended)

### Step 1: Prepare Your Code
The project is already configured for Vercel deployment:
- `api/index.js` - Vercel serverless function entry point
- `vercel.json` - Vercel configuration
- `src/config/api.js` - API URL configuration (auto-detects production)

### Step 2: Push to GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### Step 3: Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended)
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will automatically detect the configuration
5. Click "Deploy"

#### Option B: Using Vercel CLI
```bash
npm install -g vercel
vercel
```

### Step 4: Add Environment Variables
After deployment, add the database URL in Vercel:
1. Go to your project settings in Vercel
2. Navigate to "Environment Variables"
3. Add:
   - Name: `DATABASE_URL`
   - Value: Your Neon PostgreSQL connection string
4. Redeploy the project

### Step 5: Verify Deployment
- Visit your Vercel URL
- Test registration and admin functionality
- Check that API calls work correctly

## Project Structure

```
tp0/
├── api/
│   └── index.js          # Vercel serverless function entry
├── server/
│   ├── db.js             # Database connection & initialization
│   ├── app.js            # Express app with routes
│   ├── index.js          # Local server entry point
│   └── routes/
│       ├── participants.js
│       ├── matches.js
│       └── admin.js
├── src/
│   ├── components/
│   │   ├── Register.jsx
│   │   ├── Register.css
│   │   ├── Dashboard.jsx
│   │   ├── Dashboard.css
│   │   ├── ParticipantLogin.jsx
│   │   ├── ParticipantLogin.css
│   │   ├── WaitingPage.jsx
│   │   └── WaitingPage.css
│   ├── config/
│   │   └── api.js        # API configuration
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env                  # Environment variables (not in git)
├── .gitignore
├── package.json
├── vercel.json           # Vercel configuration
└── vite.config.js
```

## API Endpoints

### Participants
- `GET /api/participants` - Get all participants
- `POST /api/participants` - Register new participant
- `PUT /api/participants/:id/confirm` - Confirm participant
- `DELETE /api/participants/:id` - Delete participant
- `DELETE /api/participants` - Delete all participants
- `GET /api/participants/email/:email` - Get participant by email

### Matches
- `GET /api/matches` - Get all matches
- `POST /api/matches/generate` - Generate random test pairs
- `PUT /api/matches/:id/start` - Start a test
- `PUT /api/matches/:id/winner` - Set winner and points
- `DELETE /api/matches` - Clear all matches
- `GET /api/leaderboard` - Get leaderboard

### Admin
- `POST /api/admin/register` - Register admin
- `POST /api/admin/login` - Admin login

## Important Notes

- **Database**: PostgreSQL is required. Neon is recommended for Vercel deployment
- **Environment Variables**: Never commit `.env` file to git
- **API URL**: In production, API calls use relative URLs (same domain)
- **Database Initialization**: Tables are automatically created on first connection
- **Queue System**: Participants get queue positions when selected for testing
- **Selection Status**: Participants can be 'selected' or 'not_selected' for each round

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct in Vercel environment variables
- Ensure your PostgreSQL database allows connections from Vercel's IP ranges
- Check database logs for connection attempts

### API Not Working
- Verify `vercel.json` is configured correctly
- Check Vercel function logs for errors
- Ensure all dependencies are in `package.json`

### Build Failures
- Check that Node.js version is compatible
- Verify all imports are correct (ES modules)
- Check for any missing dependencies
