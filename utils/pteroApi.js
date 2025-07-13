import axios from 'axios';
import config from './config.js';

const pteroApi = axios.create({
  baseURL: `${config.pterodactyl.panelUrl}/api/application`,
  headers: {
    Authorization: `Bearer ${config.pterodactyl.adminApiKey}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

pteroApi.interceptors.response.use(
  res => res,
  err => {
    console.error('❌ Pterodactyl API error:', err.response?.data || err.message);
    return Promise.reject(err);
  }
);

export default pteroApi;