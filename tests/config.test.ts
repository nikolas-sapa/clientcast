import { describe, it, expect, beforeEach } from 'vitest';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadConfig, saveConfig, configPath, isInitialized } from '../src/lib/config.js';
import type { ProjectConfig } from '../src/lib/types.js';

function makeConfig(overrides: Partial<ProjectConfig> = {}): ProjectConfig {
  return {
    projectId: 'abc123',
    projectName: 'Test Project',
    clientName: 'Alice',
    clientEmail: 'alice@example.com',
    hourlyRate: 100,
    viewerUrl: 'https://example.com',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('config', () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'cc-config-'));
  });

  it('saves and loads a valid config', () => {
    const config = makeConfig();
    saveConfig(dir, config);
    expect(loadConfig(dir)).toEqual(config);
  });

  it('isInitialized returns false before save, true after', () => {
    expect(isInitialized(dir)).toBe(false);
    saveConfig(dir, makeConfig());
    expect(isInitialized(dir)).toBe(true);
  });

  it('throws a helpful error when config is missing', () => {
    expect(() => loadConfig(dir)).toThrow(/not initialized/);
  });

  it('rejects invalid config shape', () => {
    writeFileSync(configPath(dir), '{"bad":true}');
    expect(() => loadConfig(dir)).toThrow();
  });

  it('rejects invalid email', () => {
    writeFileSync(configPath(dir), JSON.stringify(makeConfig({ clientEmail: 'not-email' })));
    expect(() => loadConfig(dir)).toThrow();
  });

  it('rejects negative hourly rate', () => {
    writeFileSync(configPath(dir), JSON.stringify(makeConfig({ hourlyRate: -10 })));
    expect(() => loadConfig(dir)).toThrow();
  });
});
