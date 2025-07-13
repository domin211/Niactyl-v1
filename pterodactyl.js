// utils/pterodactyl.js
import axios from 'axios';
import fs from 'fs';
import YAML from 'yaml';
import db from './db.js';

const file = fs.readFileSync('./config.yml', 'utf8');
const config = YAML.parse(file);

const api = axios.create({
  baseURL: `${config.pterodactyl.panelUrl}/api/application`,
  headers: {
    'Authorization': `Bearer ${config.pterodactyl.adminApiKey}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

export async function getUserByEmail(email) {
  const res = await api.get('/users');
  return res.data.data.find(u => u.attributes.email === email);
}

export async function createUser({ email, username, first_name = 'User', last_name = 'Discord' }) {
  const res = await api.post('/users', {
    email,
    username,
    first_name,
    last_name
  });
  return res.data.attributes;
}

export async function syncUserServers(pteroUserId) {
  try {
    console.log('🔁 Syncing servers for user ID:', pteroUserId);
    const allServers = [];

    let currentPage = 1;
    while (true) {
      const res = await api.get(`/servers?page=${currentPage}`);
      allServers.push(...res.data.data);

      if (res.data.meta.pagination.total_pages > currentPage) {
        currentPage++;
      } else {
        break;
      }
    }

    const userServers = allServers.filter(s => s.attributes.user === parseInt(pteroUserId));

    await db('servers').where({ user_id: pteroUserId }).del();

    const inserts = userServers.map(s => {
      const a = s.attributes;
      return {
        id: a.id, // ✅ Store actual Pterodactyl server ID
        uuid: a.uuid,
        identifier: a.identifier,
        name: a.name,
        cpu: a.limits.cpu,
        memory: a.limits.memory,
        disk: a.limits.disk,
        ports: a.relationships?.allocations?.data?.length || 0,
        databases: a.relationships?.databases?.data?.length || 0,
        backups: a.relationships?.backups?.data?.length || 0,
        user_id: a.user,
        expires_at: null,
        renewal_cost: 0
      };
    });

    if (inserts.length > 0) {
      await db('servers').insert(inserts);
    }

    console.log(`✅ Synced ${inserts.length} servers for user ${pteroUserId}`);
  } catch (err) {
    console.error('❌ syncUserServers failed:', err.response?.data || err.message);
  }
}

export async function createServerOnPterodactyl({ name, user_id, egg_id, location_id, cpu, memory, disk, ports, databases, backups }) {
  const egg = await db('eggs').where({ egg_id }).first();
  if (!egg) throw new Error('Egg not found');

  const environment = JSON.parse(egg.environment || '{}');
  const envVars = {};
  Object.entries(environment).slice(0, 10).forEach(([key, val]) => {
    envVars[key] = val.default ?? '';
  });

  const payload = {
    name,
    user: user_id,
    egg: egg_id,
    docker_image: egg.docker_image,
    startup: egg.startup,
    environment: envVars,
    limits: { memory, swap: 0, disk, io: 500, cpu },
    feature_limits: { databases, allocations: ports, backups },
    deploy: {
      locations: [location_id],
      dedicated_ip: false,
      port_range: []
    },
    start_on_completion: true
  };

  const res = await api.post('/servers', payload);
  return res.data;
}
