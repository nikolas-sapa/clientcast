import { Resend } from 'resend';
import type { Reply, ScopeCreepFlag, Update } from './types.js';

export interface NotifyArgs {
  update: Update;
  reply: Reply;
  flags: ScopeCreepFlag[];
  viewerUrl: string;
}

export async function notifyDeveloper(args: NotifyArgs): Promise<{ ok: boolean; reason?: string }> {
  const channel = args.update.notifyChannel ?? 'email';
  if (channel === 'none') return { ok: true };

  if (channel === 'slack' && args.update.slackWebhookSnapshot) {
    return notifySlack(args);
  }

  if (channel === 'email' && args.update.devEmailSnapshot) {
    return notifyEmail(args);
  }

  return { ok: false, reason: `notifyChannel=${channel} but no destination configured` };
}

async function notifySlack(args: NotifyArgs): Promise<{ ok: boolean; reason?: string }> {
  const webhook = args.update.slackWebhookSnapshot!;
  const reviewUrl = `${args.viewerUrl}/u/${args.update.id}`;
  const totalFlags = args.flags.reduce((s, f) => s + f.estimatedCost, 0);

  const blocks: unknown[] = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Reply from ${args.reply.signerName ?? 'client'} on ${args.update.projectName}*\nClassified as *${args.reply.classification.category}* (${args.reply.classification.confidence})`,
      },
    },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: `> ${args.reply.rawText.replace(/\n/g, '\n> ').slice(0, 800)}` },
    },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: args.reply.classification.reasoning },
    },
  ];

  if (args.flags.length > 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Additional work flagged:* ${args.flags.length} item${args.flags.length === 1 ? '' : 's'}, ~$${totalFlags.toLocaleString()}`,
      },
    });
    for (const f of args.flags) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `[${f.severity.toUpperCase()}] ${f.description}\n~${f.estimatedHours}h · $${f.estimatedCost.toLocaleString()}`,
        },
      });
    }
  }

  blocks.push({
    type: 'actions',
    elements: [{ type: 'button', text: { type: 'plain_text', text: 'Open update' }, url: reviewUrl }],
  });

  try {
    const r = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks, text: `New reply on ${args.update.projectName}` }),
    });
    if (!r.ok) return { ok: false, reason: `Slack webhook returned ${r.status}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : String(e) };
  }
}

async function notifyEmail(args: NotifyArgs): Promise<{ ok: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, reason: 'RESEND_API_KEY not set' };

  const resend = new Resend(apiKey);
  const reviewUrl = `${args.viewerUrl}/u/${args.update.id}`;
  const totalFlags = args.flags.reduce((s, f) => s + f.estimatedCost, 0);

  const flagSection =
    args.flags.length === 0
      ? ''
      : `<h3 style="margin-top:24px;color:#92400e;">Additional work flagged: ${args.flags.length} item(s), ~$${totalFlags.toLocaleString()}</h3>` +
        args.flags
          .map(
            (f) =>
              `<p style="background:#fef3c7;padding:12px;border-radius:8px;color:#78350f;"><strong>[${f.severity.toUpperCase()}]</strong> ${escapeHtml(f.description)}<br>~${f.estimatedHours}h · $${f.estimatedCost.toLocaleString()}</p>`
          )
          .join('');

  const html = `<div style="font-family:-apple-system,sans-serif;color:#1a1a1a;max-width:560px;margin:0 auto;padding:24px;">
  <h2 style="margin:0 0 8px;">${escapeHtml(args.reply.signerName ?? 'Client')} replied on ${escapeHtml(args.update.projectName)}</h2>
  <p style="color:#666;margin-top:0;">Classified as <strong>${args.reply.classification.category}</strong> (${args.reply.classification.confidence})</p>
  <blockquote style="border-left:3px solid #e5e5e5;padding-left:16px;color:#444;">${escapeHtml(args.reply.rawText).replace(/\n/g, '<br>')}</blockquote>
  <p style="color:#666;font-style:italic;">${escapeHtml(args.reply.classification.reasoning)}</p>
  ${flagSection}
  <p style="margin-top:32px;"><a href="${reviewUrl}" style="background:#1a1a1a;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;">Open update</a></p>
</div>`;

  try {
    const result = await resend.emails.send({
      from: 'clientcast <updates@clientcast.dev>',
      to: args.update.devEmailSnapshot!,
      subject: `Reply on ${args.update.projectName}: ${args.reply.classification.category}`,
      html,
      text: `${args.reply.signerName ?? 'Client'} replied on ${args.update.projectName}\n\n${args.reply.rawText}\n\nView: ${reviewUrl}`,
    });
    if (result.error) return { ok: false, reason: result.error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : String(e) };
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
