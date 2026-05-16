import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type {
  BagCode,
  ConfidenceLevel,
  DetectedObject,
  Locale,
  LocalizedText,
  ScanCategory,
  ScanStep,
  VisualActionId,
} from '@/types';

const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 4096;

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
  const visualCsv = readFileSync(
    path.join(process.cwd(), 'docs/data-sources/visual_actions_library.csv'),
    'utf8',
  );
  const trashCsv = readFileSync(
    path.join(process.cwd(), 'docs/data-sources/trash_master_database_FULL.csv'),
    'utf8',
  );
  _systemPrompt = [
    '[Role]',
    'You are a trash disposal assistant for Gangnam-gu, Seoul.',
    'Reply with ONLY a JSON array of items. No prose, no markdown fences.',
    '',
    '[Visual Action Library + Bag Codes]',
    'Use V-codes for steps and B-codes for the bag field. Definitions:',
    visualCsv.trim(),
    '',
    '[Item Database — match item_name_en or aliases]',
    'When the item matches a row, reuse its step_*_visual_id + step_*_text as the basis for steps.',
    trashCsv.trim(),
    '',
    '[Instructions]',
    '1. Identify EVERY disposable item visible in the photo. Skip humans, pets, and decorative non-trash.',
    '2. For each item:',
    '   a. Try to match a row in [Item Database] by item_name_en or aliases.',
    '      → reuse that row\'s step_*_visual_id values, and translate the step_*_text into 4 languages.',
    '      → reuse mascot_funny_text and funny_fact from the row as the basis for the 4-language mascot_text and funny_fact.',
    '   b. If no match, construct correct Gangnam disposal steps using the Visual Library and your knowledge of Korean waste rules.',
    '3. Output an ARRAY of objects, one per item.',
    '4. All human-readable fields (item_name, step.text, mascot_text, funny_fact) MUST be {en, zh, ja, ru} objects.',
    '   Keep the sarcastic / playful mascot tone consistent across all four languages.',
    '5. confidence values:',
    '   - "high"   = direct DB match AND clear photo',
    '   - "medium" = no DB match but confident from knowledge, OR DB match with partial / occluded view',
    '   - "low"    = guessing',
    '6. bbox: { x, y, w, h } in normalized 0-1 coordinates, top-left origin. Required for every item.',
    '',
    '[Output Schema (per item)]',
    '{',
    '  "item_name":  { "en": string, "zh": string, "ja": string, "ru": string },',
    '  "category":   "Recyclable" | "General Waste" | "Food Waste" | "Hazardous" | "Bulky",',
    '  "bag":        "B01" | "B02" | "B03" | "B04",',
    '  "bbox":       { "x": number, "y": number, "w": number, "h": number },',
    '  "steps": [',
    '    { "visual": "V##", "text": { "en": string, "zh": string, "ja": string, "ru": string } }',
    '  ],',
    '  "mascot_text":{ "en": string, "zh": string, "ja": string, "ru": string },',
    '  "funny_fact": { "en": string, "zh": string, "ja": string, "ru": string },',
    '  "confidence": "high" | "medium" | "low"',
    '}',
    '',
    'Return [] when no disposable items are visible.',
  ].join('\n');
  return _systemPrompt;
}

const VALID_CATEGORIES = new Set<ScanCategory>([
  'Recyclable',
  'General Waste',
  'Food Waste',
  'Hazardous',
  'Bulky',
]);
const VALID_BAGS = new Set<BagCode>(['B01', 'B02', 'B03', 'B04']);
const VALID_CONFIDENCE = new Set<ConfidenceLevel>(['high', 'medium', 'low']);
const LOCALES: Locale[] = ['en', 'zh', 'ja', 'ru'];
const VISUAL_ID_RE = /^V\d{2}$/;

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function stripJsonFences(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenced ? fenced[1].trim() : trimmed;
}

type RawLocalized = { en?: unknown; zh?: unknown; ja?: unknown; ru?: unknown };

function coerceLocalized(value: unknown): LocalizedText | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as RawLocalized;
  const out: Partial<LocalizedText> = {};
  for (const locale of LOCALES) {
    const v = raw[locale];
    if (typeof v !== 'string' || v.length === 0) return null;
    out[locale] = v;
  }
  return out as LocalizedText;
}

type RawItem = {
  item_name?: unknown;
  category?: unknown;
  bag?: unknown;
  bbox?: { x?: unknown; y?: unknown; w?: unknown; h?: unknown };
  steps?: unknown;
  mascot_text?: unknown;
  funny_fact?: unknown;
  confidence?: unknown;
};

function coerceStep(raw: unknown): ScanStep | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as { visual?: unknown; text?: unknown };
  if (typeof s.visual !== 'string' || !VISUAL_ID_RE.test(s.visual)) return null;
  const text = coerceLocalized(s.text);
  if (!text) return null;
  return { visual: s.visual as VisualActionId, text };
}

function coerceItem(raw: RawItem): DetectedObject | null {
  const name = coerceLocalized(raw.item_name);
  if (!name) {
    console.warn('claude-vision: dropping item with missing item_name', raw);
    return null;
  }

  if (typeof raw.category !== 'string' || !VALID_CATEGORIES.has(raw.category as ScanCategory)) {
    console.warn('claude-vision: dropping item with invalid category', raw.category);
    return null;
  }
  const category = raw.category as ScanCategory;

  if (typeof raw.bag !== 'string' || !VALID_BAGS.has(raw.bag as BagCode)) {
    console.warn('claude-vision: dropping item with invalid bag', raw.bag);
    return null;
  }
  const bag = raw.bag as BagCode;

  const b = raw.bbox;
  if (
    !b ||
    typeof b.x !== 'number' || typeof b.y !== 'number' ||
    typeof b.w !== 'number' || typeof b.h !== 'number' ||
    b.w <= 0 || b.h <= 0
  ) {
    console.warn('claude-vision: dropping item with malformed bbox', raw);
    return null;
  }
  const bbox = {
    x: clamp(b.x * 100, 0, 100),
    y: clamp(b.y * 100, 0, 100),
    w: clamp(b.w * 100, 0, 100),
    h: clamp(b.h * 100, 0, 100),
  };

  if (!Array.isArray(raw.steps)) {
    console.warn('claude-vision: dropping item with non-array steps', raw);
    return null;
  }
  const steps = raw.steps
    .map(coerceStep)
    .filter((s): s is ScanStep => s !== null);
  if (steps.length === 0) {
    console.warn('claude-vision: dropping item with no valid steps', raw);
    return null;
  }

  const mascotText = coerceLocalized(raw.mascot_text);
  const funnyFact = coerceLocalized(raw.funny_fact);
  if (!mascotText || !funnyFact) {
    console.warn('claude-vision: dropping item with missing mascot/funny copy', raw);
    return null;
  }

  if (typeof raw.confidence !== 'string' || !VALID_CONFIDENCE.has(raw.confidence as ConfidenceLevel)) {
    console.warn('claude-vision: dropping item with invalid confidence', raw.confidence);
    return null;
  }

  return {
    name,
    category,
    bag,
    bbox,
    steps,
    mascotText,
    funnyFact,
    confidence: raw.confidence as ConfidenceLevel,
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
        { type: 'text', text: 'Identify the disposable items in this photo.' },
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

  return (parsed as RawItem[])
    .map(coerceItem)
    .filter((x): x is DetectedObject => x !== null);
}
