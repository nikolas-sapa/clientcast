import { describe, it, expect, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ upload: vi.fn().mockResolvedValue('https://blob.example/update'),
  config: { projectId: 'fixture', projectName: 'Fixture', clientName: 'Fixture',
    clientEmail: 'fixture@example.com', hourlyRate: 100, createdAt: '2026-01-01',
    viewerUrl: 'https://viewer.example', notifyChannel: 'email',
    slackWebhook: 'https://hooks.slack.com/services/fixture' } }));
vi.mock('../src/lib/config.js', () => ({ loadConfig: () => mocks.config }));
vi.mock('../src/lib/git.js', () => ({ isGitRepo: async () => true,
  readCommits: async () => [{ sha: 'fixture', shortSha: 'fixture', subject: 'Fixture' }] }));
vi.mock('../src/lib/claude.js', () => ({ claudeAvailable: async () => true,
  claudeJSON: async () => ({ subject: 'Fixture', body: 'Fixture', bullets: [] }) }));
vi.mock('../src/lib/blob.js', () => ({ uploadUpdate: mocks.upload }));
vi.mock('../src/lib/local-store.js', () => ({ saveUpdateLocal: vi.fn() }));
import { sendCommand } from '../src/commands/send.js';

describe('notification snapshot', () => {
  it('does not publish a retained Slack webhook when email is selected', async () => {
    await sendCommand({ noEmail: true, log: () => {} });
    expect(mocks.upload).toHaveBeenCalledOnce();
    expect(mocks.upload.mock.calls[0][0]).toMatchObject({ notifyChannel: 'email' });
    expect(mocks.upload.mock.calls[0][0].slackWebhookSnapshot).toBeUndefined();
  });
});
