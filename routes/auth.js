// routes/auth.js
import express from 'express';
import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';
import dotenv from 'dotenv';

import prisma from '../utils/db.js';
import config from '../utils/config.js';
import pteroApi from '../utils/pteroApi.js';
import { getOrCreatePteroUser } from './pterodactyl/syncUsers.js';
import { syncAllServers } from './pterodactyl/syncServers.js';

dotenv.config();

const router = express.Router();

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new DiscordStrategy({
  clientID: config.discord.clientId,
  clientSecret: config.discord.clientSecret,
  callbackURL: config.discord.callbackUrl,
  scope: ['identify', 'email'], // <--- Hardcoded scopes
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const discordId = profile.id;
    const email = profile.email;
    const username = profile.username;

    let user = await prisma.user.findUnique({ where: { discord_id: discordId } });

    if (!user) {
      const pteroUser = await getOrCreatePteroUser(email, username, discordId);

      const userDetails = await pteroApi.get(`/users/${pteroUser.id}`);
      const isAdmin = userDetails.data?.attributes?.root_admin === true;

      user = await prisma.user.create({
        data: {
          discord_id: discordId,
          discord_email: email,
          ptero_id: pteroUser.id,
          ptero_username: pteroUser.username,
          is_admin: isAdmin,
        }
      });
    }

    console.log('🔁 Syncing all servers from Pterodactyl...');
    await syncAllServers(); // ✅ Full server sync
    console.log('✅ Server sync complete.');

    return done(null, { discord: profile, ptero: user });
  } catch (err) {
    console.error('Auth error:', err);
    return done(err, null);
  }
}));

router.get('/discord', passport.authenticate('discord'));

router.get('/discord/callback',
  passport.authenticate('discord', {
    failureRedirect: '/auth',
    session: true,
  }),
  (req, res) => {
    const redirectTo = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`;
    res.redirect(redirectTo);
  }
);

router.get('/logout', (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.sendStatus(200);
    });
  });
});

export default router;
