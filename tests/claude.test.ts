import { describe, it, expect, vi, beforeEach } from 'vitest';
const mocks = vi.hoisted(() => ({ execa: vi.fn() }));
vi.mock('execa', () => ({ execa: mocks.execa }));
import { claudeJSON, claudeText } from '../src/lib/claude.js';
import { detectScopeCreep } from '../src/lib/scope-creep.js';

function reply(result: string, key: 'result' | 'text' = 'result') {
  mocks.execa.mockResolvedValueOnce({ stdout: JSON.stringify({ [key]: result }) });
}

describe('claude wrapper', () => {
  beforeEach(() => mocks.execa.mockReset());

  it('passes model and prompt to the claude binary', async () => {
    reply('  hi  ');
    expect(await claudeText('draft this', { model: 'haiku' })).toBe('hi');
    const [bin, args] = mocks.execa.mock.calls[0];
    expect(bin).toBe('claude');
    expect(args).toEqual(['--output-format=json', '--print', '--model', 'haiku', 'draft this']);
  });

  it('falls back to the text field', async () => {
    reply('from text', 'text');
    expect(await claudeText('p')).toBe('from text');
  });

  it('parses fenced JSON over surrounding prose', async () => {
    reply('Here you go:\n```json\n{"category":"approve","confidence":"high"}\n```\nThanks {x}');
    expect(await claudeJSON('p')).toEqual({ category: 'approve', confidence: 'high' });
  });

  it('parses a bare object and a bare array', async () => {
    reply('Result: {"a":1}');
    expect(await claudeJSON('p')).toEqual({ a: 1 });
    reply('[{"description":"x","estimatedHours":2}]');
    expect(await claudeJSON('p')).toEqual([{ description: 'x', estimatedHours: 2 }]);
  });

  it('throws with a snippet when no JSON is returned', async () => {
    reply('I cannot help with that.');
    await expect(claudeJSON('p')).rejects.toThrow(/did not return parseable JSON[\s\S]*cannot help/);
  });
});

describe('detectScopeCreep', () => {
  beforeEach(() => mocks.execa.mockReset());

  it('skips Claude entirely without a scope doc', async () => {
    const flags = await detectScopeCreep({ scopeDoc: undefined, hourlyRate: 100, replyId: 'r1', replyText: 'add Spanish' });
    expect(flags).toEqual([]);
    expect(mocks.execa).not.toHaveBeenCalled();
  });

  it('attaches ids and the reply id to every flag', async () => {
    reply('```json\n[{"description":"Spanish site","estimatedHours":8,"estimatedCost":960,"rationale":"not in scope","severity":"major"}]\n```');
    const flags = await detectScopeCreep({ scopeDoc: '# Scope', hourlyRate: 120, replyId: 'r1', replyText: 'add Spanish' });
    expect(flags).toHaveLength(1);
    expect(flags[0]).toMatchObject({ description: 'Spanish site', estimatedHours: 8, estimatedCost: 960, severity: 'major', replyId: 'r1' });
    expect(flags[0].id).toMatch(/\S+/);
  });
});
