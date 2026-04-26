import { describe, it, expect } from 'vitest';
import { renderEmail, renderMarkdown, renderStatusLine, formatFlag } from '../src/lib/format.js';
import type { Update } from '../src/lib/types.js';

function makeUpdate(overrides: Partial<Update> = {}): Update {
  return {
    id: 'u1',
    projectId: 'p1',
    projectName: 'Acme Site',
    clientName: 'Bob',
    createdAt: new Date('2026-04-26').toISOString(),
    sinceRef: '',
    hourlyRateSnapshot: 100,
    commits: [
      { sha: 'a'.repeat(40), shortSha: 'a'.repeat(7), author: 'me', date: '', subject: 'fix nav', body: '', filesChanged: 1, insertions: 5, deletions: 2 },
    ],
    draft: {
      subject: 'Week 3 update',
      bullets: ['Nav fixed', 'Auth shipped'],
      body: 'Lots done this week.',
    },
    status: 'pending',
    replies: [],
    scopeCreepFlags: [],
    ...overrides,
  };
}

describe('format', () => {
  it('renderEmail includes subject and bullets', () => {
    const out = renderEmail(makeUpdate());
    expect(out.subject).toBe('Week 3 update');
    expect(out.body).toContain('Hi Bob');
    expect(out.body).toContain('Nav fixed');
    expect(out.body).toContain('Auth shipped');
  });

  it('renderMarkdown includes commits', () => {
    const md = renderMarkdown(makeUpdate());
    expect(md).toContain('# Acme Site — Update');
    expect(md).toContain('fix nav');
  });

  it('renderMarkdown includes scope-creep section when flags exist', () => {
    const md = renderMarkdown(makeUpdate({
      scopeCreepFlags: [{
        id: 'f1', replyId: 'r1', description: 'Add login page',
        estimatedHours: 8, estimatedCost: 800, rationale: 'Not in original scope', severity: 'major',
      }],
    }));
    expect(md).toContain('Scope creep flags');
    expect(md).toContain('Add login page');
    expect(md).toContain('$800');
  });

  it('formatFlag formats currency and severity', () => {
    const out = formatFlag({
      id: 'f1', replyId: 'r1', description: 'New feature',
      estimatedHours: 4, estimatedCost: 400, rationale: 'Out of scope', severity: 'moderate',
    });
    expect(out).toContain('MODERATE');
    expect(out).toContain('$400');
    expect(out).toContain('~4h');
  });

  it('renderStatusLine summarizes flags + cost', () => {
    const u = makeUpdate({
      scopeCreepFlags: [
        { id: 'f1', replyId: 'r1', description: 'a', estimatedHours: 2, estimatedCost: 200, rationale: 'x', severity: 'minor' },
        { id: 'f2', replyId: 'r1', description: 'b', estimatedHours: 5, estimatedCost: 500, rationale: 'y', severity: 'moderate' },
      ],
    });
    const line = renderStatusLine(u);
    expect(line).toContain('2 scope-creep flags');
    expect(line).toContain('$700');
  });
});
