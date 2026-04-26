import type { Update, ScopeCreepFlag } from './types.js';

export function renderEmail(update: Update): { subject: string; body: string } {
  const reviewLine = `Review and reply: ${update.id}`;
  const lines = [
    `Hi ${update.clientName},`,
    '',
    update.draft.body.trim(),
    '',
    'Highlights:',
    ...update.draft.bullets.map((b) => `  • ${b}`),
    '',
    reviewLine,
  ];
  return { subject: update.draft.subject, body: lines.join('\n') };
}

export function renderMarkdown(update: Update): string {
  const sections = [
    `# ${update.projectName} — Update`,
    `_${new Date(update.createdAt).toLocaleDateString()}_`,
    '',
    '## Summary',
    ...update.draft.bullets.map((b) => `- ${b}`),
    '',
    '## Details',
    update.draft.body,
    '',
    '## Commits',
    ...update.commits.map((c) => `- \`${c.shortSha}\` ${c.subject}`),
  ];
  if (update.scopeCreepFlags.length > 0) {
    sections.push('', '## Scope creep flags', ...update.scopeCreepFlags.map(formatFlag));
  }
  return sections.join('\n');
}

export function formatFlag(flag: ScopeCreepFlag): string {
  const cost = flag.estimatedCost.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  return `- **[${flag.severity.toUpperCase()}]** ${flag.description} — ~${flag.estimatedHours}h, ${cost}\n  _${flag.rationale}_`;
}

export function renderStatusLine(update: Update): string {
  const flags = update.scopeCreepFlags;
  const totalCost = flags.reduce((s, f) => s + f.estimatedCost, 0);
  const flagsText = flags.length === 0 ? '' : ` · ${flags.length} scope-creep flag${flags.length === 1 ? '' : 's'} (~$${totalCost.toLocaleString()})`;
  return `[${update.status}] ${update.projectName}${flagsText}`;
}
