import express from 'express';
import prisma from '../../utils/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    let users = await prisma.user.findMany({
      orderBy: { coins: 'desc' },
      take: 10,
      select: { ptero_username: true, coins: true },
    });

    // Remove users where ptero_username is null, undefined, or empty string
    users = users.filter(u => !!u.ptero_username);

    res.json(users);
  } catch (err) {
    console.error('Failed to fetch leaderboard:', err);
    res.status(500).json([]);
  }
});

export default router;
