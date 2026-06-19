export default function handler(req: any, res: any) {
  res.json({ pong: true, node: process.version, env: Object.keys(process.env).filter(k => k.startsWith('STRIPE')).join(',') });
}
