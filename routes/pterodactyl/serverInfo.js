import express from 'express';
import prisma from '../../utils/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const pteroId = req.user.ptero.ptero_id;
  const servers = await prisma.server.findMany({ where: { user_id: pteroId } });

  res.json(servers);
});

router.get('/meta', async (req, res) => {
  const eggs = await prisma.egg.findMany();
  const locations = await prisma.location.findMany();

  res.json({ eggs, locations });
});

export default router;
