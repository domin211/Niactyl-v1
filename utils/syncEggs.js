import axios from 'axios';
import prisma from '../utils/db.js';
import config from './config.js';

const api = axios.create({
  baseURL: `${config.pterodactyl.panelUrl}/api/application`,
  headers: {
    Authorization: `Bearer ${config.pterodactyl.adminApiKey}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export async function syncEggs() {
  try {
    const allowedNestId = config.pterodactyl.allowedNestId;
    if (!allowedNestId) throw new Error('No allowedNestId set in config.yml');

    const res = await api.get(`/nests/${allowedNestId}/eggs?include=variables`);
    const eggs = res.data.data.map(egg => {
      const variables = egg.attributes.relationships?.variables?.data || [];
      const environment = {};

      for (const variable of variables) {
        environment[variable.attributes.env_variable] = variable.attributes.default_value || '';
      }

      return {
        egg_id: egg.attributes.id,
        name: egg.attributes.name,
        nest: egg.attributes.name,
        docker_image: egg.attributes.docker_image,
        startup: egg.attributes.startup,
        environment: JSON.stringify(environment),
      };
    });

    await prisma.egg.deleteMany();
    await prisma.egg.createMany({ data: eggs });

    return eggs.length;
  } catch (err) {
    console.error('❌ Failed to sync eggs:', err.response?.data || err.message);
    throw err;
  }
}