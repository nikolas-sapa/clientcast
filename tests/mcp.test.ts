import { describe, it, expect } from 'vitest';
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { resolve, join } from 'node:path';

describe('MCP stdio', () => {
  it('keeps init progress off the real protocol stream', async () => {
    const cwd = mkdtempSync(join(resolve('..'), 'clientcast-mcp-regression-'));
    const child = spawn(process.execPath, ['--import', resolve('node_modules/tsx/dist/loader.mjs'),
      resolve('src/mcp/server.ts')], { cwd, stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stderr.on('data', (data) => { stderr += data.toString(); });
    try {
      await new Promise<void>((resolveDone, reject) => {
        const timer = setTimeout(() => reject(new Error(`MCP timeout: ${stderr}`)), 5000);
        child.once('error', (error) => { clearTimeout(timer); reject(error); });
        child.once('exit', () => { clearTimeout(timer); reject(new Error(`MCP exited: ${stderr}`)); });
        child.stdout.on('data', (data) => {
          stdout += data.toString();
          if (stdout.split('\n').some((line) => {
            try { return JSON.parse(line).id === 2; } catch { return false; }
          })) { clearTimeout(timer); resolveDone(); }
        });
        const messages = [
          { jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2024-11-05',
            capabilities: {}, clientInfo: { name: 'local-regression', version: '1.0' } } },
          { jsonrpc: '2.0', method: 'notifications/initialized' },
          { jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'client_init',
            arguments: { projectName: 'Fixture', clientName: 'Fixture',
              clientEmail: 'fixture@example.com', hourlyRate: 100 } } },
        ];
        child.stdin.write(messages.map((message) => JSON.stringify(message)).join('\n') + '\n');
      });
      const lines = stdout.trim().split('\n');
      const messages = lines.map((line) => JSON.parse(line));
      expect(messages).toHaveLength(2);
      expect(messages.find((message) => message.id === 2).isError).not.toBe(true);
      expect(stderr).toContain('Initialized clientcast');
    } finally {
      child.kill('SIGTERM');
    }
  });
});
