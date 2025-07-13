import fs from 'fs';
import YAML from 'yaml';

const file = fs.readFileSync('./config.yml', 'utf8');
const config = YAML.parse(file);

// If a database section is provided, build the DATABASE_URL automatically
if (!process.env.DATABASE_URL && config.database) {
  const { user, password, host = 'localhost', port = 5432, name } = config.database;
  if (user && name) {
    const cred = password ? `${encodeURIComponent(user)}:${encodeURIComponent(password)}` : encodeURIComponent(user);
    process.env.DATABASE_URL = `postgresql://${cred}@${host}:${port}/${name}`;
  }
}

export default config;
