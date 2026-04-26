import { NextResponse } from 'next/server';
import { customAlphabet } from 'nanoid';
import { fetchUpdate, saveUpdate } from '@/lib/blob';
import { complete } from '@/lib/anthropic';
import { classifyReplyPrompt, scopeCreepPrompt, extractJSON } from '@/lib/prompts';
import type { Reply, ReplyClassification, ScopeCreepFlag } from '@/lib/types';

const newId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 8);

interface ReplyBody {
  updateId: string;
  replyText: string;
  signerName?: string;
}

export async function POST(req: Request) {
  let body: ReplyBody;
  try {
    body = (await req.json()) as ReplyBody;
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  if (!body.updateId || !body.replyText) {
    return NextResponse.json({ error: 'updateId and replyText required' }, { status: 400 });
  }

  const update = await fetchUpdate(body.updateId);
  if (!update) return NextResponse.json({ error: 'not found' }, { status: 404 });

  // 1. Classify the reply.
  const classifyText = await complete(classifyReplyPrompt(update, body.replyText));
  const classification = extractJSON<ReplyClassification>(classifyText);

  // 2. If scope-creep-flavored AND we have a scope doc, run the flagger.
  let flags: ScopeCreepFlag[] = [];
  const replyId = newId();
  if (
    update.scopeDocSnapshot &&
    (classification.category === 'scope_creep' || classification.category === 'mixed')
  ) {
    const flagText = await complete(
      scopeCreepPrompt(update.scopeDocSnapshot, update.hourlyRateSnapshot, body.replyText)
    );
    const raw = extractJSON<Omit<ScopeCreepFlag, 'id' | 'replyId'>[]>(flagText);
    flags = raw.map((f) => ({ ...f, id: newId(), replyId }));
  }

  const reply: Reply = {
    id: replyId,
    updateId: body.updateId,
    createdAt: new Date().toISOString(),
    rawText: body.replyText,
    classification,
    signerName: body.signerName,
  };

  update.replies.push(reply);
  update.scopeCreepFlags.push(...flags);
  update.status =
    classification.category === 'approve'
      ? 'approved'
      : classification.category === 'concern'
        ? 'concerns_flagged'
        : 'replied';

  await saveUpdate(update);

  return NextResponse.json({ reply, scopeCreepFlags: flags });
}
