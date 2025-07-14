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

    // Use user.id if you've unified on Pterodactyl ID as the primary key
    const servers = await prisma.server.findMany({
      where: { user_id: user.id },
      select: {
        id: true,              // <-- Key fix: select id!
        name: true,
        identifier: true,
        cpu: true,
        memory: true,
        disk: true,
        renewal_cost: true,
      },
    });

    const spending = servers.reduce((sum, srv) => sum + (srv.renewal_cost || 0), 0);

    let enoughTime = '∞';
    if (user.tokens && spending > 0) {
      const minutes = Math.floor(user.tokens / (spending / 1440));
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      enoughTime = `${hours}h ${mins}m`;
    }

    res.json({
      tokens: user.tokens,
      spending,
      enoughTime,
      ptero_username: user.ptero_username, // Or whatever field is correct in your User model
      is_admin: !!user.is_admin,
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
