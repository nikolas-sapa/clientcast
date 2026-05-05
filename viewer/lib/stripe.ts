import Stripe from 'stripe';

let client: Stripe | null = null;

function stripe(): Stripe {
  if (!client) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY not set on viewer deployment');
    }
    client = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return client;
}

export interface CreatePaymentLinkArgs {
  description: string;
  amountUsd: number;
  metadata?: Record<string, string>;
}

export async function createPaymentLink(args: CreatePaymentLinkArgs): Promise<string> {
  const product = await stripe().products.create({
    name: args.description.slice(0, 250),
    metadata: args.metadata,
  });
  const price = await stripe().prices.create({
    product: product.id,
    unit_amount: Math.round(args.amountUsd * 100),
    currency: 'usd',
  });
  const link = await stripe().paymentLinks.create({
    line_items: [{ price: price.id, quantity: 1 }],
    metadata: args.metadata,
  });
  return link.url;
}

export function isStripeAvailable(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}
