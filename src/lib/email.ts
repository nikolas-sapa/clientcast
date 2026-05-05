import { Resend } from 'resend';
import type { Update } from './types.js';
import { renderEmail } from './format.js';

export interface SendEmailArgs {
  update: Update;
  to: string;
  from?: string;
  replyTo?: string;
  viewerUrl: string;
  apiKey?: string;
}

export interface EmailResult {
  delivered: boolean;
  messageId?: string;
  reason?: string;
}

const DEFAULT_FROM = 'clientcast <updates@clientcast.dev>';

export async function deliverUpdateEmail(args: SendEmailArgs): Promise<EmailResult> {
  const apiKey = args.apiKey ?? process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { delivered: false, reason: 'RESEND_API_KEY not set — skipping email delivery' };
  }

  const { subject, body } = renderEmail(args.update);
  const reviewUrl = `${args.viewerUrl}/u/${args.update.id}`;

  const html = renderHtml({
    body,
    reviewUrl,
    clientName: args.update.clientName,
  });

  const text = `${body}\n\nReview and reply: ${reviewUrl}\n`;

  const resend = new Resend(apiKey);

  try {
    const result = await resend.emails.send({
      from: args.from ?? DEFAULT_FROM,
      to: args.to,
      replyTo: args.replyTo,
      subject,
      html,
      text,
    });
    if (result.error) {
      return { delivered: false, reason: result.error.message };
    }
    return { delivered: true, messageId: result.data?.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { delivered: false, reason: msg };
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderHtml(args: { body: string; reviewUrl: string; clientName: string }): string {
  const safeBody = escapeHtml(args.body).replace(/\n/g, '<br>');
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:32px;background:#f9f9f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1a1a;line-height:1.6;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e5e5e5;border-radius:12px;padding:32px;">
    <div style="font-size:13px;color:#666;line-height:1.7;">${safeBody}</div>
    <div style="margin-top:32px;text-align:center;">
      <a href="${args.reviewUrl}" style="display:inline-block;background:#1a1a1a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;">Review &amp; reply</a>
    </div>
    <div style="margin-top:24px;text-align:center;font-size:12px;color:#999;">
      Or open: <a href="${args.reviewUrl}" style="color:#666;">${args.reviewUrl}</a>
    </div>
  </div>
  <div style="text-align:center;margin-top:16px;font-size:12px;color:#aaa;">
    Sent via <a href="https://github.com/84yk8btb9f-prog/clientcast" style="color:#aaa;">clientcast</a>
  </div>
</body>
</html>`;
}
