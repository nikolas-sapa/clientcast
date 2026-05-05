import { head } from '@vercel/blob';

export interface ProjectIndex {
  projectToken: string;
  projectName: string;
  updateIds: string[];
  createdAt: string;
  updatedAt: string;
}

export async function fetchProjectIndex(token: string): Promise<ProjectIndex | null> {
  try {
    const meta = await head(`projects/${token}.json`);
    if (!meta) return null;
    const r = await fetch(meta.url, { cache: 'no-store' });
    if (!r.ok) return null;
    return (await r.json()) as ProjectIndex;
  } catch {
    return null;
  }
}
