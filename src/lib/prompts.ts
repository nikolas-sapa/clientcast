import type { Commit, ProjectConfig, Update } from './types.js';

export function draftUpdatePrompt(config: ProjectConfig, commits: Commit[]): string {
  const commitText = commits
    .map(
      (c) =>
        `[${c.shortSha}] ${c.subject}\n${c.body}\n(${c.filesChanged} files, +${c.insertions}/-${c.deletions})`
    )
    .join('\n\n');

  return `You are drafting a project update email from a developer to their non-technical client.

Project: ${config.projectName}
Client: ${config.clientName}
${config.scopeDoc ? `\nProject scope:\n"""\n${config.scopeDoc}\n"""\n` : ''}
Recent commits:
${commitText}

Write a clear, friendly client update. Translate technical jargon into business outcomes. Be specific about what was completed. Avoid filler. Avoid bullet points like "Fixed bug" — instead say what the bug fix means for the client.

Return ONLY a JSON object with this exact shape:
{
  "subject": "<short email subject, no quotes>",
  "bullets": ["<3 to 5 short bullet headlines, plain business language>"],
  "body": "<2 to 3 paragraph plain-English summary>"
}`;
}

export function classifyReplyPrompt(update: Update, replyText: string): string {
  return `Classify the following client reply to a project update.

Project: ${update.projectName}
Original update bullets:
${update.draft.bullets.map((b) => `- ${b}`).join('\n')}
${update.scopeDocSnapshot ? `\nProject scope:\n"""\n${update.scopeDocSnapshot}\n"""\n` : ''}
Client reply:
"""
${replyText}
"""

Return ONLY a JSON object with this exact shape:
{
  "category": "approve" | "feedback" | "scope_creep" | "concern" | "mixed",
  "confidence": "high" | "medium" | "low",
  "reasoning": "<1 to 2 sentences>",
  "actionItems": ["<extracted asks, plain English, empty array if none>"]
}

Definitions:
- approve: client signs off, no changes requested
- feedback: minor refinement within current scope
- scope_creep: NEW work or feature not in original scope
- concern: client is unhappy or worried about something
- mixed: contains multiple categories`;
}

export function scopeCreepPrompt(scopeDoc: string, hourlyRate: number, replyText: string): string {
  return `You are an experienced freelance project manager protecting a developer from scope creep.

Original project scope:
"""
${scopeDoc}
"""

The client just replied with:
"""
${replyText}
"""

Identify any requests that fall OUTSIDE the original scope. For each one:
1. Describe what new thing is being asked (one sentence, plain English)
2. Estimate hours of work realistically:
   - UI tweak / copy change: 0.5 to 2h
   - New small feature: 4 to 12h
   - New integration / new screen: 8 to 24h
   - Architecture change: 16 to 40h
3. Estimate cost = hours × $${hourlyRate}/hr
4. Severity: minor (under 2h), moderate (2 to 8h), major (over 8h)
5. Rationale: 1 sentence on why it's out of scope

Return ONLY a JSON array. Empty array means no scope creep detected.
[
  {
    "description": "...",
    "estimatedHours": <number>,
    "estimatedCost": <number>,
    "rationale": "...",
    "severity": "minor" | "moderate" | "major"
  }
]`;
}
