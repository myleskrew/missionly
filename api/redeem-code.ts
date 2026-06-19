import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();

  const { code, userId } = req.body || {};
  if (!code || !userId) return res.status(400).json({ error: 'Missing code or userId' });

  const validCodes = (process.env.PROMO_CODES || '').split(',').map((c: string) => c.trim().toUpperCase());

  if (!validCodes.includes(code.trim().toUpperCase())) {
    return res.status(400).json({ error: 'Invalid code' });
  }

  const { error } = await supabase
    .from('users')
    .update({ plan: 'pro' })
    .eq('id', userId);

  if (error) return res.status(500).json({ error: 'Could not upgrade account' });

  res.json({ success: true });
}
