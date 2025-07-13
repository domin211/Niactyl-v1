import axios from 'axios';
import config from './config.js';

const TOKEN = config.linkpays?.token;
const REWARD_COINS = config.linkpays?.reward_coins || 50;
const COOLDOWN_MS = (config.linkpays?.cooldown_hours || 24) * 60 * 60 * 1000;

const cooldownMap = new Map();

export function getLinkpaysCooldown(discordId) {
  const last = cooldownMap.get(discordId);
  if (!last) return null;

  const now = Date.now();
  const diff = now - last;

  if (diff < COOLDOWN_MS) {
    return {
      cooldown: true,
      remaining: COOLDOWN_MS - diff,
      readable: `${Math.ceil((COOLDOWN_MS - diff) / 60000)} minutes`
    };
  }

  return null;
}

export async function generateLinkpaysURL(discordId, host) {
  if (!TOKEN) throw new Error('Missing Linkpays token.');

  const target = `https://${host}/api/earn/reward/linkpays`;
  const apiUrl = `https://linkpays.in/api?api=${TOKEN}&url=${encodeURIComponent(target)}&alias=lp-${discordId}`;

  const res = await axios.get(apiUrl);
  if (res.data.status !== 'success' || !res.data.shortenedUrl) {
    throw new Error(res.data.message || 'URL is invalid.');
  }

  return res.data.shortenedUrl;
}

export function rewardLinkpaysUser(discordId) {
  cooldownMap.set(discordId, Date.now());
  return REWARD_COINS;
}
