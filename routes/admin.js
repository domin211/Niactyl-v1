import express from 'express';
import prisma from '../utils/db.js';

const router = express.Router();

router.post('/add-tokens', async (req, res) => {
  const { discord_id, tokens } = req.body;

  if (!req.isAuthenticated?.() || !req.user?.ptero?.is_admin) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  if (!discord_id || isNaN(tokens)) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const user = await prisma.user.findUnique({ where: { discord_id } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const newTokens = user.tokens + Number(tokens);
  await prisma.user.update({ where: { discord_id }, data: { tokens: newTokens } });

  res.json({ success: true, newTokens });
});

router.post('/set-tokens', async (req, res) => {
  const { discord_id, tokens } = req.body;

  if (!req.isAuthenticated?.() || !req.user?.ptero?.is_admin) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  if (!discord_id || isNaN(tokens)) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const user = await prisma.user.findUnique({ where: { discord_id } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  await prisma.user.update({ where: { discord_id }, data: { tokens: Number(tokens) } });

  res.json({ success: true });
});

router.post('/blacklist', async (req, res) => {
  const { discord_id, ip } = req.body;

  if (!req.isAuthenticated?.() || !req.user?.ptero?.is_admin) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  if (!discord_id && !ip) {
    return res.status(400).json({ error: 'discord_id or ip required' });
  }

  const exists = await prisma.blacklist.findFirst({
    where: { OR: [discord_id ? { discord_id } : undefined, ip ? { ip } : undefined].filter(Boolean) },
  });

  if (!exists) {
    await prisma.blacklist.create({ data: { discord_id, ip } });
  }

  res.json({ success: true });
});

router.post('/unblacklist', async (req, res) => {
  const { discord_id, ip } = req.body;

  if (!req.isAuthenticated?.() || !req.user?.ptero?.is_admin) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  if (!discord_id && !ip) {
    return res.status(400).json({ error: 'discord_id or ip required' });
  }

  await prisma.blacklist.deleteMany({
    where: { OR: [discord_id ? { discord_id } : undefined, ip ? { ip } : undefined].filter(Boolean) },
  });

  res.json({ success: true });
});

export default router;
