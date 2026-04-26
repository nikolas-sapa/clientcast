import { loadConfig } from '../lib/config.js';
import { fetchUpdateByApi } from '../lib/blob.js';
import { loadUpdateLocal, saveUpdateLocal, listUpdatesLocal } from '../lib/local-store.js';
import { formatFlag } from '../lib/format.js';
import type { Update } from '../lib/types.js';

export async function statusCommand(id?: string): Promise<void> {
  const cwd = process.cwd();
  const config = loadConfig(cwd);

  let target: Update | null = null;
  if (id) {
    target = (await loadUpdateLocal(id)) ?? null;
  } else {
    const recent = await listUpdatesLocal({ projectId: config.projectId, limit: 1 });
    target = recent[0] ?? null;
  }

  if (!target) {
    console.log(id ? `Update ${id} not found locally.` : 'No updates yet.');
    return;
  }

  // Refresh from server.
  try {
    const remote = await fetchUpdateByApi(target.id, config.viewerUrl);
    await saveUpdateLocal(remote);
    target = remote;
  } catch {
    console.log(`(could not reach ${config.viewerUrl} — showing local copy)`);
  }

  console.log('');
  console.log(`${target.projectName} — ${target.draft.subject}`);
  console.log(`ID: ${target.id}`);
  console.log(`Status: ${target.status}`);
  console.log(`URL: ${config.viewerUrl}/u/${target.id}`);
  console.log('');

  if (target.replies.length === 0) {
    console.log('No replies yet.');
    return;
  }

  console.log(`${target.replies.length} repl${target.replies.length === 1 ? 'y' : 'ies'}:`);
  for (const r of target.replies) {
    console.log('');
    console.log(`  [${r.classification.category} · ${r.classification.confidence}] ${r.signerName ?? 'anonymous'}`);
    console.log(`  ${r.classification.reasoning}`);
    if (r.classification.actionItems.length > 0) {
      console.log(`  Action items:`);
      for (const a of r.classification.actionItems) console.log(`    - ${a}`);
    }
  }

  if (target.scopeCreepFlags.length > 0) {
    const total = target.scopeCreepFlags.reduce((s, f) => s + f.estimatedCost, 0);
    console.log('');
    console.log(`Scope creep flagged — ${target.scopeCreepFlags.length} item${target.scopeCreepFlags.length === 1 ? '' : 's'}, ~$${total.toLocaleString()} total:`);
    for (const f of target.scopeCreepFlags) console.log(formatFlag(f));
  }
}
