import axios from 'axios';
import prisma from './db.js';
import config from './config.js';

const api = axios.create({
  baseURL: `${config.pterodactyl.panelUrl}/api/application`,
  headers: {
    Authorization: `Bearer ${config.pterodactyl.adminApiKey}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export async function syncLocations() {
  try {
    console.log('📦 Syncing locations...');
    const res = await api.get('/locations');

    const locations = res.data.data.map(loc => ({
      id: loc.attributes.id, // Use real Pterodactyl ID in `id` column
      name: loc.attributes.short || 'Unnamed',
    }));

    await prisma.location.deleteMany();
    await prisma.location.createMany({ data: locations });
    console.log(`✅ Synced ${locations.length} locations`);
  } catch (err) {
    console.error('❌ Failed to sync locations:', err.response?.data || err.message);
  }
}
