import { newId } from '../lib/id.js';
import { loadConfig } from '../lib/config.js';
import { readCommits, isGitRepo } from '../lib/git.js';
import { claudeAvailable, claudeJSON } from '../lib/claude.js';
import { uploadUpdate } from '../lib/blob.js';
import { draftUpdatePrompt } from '../lib/prompts.js';
import { renderEmail } from '../lib/format.js';
import { deliverUpdateEmail } from '../lib/email.js';
import { appendToProjectIndex } from '../lib/project-index.js';
import type { Update, UpdateDraft } from '../lib/types.js';
import { saveUpdateLocal } from '../lib/local-store.js';

export interface SendOptions {
  since?: string;
  model?: 'sonnet' | 'opus' | 'haiku';
  dryRun?: boolean;
  limit?: string;
  noEmail?: boolean;
  from?: string;
  previewUrl?: string;
  log?: (message: string) => void;
}

export interface SendResult {
  updateId: string;
  url?: string;
  preview: { subject: string; body: string };
  commitsCount: number;
  emailDelivered?: boolean;
  emailReason?: string;
}

export async function sendCommand(opts: SendOptions = {}): Promise<SendResult> {
  const log = opts.log ?? console.log;
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

  log(`Reading commits${opts.since ? ` since ${opts.since}` : ''}...`);
  const limit = opts.limit ? Number.parseInt(opts.limit, 10) : 50;
  const commits = await readCommits(cwd, { since: opts.since, limit });

  if (commits.length === 0) {
    log('No new commits.');
    return {
      updateId: '',
      preview: { subject: '', body: '' },
      commitsCount: 0,
    };
  }

  log(`Drafting update from ${commits.length} commits...`);
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
    previewUrl: opts.previewUrl ?? config.previewUrl,
    projectToken: config.projectToken,
    notifyChannel: config.notifyChannel,
    slackWebhookSnapshot: config.notifyChannel === 'slack' ? config.slackWebhook : undefined,
    devEmailSnapshot: config.devEmail,
    stripeEnabledSnapshot: config.stripeEnabled,
    commits,
    draft,
    status: 'pending',
    replies: [],
    scopeCreepFlags: [],
  };

  const preview = renderEmail(update);

  if (opts.dryRun) {
    log('');
    log(`Subject: ${preview.subject}`);
    log('');
    log(preview.body);
    log('');
    log('(dry run — not uploaded)');
    return { updateId: update.id, preview, commitsCount: commits.length };
  }

  log('Uploading...');
  await uploadUpdate(update);
  await saveUpdateLocal(update);

  if (config.projectToken) {
    try {
      await appendToProjectIndex({
        projectToken: config.projectToken,
        projectName: config.projectName,
        updateId: update.id,
      });
    } catch (e) {
      log(`(could not update project index: ${e instanceof Error ? e.message : e})`);
    }
  }

  const url = `${config.viewerUrl}/u/${update.id}`;
  log('');
  log(`✓ Update uploaded: ${url}`);

  let emailDelivered: boolean | undefined;
  let emailReason: string | undefined;

  if (opts.noEmail) {
    log(`(--no-email — skipping delivery. Send this link to ${config.clientName}.)`);
  } else {
    log(`Delivering to ${config.clientEmail}...`);
    const result = await deliverUpdateEmail({
      update,
      to: config.clientEmail,
      from: opts.from,
      viewerUrl: config.viewerUrl,
    });
    emailDelivered = result.delivered;
    emailReason = result.reason;
    if (result.delivered) {
      log(`✓ Email delivered to ${config.clientEmail}`);
    } else {
      log(`(email not delivered: ${result.reason})`);
      log(`Send the link manually: ${url}`);
    }
  }

  return { updateId: update.id, url, preview, commitsCount: commits.length, emailDelivered, emailReason };
}
