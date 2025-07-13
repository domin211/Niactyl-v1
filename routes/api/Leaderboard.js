import express from 'express';
import prisma from '../../utils/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { NOT: { ptero_username: null } },
      orderBy: { coins: 'desc' },
      take: 10,
      select: { ptero_username: true, coins: true },
    });

    res.json(users);
  } catch (err) {
    console.error('Failed to fetch leaderboard:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
