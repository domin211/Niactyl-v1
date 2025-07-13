import fs from 'fs';
import YAML from 'yaml';

const file = fs.readFileSync('./config.yml', 'utf8');
const config = YAML.parse(file);

export default config;