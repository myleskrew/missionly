import Stripe from 'stripe';
import { VercelRequest, VercelResponse } from '@vercel/node';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-05-27.dahlia' });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { priceId, userId, userEmail } = req.body;
  if (!priceId || !userId || !userEmail) return res.status(400).json({ error: 'Missing required fields' });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: userEmail,
      client_reference_id: userId,
      success_url: `${process.env.REACT_APP_URL}/dashboard?upgraded=true`,
      cancel_url: `${process.env.REACT_APP_URL}/dashboard`,
      metadata: { userId, userEmail },
    });

    res.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe checkout error:', err);
    res.status(500).json({ error: err.message });
  }
}
