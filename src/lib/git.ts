import simpleGit from 'simple-git';
import type { Commit } from './types.js';

export interface ReadCommitsOptions {
  since?: string;
  limit?: number;
}

export async function readCommits(
  repoPath: string,
  opts: ReadCommitsOptions = {}
): Promise<Commit[]> {
  const git = simpleGit(repoPath);

  const logArgs: string[] = ['--no-merges'];
  if (opts.since) logArgs.push(`${opts.since}..HEAD`);
  if (opts.limit) logArgs.push(`-n${opts.limit}`);

  const log = await git.log(logArgs);

  const commits: Commit[] = [];
  for (const c of log.all) {
    let stats = '';
    try {
      stats = await git.raw(['show', '--stat', '--format=', c.hash]);
    } catch {
      // ignore stat failure on initial commit etc.
    }
    const lastLine = stats.trim().split('\n').pop() ?? '';
    const fileMatch = lastLine.match(/(\d+) files? changed/);
    const insMatch = lastLine.match(/(\d+) insertions?/);
    const delMatch = lastLine.match(/(\d+) deletions?/);

    commits.push({
      sha: c.hash,
      shortSha: c.hash.slice(0, 7),
      author: c.author_name,
      date: c.date,
      subject: c.message,
      body: c.body ?? '',
      filesChanged: fileMatch ? Number(fileMatch[1]) : 0,
      insertions: insMatch ? Number(insMatch[1]) : 0,
      deletions: delMatch ? Number(delMatch[1]) : 0,
    });
  }
  return commits;
}

export async function isGitRepo(path: string): Promise<boolean> {
  try {
    const git = simpleGit(path);
    return await git.checkIsRepo();
  } catch {
    return false;
  }
}
