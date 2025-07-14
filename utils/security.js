import prisma from './db.js';
import { isVpn as proxycheckIsVpn } from './antiVpn.js';


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
  return proxycheckIsVpn(ip);
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
  try {
    const record = await prisma.loginIp.findFirst({ where: { ip } });
    return record && record.discord_id !== discordId;
  } catch (err) {
    console.error('Failed to check alt account:', err);
    return false;
  }
}

export async function recordLoginIp(discordId, ip) {
  if (!discordId || !ip) return;
  try {
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
  } catch (err) {
    console.error('Failed to record login IP:', err);
  }
}
