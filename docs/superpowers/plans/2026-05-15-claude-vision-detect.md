# Claude API Detection Provider (Flag-Gated) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Claude-API-backed detection path alongside the existing Google Vision path, selected by a `DETECT_PROVIDER` env var.

**Architecture:** New `lib/claude-vision.ts` exports `claudeDetect(base64Image)` returning `DetectedObject[]` already-categorized — no alias-matcher pass needed because Claude is prompted with the 12 waste categories and returns them directly. `lib/detect.ts` branches on `process.env.DETECT_PROVIDER === 'claude'`. Default = Vision; opt in to Claude.

**Tech Stack:** Next.js 16 (existing), `@anthropic-ai/sdk` (new), TypeScript, Vitest, Tailwind (existing). Claude model: `claude-sonnet-4-6`.

**Spec:** [`docs/superpowers/specs/2026-05-15-claude-vision-detect-design.md`](../specs/2026-05-15-claude-vision-detect-design.md)

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `package.json` | modify | Add `@anthropic-ai/sdk` dependency |
| `lib/claude-vision.ts` | create | `claudeDetect()`: call Anthropic, parse JSON, validate, hydrate names, return `DetectedObject[]` |
| `__tests__/lib/claude-vision.test.ts` | create | Unit tests for `claudeDetect` (mocked SDK) |
| `lib/detect.ts` | modify | Branch on `DETECT_PROVIDER` env var |
| `__tests__/lib/detect.test.ts` | modify | Add env-flag branching cases |

No new types — `DetectedObject`, `WasteCategory`, `BBox` from `types/index.ts` are sufficient.

---

### Task 1: Install Anthropic SDK

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install the SDK**

Run: `npm install @anthropic-ai/sdk`

Expected: `package.json` gains an `@anthropic-ai/sdk` entry under `dependencies`. `package-lock.json` updates.

- [ ] **Step 2: Verify it imports**

Run: `npx tsc --noEmit`

Expected: PASS (no type errors).

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: add @anthropic-ai/sdk for Claude vision detection"
```

---

### Task 2: Scaffold `lib/claude-vision.ts` with API key check

**Files:**
- Create: `lib/claude-vision.ts`
- Create: `__tests__/lib/claude-vision.test.ts`

- [ ] **Step 1: Write the failing test**

Create `__tests__/lib/claude-vision.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { messagesCreateMock } = vi.hoisted(() => ({
  messagesCreateMock: vi.fn(),
}));

vi.mock('@anthropic-ai/sdk', () => ({
  default: function Anthropic() {
    return { messages: { create: messagesCreateMock } };
  },
}));

import { claudeDetect } from '@/lib/claude-vision';

beforeEach(() => {
  messagesCreateMock.mockReset();
  delete process.env.ANTHROPIC_API_KEY;
});

describe('claudeDetect', () => {
  it('throws when ANTHROPIC_API_KEY is not set', async () => {
    await expect(claudeDetect('base64data')).rejects.toThrow('ANTHROPIC_API_KEY not set');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/lib/claude-vision.test.ts`

Expected: FAIL (module `@/lib/claude-vision` not found).

- [ ] **Step 3: Create the file with stub + getClient**

Create `lib/claude-vision.ts`:

```ts
import Anthropic from '@anthropic-ai/sdk';
import type { DetectedObject } from '@/types';

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (_client) return _client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');
  _client = new Anthropic({ apiKey });
  return _client;
}

export async function claudeDetect(_base64Image: string): Promise<DetectedObject[]> {
  getClient();
  throw new Error('not implemented');
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run __tests__/lib/claude-vision.test.ts`

Expected: PASS (1 passing).

- [ ] **Step 5: Commit**

```bash
git add lib/claude-vision.ts __tests__/lib/claude-vision.test.ts
git commit -m "feat(claude-vision): scaffold with API key check"
```

---

### Task 3: Build the system prompt from `CATEGORY_IDS`

**Files:**
- Modify: `lib/claude-vision.ts`
- Modify: `__tests__/lib/claude-vision.test.ts`

The prompt has to list every category so Claude knows the taxonomy. Source the list from `CATEGORY_IDS` and the per-category description from `getCategoryDef(id).examples.en`. Building it lazily (inside the function or memoized) avoids module-init cost for the Vision path.

- [ ] **Step 1: Add the failing test**

Append inside the `describe('claudeDetect', ...)` block in `__tests__/lib/claude-vision.test.ts`:

```ts
  it('includes every category id in the system prompt', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    messagesCreateMock.mockResolvedValue({ content: [{ type: 'text', text: '[]' }] });

    await claudeDetect('base64data');

    const callArg = messagesCreateMock.mock.calls[0][0];
    const systemText = Array.isArray(callArg.system) ? callArg.system[0].text : callArg.system;
    for (const id of ['paper', 'paper_carton', 'glass', 'metal_can', 'plastic', 'vinyl',
                      'styrofoam', 'clothing', 'lightbulb', 'food', 'general', 'large', 'etc']) {
      expect(systemText).toContain(id);
    }
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/lib/claude-vision.test.ts -t "every category id"`

Expected: FAIL ("not implemented").

- [ ] **Step 3: Build the prompt and call the SDK**

Replace `lib/claude-vision.ts` body so it builds the prompt, calls `messages.create`, and (for now) returns `[]`:

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run __tests__/lib/claude-vision.test.ts`

Expected: PASS (2 passing).

- [ ] **Step 5: Commit**

```bash
git add lib/claude-vision.ts __tests__/lib/claude-vision.test.ts
git commit -m "feat(claude-vision): build category-aware system prompt with cache_control"
```

---

### Task 4: Happy path — parse one well-formed item

**Files:**
- Modify: `lib/claude-vision.ts`
- Modify: `__tests__/lib/claude-vision.test.ts`

- [ ] **Step 1: Add the failing test**

Append inside `describe('claudeDetect', ...)`:

```ts
  it('parses a single well-formed item with bbox converted to 0-100 percent', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    messagesCreateMock.mockResolvedValue({
      content: [{
        type: 'text',
        text: JSON.stringify([
          { category: 'paper', label: 'Newspaper', bbox: { x: 0.1, y: 0.2, w: 0.3, h: 0.4 } },
        ]),
      }],
    });

    const result = await claudeDetect('base64data');

    expect(result).toHaveLength(1);
    expect(result[0].category).toBe('paper');
    expect(result[0].nameEn).toBe('Paper');
    expect(result[0].bbox.x).toBeCloseTo(10);
    expect(result[0].bbox.y).toBeCloseTo(20);
    expect(result[0].bbox.w).toBeCloseTo(30);
    expect(result[0].bbox.h).toBeCloseTo(40);
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/lib/claude-vision.test.ts -t "single well-formed"`

Expected: FAIL (`result` has length 0, not 1).

- [ ] **Step 3: Implement parse + per-item conversion**

Replace the last three lines of `claudeDetect` (the `await client.messages.create(...)` line and the `return [];`) with a stored response, plus add `parseClaudeResponse` and `coerceItem` helpers. The full updated `claudeDetect` and new helpers:

```ts
type ClaudeItem = {
  category?: unknown;
  label?: unknown;
  bbox?: { x?: unknown; y?: unknown; w?: unknown; h?: unknown };
};

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function coerceItem(item: ClaudeItem): DetectedObject | null {
  const b = item.bbox;
  if (
    !b ||
    typeof b.x !== 'number' || typeof b.y !== 'number' ||
    typeof b.w !== 'number' || typeof b.h !== 'number'
  ) return null;

  const def = getCategoryDef('paper'); // placeholder — replaced in next task
  return {
    nameEn: def.names.en,
    nameZh: def.names.zh,
    nameJa: def.names.ja,
    nameRu: def.names.ru,
    category: 'paper',
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

  const parsed = JSON.parse(textBlock.text) as ClaudeItem[];
  return parsed.map(coerceItem).filter((x): x is DetectedObject => x !== null);
}
```

(The hardcoded `'paper'` category is intentional — the next task makes it dynamic. TDD: smallest change to pass.)

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run __tests__/lib/claude-vision.test.ts`

Expected: PASS (3 passing).

- [ ] **Step 5: Commit**

```bash
git add lib/claude-vision.ts __tests__/lib/claude-vision.test.ts
git commit -m "feat(claude-vision): parse SDK response into DetectedObject (happy path)"
```

---

### Task 5: Dynamic category + name hydration + `etc` coercion

**Files:**
- Modify: `lib/claude-vision.ts`
- Modify: `__tests__/lib/claude-vision.test.ts`

- [ ] **Step 1: Add the failing tests**

Append three cases inside `describe('claudeDetect', ...)`:

```ts
  it('hydrates localized names from getCategoryDef for known categories', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    messagesCreateMock.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify([
        { category: 'paper_carton', label: 'Milk carton', bbox: { x: 0, y: 0, w: 0.5, h: 0.5 } },
      ]) }],
    });

    const result = await claudeDetect('base64data');

    expect(result[0].category).toBe('paper_carton');
    expect(result[0].nameEn).toBe('Paper carton');
    expect(result[0].nameZh).toBeTruthy();
    expect(result[0].nameJa).toBeTruthy();
    expect(result[0].nameRu).toBeTruthy();
  });

  it('coerces unknown category to etc with ETC_NAMES', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    messagesCreateMock.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify([
        { category: 'banana_peel', label: 'banana', bbox: { x: 0, y: 0, w: 0.1, h: 0.1 } },
      ]) }],
    });

    const result = await claudeDetect('base64data');

    expect(result[0].category).toBe('etc');
    expect(result[0].nameEn).toBe('Other ❓');
  });

  it('accepts etc as an explicit category from Claude', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    messagesCreateMock.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify([
        { category: 'etc', label: 'unknown thing', bbox: { x: 0, y: 0, w: 0.1, h: 0.1 } },
      ]) }],
    });

    const result = await claudeDetect('base64data');

    expect(result[0].category).toBe('etc');
    expect(result[0].nameEn).toBe('Other ❓');
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run __tests__/lib/claude-vision.test.ts`

Expected: FAIL on the three new cases (category is always `'paper'`).

- [ ] **Step 3: Replace `coerceItem` to use the real category**

Update imports in `lib/claude-vision.ts`:

```ts
import { CATEGORY_IDS, ETC_NAMES, getCategoryDef } from '@/lib/categories';
import type { DetectedObject, WasteCategory } from '@/types';
```

Replace `coerceItem` entirely:

```ts
const VALID_CATEGORIES = new Set<string>([...CATEGORY_IDS, 'etc']);

function resolveCategory(raw: unknown): WasteCategory {
  if (typeof raw === 'string' && VALID_CATEGORIES.has(raw)) {
    return raw as WasteCategory;
  }
  return 'etc';
}

function coerceItem(item: ClaudeItem): DetectedObject | null {
  const b = item.bbox;
  if (
    !b ||
    typeof b.x !== 'number' || typeof b.y !== 'number' ||
    typeof b.w !== 'number' || typeof b.h !== 'number'
  ) return null;

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
```

- [ ] **Step 4: Run all tests to verify they pass**

Run: `npx vitest run __tests__/lib/claude-vision.test.ts`

Expected: PASS (6 passing).

- [ ] **Step 5: Commit**

```bash
git add lib/claude-vision.ts __tests__/lib/claude-vision.test.ts
git commit -m "feat(claude-vision): dynamic category + name hydration + etc coercion"
```

---

### Task 6: JSON markdown-fence cleanup

**Files:**
- Modify: `lib/claude-vision.ts`
- Modify: `__tests__/lib/claude-vision.test.ts`

Claude sometimes wraps JSON in ` ```json ... ``` ` even when told not to. One cleanup pass before `JSON.parse`.

- [ ] **Step 1: Add the failing test**

Append inside `describe('claudeDetect', ...)`:

```ts
  it('strips markdown fences before parsing', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const json = JSON.stringify([
      { category: 'plastic', label: 'bottle', bbox: { x: 0.1, y: 0.1, w: 0.2, h: 0.2 } },
    ]);
    messagesCreateMock.mockResolvedValue({
      content: [{ type: 'text', text: '```json\n' + json + '\n```' }],
    });

    const result = await claudeDetect('base64data');

    expect(result).toHaveLength(1);
    expect(result[0].category).toBe('plastic');
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/lib/claude-vision.test.ts -t "strips markdown"`

Expected: FAIL (`JSON.parse` throws on the backticks).

- [ ] **Step 3: Add `stripJsonFences` helper and call before `JSON.parse`**

Add to `lib/claude-vision.ts`:

```ts
function stripJsonFences(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenced ? fenced[1].trim() : trimmed;
}
```

Replace the `const parsed = JSON.parse(textBlock.text) as ClaudeItem[];` line with:

```ts
  const parsed = JSON.parse(stripJsonFences(textBlock.text)) as ClaudeItem[];
```

- [ ] **Step 4: Run all tests to verify they pass**

Run: `npx vitest run __tests__/lib/claude-vision.test.ts`

Expected: PASS (7 passing).

- [ ] **Step 5: Commit**

```bash
git add lib/claude-vision.ts __tests__/lib/claude-vision.test.ts
git commit -m "feat(claude-vision): strip markdown fences before JSON parse"
```

---

### Task 7: Error handling for bad JSON and non-array responses

**Files:**
- Modify: `lib/claude-vision.ts`
- Modify: `__tests__/lib/claude-vision.test.ts`

- [ ] **Step 1: Add the failing tests**

Append inside `describe('claudeDetect', ...)`:

```ts
  it('throws with diagnostic when response is not valid JSON', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    messagesCreateMock.mockResolvedValue({
      content: [{ type: 'text', text: 'I see a newspaper and a plastic bottle.' }],
    });

    await expect(claudeDetect('base64data')).rejects.toThrow(/invalid JSON/);
  });

  it('throws when JSON is not an array', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    messagesCreateMock.mockResolvedValue({
      content: [{ type: 'text', text: '{"category":"paper"}' }],
    });

    await expect(claudeDetect('base64data')).rejects.toThrow(/non-array/);
  });

  it('throws when there is no text content block', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    messagesCreateMock.mockResolvedValue({ content: [] });

    await expect(claudeDetect('base64data')).rejects.toThrow(/no text content/);
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run __tests__/lib/claude-vision.test.ts`

Expected: FAIL on the three new cases (the `JSON.parse` throw message and the `.map` call on non-array don't match the assertions).

- [ ] **Step 3: Wrap parse + array check with explicit errors**

Replace the parse block in `claudeDetect` (lines from `const parsed = JSON.parse(...)` through `return parsed.map(...);`) with:

```ts
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
```

- [ ] **Step 4: Run all tests to verify they pass**

Run: `npx vitest run __tests__/lib/claude-vision.test.ts`

Expected: PASS (10 passing).

- [ ] **Step 5: Commit**

```bash
git add lib/claude-vision.ts __tests__/lib/claude-vision.test.ts
git commit -m "feat(claude-vision): explicit errors for invalid JSON, non-array, missing text"
```

---

### Task 8: Empty array + malformed-item drop

**Files:**
- Modify: `lib/claude-vision.ts`
- Modify: `__tests__/lib/claude-vision.test.ts`

The "empty array" case should already pass from earlier work — but adding the explicit test locks the contract. The "malformed item dropped" case requires adding a `console.warn` (the current `coerceItem` already returns `null` for malformed items but is silent).

- [ ] **Step 1: Add the failing tests**

Append inside `describe('claudeDetect', ...)`:

```ts
  it('returns empty array when Claude detects no waste', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    messagesCreateMock.mockResolvedValue({
      content: [{ type: 'text', text: '[]' }],
    });

    const result = await claudeDetect('base64data');

    expect(result).toEqual([]);
  });

  it('drops malformed items, keeps good ones, warns', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    messagesCreateMock.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify([
        { category: 'paper', label: 'newspaper', bbox: { x: 0, y: 0, w: 0.1, h: 0.1 } },
        { category: 'plastic', label: 'no bbox' },
        { category: 'glass', label: 'partial bbox', bbox: { x: 0.5, y: 0.5 } },
      ]) }],
    });

    const result = await claudeDetect('base64data');

    expect(result).toHaveLength(1);
    expect(result[0].category).toBe('paper');
    expect(warnSpy).toHaveBeenCalledTimes(2);
    warnSpy.mockRestore();
  });
```

- [ ] **Step 2: Run tests to verify the "drops malformed" test fails**

Run: `npx vitest run __tests__/lib/claude-vision.test.ts`

Expected: "returns empty array" passes, "drops malformed items" fails (warn not called).

- [ ] **Step 3: Add `console.warn` to `coerceItem`**

Replace the early-return in `coerceItem` (the `return null;` after the bbox check) with:

```ts
  if (
    !b ||
    typeof b.x !== 'number' || typeof b.y !== 'number' ||
    typeof b.w !== 'number' || typeof b.h !== 'number'
  ) {
    console.warn('claude-vision: dropping malformed item', item);
    return null;
  }
```

- [ ] **Step 4: Run all tests to verify they pass**

Run: `npx vitest run __tests__/lib/claude-vision.test.ts`

Expected: PASS (12 passing).

- [ ] **Step 5: Commit**

```bash
git add lib/claude-vision.ts __tests__/lib/claude-vision.test.ts
git commit -m "feat(claude-vision): drop malformed items with warning, accept empty results"
```

---

### Task 9: Wire `DETECT_PROVIDER` flag into `lib/detect.ts`

**Files:**
- Modify: `lib/detect.ts`
- Modify: `__tests__/lib/detect.test.ts`

- [ ] **Step 1: Update the existing test file to cover env-flag branching**

Replace the entire contents of `__tests__/lib/detect.test.ts` with:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/vision', () => ({ cloudVisionDetect: vi.fn() }));
vi.mock('@/lib/claude-vision', () => ({ claudeDetect: vi.fn() }));

import { cloudVisionDetect } from '@/lib/vision';
import { claudeDetect } from '@/lib/claude-vision';
import { detectWaste } from '@/lib/detect';

beforeEach(() => {
  vi.clearAllMocks();
  delete process.env.DETECT_PROVIDER;
});

describe('detectWaste orchestrator', () => {
  it('returns category-enriched results when labels match the catalog', async () => {
    vi.mocked(cloudVisionDetect).mockResolvedValue([
      { nameEn: 'Newspaper', nameZh: '', nameJa: '', nameRu: '', category: '',
        bbox: { x: 10, y: 10, w: 20, h: 20 } },
      { nameEn: 'Plastic bag', nameZh: '', nameJa: '', nameRu: '', category: '',
        bbox: { x: 40, y: 40, w: 20, h: 20 } },
    ]);

    const result = await detectWaste('base64');

    expect(result).toHaveLength(2);
    expect(result[0].category).toBe('paper');
    expect(result[1].category).toBe('vinyl');
  });

  it('falls back to etc (unclear) for unmatched Vision labels', async () => {
    vi.mocked(cloudVisionDetect).mockResolvedValue([
      { nameEn: 'Newspaper', nameZh: '', nameJa: '', nameRu: '', category: '',
        bbox: { x: 0, y: 0, w: 10, h: 10 } },
      { nameEn: 'Banana', nameZh: '', nameJa: '', nameRu: '', category: '',
        bbox: { x: 50, y: 50, w: 10, h: 10 } },
    ]);

    const result = await detectWaste('base64');

    expect(result).toHaveLength(2);
    expect(result[0].category).toBe('paper');
    expect(result[1].category).toBe('etc');
  });

  it('returns an empty array when Vision finds nothing', async () => {
    vi.mocked(cloudVisionDetect).mockResolvedValue([]);

    const result = await detectWaste('base64');

    expect(result).toEqual([]);
  });

  it('propagates Vision errors to the caller', async () => {
    vi.mocked(cloudVisionDetect).mockRejectedValue(new Error('auth failed'));

    await expect(detectWaste('base64')).rejects.toThrow('auth failed');
  });

  it('routes to claudeDetect when DETECT_PROVIDER=claude', async () => {
    process.env.DETECT_PROVIDER = 'claude';
    vi.mocked(claudeDetect).mockResolvedValue([
      { nameEn: 'Paper', nameZh: '纸类', nameJa: '紙類', nameRu: 'Бумага',
        category: 'paper', bbox: { x: 5, y: 5, w: 10, h: 10 } },
    ]);

    const result = await detectWaste('base64');

    expect(claudeDetect).toHaveBeenCalledWith('base64');
    expect(cloudVisionDetect).not.toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0].category).toBe('paper');
  });

  it('routes to Vision when DETECT_PROVIDER is unset, empty, or unknown', async () => {
    vi.mocked(cloudVisionDetect).mockResolvedValue([]);

    delete process.env.DETECT_PROVIDER;
    await detectWaste('base64');
    process.env.DETECT_PROVIDER = '';
    await detectWaste('base64');
    process.env.DETECT_PROVIDER = 'gemini';
    await detectWaste('base64');

    expect(cloudVisionDetect).toHaveBeenCalledTimes(3);
    expect(claudeDetect).not.toHaveBeenCalled();
  });

  it('skips enrichObjects on the Claude path (Claude returns categorized)', async () => {
    process.env.DETECT_PROVIDER = 'claude';
    vi.mocked(claudeDetect).mockResolvedValue([
      { nameEn: 'X', nameZh: 'X', nameJa: 'X', nameRu: 'X',
        category: 'etc', bbox: { x: 0, y: 0, w: 1, h: 1 } },
    ]);

    const result = await detectWaste('base64');

    expect(result[0].category).toBe('etc');
    expect(result[0].nameEn).toBe('X');
  });
});
```

- [ ] **Step 2: Run tests to verify the new cases fail**

Run: `npx vitest run __tests__/lib/detect.test.ts`

Expected: the three new cases (routes to claudeDetect, routes to Vision, skips enrichObjects) FAIL. The old cases still pass.

- [ ] **Step 3: Update `lib/detect.ts`**

Replace the entire file contents:

```ts
import { cloudVisionDetect } from './vision';
import { claudeDetect } from './claude-vision';
import { enrichObjects } from './matcher';
import type { DetectedObject } from '@/types';

export async function detectWaste(base64Image: string): Promise<DetectedObject[]> {
  if (process.env.DETECT_PROVIDER === 'claude') {
    return claudeDetect(base64Image);
  }
  const raw = await cloudVisionDetect(base64Image);
  return enrichObjects(raw);
}
```

- [ ] **Step 4: Run all tests to verify they pass**

Run: `npx vitest run __tests__/lib/detect.test.ts`

Expected: PASS (7 passing).

- [ ] **Step 5: Commit**

```bash
git add lib/detect.ts __tests__/lib/detect.test.ts
git commit -m "feat(detect): branch on DETECT_PROVIDER env var (vision | claude)"
```

---

### Task 10: Full test + typecheck + lint sweep

Sanity pass on the whole repo before manual QA.

- [ ] **Step 1: Run the whole test suite**

Run: `npm test`

Expected: All suites pass. No regressions in `analyze.test.ts`, `ObjectOverlay.test.tsx`, or any other existing test.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`

Expected: No errors.

- [ ] **Step 3: Lint**

Run: `npm run lint`

Expected: No errors.

- [ ] **Step 4: If any step fails, fix inline and re-run**

If `tsc` complains about Anthropic SDK types, check the actual response-content type — in the SDK, content blocks are a discriminated union. The current code does:

```ts
const textBlock = response.content.find(b => b.type === 'text') as { type: 'text'; text: string } | undefined;
```

If `tsc` finds a better-typed pattern (e.g., a type guard), use it. Don't widen to `any`.

- [ ] **Step 5: Commit any fixups**

```bash
git add -p   # stage just the fixes
git commit -m "chore(claude-vision): type/lint fixups"
```

(Skip the commit if there were no fixes to make.)

---

### Task 11: Manual QA (no commit)

Validates the wiring end-to-end. Not automatable because it needs a real photo + real Claude credentials.

- [ ] **Step 1: Add env vars to `.env.local`**

Append to `.env.local`:

```
ANTHROPIC_API_KEY=<your-key>
DETECT_PROVIDER=claude
```

- [ ] **Step 2: Run dev server**

Run: `npm run dev`

Open `http://localhost:3000/en/scan` in a phone or a desktop browser.

- [ ] **Step 3: Take/upload a photo of household waste**

Use a photo that contains at least one item from each of several categories (e.g., a milk carton, a plastic bottle, a newspaper).

Expected: The scan page shows chips positioned over the items with correct categories. Check the Network tab — the response from `/api/analyze` should have `objects[].category` values from the 12 categories or `etc`.

- [ ] **Step 4: Toggle the flag off**

Comment out `DETECT_PROVIDER=claude` in `.env.local`, restart `npm run dev`, repeat the scan.

Expected: The Vision path runs (chip placement and labels may differ — that's the point of the comparison).

- [ ] **Step 5: Error-path smoke test**

Temporarily set `ANTHROPIC_API_KEY=bad-key` with `DETECT_PROVIDER=claude`. Scan a photo.

Expected: `/api/analyze` returns 500. Server console logs the Anthropic auth error with `code` / `message`. UI handles the 500 (existing error path).

Restore valid key + flag setting (or leave `DETECT_PROVIDER` unset) before ending the session.

---

## Self-Review

**Spec coverage:**
- New `lib/claude-vision.ts` with `claudeDetect()` returning `DetectedObject[]` — Tasks 2-8 ✓
- API key check — Task 2 ✓
- Sonnet 4.6 model — Task 3 ✓
- System prompt from `CATEGORY_IDS` with `cache_control: ephemeral` — Task 3 ✓
- JSON parsing with fence cleanup — Tasks 4, 6 ✓
- Category coercion to `etc`, hydration from `getCategoryDef` — Task 5 ✓
- bbox 0-1 → 0-100% with clamp — Task 4 ✓
- Malformed item drop with warn — Task 8 ✓
- Errors: invalid JSON, non-array, no text content, missing API key — Tasks 2, 7 ✓
- Empty array passthrough — Task 8 ✓
- Wire env flag into `detect.ts`, default = Vision, skip `enrichObjects` on Claude path — Task 9 ✓
- Tests mirroring `vision.test.ts` (`vi.hoisted` + module mock) — Tasks 2-8 ✓
- Update `detect.test.ts` with env-flag branching — Task 9 ✓
- `analyze.test.ts` unchanged — confirmed in Task 10 ✓
- Manual QA — Task 11 ✓

**Placeholder scan:** No TBD / TODO / "implement later" / "add error handling". Every code step has the full code. No "similar to Task N".

**Type consistency:** `claudeDetect(base64Image: string): Promise<DetectedObject[]>` is consistent across Task 2, Task 4, and the call site in Task 9. `coerceItem`, `resolveCategory`, `stripJsonFences`, `getSystemPrompt`, `getClient` are each defined once. `ClaudeItem` type is declared in Task 4 and reused in Task 7.

**One thing to double-check during execution:** The Anthropic SDK's response shape may have evolved. Task 10 includes a typecheck pass; if `response.content` has a different shape than the `find(b => b.type === 'text')` cast assumes, fix it inline (without widening to `any`).
