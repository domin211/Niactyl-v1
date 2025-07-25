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
import {
  getAccountAgeDays,
  isVpn,
  isBlacklisted,
  isAltAccount,
  recordLoginIp,
} from '../utils/security.js';

dotenv.config();

const router = express.Router();

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new DiscordStrategy({
  clientID: config.discord.clientId,
  clientSecret: config.discord.clientSecret,
  callbackURL: config.discord.callbackUrl,
  scope: ['identify', 'email'],
  passReqToCallback: true,
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    const discordId = profile.id;
    const email = profile.email;
    const username = profile.username;

    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0] || req.ip;

    if (await isVpn(ip)) {
      return done(null, false, { message: 'VPN or proxy detected' });
    }

    if (await isBlacklisted({ discordId, ip })) {
      return done(null, false, { message: 'User is blacklisted' });
    }

    if (await isAltAccount(discordId, ip)) {
      return done(null, false, { message: 'IP already used by another account' });
    }

    if (getAccountAgeDays(discordId) < 7) {
      return done(null, false, { message: 'Account too new' });
    }

    let user = await prisma.user.findUnique({ where: { discord_id: discordId } });

    if (!user) {
      const pteroUser = await getOrCreatePteroUser(email, username, discordId);

      const userDetails = await pteroApi.get(`/users/${pteroUser.id}`);
      const isAdmin = userDetails.data?.attributes?.root_admin === true;

      user = await prisma.user.create({
        data: {
          id: typeof pteroUser.id === 'string' ? parseInt(pteroUser.id, 10) : pteroUser.id, // Ensure type matches your Prisma model!
          discord_id: discordId,
          discord_email: email,
          ptero_username: pteroUser.username,
          is_admin: isAdmin,
        }
      });
    }

    console.log('🔁 Syncing all servers from Pterodactyl...');
    await syncAllServers();
    console.log('✅ Server sync complete.');

    await recordLoginIp(discordId, ip);

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
    const frontend = process.env.FRONTEND_URL || config.frontend.url || 'http://localhost:5173';
    const redirectTo = `${frontend.replace(/\/$/, '')}/dashboard`;
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
