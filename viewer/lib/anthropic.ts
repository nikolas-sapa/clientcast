import Anthropic from '@anthropic-ai/sdk';

let client: Anthropic | null = null;

export function anthropic(): Anthropic {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not set on the viewer deployment.');
    }
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export async function complete(prompt: string): Promise<string> {
  const msg = await anthropic().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });
  const block = msg.content.find((b) => b.type === 'text');
  if (!block || block.type !== 'text') throw new Error('No text in response');
  return block.text;
}
