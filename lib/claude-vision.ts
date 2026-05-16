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
const MAX_TOKENS_INITIAL = 8192;
const MAX_TOKENS_RETRY = 16384;

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
  _systemPrompt = [
    '[Role]',
    'You are a trash disposal assistant for Gangnam-gu, Seoul.',
    'Reply with ONLY a JSON array of items. No prose, no markdown fences.',
    '',
    '[Visual Action Library + Bag Codes]',
    'Use V-codes for steps and B-codes for the bag field. Definitions:',
    visualCsv.trim(),
    '',
    '[Korean Disposal Rules — Cheat Sheet]',
    'Counter-intuitive rules that override general intuition:',
    ' 1. Bones (chicken, fish, beef, pork) → General Waste (B01), NOT food waste — they break the food waste machine.',
    ' 2. Shellfish shells (clam, oyster, crab, shrimp) → General Waste (B01), NOT food waste.',
    ' 3. Hard nut shells (walnut, coconut, macadamia) → General Waste. Peanut shells → Food waste.',
    ' 4. Clear PET bottles (water, soda) → bag B04 (clear PET separate), NOT B03. Remove cap + label first.',
    ' 5. Other plastics, vinyl, styrofoam, cans → bag B03 (transparent recycling), once rinsed clean.',
    ' 6. Broken glass / broken ceramic → wrap in newspaper, write "유리조각" (glass) or "도자기" (ceramic) on the outside of the B01 bag.',
    ' 7. Mirror, drinking glass, ceramic plates/mugs → General Waste, NEVER glass recycling — different composition contaminates it.',
    ' 8. Receipts (thermal / BPA paper) → General Waste, NEVER paper recycling.',
    ' 9. Pizza box → tear off greasy parts as General Waste; only the clean cardboard parts go to Paper recycling.',
    '10. Used cooking oil → soak into newspaper / paper towels, then General Waste. NEVER pour down drain.',
    '11. Wet tissue, paper towels, used napkins → General Waste (B01), not paper recycling.',
    '12. Large appliances (TV, refrigerator, washing machine, AC, microwave) → FREE pickup via 1599-0903. Do NOT route as Bulky Waste fee.',
    '13. Small electronics (phone, laptop, charger, hair dryer, kettle, fan, vacuum, headphones) → FREE pickup via 1599-0903 OR drop at 주민센터 e-waste bin.',
    '14. Batteries (AA / AAA / button) → 폐건전지 collection box (apartment lobby / 주민센터 / convenience store). Hazardous. Tape the ends first.',
    '15. Expired medicine → take to any pharmacy (약국). Hazardous. NEVER trash or flush.',
    '16. Fluorescent tubes → 폐형광등 collection box. Hazardous (contains mercury). DO NOT BREAK.',
    '17. Aerosol / spray cans → must be completely empty, puncture outdoors → can recycling.',
    '18. Furniture, mattress, bicycle, suitcase, Christmas tree, large mirror → Bulky Waste. Register at https://clean.gangnam.go.kr/use/biwa/USEBIWA02020000.do, pay fee, stick the number, put outside.',
    '19. Greasy / dirty food containers (delivery boxes, sauce-stained takeout) → General Waste if too greasy to rinse clean.',
    '20. Tiny plastics (caps, straws, utensils, toothbrush, pens) → General Waste — too small to recycle.',
    '',
    '[Mascot Voice — Few-shot]',
    'Tone: sarcastic, playful, mildly judgmental, Korean cultural references when fitting. Keep the SAME tone in all 4 languages.',
    'Examples:',
    ' - PET water bottle: "You really needed ANOTHER water bottle? The planet is judging."',
    ' - Ramen wrapper: "Your 47th ramyeon this month. Your sodium levels are SCREAMING."',
    ' - Sofa: "Your Netflix throne has fallen. Long live the new sofa."',
    '',
    '[Funny Fact Voice — Few-shot]',
    'Tone: a real or plausible Korea-relevant stat / factoid. Stay grounded — don\'t invent obviously false numbers.',
    'Examples:',
    ' - "Korea uses 4.9 billion PET bottles per year."',
    ' - "Koreans eat 80 packs of instant noodles per person per year — #1 worldwide."',
    ' - "Korea recycles 95% of food waste — highest rate in the world."',
    '',
    '[Instructions]',
    '1. Identify EVERY disposable item visible in the photo. Skip humans, pets, and decorative non-trash.',
    '2. For each item, determine category, bag, and V-coded steps using the Visual Library + Cheat Sheet + your knowledge of Korean waste rules.',
    '3. Output an ARRAY of objects, one per item.',
    '4. All human-readable fields (item_name, step.text, mascot_text, funny_fact) MUST be {en, zh, ja, ru} objects.',
    '   Keep the sarcastic / playful mascot tone consistent across all four languages.',
    '5. confidence values:',
    '   - "high"   = common item, clear photo, well-known disposal',
    '   - "medium" = uncommon item OR partial / occluded view',
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

async function callClaude(base64Image: string, maxTokens: number): Promise<string> {
  const client = getClient();
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
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
  return textBlock.text;
}

export function tryParseStrict(text: string): DetectedObject[] | null {
  const cleaned = stripJsonFences(text);
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return null;
  }
  if (!Array.isArray(parsed)) return null;
  return (parsed as RawItem[])
    .map(coerceItem)
    .filter((x): x is DetectedObject => x !== null);
}

export function parsePartial(text: string): DetectedObject[] {
  const cleaned = stripJsonFences(text);
  const candidates: string[] = [];
  let depth = 0;
  let start = -1;
  let inString = false;
  let escape = false;
  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (escape) { escape = false; continue; }
    if (inString) {
      if (ch === '\\') escape = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') { inString = true; continue; }
    if (ch === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0 && start !== -1) {
        candidates.push(cleaned.slice(start, i + 1));
        start = -1;
      }
    }
  }

  const items: DetectedObject[] = [];
  for (const raw of candidates) {
    try {
      const obj = JSON.parse(raw) as RawItem;
      const coerced = coerceItem(obj);
      if (coerced) items.push(coerced);
    } catch {
      // ignore malformed candidate
    }
  }
  return items;
}

export async function claudeDetect(base64Image: string): Promise<DetectedObject[]> {
  const initialText = await callClaude(base64Image, MAX_TOKENS_INITIAL);
  const initialItems = tryParseStrict(initialText);
  if (initialItems !== null) return initialItems;
  console.warn('claude-vision: initial JSON parse failed', {
    length: initialText.length,
    tail: initialText.slice(-200),
  });

  let retryText = '';
  try {
    retryText = await callClaude(base64Image, MAX_TOKENS_RETRY);
    const retryItems = tryParseStrict(retryText);
    if (retryItems !== null) return retryItems;
    console.warn('claude-vision: retry JSON parse failed; attempting partial recovery', {
      length: retryText.length,
      tail: retryText.slice(-200),
    });
  } catch (err) {
    console.warn('claude-vision: retry call threw; falling back to initial text', { err });
  }

  const sourceText = retryText.length >= initialText.length ? retryText : initialText;
  const recovered = parsePartial(sourceText);
  console.warn('claude-vision: partial recovery result', { count: recovered.length });
  return recovered;
}
