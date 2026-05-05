import { put, head } from '@vercel/blob';

export interface ProjectIndex {
  projectToken: string;
  projectName: string;
  updateIds: string[];
  createdAt: string;
  updatedAt: string;
}

const PREFIX = 'projects/';

function key(token: string): string {
  return `${PREFIX}${token}.json`;
}

export async function fetchProjectIndex(token: string): Promise<ProjectIndex | null> {
  try {
    const meta = await head(key(token));
    if (!meta) return null;
    const r = await fetch(meta.url, { cache: 'no-store' });
    if (!r.ok) return null;
    return (await r.json()) as ProjectIndex;
  } catch {
    return null;
  }
}

export async function appendToProjectIndex(args: {
  projectToken: string;
  projectName: string;
  updateId: string;
  blobToken?: string;
}): Promise<void> {
  const blobToken = args.blobToken ?? process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) throw new Error('BLOB_READ_WRITE_TOKEN required for project index');

  const existing = await fetchProjectIndex(args.projectToken);
  const now = new Date().toISOString();

  const next: ProjectIndex = existing
    ? {
        ...existing,
        projectName: args.projectName,
        updateIds: existing.updateIds.includes(args.updateId)
          ? existing.updateIds
          : [args.updateId, ...existing.updateIds],
        updatedAt: now,
      }
    : {
        projectToken: args.projectToken,
        projectName: args.projectName,
        updateIds: [args.updateId],
        createdAt: now,
        updatedAt: now,
      };

  await put(key(args.projectToken), JSON.stringify(next, null, 2), {
    access: 'public',
    contentType: 'application/json',
    token: blobToken,
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}
