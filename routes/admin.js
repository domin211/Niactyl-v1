import express from 'express';
import db from '../utils/db.js';

const router = express.Router();

router.post('/add-coins', async (req, res) => {
  const { discord_id, coins } = req.body;

  if (!req.isAuthenticated?.() || !req.user?.ptero?.is_admin) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  if (!discord_id || isNaN(coins)) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const user = await db('users').where({ discord_id }).first();
  if (!user) return res.status(404).json({ error: 'User not found' });

  const newCoins = user.coins + Number(coins);
  await db('users').where({ discord_id }).update({ coins: newCoins });

  res.json({ success: true, newCoins });
});

export default router;
