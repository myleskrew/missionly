import Stripe from 'stripe';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-05-28.basil' });

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  const session = event.data.object as any;

  switch (event.type) {
    case 'checkout.session.completed': {
      const userId = session.client_reference_id || session.metadata?.userId;
      if (userId) {
        await supabase.from('users').update({ plan: 'pro', stripe_customer_id: session.customer }).eq('id', userId);
      }
      break;
    }
    case 'customer.subscription.deleted': {
      const customerId = session.customer;
      await supabase.from('users').update({ plan: 'free' }).eq('stripe_customer_id', customerId);
      break;
    }
    case 'invoice.payment_failed': {
      const customerId = session.customer;
      await supabase.from('users').update({ plan: 'free' }).eq('stripe_customer_id', customerId);
      break;
    }
  }

  res.json({ received: true });
}

async function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', chunk => chunks.push(Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}
