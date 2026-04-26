// Mirrored prompts for server-side classification (the viewer uses the
// Anthropic SDK because Vercel can't spawn the `claude` CLI).
import type { Update } from './types';

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
}`;
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

Identify any requests that fall OUTSIDE the original scope. For each one estimate hours, cost = hours × $${hourlyRate}/hr, and severity (minor <2h, moderate 2-8h, major >8h).

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

export function extractJSON<T>(text: string): T {
  const fenced = text.match(/```json\s*([\s\S]*?)```/);
  if (fenced) return JSON.parse(fenced[1]) as T;
  const obj = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (obj) return JSON.parse(obj[1]) as T;
  throw new Error('No JSON in response');
}
