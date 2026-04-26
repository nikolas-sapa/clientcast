import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import type { Update } from './types.js';

const STORE_DIR = join(homedir(), '.clientcast', 'updates');

function ensureDir(): void {
  if (!existsSync(STORE_DIR)) mkdirSync(STORE_DIR, { recursive: true });
}

export async function saveUpdateLocal(update: Update): Promise<string> {
  ensureDir();
  const path = join(STORE_DIR, `${update.id}.json`);
  writeFileSync(path, JSON.stringify(update, null, 2));
  return path;
}

export async function loadUpdateLocal(id: string): Promise<Update | null> {
  const path = join(STORE_DIR, `${id}.json`);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf8')) as Update;
}

export async function listUpdatesLocal(opts: { projectId?: string; limit?: number } = {}): Promise<Update[]> {
  ensureDir();
  const files = readdirSync(STORE_DIR).filter((f) => f.endsWith('.json'));
  const updates: Update[] = [];
  for (const f of files) {
    try {
      const u = JSON.parse(readFileSync(join(STORE_DIR, f), 'utf8')) as Update;
      if (!opts.projectId || u.projectId === opts.projectId) updates.push(u);
    } catch {
      // ignore corrupt files
    }
  }
  updates.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return opts.limit ? updates.slice(0, opts.limit) : updates;
}
