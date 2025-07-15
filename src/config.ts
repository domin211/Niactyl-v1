export const APP_NAME = 'Firecone';
export const BRAND_COLOR = '#fc6b05';
export const DISCORD_COLOR = '#5865F2';
export const TOS_URL = 'https://firecone.eu/terms';
export const PANEL_URL = 'https://panel.firecone.eu';

const env = typeof import.meta !== 'undefined' ? (import.meta as any).env : process.env;
export const API_BASE_URL = env?.VITE_API_BASE_URL || 'http://localhost:3000';
export const FRONTEND_URL = env?.VITE_FRONTEND_URL || 'http://localhost:5173';

