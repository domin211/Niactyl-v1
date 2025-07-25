import express from 'express';
import prisma from '../../utils/db.js';
import pteroApi from '../../utils/pteroApi.js';

const router = express.Router();

router.delete('/:id', async (req, res) => {
  const serverId = req.params.id;

  try {
    const server = await prisma.server.findUnique({ where: { id: Number(serverId) } });
    if (!server) return res.status(404).json({ error: 'Server not found' });

    await pteroApi.delete(`/servers/${serverId}`);
    await prisma.server.delete({ where: { id: Number(serverId) } });

    res.json({ success: true });
  } catch (err) {
    console.error('❌ Failed to delete server:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to delete server' });
  }
});

export default router;
