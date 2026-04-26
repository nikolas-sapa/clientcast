import { loadConfig, configPath } from '../lib/config.js';

export async function configCommand(): Promise<void> {
  const cwd = process.cwd();
  const config = loadConfig(cwd);
  console.log(`Config: ${configPath(cwd)}`);
  console.log('');
  console.log(JSON.stringify({ ...config, scopeDoc: config.scopeDoc ? '<redacted>' : undefined }, null, 2));
}
