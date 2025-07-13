import db from '../../utils/db.js';
import pteroApi from '../../utils/pteroApi.js';

export async function syncAllServers() {
  try {
    console.log('🔁 Syncing all servers from Pterodactyl...');

    const allServers = [];

    // Pagination support
    let page = 1;
    let lastPage = 1;

    do {
      const res = await pteroApi.get(`/servers?page=${page}`);
      const data = res.data;

      allServers.push(...data.data);
      lastPage = data.meta.pagination.total_pages;
      page++;
    } while (page <= lastPage);

    const inserts = allServers.map(s => {
      const a = s.attributes;
      return {
        id: a.id, // Pterodactyl server ID
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

    await db('servers').del();
    await db('servers').insert(inserts);

    console.log(`✅ Synced ${inserts.length} servers to local DB`);
  } catch (err) {
    console.error('❌ Failed to sync all servers:', err.response?.data || err.message);
  }
}
