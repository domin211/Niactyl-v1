import axios from 'axios';
import prisma from './db.js';

const vpnCache = new Map();
const VPN_CACHE_TTL = 172800000; // 2 days in ms

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

  const cached = vpnCache.get(cleanIp);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.result;
  }

  try {
    const { data } = await axios.get(
      `http://ip-api.com/json/${cleanIp}?fields=status,proxy,hosting`
    );
    const isProxy = data.status === 'success' && (data.proxy || data.hosting);
    vpnCache.set(cleanIp, {
      result: isProxy,
      expiresAt: Date.now() + VPN_CACHE_TTL,
    });
    return isProxy;
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
