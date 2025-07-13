import config from './config.js';

const LV_USER_ID = config.linkvertise?.id;
const REWARD_COINS = config.linkvertise?.reward_coins || 50;
const COOLDOWN_MS = (config.linkvertise?.cooldown_hours || 1) * 60 * 60 * 1000;

const cooldownMap = new Map();

export function getLinkvertiseCooldown(discordId) {
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

export function generateLinkvertiseURL(discordId, host) {
  if (!LV_USER_ID) throw new Error('Missing Linkvertise ID in config.');

  const target = `https://${host}/api/earn/reward/linkvertise`;
  const encodedTarget = encodeURIComponent(btoa(target));
  const random = Math.floor(500 + Math.random() * 500); // pseudo-random number for visual

  return `https://linkvertise.com/${LV_USER_ID}/${random}/dynamic?r=${encodedTarget}&o=sharing`;
}

export function rewardLinkvertiseUser(discordId) {
  cooldownMap.set(discordId, Date.now());
  return REWARD_COINS;
}
