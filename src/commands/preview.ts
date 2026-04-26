import { sendCommand } from './send.js';

export interface PreviewOptions {
  since?: string;
  model?: 'sonnet' | 'opus' | 'haiku';
  limit?: string;
}

export async function previewCommand(opts: PreviewOptions = {}): Promise<void> {
  await sendCommand({ ...opts, dryRun: true });
}
