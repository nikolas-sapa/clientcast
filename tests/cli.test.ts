import { afterEach, describe, it, expect, vi } from 'vitest';

const send = vi.hoisted(() => vi.fn().mockResolvedValue({ updateId: 'test' }));
vi.mock('../src/commands/send.js', () => ({ sendCommand: send }));
const originalArgv = process.argv;

afterEach(() => {
  process.argv = originalArgv;
  send.mockClear();
});

describe('send email flag', () => {
  it.each([[['--no-email'], true], [[], false]] as const)(
    'maps actual CLI options %j to noEmail=%s', async (flags, noEmail) => {
      vi.resetModules();
      process.argv = ['node', 'clientcast', 'send', ...flags];
      await import('../src/cli.js');
      await vi.waitFor(() => expect(send).toHaveBeenCalledOnce());
      expect(send.mock.calls[0][0]).toMatchObject({ noEmail });
    }
  );
});
