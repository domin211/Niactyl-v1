import express from 'express';
import prisma from '../../utils/db.js';
import fs from 'fs';
import YAML from 'yaml';
import axios from 'axios';

const router = express.Router();
const config = YAML.parse(fs.readFileSync('./config.yml', 'utf8'));

const api = axios.create({
  baseURL: `${config.pterodactyl.panelUrl}/api/application`,
  headers: {
    Authorization: `Bearer ${config.pterodactyl.adminApiKey}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

const plans = config.plans || {};
const freePlanKey = Object.keys(plans).find(key => plans[key].price === 0);

// ✅ GET /meta — send all needed info to CreateServer page
router.get('/meta', async (req, res) => {
  try {
    const eggs = await prisma.egg.findMany({ select: { egg_id: true, name: true } });
    const locations = await prisma.location.findMany({ select: { id: true, name: true } });
    res.json({ eggs, locations, plans });
  } catch (err) {
    console.error('❌ Failed to fetch create-server meta:', err);
    res.status(500).json({ error: 'Failed to load server creation info' });
  }
});

async function getEnvironmentVariables(egg_id) {
  if (!egg_id || isNaN(Number(egg_id))) {
    throw new Error('Invalid egg selected');
  }
  const egg = await prisma.egg.findUnique({ where: { egg_id: Number(egg_id) } });
  if (!egg) throw new Error('Invalid egg selected');

  let parsed;
  try {
    parsed = JSON.parse(egg.environment || '{}');
  } catch (e) {
    console.error('❌ Failed to parse environment JSON:', e);
    parsed = {};
  }

  console.log('🌱 Environment variables used:', parsed);
  return { egg, envVars: parsed };
}

router.post('/create', async (req, res) => {
  if (!req.isAuthenticated?.() || !req.user?.discord?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = await prisma.user.findUnique({ where: { discord_id: req.user.discord.id } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const userServers = await prisma.server.count({ where: { user_id: user.id } });
  if (config.limits?.maxServersPerUser && userServers >= config.limits.maxServersPerUser) {
    return res.status(400).json({ error: 'User server limit reached' });
  }

  const membership = await prisma.teamMember.findFirst({ where: { user_id: user.id } });
  if (membership && config.limits?.maxServersPerTeam) {
    const teamCount = await prisma.server.count({ where: { team_id: membership.team_id } });
    if (teamCount >= config.limits.maxServersPerTeam) {
      return res.status(400).json({ error: 'Team server limit reached' });
    }
  }

  const {
    name,
    plan: planName,
    egg: egg_id,
    location: location_id,
    eulaAccepted,
  } = req.body;

  if (!name || typeof name !== 'string' || name.length < 3) {
    return res.status(400).json({ error: 'Server name is required and must be at least 3 characters.' });
  }

  if (!eulaAccepted) {
    return res.status(400).json({ error: 'You must accept the Minecraft EULA.' });
  }

  const selectedPlan = plans[planName];
  if (!selectedPlan) return res.status(400).json({ error: 'Invalid plan selected' });

  if (!selectedPlan.eggs.includes(Number(egg_id))) {
    return res.status(400).json({ error: 'Egg not allowed for selected plan' });
  }

  let planToUse = selectedPlan;
  let finalPlanName = planName;
  if (user.tokens < selectedPlan.price && freePlanKey) {
    planToUse = plans[freePlanKey];
    finalPlanName = freePlanKey;
  }

  try {
    const { egg, envVars } = await getEnvironmentVariables(egg_id);

    const { cpu, memory, disk, ports, backups, databases } = planToUse.resources;
    const payload = {
      name: name.substring(0, 48),
      user: user.id,
      egg: egg_id,
      docker_image: egg.docker_image,
      startup: egg.startup,
      environment: envVars,
      limits: {
        memory,
        swap: 0,
        disk,
        io: 500,
        cpu,
      },
      feature_limits: {
        databases,
        allocations: ports,
        backups,
      },
      deploy: {
        locations: [location_id],
        dedicated_ip: false,
        port_range: [],
      },
      start_on_completion: true,
    };

    const response = await api.post('/servers', payload);
    const server = response.data.attributes;

    await prisma.user.update({ where: { id: user.id }, data: { tokens: { decrement: planToUse.price } } });

    await prisma.server.create({ data: {
      id: server.id,
      uuid: server.uuid,
      identifier: server.identifier,
      name: server.name,
      cpu,
      memory,
      disk,
      ports,
      databases,
      backups,
      user_id: user.id,
      team_id: membership?.team_id || null,
      plan: finalPlanName,
      expires_at: new Date(Date.now() + config.renewalHours * 3600000),
      renewal_cost: planToUse.price,
    }});

    res.json({ success: true, server });
  } catch (err) {
    console.error('❌ Failed to create server:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to create server' });
  }
});

// ✅ Needed for ESModule import
export default router;
