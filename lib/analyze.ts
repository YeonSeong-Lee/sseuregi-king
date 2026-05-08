import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a waste detection assistant for Korea's recycling system.
Detect all waste/trash items visible in the image.
Return ONLY a valid JSON array — no markdown, no explanation:
[{"nameEn":"Plastic Bottle","nameZh":"塑料瓶","nameJa":"ペットボトル","nameRu":"Пластиковая бутылка","category":"recycling","bbox":{"x":20,"y":30,"w":15,"h":25}}]
bbox values are percentages of image dimensions (0-100).
category must be exactly one of: recycling, food, general, large.
Only detect items that are clearly waste or trash. Return [] if none found.`;

export type RawDetected = {
  nameEn: string;
  nameZh: string;
  nameJa: string;
  nameRu: string;
  category: string;
  bbox: { x: number; y: number; w: number; h: number };
};

export async function analyzeImage(base64Image: string): Promise<RawDetected[]> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: 'image/jpeg', data: base64Image },
        },
        { type: 'text', text: 'Detect all waste items in this image.' },
      ],
    }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '[]';
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
