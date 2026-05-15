import Anthropic from '@anthropic-ai/sdk';
import { CATEGORY_IDS, ETC_NAMES, getCategoryDef } from '@/lib/categories';
import type { DetectedObject, WasteCategory } from '@/types';

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

type ClaudeItem = {
  category?: unknown;
  label?: unknown;
  bbox?: { x?: unknown; y?: unknown; w?: unknown; h?: unknown };
};

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

const VALID_CATEGORIES = new Set<string>([...CATEGORY_IDS, 'etc']);

function resolveCategory(raw: unknown): WasteCategory {
  if (typeof raw === 'string' && VALID_CATEGORIES.has(raw)) {
    return raw as WasteCategory;
  }
  return 'etc';
}

function stripJsonFences(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenced ? fenced[1].trim() : trimmed;
}

function coerceItem(item: ClaudeItem): DetectedObject | null {
  const b = item.bbox;
  if (
    !b ||
    typeof b.x !== 'number' || typeof b.y !== 'number' ||
    typeof b.w !== 'number' || typeof b.h !== 'number'
  ) {
    console.warn('claude-vision: dropping malformed item', item);
    return null;
  }

  const category = resolveCategory(item.category);
  const names = category === 'etc'
    ? ETC_NAMES
    : getCategoryDef(category).names;

  return {
    nameEn: names.en,
    nameZh: names.zh,
    nameJa: names.ja,
    nameRu: names.ru,
    category,
    bbox: {
      x: clamp(b.x * 100, 0, 100),
      y: clamp(b.y * 100, 0, 100),
      w: clamp(b.w * 100, 0, 100),
      h: clamp(b.h * 100, 0, 100),
    },
  };
}

export async function claudeDetect(base64Image: string): Promise<DetectedObject[]> {
  const client = getClient();
  const response = await client.messages.create({
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

  const textBlock = response.content.find(b => b.type === 'text') as { type: 'text'; text: string } | undefined;
  if (!textBlock) throw new Error('Claude returned no text content');

  const cleaned = stripJsonFences(textBlock.text);
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Claude returned invalid JSON: ${cleaned.slice(0, 200)}`);
  }
  if (!Array.isArray(parsed)) {
    throw new Error('Claude returned non-array JSON');
  }

  return (parsed as ClaudeItem[])
    .map(coerceItem)
    .filter((x): x is DetectedObject => x !== null);
}
