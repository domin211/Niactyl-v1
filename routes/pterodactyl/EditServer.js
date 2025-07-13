import express from 'express';
import prisma from '../../utils/db.js';
import pteroApi from '../../utils/pteroApi.js';

const router = express.Router();

router.patch('/:id', async (req, res) => {
  const serverId = req.params.id;
  const { cpu, memory, disk } = req.body;

  try {
    await pteroApi.patch(`/servers/${serverId}/build`, {
      limits: {
        memory,
        swap: 0,
        disk,
        io: 500,
        cpu,
      }
    });

    await prisma.server.update({ where: { id: Number(serverId) }, data: { cpu, memory, disk } });
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Failed to edit server:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to update server' });
  }
});

export default router;
