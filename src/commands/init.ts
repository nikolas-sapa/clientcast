import { existsSync, readFileSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { resolve } from 'node:path';
import { newId, newShortId } from '../lib/id.js';
import { saveConfig, configPath, isInitialized } from '../lib/config.js';
import type { ProjectConfig } from '../lib/types.js';

const DEFAULT_VIEWER_URL =
  process.env.CLIENTCAST_VIEWER_URL ?? 'https://clientcast.vercel.app';

interface InitOptions {
  yes?: boolean;
  projectName?: string;
  clientName?: string;
  clientEmail?: string;
  hourlyRate?: string;
  scope?: string;
  devEmail?: string;
  previewUrl?: string;
  slackWebhook?: string;
  notifyChannel?: 'email' | 'slack' | 'none';
  stripeEnabled?: boolean;
}

export async function initCommand(opts: InitOptions = {}): Promise<void> {
  const cwd = process.cwd();
  if (isInitialized(cwd)) {
    console.log(`Already initialized at ${configPath(cwd)}`);
    return;
  }

  let projectName = opts.projectName ?? '';
  let clientName = opts.clientName ?? '';
  let clientEmail = opts.clientEmail ?? '';
  let rateStr = opts.hourlyRate ?? '';
  let scopeAnswer = opts.scope ?? '';
  let devEmail = opts.devEmail ?? '';
  let previewUrl = opts.previewUrl ?? '';
  let slackWebhook = opts.slackWebhook ?? '';

  if (!opts.yes) {
    const rl = createInterface({ input, output });
    try {
      if (!projectName) projectName = await rl.question('Project name: ');
      if (!clientName) clientName = await rl.question('Client name: ');
      if (!clientEmail) clientEmail = await rl.question('Client email: ');
      if (!rateStr) rateStr = await rl.question('Your hourly rate ($): ');
      if (!scopeAnswer) {
        scopeAnswer = await rl.question(
          'Path to scope doc (or paste inline, blank to skip): '
        );
      }
      if (!devEmail) devEmail = await rl.question('Your email (for reply notifications, blank to skip): ');
      if (!previewUrl) previewUrl = await rl.question('Live preview URL (e.g. Vercel deploy, blank to skip): ');
      if (!slackWebhook) slackWebhook = await rl.question('Slack webhook URL (blank to skip): ');
    } finally {
      rl.close();
    }
  }

  if (!projectName || !clientName || !clientEmail) {
    throw new Error('projectName, clientName, and clientEmail are required.');
  }

  let scopeDoc: string | undefined;
  if (scopeAnswer) {
    const asPath = resolve(cwd, scopeAnswer);
    if (existsSync(asPath)) {
      scopeDoc = readFileSync(asPath, 'utf8');
    } else {
      scopeDoc = scopeAnswer;
    }
  }

  const notifyChannel = opts.notifyChannel ?? (slackWebhook ? 'slack' : devEmail ? 'email' : 'none');

  const config: ProjectConfig = {
    projectId: newId(),
    projectName,
    clientName,
    clientEmail,
    hourlyRate: Number.parseFloat(rateStr) || 0,
    scopeDoc,
    devEmail: devEmail || undefined,
    previewUrl: previewUrl || undefined,
    slackWebhook: slackWebhook || undefined,
    notifyChannel,
    stripeEnabled: opts.stripeEnabled,
    projectToken: newShortId(),
    viewerUrl: DEFAULT_VIEWER_URL,
    createdAt: new Date().toISOString(),
  };

  saveConfig(cwd, config);
  console.log(`✓ Initialized clientcast`);
  console.log(`  Project ID:    ${config.projectId}`);
  console.log(`  Project token: ${config.projectToken} (for /projects dashboard)`);
  console.log(`  Config:        ${configPath(cwd)}`);
  console.log(``);
  console.log(`Next: make some commits, then run 'clientcast send'`);
}
