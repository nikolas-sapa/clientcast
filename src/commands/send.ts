import { newId } from '../lib/id.js';
import { loadConfig } from '../lib/config.js';
import { readCommits, isGitRepo } from '../lib/git.js';
import { claudeAvailable, claudeJSON } from '../lib/claude.js';
import { uploadUpdate } from '../lib/blob.js';
import { draftUpdatePrompt } from '../lib/prompts.js';
import { renderEmail } from '../lib/format.js';
import type { Update, UpdateDraft } from '../lib/types.js';
import { saveUpdateLocal } from '../lib/local-store.js';

export interface SendOptions {
  since?: string;
  model?: 'sonnet' | 'opus' | 'haiku';
  dryRun?: boolean;
  limit?: string;
}

export interface SendResult {
  updateId: string;
  url?: string;
  preview: { subject: string; body: string };
  commitsCount: number;
}

export async function sendCommand(opts: SendOptions = {}): Promise<SendResult> {
  const cwd = process.cwd();
  const config = loadConfig(cwd);

  if (!(await isGitRepo(cwd))) {
    throw new Error('Not a git repository. clientcast reads commits from git.');
  }
  if (!(await claudeAvailable())) {
    throw new Error(
      `'claude' CLI not found on PATH. Install Claude Code first: https://claude.com/claude-code`
    );
  }

  console.log(`Reading commits${opts.since ? ` since ${opts.since}` : ''}...`);
  const limit = opts.limit ? Number.parseInt(opts.limit, 10) : 50;
  const commits = await readCommits(cwd, { since: opts.since, limit });

  if (commits.length === 0) {
    console.log('No new commits.');
    return {
      updateId: '',
      preview: { subject: '', body: '' },
      commitsCount: 0,
    };
  }

  console.log(`Drafting update from ${commits.length} commits...`);
  const draft = await claudeJSON<UpdateDraft>(draftUpdatePrompt(config, commits), {
    model: opts.model ?? 'sonnet',
  });

  const update: Update = {
    id: newId(),
    projectId: config.projectId,
    projectName: config.projectName,
    clientName: config.clientName,
    createdAt: new Date().toISOString(),
    sinceRef: opts.since ?? '',
    scopeDocSnapshot: config.scopeDoc,
    hourlyRateSnapshot: config.hourlyRate,
    commits,
    draft,
    status: 'pending',
    replies: [],
    scopeCreepFlags: [],
  };

  const preview = renderEmail(update);

  if (opts.dryRun) {
    console.log('');
    console.log(`Subject: ${preview.subject}`);
    console.log('');
    console.log(preview.body);
    console.log('');
    console.log('(dry run — not uploaded)');
    return { updateId: update.id, preview, commitsCount: commits.length };
  }

  console.log('Uploading...');
  await uploadUpdate(update);
  await saveUpdateLocal(update);

  const url = `${config.viewerUrl}/u/${update.id}`;
  console.log('');
  console.log(`✓ Update ready: ${url}`);
  console.log(`Send this link to ${config.clientName} for review.`);

  return { updateId: update.id, url, preview, commitsCount: commits.length };
}
