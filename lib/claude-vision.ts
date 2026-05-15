import Anthropic from '@anthropic-ai/sdk';
import { CATEGORY_IDS, getCategoryDef } from '@/lib/categories';
import type { DetectedObject } from '@/types';

const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 1024;

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (_client) return _client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');
  _client = new Anthropic({ apiKey });
  return _client;
}

let _systemPrompt: string | null = null;
function getSystemPrompt(): string {
  if (_systemPrompt) return _systemPrompt;
  const lines = CATEGORY_IDS.map(id => {
    const def = getCategoryDef(id);
    return `- ${id}: ${def.examples.en}`;
  });
  _systemPrompt = [
    'You identify recyclable waste items in photos taken in Korean households.',
    'Return ONLY a JSON array. No prose, no markdown fences.',
    'Each item must have:',
    '  - category: one of the ids below, or "etc" if unsure',
    '  - label: short English noun phrase (e.g., "milk carton")',
    '  - bbox: { x, y, w, h } in normalized 0-1 coordinates, top-left origin',
    '',
    'Categories:',
    ...lines,
    '- etc: anything that does not match the above',
  ].join('\n');
  return _systemPrompt;
}

export async function claudeDetect(base64Image: string): Promise<DetectedObject[]> {
  const client = getClient();
  await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: [{ type: 'text', text: getSystemPrompt(), cache_control: { type: 'ephemeral' } }],
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64Image } },
        { type: 'text', text: 'Identify the waste items in this image.' },
      ],
    }],
  });
  return [];
}
