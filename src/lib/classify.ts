import { claudeJSON } from './claude.js';
import { classifyReplyPrompt } from './prompts.js';
import type { Update, ReplyClassification } from './types.js';

export async function classifyReply(
  update: Update,
  replyText: string,
  model: 'sonnet' | 'opus' | 'haiku' = 'sonnet'
): Promise<ReplyClassification> {
  return claudeJSON<ReplyClassification>(classifyReplyPrompt(update, replyText), { model });
}
