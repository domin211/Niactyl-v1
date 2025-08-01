import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { execSync } from 'child_process';
import prisma from './utils/db.js';
import config from './utils/config.js'; // Loads sessionSecret from YAML

// Clean startup output and show an initialization message
console.clear();
console.log('🟢 Initializing Niactyl server...');

// Load Passport strategy
import './routes/auth.js';

// Route Imports
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import serverInfoRoutes from './routes/pterodactyl/serverInfo.js';
import serverCreateRoute from './routes/pterodactyl/CreateServer.js';
import serverDeleteRoute from './routes/pterodactyl/DeleteServer.js';
import serverEditRoute from './routes/pterodactyl/EditServer.js';
import editPlanRoute from './routes/pterodactyl/EditPlan.js';
import resetPasswordRoute from './routes/pterodactyl/resetPassword.js';
import dashboardRoutes from './routes/api/Dashboard.js';
import leaderboardRoutes from './routes/api/Leaderboard.js';
import teamRoutes from './routes/api/Teams.js';

import { syncEggs } from './utils/syncEggs.js';
import { syncLocations } from './utils/syncLocations.js';
import { startRenewalJob } from './utils/renewal.js';

// Automatically generate Prisma client and deploy schema on startup
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  execSync('npx prisma db push', { stdio: 'inherit' });
  console.log('✅ Prisma schema deployed');
} catch (err) {
  console.error('❌ Prisma deploy failed:', err);
}

const app = express();
app.use(express.json());

// Use session secret from config.yml
app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ✅ Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/servers', serverInfoRoutes);
app.use('/api/create-server', serverCreateRoute);
app.use('/api/servers', serverDeleteRoute);
app.use('/api/servers', serverEditRoute);
app.use('/api/servers', editPlanRoute);
app.use('/api/admin', adminRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/user', resetPasswordRoute);

// ✅ Authenticated user info route
app.get('/api/me', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { discord_id: req.user.discord.id },
    });

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
    console.log('🔄 Syncing eggs and locations...');
    const locationCount = await syncLocations();
    const eggCount = await syncEggs();
    console.log(`✅ Synced ${eggCount} eggs and ${locationCount} locations`);
  } catch (err) {
    console.error('❌ Error syncing eggs or locations:', err);
  }
})();

startRenewalJob();

// ✅ Start server
const PORT = process.env.PORT || config.server.port || 3000;
const baseUrl = config.server.url?.replace(/\/$/, '') || `http://localhost:${PORT}`;

app.listen(PORT, () => {
  console.log(`🚀 Server running on ${baseUrl}`);
  console.log('✅ Startup complete');
});
