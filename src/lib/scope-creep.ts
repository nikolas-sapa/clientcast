import { claudeJSON } from './claude.js';
import { newShortId } from './id.js';
import { scopeCreepPrompt } from './prompts.js';
import type { ScopeCreepFlag } from './types.js';

type RawFlag = Omit<ScopeCreepFlag, 'id' | 'replyId'>;

export interface DetectScopeCreepArgs {
  scopeDoc: string | undefined;
  hourlyRate: number;
  replyId: string;
  replyText: string;
  model?: 'sonnet' | 'opus' | 'haiku';
}

export async function detectScopeCreep(args: DetectScopeCreepArgs): Promise<ScopeCreepFlag[]> {
  if (!args.scopeDoc) return [];
  const flags = await claudeJSON<RawFlag[]>(
    scopeCreepPrompt(args.scopeDoc, args.hourlyRate, args.replyText),
    { model: args.model ?? 'sonnet' }
  );
  return flags.map((f) => ({ ...f, id: newShortId(), replyId: args.replyId }));
}
