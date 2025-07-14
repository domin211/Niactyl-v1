import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { load } from 'js-yaml';

const configPath = path.resolve(process.cwd(), 'config.yml');
const config = load(fs.readFileSync(configPath, 'utf8')) || {};
const apiKeys = Array.isArray(config.proxycheck?.apiKeys) ? config.proxycheck.apiKeys : [];
let keyIndex = 0;

function getNextKey() {
  if (apiKeys.length === 0) return undefined;
  const key = apiKeys[keyIndex];
  keyIndex = (keyIndex + 1) % apiKeys.length;
  return key;
}

function normalizeIp(ip) {
  if (typeof ip !== 'string') return '';
  return ip.startsWith('::ffff:') ? ip.slice(7) : ip;
}

const cache = new Map();
const CACHE_TTL = 48 * 60 * 60 * 1000; // 48 hours

export async function isVpn(ip) {
  if (!ip) return false;
  const cleanIp = normalizeIp(ip);
  const cached = cache.get(cleanIp);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.result;
  }

  const params = new URLSearchParams({ vpn: '1', asn: '1', risk: '1' });
  const key = getNextKey();
  if (key) params.set('key', key);
  const url = `https://proxycheck.io/v2/${cleanIp}?${params.toString()}`;

  try {
    const { data } = await axios.get(url, { timeout: 5000 });
    const result = data[cleanIp] || {};
    const risk = Number(result.risk) || 0;
    const isProxy =
      result.proxy === 'yes' ||
      result.type === 'VPN' ||
      result.type === 'Tor' ||
      risk > 75;
    cache.set(cleanIp, { result: isProxy, expiresAt: Date.now() + CACHE_TTL });
    return isProxy;
  } catch (err) {
    console.error('ProxyCheck API error:', err.message);
    return true; // fail closed
  }
}

export default { isVpn };
