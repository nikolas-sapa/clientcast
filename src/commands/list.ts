import { loadConfig } from '../lib/config.js';
import { listUpdatesLocal } from '../lib/local-store.js';
import { renderStatusLine } from '../lib/format.js';

export interface ListOptions {
  limit?: string;
  all?: boolean;
}

export async function listCommand(opts: ListOptions = {}): Promise<void> {
  const cwd = process.cwd();
  const config = loadConfig(cwd);
  const limit = opts.limit ? Number.parseInt(opts.limit, 10) : 20;
  const updates = await listUpdatesLocal({
    projectId: opts.all ? undefined : config.projectId,
    limit,
  });

  if (updates.length === 0) {
    console.log('No updates yet. Run `clientcast send`.');
    return;
  }

  for (const u of updates) {
    const date = new Date(u.createdAt).toISOString().slice(0, 10);
    console.log(`${u.id}  ${date}  ${renderStatusLine(u)}`);
  }
}
