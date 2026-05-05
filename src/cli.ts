#!/usr/bin/env node
import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { sendCommand } from './commands/send.js';
import { listCommand } from './commands/list.js';
import { statusCommand } from './commands/status.js';
import { previewCommand } from './commands/preview.js';
import { exportCommand } from './commands/export.js';
import { configCommand } from './commands/config.js';

const program = new Command();

program
  .name('clientcast')
  .description('AI-drafted client updates from your Git commits. Hosted approval. Scope-creep alerts.')
  .version('0.1.0');

program
  .command('init')
  .description('Initialize clientcast in this project')
  .option('-y, --yes', 'non-interactive — use flag values')
  .option('--project-name <name>', 'project name')
  .option('--client-name <name>', 'client name')
  .option('--client-email <email>', 'client email')
  .option('--hourly-rate <rate>', 'hourly rate in USD')
  .option('--scope <pathOrText>', 'path to scope doc or inline scope text')
  .action(initCommand);

program
  .command('send')
  .description('Generate, upload, and email a client update')
  .option('--since <ref>', 'git ref or date to start from')
  .option('--model <model>', 'claude model (sonnet|opus|haiku)', 'sonnet')
  .option('--limit <n>', 'max commits to include', '50')
  .option('--dry-run', 'print update without uploading')
  .option('--no-email', 'skip email delivery (just upload)')
  .option('--from <addr>', 'override the From: address (default uses RESEND_API_KEY default)')
  .action(async (opts) => { await sendCommand(opts); });

program
  .command('list')
  .description('List recent updates for this project')
  .option('--limit <n>', 'max items', '20')
  .option('--all', 'show updates across all projects')
  .action(listCommand);

program
  .command('status [id]')
  .description('Show status of an update (latest if id omitted)')
  .action(statusCommand);

program
  .command('preview')
  .description('Preview the next update without uploading')
  .option('--since <ref>', 'git ref or date to start from')
  .option('--model <model>', 'claude model', 'sonnet')
  .option('--limit <n>', 'max commits', '50')
  .action(previewCommand);

program
  .command('export <id>')
  .description('Export an update as markdown or email')
  .option('--format <fmt>', 'markdown|email', 'markdown')
  .option('--out <path>', 'write to file instead of stdout')
  .action(exportCommand);

program
  .command('config')
  .description('Show current project config')
  .action(configCommand);

program.parseAsync().catch((e: Error) => {
  console.error(e.message);
  process.exit(1);
});
