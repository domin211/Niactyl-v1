import express from 'express';
import {
  getLinkvertiseCooldown,
  generateLinkvertiseURL,
  rewardLinkvertiseUser,
} from '../../utils/linkvertise.js';

import {
  getLinkpaysCooldown,
  generateLinkpaysURL,
  rewardLinkpaysUser,
} from '../../utils/linkpays.js';

import prisma from '../../utils/db.js';

const router = express.Router();

router.get('/cooldowns', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Unauthorized' });

  const userId = req.user.discord.id;
  res.json({
    linkvertise: getLinkvertiseCooldown(userId) || { cooldown: false },
    linkpays: getLinkpaysCooldown(userId) || { cooldown: false },
  });
});

router.get('/gen/linkvertise', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Unauthorized' });

  const userId = req.user.discord.id;
  const cooldown = getLinkvertiseCooldown(userId);
  if (cooldown) return res.status(429).json({ error: 'Cooldown active', ...cooldown });

  try {
    const url = generateLinkvertiseURL(userId, req.get('host'));
    res.json({ url });
  } catch (err) {
    console.error('❌ Error generating Linkvertise URL:', err);
    res.status(500).json({ error: 'Failed to generate Linkvertise URL' });
  }
});

router.get('/reward/linkvertise', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).send('Not authenticated');

  const userId = req.user.discord.id;
  try {
    const coins = rewardLinkvertiseUser(userId);
    await prisma.user.update({ where: { discord_id: userId }, data: { coins: { increment: coins } } });
    res.redirect('/dashboard');
  } catch (err) {
    console.error('❌ Reward error:', err);
    res.status(500).send('Failed to reward user');
  }
});

router.get('/gen/linkpays', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Unauthorized' });

  const userId = req.user.discord.id;
  const cooldown = getLinkpaysCooldown(userId);
  if (cooldown) return res.status(429).json({ error: 'Cooldown active', ...cooldown });

  try {
    const url = await generateLinkpaysURL(userId, req.get('host'));
    res.json({ url });
  } catch (err) {
    console.error('❌ Error generating Linkpays URL:', err);
    res.status(500).json({ error: 'Failed to generate Linkpays URL' });
  }
});

router.get('/reward/linkpays', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).send('Not authenticated');

  const userId = req.user.discord.id;
  try {
    const coins = rewardLinkpaysUser(userId);
    await prisma.user.update({ where: { discord_id: userId }, data: { coins: { increment: coins } } });
    res.redirect('/dashboard');
  } catch (err) {
    console.error('❌ Reward error:', err);
    res.status(500).send('Failed to reward user');
  }
});

export default router;
