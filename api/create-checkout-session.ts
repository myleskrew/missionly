import Stripe from 'stripe';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();

  const { priceId, userId, userEmail } = req.body || {};
  if (!priceId || !userId || !userEmail) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({ error: 'Stripe not configured' });
  }

  try {
    const stripe = new Stripe(secretKey, { apiVersion: '2026-05-27.dahlia' as any });
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
    console.error('Stripe checkout error:', err?.message, err?.stack);
    res.status(500).json({ error: err?.message || 'Unknown error' });
  }
}
