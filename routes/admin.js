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

  const amount = Number(tokens);
  let newTokens = user.tokens + amount;
  await prisma.user.update({ where: { discord_id }, data: { tokens: newTokens } });

  const membership = await prisma.teamMember.findFirst({ where: { user_id: user.id } , include: { team: true } });
  if (membership && membership.team && membership.team.owner_id !== user.id) {
    const ownerId = membership.team.owner_id;
    const owner = await prisma.user.findUnique({ where: { id: ownerId } });
    if (membership.team.type === 'community') {
      // community teams transfer tokens to owner only
      newTokens = user.tokens; // revert for user
      await prisma.user.update({ where: { id: user.id }, data: { tokens: user.tokens } });
      await prisma.user.update({ where: { id: ownerId }, data: { tokens: owner.tokens + amount } });
    } else if (membership.team.type === 'friends') {
      await prisma.user.update({ where: { id: ownerId }, data: { tokens: owner.tokens + amount } });
    }
  }

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

  const amount = Number(tokens);
  await prisma.user.update({ where: { discord_id }, data: { tokens: amount } });

  const membership = await prisma.teamMember.findFirst({ where: { user_id: user.id }, include: { team: true } });
  if (membership && membership.team && membership.team.owner_id !== user.id) {
    const owner = await prisma.user.findUnique({ where: { id: membership.team.owner_id } });
    if (membership.team.type === 'community') {
      await prisma.user.update({ where: { id: membership.team.owner_id }, data: { tokens: amount } });
      await prisma.user.update({ where: { id: user.id }, data: { tokens: 0 } });
    } else if (membership.team.type === 'friends') {
      await prisma.user.update({ where: { id: membership.team.owner_id }, data: { tokens: owner.tokens + amount } });
    }
  }

  res.json({ success: true });
});

export default router;
