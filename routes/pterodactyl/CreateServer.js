import express from 'express';
import db from '../../utils/db.js';
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

const getPrice = (key) => parseFloat(config.renewalPricing?.[key] || 0);

// ✅ GET /meta — send all needed info to CreateServer page
router.get('/meta', async (req, res) => {
  try {
    const eggs = await db('eggs').select('egg_id as id', 'name');
    const locations = await db('locations').select('id', 'name');

    const pricing = config.renewalPricing || {};
    const limits = config.serverLimits || {
      cpu: 2000,
      memory: 32768,
      disk: 51200,
    };

    res.json({ eggs, locations, pricing, limits });
  } catch (err) {
    console.error('❌ Failed to fetch create-server meta:', err);
    res.status(500).json({ error: 'Failed to load server creation info' });
  }
});

async function getEnvironmentVariables(egg_id) {
  const egg = await db('eggs').where({ egg_id }).first();
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

  const user = await db('users').where({ discord_id: req.user.discord.id }).first();
  if (!user) return res.status(404).json({ error: 'User not found' });

  const {
    name,
    cpu,
    memory,
    disk,
    ports,
    databases,
    backups,
    egg: egg_id,
    location: location_id,
  } = req.body;

  if (!name || typeof name !== 'string' || name.length < 3) {
    return res.status(400).json({ error: 'Server name is required and must be at least 3 characters.' });
  }

  const cost = Math.round(
    cpu * getPrice('cpu') +
    memory * getPrice('memory') +
    disk * getPrice('disk') +
    ports * getPrice('port') +
    databases * getPrice('database') +
    backups * getPrice('backup')
  );

  if (user.coins < cost) {
    return res.status(400).json({ error: 'Not enough coins' });
  }

  try {
    const { egg, envVars } = await getEnvironmentVariables(egg_id);

    const payload = {
      name: name.substring(0, 48), // Pterodactyl name limit
      user: user.ptero_id,
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

    await db('users').where({ id: user.id }).update({ coins: user.coins - cost });

    await db('servers').insert({
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
      expires_at: new Date(Date.now() + config.renewalHours * 3600000),
      renewal_cost: cost,
    });

    res.json({ success: true, server });
  } catch (err) {
    console.error('❌ Failed to create server:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to create server' });
  }
});

// ✅ Needed for ESModule import
export default router;
