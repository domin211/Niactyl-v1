import express from 'express';
import prisma from '../../utils/db.js';
import pteroApi from '../../utils/pteroApi.js';
import fs from 'fs';
import YAML from 'yaml';

const router = express.Router();
const config = YAML.parse(fs.readFileSync('./config.yml', 'utf8'));
const plans = config.plans || {};
const freePlanKey = Object.keys(plans).find(key => plans[key].price === 0);

router.post('/:id/edit-plan', async (req, res) => {
  if (!req.isAuthenticated?.() || !req.user?.discord?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const serverId = req.params.id;
  const { plan: planName } = req.body;
  const selectedPlan = plans[planName];
  if (!selectedPlan) return res.status(400).json({ error: 'Invalid plan selected' });

  try {
    const server = await prisma.server.findUnique({ where: { id: Number(serverId) } });
    if (!server) return res.status(404).json({ error: 'Server not found' });

    const user = await prisma.user.findUnique({ where: { discord_id: req.user.discord.id } });
    if (!user || user.id !== server.user_id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    let planToUse = selectedPlan;
    let finalPlanName = planName;
    if (user.tokens < selectedPlan.price && freePlanKey) {
      planToUse = plans[freePlanKey];
      finalPlanName = freePlanKey;
    }

    await pteroApi.patch(`/servers/${serverId}/build`, {
      limits: {
        memory: planToUse.resources.memory,
        swap: 0,
        disk: planToUse.resources.disk,
        io: 500,
        cpu: planToUse.resources.cpu,
      },
      feature_limits: {
        databases: planToUse.resources.databases,
        allocations: planToUse.resources.ports,
        backups: planToUse.resources.backups,
      },
    });

    if (planToUse.price > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: { tokens: { decrement: planToUse.price } },
      });
    }

    await prisma.server.update({
      where: { id: Number(serverId) },
      data: {
        plan: finalPlanName,
        cpu: planToUse.resources.cpu,
        memory: planToUse.resources.memory,
        disk: planToUse.resources.disk,
        ports: planToUse.resources.ports,
        databases: planToUse.resources.databases,
        backups: planToUse.resources.backups,
        renewal_cost: planToUse.price,
        expires_at: new Date(Date.now() + (config.renewalHours || 24) * 3600000),
      },
    });

    res.json({ success: true, plan: finalPlanName });
  } catch (err) {
    console.error('❌ Failed to edit plan:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to update plan' });
  }
});

export default router;
