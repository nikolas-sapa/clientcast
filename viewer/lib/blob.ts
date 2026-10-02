import { put, head } from '@vercel/blob';
import type { Update } from './types';

const PREFIX = 'updates/';

function key(id: string): string {
  return `${PREFIX}${id}.json`;
}

export async function fetchUpdate(id: string): Promise<Update | null> {
  try {
    const meta = await head(key(id));
    if (!meta) return null;
    const r = await fetch(meta.url, { cache: 'no-store' });
    if (!r.ok) return null;
    return (await r.json()) as Update;
  } catch {
    return null;
  }
}

export async function saveUpdate(update: Update): Promise<void> {
  if (update.slackWebhookSnapshot) {
    throw new Error('Slack notifications require private destination storage. Credential-bearing updates cannot be saved publicly.');
  }
  await put(key(update.id), JSON.stringify(update, null, 2), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}
