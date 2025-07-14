import axios from 'axios';
import prisma from './db.js';

const DISCORD_EPOCH = 1420070400000n;

export function getAccountAgeDays(discordId) {
  try {
    const idBig = BigInt(discordId);
    const timestamp = Number((idBig >> 22n) + DISCORD_EPOCH);
    const ageMs = Date.now() - timestamp;
    return ageMs / (1000 * 60 * 60 * 24);
  } catch {
    return Infinity;
  }
}

export async function isVpn(ip) {
  if (!ip) return false;
  let cleanIp = ip;
  if (cleanIp.startsWith('::ffff:')) {
    cleanIp = cleanIp.substring(7);
  }

  try {
    const { data } = await axios.get(
      `http://ip-api.com/json/${cleanIp}?fields=status,proxy,hosting`
    );
    return data.status === 'success' && (data.proxy || data.hosting);
  } catch (err) {
    console.error('VPN check failed:', err.message);
    return false;
  }
}

export async function isBlacklisted({ discordId, ip }) {
  return await prisma.blacklist.findFirst({
    where: {
      OR: [
        discordId ? { discord_id: discordId } : undefined,
        ip ? { ip } : undefined,
      ].filter(Boolean),
    },
  });
}

export async function isAltAccount(discordId, ip) {
  if (!discordId || !ip) return false;
  const record = await prisma.loginIp.findFirst({ where: { ip } });
  return record && record.discord_id !== discordId;
}

export async function recordLoginIp(discordId, ip) {
  if (!discordId || !ip) return;
  const existing = await prisma.loginIp.findFirst({ where: { ip } });
  if (existing) {
    if (existing.discord_id === discordId) {
      await prisma.loginIp.update({
        where: { id: existing.id },
        data: { last_used: new Date() },
      });
    }
    return;
  }
  await prisma.loginIp.create({ data: { discord_id: discordId, ip } });
}
