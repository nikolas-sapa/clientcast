import { put, head } from '@vercel/blob';
import type { Update } from './types.js';

const PREFIX = 'updates/';

function blobKey(id: string): string {
  return `${PREFIX}${id}.json`;
}

export interface BlobOptions {
  token?: string;
}

export async function uploadUpdate(update: Update, opts: BlobOptions = {}): Promise<string> {
  const token = opts.token ?? process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error(
      'BLOB_READ_WRITE_TOKEN is not set. Get one from https://vercel.com/dashboard/stores'
    );
  }
  const result = await put(blobKey(update.id), JSON.stringify(update, null, 2), {
    access: 'public',
    contentType: 'application/json',
    token,
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  return result.url;
}

export async function fetchUpdateByApi(id: string, viewerUrl: string): Promise<Update> {
  const r = await fetch(`${viewerUrl}/api/update/${id}`);
  if (!r.ok) throw new Error(`Update ${id} not found at ${viewerUrl}`);
  return r.json() as Promise<Update>;
}

export async function fetchUpdateByBlob(id: string, opts: BlobOptions = {}): Promise<Update | null> {
  const token = opts.token ?? process.env.BLOB_READ_WRITE_TOKEN;
  try {
    const meta = await head(blobKey(id), token ? { token } : undefined);
    const r = await fetch(meta.url);
    if (!r.ok) return null;
    return (await r.json()) as Update;
  } catch {
    return null;
  }
}
