import { describe, it, expect, vi } from 'vitest';
import type { Update } from '../src/lib/types.js';

const put = vi.hoisted(() => vi.fn().mockResolvedValue({ url: 'https://blob.example/update.json' }));
vi.mock('@vercel/blob', () => ({ put, head: vi.fn() }));
import { uploadUpdate } from '../src/lib/blob.js';
import { saveUpdate } from '../viewer/lib/blob.js';

describe('public update persistence', () => {
  it.each([
    (update: Update) => uploadUpdate(update, { token: 'fixture-token' }),
    (update: Update) => saveUpdate(update),
  ])('blocks webhook credentials before put', async (write) => {
    put.mockClear();
    const update = { id: 'update', slackWebhookSnapshot: 'https://hooks.slack.com/services/fixture' } as Update;
    await expect(write(update)).rejects.toThrow(/Slack.*private/i);
    expect(put).not.toHaveBeenCalled();
  });
});
