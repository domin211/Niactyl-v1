import express from 'express';
import db from '../../utils/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const pteroId = req.user.ptero.ptero_id;
  const servers = await db('servers').where({ user_id: pteroId });

  res.json(servers);
});

router.get('/meta', async (req, res) => {
  const eggs = await db('eggs').select();
  const locations = await db('locations').select();

  res.json({ eggs, locations });
});

export default router;
