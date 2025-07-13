import express from 'express';
import prisma from '../../utils/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const discordId = req.user.discord.id;
    const user = await prisma.user.findUnique({ where: { discord_id: discordId } });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const servers = await prisma.server.findMany({
      where: { user_id: user.ptero_id },
      select: { name: true, identifier: true, cpu: true, memory: true, disk: true, renewal_cost: true },
    });

    const spending = servers.reduce((sum, srv) => sum + (srv.renewal_cost || 0), 0);

    let enoughTime = '∞';
    if (user.coins && spending > 0) {
      const minutes = Math.floor(user.coins / (spending / 1440));
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      enoughTime = `${hours}h ${mins}m`;
    }

    res.json({
      coins: user.coins,
      spending,
      enoughTime,
      ptero_username: user.username, // ✅ for topbar and profile
      is_admin: !!user.is_admin,     // ✅ for Layout/Admin routes
      discord: {
        id: req.user.discord.id,
        avatar: req.user.discord.avatar,
      },
      servers,
    });
  } catch (err) {
    console.error('❌ Error loading dashboard:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
