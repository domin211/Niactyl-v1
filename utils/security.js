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
  try {
    const apiKey = process.env.PROXYCHECK_API_KEY || '';
    const url = `https://proxycheck.io/v2/${ip}?vpn=1${apiKey ? `&key=${apiKey}` : ''}`;
    const { data } = await axios.get(url);
    if (data.status !== 'ok') return false;
    const record = data[ip];
    return record && record.proxy === 'yes';
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
