import express from 'express';
import db from '../../utils/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const users = await db('users')
      .whereNotNull('ptero_username') // Make sure the username is set
      .orderBy('coins', 'desc')
      .limit(10)
      .select('ptero_username', 'coins'); // Use ptero_username

    res.json(users);
  } catch (err) {
    console.error('Failed to fetch leaderboard:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
