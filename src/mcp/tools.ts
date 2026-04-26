import { z } from 'zod';
import { initCommand } from '../commands/init.js';
import { sendCommand } from '../commands/send.js';
import { listUpdatesLocal, loadUpdateLocal } from '../lib/local-store.js';
import { fetchUpdateByApi } from '../lib/blob.js';
import { loadConfig, isInitialized } from '../lib/config.js';
import { renderEmail, renderMarkdown, renderStatusLine } from '../lib/format.js';

export const InitSchema = z.object({
  projectName: z.string(),
  clientName: z.string(),
  clientEmail: z.string().email(),
  hourlyRate: z.number().nonnegative(),
  scope: z.string().optional(),
});

export async function clientInit(input: z.infer<typeof InitSchema>): Promise<string> {
  await initCommand({
    yes: true,
    projectName: input.projectName,
    clientName: input.clientName,
    clientEmail: input.clientEmail,
    hourlyRate: String(input.hourlyRate),
    scope: input.scope,
  });
  const config = loadConfig(process.cwd());
  return JSON.stringify({ ok: true, projectId: config.projectId }, null, 2);
}

export const SendSchema = z.object({
  since: z.string().optional(),
  model: z.enum(['sonnet', 'opus', 'haiku']).optional(),
  dryRun: z.boolean().optional(),
});

export async function clientSend(input: z.infer<typeof SendSchema>): Promise<string> {
  const result = await sendCommand({
    since: input.since,
    model: input.model,
    dryRun: input.dryRun,
  });
  return JSON.stringify(
    {
      ok: true,
      updateId: result.updateId,
      url: result.url,
      commitsCount: result.commitsCount,
      preview: result.preview,
    },
    null,
    2
  );
}

export const StatusSchema = z.object({
  updateId: z.string().optional(),
});

export async function clientStatus(input: z.infer<typeof StatusSchema>): Promise<string> {
  if (!isInitialized(process.cwd())) {
    return JSON.stringify({ ok: false, error: 'Project not initialized' });
  }
  const config = loadConfig(process.cwd());

  let update;
  if (input.updateId) {
    update = await loadUpdateLocal(input.updateId);
  } else {
    const recent = await listUpdatesLocal({ projectId: config.projectId, limit: 1 });
    update = recent[0] ?? null;
  }

  if (!update) {
    return JSON.stringify({ ok: false, error: 'no update found' });
  }

  // Try to refresh.
  try {
    update = await fetchUpdateByApi(update.id, config.viewerUrl);
  } catch {
    // ignore — local copy is fine
  }

  return JSON.stringify(
    {
      ok: true,
      id: update.id,
      url: `${config.viewerUrl}/u/${update.id}`,
      status: update.status,
      replies: update.replies.length,
      scopeCreepFlags: update.scopeCreepFlags,
      lastReply: update.replies[update.replies.length - 1] ?? null,
    },
    null,
    2
  );
}

export const ListSchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
  all: z.boolean().optional(),
});

export async function clientList(input: z.infer<typeof ListSchema>): Promise<string> {
  if (!isInitialized(process.cwd())) {
    return JSON.stringify({ ok: false, error: 'Project not initialized' });
  }
  const config = loadConfig(process.cwd());
  const updates = await listUpdatesLocal({
    projectId: input.all ? undefined : config.projectId,
    limit: input.limit ?? 20,
  });
  return JSON.stringify(
    {
      ok: true,
      count: updates.length,
      updates: updates.map((u) => ({
        id: u.id,
        projectName: u.projectName,
        createdAt: u.createdAt,
        status: u.status,
        summary: renderStatusLine(u),
      })),
    },
    null,
    2
  );
}

export const ExportSchema = z.object({
  updateId: z.string(),
  format: z.enum(['markdown', 'email']).optional(),
});

export async function clientExport(input: z.infer<typeof ExportSchema>): Promise<string> {
  const update = await loadUpdateLocal(input.updateId);
  if (!update) return JSON.stringify({ ok: false, error: 'not found' });
  if (input.format === 'email') {
    const e = renderEmail(update);
    return JSON.stringify({ ok: true, subject: e.subject, body: e.body });
  }
  return JSON.stringify({ ok: true, markdown: renderMarkdown(update) });
}
