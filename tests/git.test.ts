import { describe, it, expect, beforeAll } from 'vitest';
import { execSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readCommits, isGitRepo } from '../src/lib/git.js';

describe('git', () => {
  let repo: string;
  let firstSha: string;

  beforeAll(() => {
    repo = mkdtempSync(join(tmpdir(), 'cc-git-'));
    const env = { ...process.env, GIT_AUTHOR_NAME: 'T', GIT_AUTHOR_EMAIL: 't@t.com', GIT_COMMITTER_NAME: 'T', GIT_COMMITTER_EMAIL: 't@t.com' };
    execSync('git init -b main', { cwd: repo, env });
    execSync('git config user.email t@t.com', { cwd: repo, env });
    execSync('git config user.name T', { cwd: repo, env });
    writeFileSync(join(repo, 'a.txt'), 'hello');
    execSync('git add . && git commit -m "first"', { cwd: repo, env });
    firstSha = execSync('git rev-parse HEAD', { cwd: repo }).toString().trim();
    writeFileSync(join(repo, 'b.txt'), 'world');
    execSync('git add . && git commit -m "second"', { cwd: repo, env });
    writeFileSync(join(repo, 'c.txt'), 'three');
    execSync('git add . && git commit -m "third"', { cwd: repo, env });
  });

  it('isGitRepo returns true for a real repo', async () => {
    expect(await isGitRepo(repo)).toBe(true);
  });

  it('isGitRepo returns false for a non-repo', async () => {
    const non = mkdtempSync(join(tmpdir(), 'cc-non-'));
    expect(await isGitRepo(non)).toBe(false);
  });

  it('reads recent commits in reverse-chronological order', async () => {
    const commits = await readCommits(repo, { limit: 10 });
    expect(commits.length).toBe(3);
    expect(commits[0].subject).toBe('third');
    expect(commits[2].subject).toBe('first');
  });

  it('reads commits since a ref', async () => {
    const recent = await readCommits(repo, { since: firstSha });
    expect(recent.length).toBe(2);
    expect(recent.map((c) => c.subject)).toEqual(['third', 'second']);
  });

  it('returns commits with stats', async () => {
    const commits = await readCommits(repo, { limit: 1 });
    expect(commits[0].filesChanged).toBeGreaterThanOrEqual(1);
    expect(commits[0].insertions).toBeGreaterThanOrEqual(1);
    expect(commits[0].shortSha).toHaveLength(7);
  });
});
