import express from 'express';
import prisma from '../../utils/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const pteroId = req.user.ptero.id;
  const servers = await prisma.server.findMany({ where: { user_id: pteroId } });

  res.json(servers);
});

router.get('/:id', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const serverId = Number(req.params.id);
  if (isNaN(serverId)) return res.status(400).json({ error: 'Invalid id' });

  const pteroId = req.user.ptero.id;
  const server = await prisma.server.findFirst({
    where: { id: serverId, user_id: pteroId }
  });

  if (!server) return res.status(404).json({ error: 'Server not found' });

  res.json(server);
});

router.get('/meta', async (req, res) => {
  const eggs = await prisma.egg.findMany();
  const locations = await prisma.location.findMany();

  res.json({ eggs, locations });
});

export default router;
