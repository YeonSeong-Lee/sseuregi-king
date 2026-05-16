import Anthropic from '@anthropic-ai/sdk';
import { SCAN_RESULT_SCHEMA } from './schemas/scan-result';
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
const MAX_TOKENS = 8192;

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
  _systemPrompt = [
    '[Role]',
    'You are a trash disposal assistant for Gangnam-gu, Seoul.',
    'Reply with ONLY a JSON array of items. No prose, no markdown fences.',
    '',
    '[Visual Action Vocabulary]',
    'Use EXACTLY one of these codes for the "visual" field in each step. Do NOT invent new codes.',
    '',
    'PREPARATION CODES (use earlier in a sequence):',
    '  REMOVE_CAP_OR_LID_PUMP             — Take off bottle cap, lid, or pump nozzle',
    '  PEEL_OFF_LABEL_FILM                — Peel labels, shrink films, plastic windows',
    '  EMPTY_CONTENTS                     — Pour out liquid or shake out remaining contents',
    '  EMPTY_DRINKS_CONTAINER             — Empty a drink container before recycling',
    '  EMPTY_SPRAY_CAN                    — Use up aerosol contents completely',
    '  RELEASE_GAS                        — Puncture aerosol can outdoors to release residual gas',
    '  RINSE_LIGHTLY                      — Quick rinse with tap water',
    '  WIPE_FOOD_RESIDUE_BEFORE_RECYCLING — Wipe off grease / food residue',
    '  REMOVE_FOOD_WASTE                  — Scrape out leftover food bits',
    '  REMOVE_TAPE                        — Remove sticky tape / strings / shipping labels',
    '  FLATTEN_BOX                        — Flatten cardboard or paper boxes',
    '  CRUSH                              — Crush a PET / plastic bottle flat',
    '  CRUSH_CANS_BOTTLES                 — Crush metal cans flat',
    '  BREAK_PIECES                       — Break styrofoam or large items into smaller chunks',
    '  TIE_BUNDLE                         — Stack paper / cardboard and tie into a string bundle',
    '  SEPARATE_BY_MATERIAL               — Disassemble mixed-material items into components',
    '  SEPARATIING_CUP_PARTS              — Split paper cup parts (lid + sleeve + body)',
    '  RECYCLE_METALS                     — Sort out metal components for recycling',
    '',
    'TERMINAL CODES (must appear LAST in the sequence, exactly one per item):',
    '  PUT_IN_GENERAL_BIN                 — White 일반쓰레기 bag (Gangnam-gu general waste)',
    '  PUT_IN_RECYCLE_PAPER               — Paper / cardboard recycling',
    '  PUT_IN_RECYCLE_PLASTIC_PET         — Transparent PET / plastic recycling',
    '  PUT_IN_RECYCLE_GLASS               — Glass recycling',
    '  PUT_IN_RECYCLE_CANS_METALS         — Can / metal recycling',
    '  PUT_IN_RECYCLE_BATTERIES_BULBS     — Battery / fluorescent bulb collection box',
    '  DONATION_BIN                       — 의류수거함 (clothing donation bin)',
    '  FOOD_WASTE_SEPARATE                — Yellow food-waste bag / RFID food-waste bin',
    '  CALL_COMMUNITY_CENTER              — Call 1599-0903 / contact 주민센터 (e-waste, Bulky)',
    '',
    '[Step Sequencing Rules — HARD RULES, DO NOT VIOLATE]',
    '1. Choose 2–4 steps per item. Concise but complete.',
    '2. The final step MUST be a TERMINAL CODE. A PREPARATION code may never be last.',
    '3. For category="Bulky": the final step MUST be CALL_COMMUNITY_CENTER. Do NOT use any PUT_IN_* code for Bulky items.',
    '4. Do NOT repeat the same code consecutively. Each consecutive pair must differ.',
    '5. If only one step makes sense (trivial item), output exactly one TERMINAL code.',
    '',
    '[Korean Disposal Rules — Cheat Sheet]',
    'Counter-intuitive rules that override general intuition:',
    ' 1. Bones (chicken, fish, beef, pork) → General Waste (general), NOT food waste — they break the food waste machine.',
    ' 2. Shellfish shells (clam, oyster, crab, shrimp) → General Waste (general), NOT food waste.',
    ' 3. Hard nut shells (walnut, coconut, macadamia) → General Waste. Peanut shells → Food waste.',
    ' 4. Clear PET bottles (water, soda) → bag recycle (transparent recycling). Remove cap + label first.',
    ' 5. Other plastics, vinyl, styrofoam, cans → bag recycle (transparent recycling), once rinsed clean.',
    ' 6. Broken glass / broken ceramic → wrap in newspaper, write "유리조각" (glass) or "도자기" (ceramic) on the outside of the general bag.',
    ' 7. Mirror, drinking glass, ceramic plates/mugs → General Waste, NEVER glass recycling — different composition contaminates it.',
    ' 8. Receipts (thermal / BPA paper) → General Waste, NEVER paper recycling.',
    ' 9. Pizza box → tear off greasy parts as General Waste; only the clean cardboard parts go to Paper recycling.',
    '10. Used cooking oil → soak into newspaper / paper towels, then General Waste. NEVER pour down drain.',
    '11. Wet tissue, paper towels, used napkins → General Waste (general), not paper recycling.',
    '12. Large appliances (TV, refrigerator, washing machine, AC, microwave) → FREE pickup via 1599-0903. Do NOT route as Bulky Waste fee.',
    '13. Small electronics (phone, laptop, charger, hair dryer, kettle, fan, vacuum, headphones) → FREE pickup via 1599-0903 OR drop at 주민센터 e-waste bin.',
    '14. Batteries (AA / AAA / button) → 폐건전지 collection box (apartment lobby / 주민센터 / convenience store). Hazardous. Tape the ends first.',
    '15. Expired medicine → take to any pharmacy (약국). Hazardous. NEVER trash or flush.',
    '16. Fluorescent tubes → 폐형광등 collection box. Hazardous (contains mercury). DO NOT BREAK.',
    '17. Aerosol / spray cans → must be completely empty, puncture outdoors → can recycling.',
    '18. Furniture (sofa, couch, chair, office chair, desk, dining table, bookshelf, wardrobe, dresser, cabinet), mattress, bed frame, bicycle, suitcase, Christmas tree, large mirror → Bulky Waste. Register at https://clean.gangnam.go.kr/use/biwa/USEBIWA02020000.do, pay fee, stick the number, put outside.',
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
    '1. Identify EVERY disposable item visible in the photo. When the photo clearly focuses on a single item like furniture or an appliance, treat it as the item being disposed. Skip humans, pets, and purely decorative non-trash.',
    '2. For each item, determine category, bag, and the step sequence using the Visual Action Vocabulary + Sequencing Rules + Cheat Sheet.',
    '3. Output an ARRAY of objects, one per item.',
    '4. item_name and step.text MUST be plain English strings.',
    '   mascot_text and funny_fact MUST be {en, zh, ja, ru} objects.',
    '   Keep the sarcastic / playful mascot tone consistent across all four languages.',
    '5. confidence values:',
    '   - "high"   = common item, clear photo, well-known disposal',
    '   - "medium" = uncommon item OR partial / occluded view',
    '   - "low"    = guessing',
    '6. bbox: { x, y, w, h } in normalized 0-1 coordinates, top-left origin. Required for every item.',
    '',
    '[Output Schema (per item)]',
    '{',
    '  "item_name":  string (English),',
    '  "category":   "Recyclable" | "General Waste" | "Food Waste" | "Hazardous" | "Bulky",',
    '  "bag":        "general" | "food" | "recycle",',
    '  "bbox":       { "x": number, "y": number, "w": number, "h": number },',
    '  "steps": [',
    '    { "visual": "<one code from the Visual Action Vocabulary>", "text": string (English) }',
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
const VALID_BAGS = new Set<BagCode>(['general', 'food', 'recycle']);
const VALID_CONFIDENCE = new Set<ConfidenceLevel>(['high', 'medium', 'low']);
const LOCALES: Locale[] = ['en', 'zh', 'ja', 'ru'];
const VALID_VISUAL_IDS = new Set<VisualActionId>([
  'REMOVE_CAP_OR_LID_PUMP',
  'PEEL_OFF_LABEL_FILM',
  'EMPTY_CONTENTS',
  'EMPTY_DRINKS_CONTAINER',
  'EMPTY_SPRAY_CAN',
  'RELEASE_GAS',
  'RINSE_LIGHTLY',
  'WIPE_FOOD_RESIDUE_BEFORE_RECYCLING',
  'REMOVE_FOOD_WASTE',
  'REMOVE_TAPE',
  'FLATTEN_BOX',
  'CRUSH',
  'CRUSH_CANS_BOTTLES',
  'BREAK_PIECES',
  'TIE_BUNDLE',
  'SEPARATE_BY_MATERIAL',
  'SEPARATIING_CUP_PARTS',
  'RECYCLE_METALS',
  'PUT_IN_GENERAL_BIN',
  'PUT_IN_RECYCLE_PAPER',
  'PUT_IN_RECYCLE_PLASTIC_PET',
  'PUT_IN_RECYCLE_GLASS',
  'PUT_IN_RECYCLE_CANS_METALS',
  'PUT_IN_RECYCLE_BATTERIES_BULBS',
  'DONATION_BIN',
  'FOOD_WASTE_SEPARATE',
  'CALL_COMMUNITY_CENTER',
]);

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

function coerceStringField(value: unknown): string | null {
  if (typeof value !== 'string' || value.length === 0) return null;
  return value;
}

function coerceStep(raw: unknown): ScanStep | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as { visual?: unknown; text?: unknown };
  if (typeof s.visual !== 'string' || !VALID_VISUAL_IDS.has(s.visual as VisualActionId)) return null;
  const text = coerceStringField(s.text);
  if (!text) return null;
  return { visual: s.visual as VisualActionId, text };
}

function coerceItem(raw: RawItem): DetectedObject | null {
  const name = coerceStringField(raw.item_name);
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

async function* streamClaudeText(
  base64Image: string,
  signal?: AbortSignal,
): AsyncGenerator<string, void, unknown> {
  const client = getClient();
  const stream = client.messages.stream(
    {
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: [{ type: 'text', text: getSystemPrompt(), cache_control: { type: 'ephemeral' } }],
      output_config: {
        format: { type: 'json_schema', schema: SCAN_RESULT_SCHEMA as unknown as Record<string, unknown> },
      },
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64Image } },
          { type: 'text', text: 'Identify the disposable items in this photo.' },
        ],
      }],
    },
    { signal },
  );

  try {
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        yield event.delta.text;
      }
    }
  } finally {
    if (typeof (stream as { abort?: () => void }).abort === 'function') {
      (stream as { abort: () => void }).abort();
    }
  }
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

export async function* claudeDetectStream(
  base64Image: string,
  signal?: AbortSignal,
): AsyncGenerator<DetectedObject, void, unknown> {
  let buffer = '';
  let emitted = 0;
  let dirty = false;

  for await (const chunk of streamClaudeText(base64Image, signal)) {
    buffer += chunk;
    if (chunk.includes('}')) {
      const items = parsePartial(buffer);
      while (emitted < items.length) {
        yield items[emitted];
        emitted++;
      }
      dirty = false;
    } else {
      dirty = true;
    }
  }

  // Final sweep only if the last chunk didn't trigger one — avoids redundant parsing.
  if (dirty) {
    const items = parsePartial(buffer);
    while (emitted < items.length) {
      yield items[emitted];
      emitted++;
    }
  }
}

// Convenience non-streaming wrapper. Buffers items until the stream is done.
export async function claudeDetect(base64Image: string): Promise<DetectedObject[]> {
  const items: DetectedObject[] = [];
  for await (const item of claudeDetectStream(base64Image)) {
    items.push(item);
  }
  return items;
}
