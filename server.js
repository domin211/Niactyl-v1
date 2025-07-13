import express from 'express';
import session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';
import db from './utils/db.js';
import config from './utils/config.js';

import './routes/auth.js'; // Initializes passport strategy

// Route Imports
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import serverInfoRoutes from './routes/pterodactyl/serverInfo.js';
import serverCreateRoute from './routes/pterodactyl/CreateServer.js';
import serverDeleteRoute from './routes/pterodactyl/DeleteServer.js';
import serverEditRoute from './routes/pterodactyl/EditServer.js';
import resetPasswordRoute from './routes/pterodactyl/resetPassword.js';
import dashboardRoutes from './routes/api/Dashboard.js';
import leaderboardRoutes from './routes/api/Leaderboard.js';
import earnRoutes from './routes/api/earn.js';

import { syncEggs } from './utils/syncEggs.js';
import { syncLocations } from './utils/syncLocations.js';

dotenv.config();

const app = express();
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ✅ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/servers', serverInfoRoutes);
app.use('/api/create-server', serverCreateRoute); // ✅ Fixed mount path
app.use('/api/servers', serverDeleteRoute);
app.use('/api/servers', serverEditRoute);
app.use('/api/admin', adminRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/earn', earnRoutes);
app.use('/api/user', resetPasswordRoute); // ✅ Password reset

// ✅ Authenticated user info
app.get('/api/me', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const user = await db('users').where({ discord_id: req.user.discord.id }).first();
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      discord: req.user.discord,
      created_at: user.created_at,
      is_admin: !!user.is_admin,
    });
  } catch (err) {
    console.error('❌ Failed to fetch user info:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ Sync eggs & locations on startup
(async () => {
  try {
    await syncLocations();
    await syncEggs();
    console.log('✅ Eggs and locations synced');
  } catch (err) {
    console.error('❌ Error syncing eggs or locations:', err);
  }
})();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
