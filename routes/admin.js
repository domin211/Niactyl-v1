import express from 'express';
import prisma from '../utils/db.js';

const router = express.Router();

router.post('/add-coins', async (req, res) => {
  const { discord_id, coins } = req.body;

  if (!req.isAuthenticated?.() || !req.user?.ptero?.is_admin) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  if (!discord_id || isNaN(coins)) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const user = await prisma.user.findUnique({ where: { discord_id } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const newCoins = user.coins + Number(coins);
  await prisma.user.update({ where: { discord_id }, data: { coins: newCoins } });

  res.json({ success: true, newCoins });
});

export default router;
