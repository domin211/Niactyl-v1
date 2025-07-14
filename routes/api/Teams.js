import express from 'express';
import prisma from '../../utils/db.js';
import config from '../../utils/config.js';

const router = express.Router();

// Get teams for current user
router.get('/', async (req, res) => {
  if (!req.isAuthenticated?.()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const user = await prisma.user.findUnique({ where: { discord_id: req.user.discord.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const memberships = await prisma.teamMember.findMany({
      where: { user_id: user.id },
      include: { team: true }
    });

    res.json({ teams: memberships.map(m => ({
      id: m.team.id,
      name: m.team.name,
      type: m.team.type,
      can_edit: m.can_edit,
      owner_id: m.team.owner_id
    })) });
  } catch (err) {
    console.error('Failed to list teams:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new team
router.post('/create', async (req, res) => {
  if (!req.isAuthenticated?.()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { name, type } = req.body;
  if (!name || !['friends', 'community'].includes(type)) {
    return res.status(400).json({ error: 'Invalid name or type' });
  }
  try {
    const user = await prisma.user.findUnique({ where: { discord_id: req.user.discord.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const existing = await prisma.team.findFirst({ where: { owner_id: user.id } });
    if (existing) return res.status(400).json({ error: 'Already owns a team' });

    const team = await prisma.team.create({ data: { name, type, owner_id: user.id } });
    await prisma.teamMember.create({ data: { team_id: team.id, user_id: user.id, can_edit: true } });
    res.json({ success: true, team });
  } catch (err) {
    console.error('Failed to create team:', err);
    res.status(500).json({ error: 'Failed to create team' });
  }
});

// Join a team by ID
router.post('/:id/join', async (req, res) => {
  if (!req.isAuthenticated?.()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const teamId = parseInt(req.params.id, 10);
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) return res.status(404).json({ error: 'Team not found' });

    const user = await prisma.user.findUnique({ where: { discord_id: req.user.discord.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const membership = await prisma.teamMember.findFirst({ where: { user_id: user.id, team_id: teamId } });
    if (membership) return res.status(400).json({ error: 'Already a member' });

    await prisma.teamMember.create({ data: { team_id: teamId, user_id: user.id } });
    res.json({ success: true });
  } catch (err) {
    console.error('Join team failed:', err);
    res.status(500).json({ error: 'Failed to join team' });
  }
});

// Leave a team
router.post('/:id/leave', async (req, res) => {
  if (!req.isAuthenticated?.()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const teamId = parseInt(req.params.id, 10);
    const user = await prisma.user.findUnique({ where: { discord_id: req.user.discord.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    await prisma.teamMember.deleteMany({ where: { user_id: user.id, team_id: teamId } });
    res.json({ success: true });
  } catch (err) {
    console.error('Leave team failed:', err);
    res.status(500).json({ error: 'Failed to leave team' });
  }
});

export default router;
