export default function handler(req: any, res: any) {
  res.json({ ok: true, env: !!process.env.STRIPE_SECRET_KEY, node: process.version });
}
