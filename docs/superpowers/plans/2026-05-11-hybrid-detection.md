# Hybrid Object Detection: Cloud Vision + Claude Fallback

## Context

Every scan currently invokes Claude Sonnet 4.6 vision (`lib/analyze.ts`). Cost ≈ $0.01 per scan, latency ~1–2 s. The matching architecture (`lib/matcher.ts` resolves model-emitted English labels to a curated `data/waste-items.json` catalog) does not actually require a generative model — any object detector that returns an English label and a bounding box will work.

This plan introduces Google Cloud Vision Object Localization as a 1st-pass detector with a free monthly tier (1000 requests / month / feature, then $1.50 / 1000), keeping Claude as the fallback when Vision can't cover a scan. For sufficiently common Korean-trash photos (newspaper, cardboard, can, plastic bag, phone, generic bottle), this drives marginal cost to **$0** until quota is exhausted; for less common items (food_waste, styrofoam, battery — not in Open Images v4) the system falls back to Claude transparently.

Selection / fallback rule (locked in with user):

> Vision detects N ≥ 1 items AND every result resolves through `matcher` to a catalog item → return Vision result. Otherwise (zero detections, or any result that doesn't match the catalog) → discard Vision output and re-run via the existing Claude path on the full image.

The "Bottle" disambiguation question (`plastic` vs `glass`) is **out of scope** for this plan — current `data/waste-items.json` aliases route generic `"bottle"` to `glass_bottle`, and we accept that as the default. Either model is empirically imperfect at this anyway.

## Architecture

```
POST /api/analyze
   │
   ▼
detectWaste(base64)                       ── lib/detect.ts (NEW)
   │
   ├─ try cloudVisionDetect(base64)       ── lib/vision.ts  (NEW)
   │     │
   │     └─ Cloud Vision Object Localization
   │           returns [{ label, score, bbox }] in pixel-percent
   │
   ├─ enrichObjects(visionResults)        ── lib/matcher.ts (modified)
   │     │
   │     └─ resolves label → WasteItem; pulls names from catalog
   │
   ├─ if results.length > 0
   │  AND every result has itemId !== null
   │  AND vision call did not throw
   │     → return enriched results
   │
   └─ else (zero, partial-match, or Vision exception)
         └─ enrichObjects(await analyzeImage(base64))
               ── existing Claude path, unchanged
```

## Files to modify

| File | Type | Notes |
|---|---|---|
| `package.json` / `package-lock.json` | dep | add `@google-cloud/vision` |
| `lib/vision.ts` | **NEW** | Cloud Vision wrapper |
| `lib/detect.ts` | **NEW** | orchestrator with fallback rule |
| `lib/matcher.ts` | modify | prefer catalog `category` and `names` when match exists |
| `app/api/analyze/route.ts` | modify | call `detectWaste` instead of `analyzeImage` directly |
| `data/waste-items.json` | modify | `electronic_waste.aiAliases` += `"mobile phone"`, `"tablet computer"` |
| `lib/analyze.ts` | unchanged | continues to be the fallback |
| `__tests__/lib/vision.test.ts` | **NEW** | normalizedVertices → BBox math, confidence filter |
| `__tests__/lib/detect.test.ts` | **NEW** | three orchestrator branches |
| `__tests__/lib/matcher.test.ts` | extend | catalog-prefers-over-raw assertions |

## Cloud Vision specifics

### Request

Use the official Node.js client `@google-cloud/vision`. Auth via `GOOGLE_APPLICATION_CREDENTIALS` pointing at the service-account JSON. Single feature: `LOCALIZED_OBJECT_DETECTION`.

```ts
import vision from '@google-cloud/vision';
const client = new vision.ImageAnnotatorClient();
const [response] = await client.objectLocalization({ image: { content: base64 } });
const annotations = response.localizedObjectAnnotations ?? [];
```

### Response shape

```ts
{
  name: 'Newspaper',
  score: 0.91,                    // 0..1 confidence
  boundingPoly: {
    normalizedVertices: [         // 4 points, clockwise from top-left
      { x: 0.1, y: 0.2 },
      { x: 0.4, y: 0.2 },
      { x: 0.4, y: 0.6 },
      { x: 0.1, y: 0.6 },
    ],
  },
}
```

### normalizedVertices → our BBox (% coords)

```ts
// types/index.ts BBox is { x, y, w, h } in % (0..100)
const xs = vertices.map(v => v.x ?? 0);
const ys = vertices.map(v => v.y ?? 0);
const x = Math.min(...xs) * 100;
const y = Math.min(...ys) * 100;
const w = (Math.max(...xs) - Math.min(...xs)) * 100;
const h = (Math.max(...ys) - Math.min(...ys)) * 100;
```

Vertices may be missing (`undefined`) for fields the API didn't fill — defensive `?? 0`.

### Confidence filter

Drop annotations with `score < 0.5`. Open Images detections below that threshold are noisy and would frequently trigger fallback unnecessarily. Constant in the file, easy to tune.

## Code sketches

### `lib/vision.ts` (new)

```ts
import vision from '@google-cloud/vision';
import type { RawDetected } from './analyze';

const SCORE_THRESHOLD = 0.5;
const client = new vision.ImageAnnotatorClient();

export async function cloudVisionDetect(base64Image: string): Promise<RawDetected[]> {
  const [response] = await client.objectLocalization({
    image: { content: base64Image },
  });
  const annotations = response.localizedObjectAnnotations ?? [];

  return annotations
    .filter(a => (a.score ?? 0) >= SCORE_THRESHOLD)
    .map(a => {
      const vs = a.boundingPoly?.normalizedVertices ?? [];
      const xs = vs.map(v => v.x ?? 0);
      const ys = vs.map(v => v.y ?? 0);
      return {
        nameEn: a.name ?? '',
        nameZh: '', nameJa: '', nameRu: '',  // matcher fills from catalog
        category: '',                          // matcher fills from catalog
        bbox: {
          x: Math.min(...xs) * 100,
          y: Math.min(...ys) * 100,
          w: (Math.max(...xs) - Math.min(...xs)) * 100,
          h: (Math.max(...ys) - Math.min(...ys)) * 100,
        },
      };
    });
}
```

> `RawDetected` is exported from `lib/analyze.ts:13` — reuse it so both detectors return the same shape.

### `lib/detect.ts` (new)

```ts
import { cloudVisionDetect } from './vision';
import { analyzeImage } from './analyze';
import { enrichObjects } from './matcher';
import type { DetectedObject } from '@/types';

export async function detectWaste(base64: string): Promise<DetectedObject[]> {
  let visionEnriched: DetectedObject[] | null = null;
  try {
    const visionRaw = await cloudVisionDetect(base64);
    visionEnriched = enrichObjects(visionRaw);
  } catch (err) {
    console.warn('cloud vision failed, falling back to claude:', err);
  }

  if (
    visionEnriched &&
    visionEnriched.length > 0 &&
    visionEnriched.every(o => o.itemId !== null)
  ) {
    return visionEnriched;
  }

  const claudeRaw = await analyzeImage(base64);
  return enrichObjects(claudeRaw);
}
```

### `lib/matcher.ts` (modify `enrichObjects`)

Currently passes `obj.category` and model-supplied `nameZh/Ja/Ru` straight through. After the change, if the matcher resolves a `WasteItem`, prefer the catalog's authoritative values; fall back to raw only when unmatched.

```ts
export function enrichObjects(rawObjects: RawObject[]): DetectedObject[] {
  return rawObjects.map(obj => {
    const match = matchItem(obj.nameEn);
    return {
      nameEn: match?.names.en ?? obj.nameEn,
      nameZh: match?.names.zh ?? obj.nameZh,
      nameJa: match?.names.ja ?? obj.nameJa,
      nameRu: match?.names.ru ?? obj.nameRu,
      category: (match?.category ?? obj.category) as WasteCategory,
      bbox: obj.bbox,
      itemId: match?.id ?? null,
      videoUrl: match?.videoUrl ?? null,
      thumbnailUrl: match?.thumbnailUrl ?? null,
    };
  });
}
```

This change has two benefits beyond enabling Cloud Vision:

1. **Cloud Vision can supply empty `category` / `nameZh/Ja/Ru`**, and `enrichObjects` fills them in.
2. **Resolves a latent bug** where a hallucinated Claude `category: 'huge'` would have pushed `undefined` into `CATEGORY_BG[obj.category]` (the color map shipped in commit `4b3c237`).

### `app/api/analyze/route.ts`

Single-line swap:

```ts
- import { analyzeImage } from '@/lib/analyze';
- import { enrichObjects } from '@/lib/matcher';
+ import { detectWaste } from '@/lib/detect';
…
-   const rawObjects = await analyzeImage(body.image);
-   const objects = enrichObjects(rawObjects);
+   const objects = await detectWaste(body.image);
```

### `data/waste-items.json` aliases additions

Only `electronic_waste`:

```diff
- "aiAliases": ["phone", "smartphone", "tablet", "laptop", "computer", "electronic device", "e-waste", "electronics"]
+ "aiAliases": ["phone", "smartphone", "tablet", "laptop", "computer", "electronic device", "e-waste", "electronics", "mobile phone", "tablet computer"]
```

Reason: matcher does case-insensitive **exact** match, and Cloud Vision returns `"Mobile phone"` / `"Tablet computer"` rather than `"phone"` / `"tablet"`. Other catalog items already cover the relevant Vision labels (`"Bottle"`, `"Tin can"`, `"Plastic bag"`, `"Newspaper"`, `"Box"`).

## GCP setup (manual, one-time, by user)

1. Sign in at https://console.cloud.google.com
2. Create a project (or pick existing). Note the project ID.
3. Enable the API: **APIs & Services → Library → search "Cloud Vision API" → Enable**
4. Create service account: **APIs & Services → Credentials → + Create Credentials → Service account**
   - Name: `sseuregi-vision`
   - Roles: none required for Vision API access via JSON key (default user identity is sufficient); add `Cloud Vision AI Service Agent` if you want explicit auditing.
5. Generate JSON key: open the new service account → **Keys → Add Key → Create new key → JSON → download**.
6. Move the key:
   ```bash
   mkdir -p ~/.config/gcloud
   mv ~/Downloads/<project>-*.json ~/.config/gcloud/sseuregi-vision.json
   chmod 600 ~/.config/gcloud/sseuregi-vision.json
   ```
7. Add to `.env.local` (gitignored):
   ```env
   GOOGLE_APPLICATION_CREDENTIALS=/Users/yeonseong/.config/gcloud/sseuregi-vision.json
   ```
8. **Billing**: GCP requires a billing account on the project even for free-tier consumption. Add a payment method via **Billing → Link a billing account**. The free tier (1000 requests / month / feature) will not charge; you only pay if you exceed it.

A 60-second smoke test once steps 1–7 are done:

```bash
curl -s -X POST -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json" \
  https://vision.googleapis.com/v1/images:annotate \
  -d '{"requests":[{"image":{"source":{"imageUri":"https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Plastic_bottle_2_Pengo.jpg/240px-Plastic_bottle_2_Pengo.jpg"}},"features":[{"type":"LOCALIZED_OBJECT_DETECTION"}]}]}' \
  | python3 -m json.tool
```

Expected: a JSON response containing `"localizedObjectAnnotations"` with at least one `"Bottle"` entry.

## Verification

### Pre-GCP (no live API calls — runs on CI / dev box for free)

1. **Type check** — `npx tsc --noEmit`
2. **`__tests__/lib/vision.test.ts`** (new) —
   - Mock `@google-cloud/vision` so `client.objectLocalization` returns canned `localizedObjectAnnotations`.
   - Assert: 4 normalizedVertices `(0.1, 0.2) (0.4, 0.2) (0.4, 0.6) (0.1, 0.6)` → `BBox { x: 10, y: 20, w: 30, h: 40 }`.
   - Assert: annotation with `score: 0.3` is filtered out, `score: 0.5` kept.
   - Assert: missing `boundingPoly` doesn't throw (defensive `?? 0`).
3. **`__tests__/lib/detect.test.ts`** (new) — three branches:
   - Vision returns 3 results, all match catalog → Claude mock not called.
   - Vision returns 3 results, 1 unmatched → Claude mock called once with original base64.
   - Vision throws → Claude mock called once.
4. **`__tests__/lib/matcher.test.ts`** (extend) — assert that when a match exists, `enrichObjects` overrides raw `category` / `nameZh/Ja/Ru` with catalog values.
5. **`__tests__/api/analyze.test.ts`** — update mocks: now mocks `@/lib/detect` instead of `@/lib/analyze` + `@/lib/matcher`. Two existing test cases (400 on missing image, 200 with enriched payload) stay green with minimal edits.
6. **All existing tests** — `npm test` stays green (5 → 7 files, 19 → ~26 tests).

### Post-GCP (one-shot, ≤ 5 free-tier requests)

7. Start dev server: `npm run dev -- --port 3456`
8. Scan a photo containing a **newspaper** or **cardboard box** → expect Vision-only path: response in ~300ms, correct catalog match, no Claude billing event.
9. Scan a photo containing a **banana peel** (food_waste, not in Open Images) → expect fallback: ~1–2s response, correct match via Claude.
10. Scan a photo with **no waste at all** → expect Vision returns 0, Claude returns `[]`, UI shows "no items detected" (current empty-state behavior).

## Out of scope

- "Bottle" plastic-vs-glass disambiguation. Default routing to `glass_bottle` per current aliases is accepted.
- Vertex AI AutoML custom training for Korea-specific waste classes.
- Per-object cropping + per-crop LLM identification.
- Prompt caching on the Claude path.
- Other detection-quality items from the earlier review (bbox bounds clamp, response.content[0] safety, server-side payload size cap).

## Rollback

If Vision misbehaves in production:

- Set the env var `DISABLE_CLOUD_VISION=true` and add an early-exit at the top of `detectWaste` that always falls through to Claude. (One-line change, doesn't require redeploying without `@google-cloud/vision`.)
- Or revert the route change to call `analyzeImage` + `enrichObjects` directly.
