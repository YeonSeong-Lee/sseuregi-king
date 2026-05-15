# Switch Image Detection to Claude API (Flag-Gated)

**Date:** 2026-05-15
**Status:** Design approved, pending implementation plan

## Problem

`lib/vision.ts` calls Google Vision's `objectLocalization` to return generic object labels (e.g., "Bottle", "Newspaper"), then `lib/matcher.ts` alias-matches them to one of 12 waste categories. Items whose Vision label doesn't appear in any category's `aliases` array fall to `etc`. In practice this happens often — Vision returns broad object names that don't reflect Korean household waste taxonomy (e.g., a crushed milk carton labeled "Carton" doesn't alias-match `paper_carton`).

The goal is to swap the detection step to Claude (Sonnet 4.6), which can be prompted with the 12-category taxonomy and classify directly. A `DETECT_PROVIDER` env flag selects the provider so we can roll out incrementally and fall back operationally if Claude has an outage.

## Non-goals

- Removing Google Vision from the codebase. Both providers stay; the flag selects.
- Per-request provider override from the client. Env var only.
- Automatic cross-provider fallback inside `detectWaste`. Failing fast is the chosen behavior.
- Making the Claude model configurable. Hardcoded to `claude-sonnet-4-6`.

## Architecture

```
app/api/analyze/route.ts
        │
        ▼
lib/detect.ts                ← reads DETECT_PROVIDER, branches
   ├─ if 'claude' →  lib/claude-vision.ts  → DetectedObject[] (already categorized)
   └─ else        →  lib/vision.ts         → RawDetected[] → enrichObjects() → DetectedObject[]
```

- **New file:** `lib/claude-vision.ts`
- **Unchanged:** `lib/vision.ts`, `lib/matcher.ts`, `app/api/analyze/route.ts`
- **New env vars:** `DETECT_PROVIDER` (`claude` | anything-else → vision), `ANTHROPIC_API_KEY`
- **New dependency:** `@anthropic-ai/sdk`

Default = Vision. Any value other than the literal string `'claude'` (including unset, typo, empty) routes to Vision. The operator opts in to Claude by setting `DETECT_PROVIDER=claude`.

## `lib/claude-vision.ts`

**Exported function:** `claudeDetect(base64Image: string): Promise<DetectedObject[]>`

Returns `DetectedObject[]` directly — already categorized, with localized names hydrated. This differs from `cloudVisionDetect`, which returns `RawDetected[]` and depends on `enrichObjects`.

### Client init

Lazy singleton, matching `lib/vision.ts`:

```ts
let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (_client) return _client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');
  _client = new Anthropic({ apiKey });
  return _client;
}
```

### Prompt

Built once at module load from `lib/categories.ts` (`CATEGORY_IDS` is the source of truth — adding a 13th category later just means updating `categories.ts` and `waste-categories.json`).

**System prompt** (cached via `cache_control: { type: 'ephemeral' }`):

> You identify recyclable waste items in photos taken in Korean households. Return a JSON array. Each item must have:
> - `category`: one of `paper`, `paper_carton`, `glass`, `metal_can`, `plastic`, `vinyl`, `styrofoam`, `clothing`, `lightbulb`, `food`, `general`, `large`, or `etc` if unsure
> - `label`: short English noun phrase (e.g., "milk carton")
> - `bbox`: `{ x, y, w, h }` in normalized coordinates 0-1 (top-left origin)
>
> Output ONLY the JSON array. No prose, no markdown fences.

Plus a brief one-line description per category, generated from the 12 ids. Example seed line: `"paper_carton: cardboard milk/juice cartons, often with plastic caps"`. The exact descriptions can be tuned during implementation; the spec only commits to "one line per category, derived from waste-categories.json".

**User message:** the image as a base64 JPEG content block.

### Output parsing

1. Extract text from the response's first content block.
2. Strip ` ```json ` / ` ``` ` fences if present.
3. `JSON.parse`. If parse fails, throw with first 200 chars of the response.
4. Assert array. If not, throw.
5. For each item:
   - Drop and `console.warn` if `category` / `bbox` missing or wrong type.
   - If `category` not in `CATEGORY_IDS ∪ {'etc'}`, coerce to `'etc'`.
   - Hydrate `nameEn`/`nameZh`/`nameJa`/`nameRu` from `getCategoryDef(category).names`. For `etc`, use `ETC_NAMES`.
   - Convert bbox 0-1 → 0-100 percent. Clamp to `[0, 100]`. Ensure `w`, `h` are positive.
6. Return the validated `DetectedObject[]`.

## `lib/detect.ts`

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

`process.env.DETECT_PROVIDER` is read per request. Next.js server runtime supports this and a single env compare per request is free.

## Error handling

`app/api/analyze/route.ts`'s existing `catch` block logs `message`/`code`/`details` and returns 500. The Claude path throws in a way that's compatible with that log.

| Failure | Behavior |
|---|---|
| `ANTHROPIC_API_KEY` missing | Throw on client init. |
| Anthropic SDK throws (network, 429, 5xx, auth) | Bubble. SDK internally retries idempotent server errors. |
| Response has no text content block | Throw `'Claude returned no text content'`. |
| Response is not valid JSON (after fence strip) | Throw `'Claude returned invalid JSON: <first 200 chars>'`. |
| Response is JSON but not an array | Throw `'Claude returned non-array JSON'`. |
| Individual item malformed | Drop the item, `console.warn`. Partial results > zero results. |
| Item has unknown category | Coerce to `'etc'`. Not an error. |
| Empty array (Claude saw no waste) | Return `[]`. UI already handles this (photo-tips sheet from commit `5b892d1`). |

No in-process retries. No cross-provider fallback. If Claude is down, the operator flips `DETECT_PROVIDER` off Claude.

## Testing

### New: `__tests__/lib/claude-vision.test.ts`

Mock `@anthropic-ai/sdk` at the module boundary using `vi.hoisted`, same pattern as `vision.test.ts`.

Test cases:

1. **Happy path** — single well-formed item produces `DetectedObject` with category-driven localized names and bbox in 0-100 percent.
2. **Category coercion** — unknown category coerced to `'etc'` with `ETC_NAMES`.
3. **Localized names hydration** — `paper_carton` response → `nameZh`/`nameJa`/`nameRu` come from `getCategoryDef`, not from Claude.
4. **JSON fence cleanup** — response wrapped in ` ```json ... ``` ` still parses.
5. **Malformed item dropped** — array with one good + one bad item returns one item, no throw, warning logged.
6. **Invalid JSON throws** — prose response throws with first-200-chars diagnostic.
7. **Empty array** — `[]` response returns `[]`.
8. **Missing API key** — throws `'ANTHROPIC_API_KEY not set'`.

### Updated: `__tests__/lib/detect.test.ts`

Add cases that flip `process.env.DETECT_PROVIDER` and assert which underlying mock (Vision vs Claude) is called. `beforeEach` clears the env var so cases are independent.

### Unchanged

`__tests__/api/analyze.test.ts` — the API contract is unchanged; the route still returns `{ objects: DetectedObject[] }`.

### Manual QA

1. `npm run dev`
2. Set `DETECT_PROVIDER=claude` and `ANTHROPIC_API_KEY=...` in `.env.local`.
3. Open `/scan`, take/upload a photo of household waste.
4. Verify chips appear in roughly correct positions with correct categories.
5. Unset `DETECT_PROVIDER`, confirm Vision path still works.

## Rollout

1. Land code with `DETECT_PROVIDER` unset → no behavior change in prod.
2. Test in dev with `DETECT_PROVIDER=claude`.
3. Flip prod env var to Claude. Monitor `console.error` for parse failures, watch user-visible accuracy.
4. If accuracy regresses, unset the env var to revert to Vision. No deploy needed.
