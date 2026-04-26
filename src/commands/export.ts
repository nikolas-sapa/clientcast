import { writeFileSync } from 'node:fs';
import { loadUpdateLocal } from '../lib/local-store.js';
import { renderEmail, renderMarkdown } from '../lib/format.js';

export interface ExportOptions {
  format?: 'markdown' | 'email';
  out?: string;
}

export async function exportCommand(id: string, opts: ExportOptions = {}): Promise<void> {
  const update = await loadUpdateLocal(id);
  if (!update) throw new Error(`Update ${id} not found locally.`);

  const fmt = opts.format ?? 'markdown';
  let content: string;
  if (fmt === 'email') {
    const e = renderEmail(update);
    content = `Subject: ${e.subject}\n\n${e.body}`;
  } else {
    content = renderMarkdown(update);
  }

  if (opts.out) {
    writeFileSync(opts.out, content);
    console.log(`Wrote ${opts.out}`);
  } else {
    console.log(content);
  }
}
