import fs from 'fs';
import YAML from 'yaml';

const file = fs.readFileSync('./config.yml', 'utf8');
const config = YAML.parse(file);

// Provide sensible defaults for server and frontend URLs
config.server = config.server || { url: 'http://localhost:3000', port: 3000 };
config.frontend = config.frontend || { url: 'http://localhost:5173' };

// Expose URLs/ports as env vars for convenience
if (!process.env.PORT && config.server.port) {
  process.env.PORT = config.server.port;
}
if (!process.env.FRONTEND_URL && config.frontend.url) {
  process.env.FRONTEND_URL = config.frontend.url;
}

// Build Discord callback URL from server.url if not explicitly set
if (!config.discord.callbackUrl && config.server.url) {
  config.discord.callbackUrl = `${config.server.url}/api/auth/discord/callback`;
}

// If a database section is provided, build the DATABASE_URL automatically
if (!process.env.DATABASE_URL && config.database) {
  const { user, password, host = 'localhost', port = 5432, name } = config.database;
  if (user && name) {
    const cred = password ? `${encodeURIComponent(user)}:${encodeURIComponent(password)}` : encodeURIComponent(user);
    process.env.DATABASE_URL = `postgresql://${cred}@${host}:${port}/${name}`;
  }
}

export default config;
