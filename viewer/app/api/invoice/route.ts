import { NextResponse } from 'next/server';
import { fetchUpdate, saveUpdate } from '@/lib/blob';
import { createPaymentLink, isStripeAvailable } from '@/lib/stripe';

interface InvoiceBody {
  updateId: string;
  flagId: string;
}

export async function POST(req: Request) {
  if (!isStripeAvailable()) {
    return NextResponse.json({ error: 'STRIPE_SECRET_KEY not configured' }, { status: 503 });
  }

  let body: InvoiceBody;
  try {
    body = (await req.json()) as InvoiceBody;
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  if (!body.updateId || !body.flagId) {
    return NextResponse.json({ error: 'updateId and flagId required' }, { status: 400 });
  }

  const update = await fetchUpdate(body.updateId);
  if (!update) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const flag = update.scopeCreepFlags.find((f) => f.id === body.flagId);
  if (!flag) return NextResponse.json({ error: 'flag not found' }, { status: 404 });

  if (flag.paymentLink) {
    return NextResponse.json({ paymentLink: flag.paymentLink, alreadyExists: true });
  }

  const paymentLink = await createPaymentLink({
    description: `${update.projectName}: ${flag.description}`,
    amountUsd: flag.estimatedCost,
    metadata: {
      clientcast_update_id: update.id,
      clientcast_flag_id: flag.id,
      clientcast_project_name: update.projectName,
    },
  });

  flag.paymentLink = paymentLink;
  flag.paymentStatus = 'sent';
  await saveUpdate(update);

  return NextResponse.json({ paymentLink });
}
