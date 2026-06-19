import Anthropic from '@anthropic-ai/sdk';
import { VercelRequest, VercelResponse } from '@vercel/node';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { systemPrompt, messages } = req.body;

  if (!systemPrompt || !messages) {
    return res.status(400).json({ error: 'Missing systemPrompt or messages' });
  }

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      system: systemPrompt,
      messages,
    });

    res.json({ content: (response.content[0] as any).text });
  } catch (err: any) {
    console.error('Eli error:', err);
    res.status(500).json({ error: err.message });
  }
}
