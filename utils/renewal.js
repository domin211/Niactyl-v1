import prisma from './db.js';
import pteroApi from './pteroApi.js';
import config from './config.js';

const plans = config.plans || {};
const freePlanKey = Object.keys(plans).find(key => plans[key].price === 0);
const renewalMs = (config.renewalHours || 24) * 3600000;
const deleteMs = (config.deleteInactiveDays || 7) * 86400000;

export async function processRenewals() {
  const now = new Date();
  const servers = await prisma.server.findMany({
    where: {
      expires_at: { lte: now }
    }
  });

  for (const server of servers) {
    if (server.expires_at && now - server.expires_at >= deleteMs) {
      try {
        await pteroApi.delete(`/servers/${server.id}`);
      } catch (err) {
        console.error('❌ Failed to delete inactive server:', err.response?.data || err.message);
      }
      await prisma.server.delete({ where: { id: server.id } });
      continue;
    }

    const user = await prisma.user.findUnique({ where: { id: server.user_id } });
    if (!user) continue;

    if (user.tokens >= (server.renewal_cost || 0)) {
      if (server.renewal_cost) {
        await prisma.user.update({
          where: { id: user.id },
          data: { tokens: { decrement: server.renewal_cost } }
        });
      }

      await prisma.server.update({
        where: { id: server.id },
        data: { expires_at: new Date(now.getTime() + renewalMs) }
      });
      continue;
    }

    if (freePlanKey && server.plan !== freePlanKey) {
      const freePlan = plans[freePlanKey];

      await pteroApi.patch(`/servers/${server.id}/build`, {
        limits: {
          memory: freePlan.resources.memory,
          swap: 0,
          disk: freePlan.resources.disk,
          io: 500,
          cpu: freePlan.resources.cpu
        },
        feature_limits: {
          databases: freePlan.resources.databases,
          allocations: freePlan.resources.ports,
          backups: freePlan.resources.backups
        }
      });

      await prisma.server.update({
        where: { id: server.id },
        data: {
          plan: freePlanKey,
          cpu: freePlan.resources.cpu,
          memory: freePlan.resources.memory,
          disk: freePlan.resources.disk,
          ports: freePlan.resources.ports,
          databases: freePlan.resources.databases,
          backups: freePlan.resources.backups,
          renewal_cost: freePlan.price,
          expires_at: server.expires_at
        }
      });
    } else {
      await prisma.server.update({
        where: { id: server.id },
        data: { expires_at: server.expires_at }
      });
    }
  }
}

export function startRenewalJob() {
  setInterval(processRenewals, 60 * 60 * 1000);
}
