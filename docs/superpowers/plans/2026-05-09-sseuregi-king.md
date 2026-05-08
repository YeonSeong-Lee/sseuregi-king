# Sseuregi King Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first Next.js web app where foreigners photograph trash in Korea, AI detects waste objects and overlays tappable tags, and users get disposal guide videos — with a Pokémon-style Trash Dex collection system.

**Architecture:** Next.js 15 App Router with next-intl for locale routing (en/zh/ja/ru). A single API route calls Claude Vision to detect objects and map them to S3 video URLs via a local JSON file. No DB — localStorage stores unlock state. Scan immediately unlocks items.

**Tech Stack:** Next.js 15, Tailwind CSS, next-intl, @anthropic-ai/sdk (claude-sonnet-4-6), AWS S3, localStorage, Vitest + React Testing Library

---

## File Map

| File | Responsibility |
|------|---------------|
| `types/index.ts` | Shared TypeScript types |
| `data/waste-items.json` | Master waste item catalog (10 items) |
| `data/i18n/en.json` | English UI strings |
| `data/i18n/zh.json` | Chinese UI strings |
| `data/i18n/ja.json` | Japanese UI strings |
| `data/i18n/ru.json` | Russian UI strings |
| `i18n/routing.ts` | next-intl locale routing config |
| `i18n/request.ts` | next-intl server-side message loader |
| `middleware.ts` | next-intl locale detection + redirect |
| `lib/storage.ts` | localStorage read/write/unlock helpers |
| `lib/matcher.ts` | Maps Claude nameEn → WasteItem via aiAliases |
| `lib/analyze.ts` | Claude Vision API call (server-only) |
| `app/api/analyze/route.ts` | POST /api/analyze — calls analyze + matcher |
| `hooks/useCollection.ts` | React hook: unlock state from localStorage |
| `components/CameraCapture.tsx` | Camera/gallery input with client-side resize |
| `components/ObjectOverlay.tsx` | Photo with floating tappable bbox tags |
| `components/VideoPlayer.tsx` | S3 video player with per-object tab UI |
| `components/TrashDex.tsx` | 4-column collection grid |
| `components/BottomNav.tsx` | Bottom tab navigation (Scan / Collection) |
| `app/[locale]/layout.tsx` | NextIntlClientProvider + BottomNav wrapper |
| `app/[locale]/page.tsx` | Language selection screen |
| `app/[locale]/scan/page.tsx` | Scan flow (capture → analyzing → overlay → video) |
| `app/[locale]/collection/page.tsx` | Trash Dex collection screen |

---

### Task 1: Project Setup

**Files:**
- Create: project root (via npx)
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`

- [ ] **Step 1: Scaffold Next.js 15 project**

```bash
cd /Users/yeonseong/project/sseuregi-king
npx create-next-app@latest . --typescript --tailwind --app --src-dir=no --import-alias="@/*" --yes
```

Expected: `✓ Installation complete`

- [ ] **Step 2: Install additional dependencies**

```bash
npm install next-intl @anthropic-ai/sdk
npm install --save-dev vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 3: Create vitest.config.ts**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
});
```

- [ ] **Step 4: Create vitest.setup.ts**

```typescript
// vitest.setup.ts
import '@testing-library/jest-dom';
```

- [ ] **Step 5: Add test scripts to package.json**

In `package.json`, add to the `"scripts"` section:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 6: Verify setup compiles**

```bash
npm run test
```

Expected: exits 0 with "No test files found"

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js 15 with Tailwind, next-intl, Anthropic SDK, Vitest"
```

---

### Task 2: Types and Data Files

**Files:**
- Create: `types/index.ts`
- Create: `data/waste-items.json`
- Create: `data/i18n/en.json`
- Create: `data/i18n/zh.json`
- Create: `data/i18n/ja.json`
- Create: `data/i18n/ru.json`

- [ ] **Step 1: Create types/index.ts**

```typescript
// types/index.ts
export type Locale = 'en' | 'zh' | 'ja' | 'ru';
export type WasteCategory = 'recycling' | 'food' | 'general' | 'large';

export interface WasteItem {
  id: string;
  emoji: string;
  category: WasteCategory;
  names: Record<Locale, string>;
  videoUrl: string;
  thumbnailUrl: string;
  aiAliases: string[];
}

export interface BBox {
  x: number; // % of image width (0-100)
  y: number; // % of image height (0-100)
  w: number;
  h: number;
}

export interface DetectedObject {
  nameEn: string;
  nameZh: string;
  nameJa: string;
  nameRu: string;
  category: WasteCategory;
  bbox: BBox;
  itemId: string | null;
  videoUrl: string | null;
  thumbnailUrl: string | null;
}

export interface StorageData {
  lang: Locale;
  unlockedIds: string[];
  lastScanAt: string | null;
}
```

- [ ] **Step 2: Create data/waste-items.json**

S3 URLs use bucket name `sseuregi-king-videos` — replace with actual bucket after upload.

```json
{
  "plastic_bottle": {
    "id": "plastic_bottle",
    "emoji": "🍶",
    "category": "recycling",
    "names": { "en": "Plastic Bottle", "zh": "塑料瓶", "ja": "ペットボトル", "ru": "Пластиковая бутылка" },
    "videoUrl": "https://sseuregi-king-videos.s3.ap-northeast-2.amazonaws.com/plastic-bottle.mp4",
    "thumbnailUrl": "https://sseuregi-king-videos.s3.ap-northeast-2.amazonaws.com/plastic-bottle-thumb.jpg",
    "aiAliases": ["plastic bottle", "pet bottle", "water bottle", "soda bottle", "beverage bottle"]
  },
  "newspaper": {
    "id": "newspaper",
    "emoji": "📰",
    "category": "recycling",
    "names": { "en": "Newspaper", "zh": "报纸", "ja": "新聞紙", "ru": "Газета" },
    "videoUrl": "https://sseuregi-king-videos.s3.ap-northeast-2.amazonaws.com/newspaper.mp4",
    "thumbnailUrl": "https://sseuregi-king-videos.s3.ap-northeast-2.amazonaws.com/newspaper-thumb.jpg",
    "aiAliases": ["newspaper", "paper", "magazine", "flyer"]
  },
  "glass_bottle": {
    "id": "glass_bottle",
    "emoji": "🍾",
    "category": "recycling",
    "names": { "en": "Glass Bottle", "zh": "玻璃瓶", "ja": "ガラス瓶", "ru": "Стеклянная бутылка" },
    "videoUrl": "https://sseuregi-king-videos.s3.ap-northeast-2.amazonaws.com/glass-bottle.mp4",
    "thumbnailUrl": "https://sseuregi-king-videos.s3.ap-northeast-2.amazonaws.com/glass-bottle-thumb.jpg",
    "aiAliases": ["glass bottle", "bottle", "wine bottle", "beer bottle", "glass jar", "jar"]
  },
  "aluminum_can": {
    "id": "aluminum_can",
    "emoji": "🥫",
    "category": "recycling",
    "names": { "en": "Aluminum Can", "zh": "铝罐", "ja": "アルミ缶", "ru": "Алюминиевая банка" },
    "videoUrl": "https://sseuregi-king-videos.s3.ap-northeast-2.amazonaws.com/aluminum-can.mp4",
    "thumbnailUrl": "https://sseuregi-king-videos.s3.ap-northeast-2.amazonaws.com/aluminum-can-thumb.jpg",
    "aiAliases": ["aluminum can", "aluminium can", "can", "soda can", "beer can", "tin can"]
  },
  "food_waste": {
    "id": "food_waste",
    "emoji": "🍱",
    "category": "food",
    "names": { "en": "Food Waste", "zh": "厨余垃圾", "ja": "生ごみ", "ru": "Пищевые отходы" },
    "videoUrl": "https://sseuregi-king-videos.s3.ap-northeast-2.amazonaws.com/food-waste.mp4",
    "thumbnailUrl": "https://sseuregi-king-videos.s3.ap-northeast-2.amazonaws.com/food-waste-thumb.jpg",
    "aiAliases": ["food waste", "food scraps", "leftovers", "food", "banana peel", "vegetable scraps", "fruit peel"]
  },
  "cardboard": {
    "id": "cardboard",
    "emoji": "📦",
    "category": "recycling",
    "names": { "en": "Cardboard Box", "zh": "纸箱", "ja": "段ボール", "ru": "Картонная коробка" },
    "videoUrl": "https://sseuregi-king-videos.s3.ap-northeast-2.amazonaws.com/cardboard.mp4",
    "thumbnailUrl": "https://sseuregi-king-videos.s3.ap-northeast-2.amazonaws.com/cardboard-thumb.jpg",
    "aiAliases": ["cardboard", "cardboard box", "box", "shipping box", "corrugated box"]
  },
  "styrofoam": {
    "id": "styrofoam",
    "emoji": "🫙",
    "category": "recycling",
    "names": { "en": "Styrofoam", "zh": "泡沫塑料", "ja": "発泡スチロール", "ru": "Пенопласт" },
    "videoUrl": "https://sseuregi-king-videos.s3.ap-northeast-2.amazonaws.com/styrofoam.mp4",
    "thumbnailUrl": "https://sseuregi-king-videos.s3.ap-northeast-2.amazonaws.com/styrofoam-thumb.jpg",
    "aiAliases": ["styrofoam", "foam", "polystyrene", "foam cup", "foam tray"]
  },
  "plastic_bag": {
    "id": "plastic_bag",
    "emoji": "🛍️",
    "category": "general",
    "names": { "en": "Plastic Bag", "zh": "塑料袋", "ja": "ビニール袋", "ru": "Полиэтиленовый пакет" },
    "videoUrl": "https://sseuregi-king-videos.s3.ap-northeast-2.amazonaws.com/plastic-bag.mp4",
    "thumbnailUrl": "https://sseuregi-king-videos.s3.ap-northeast-2.amazonaws.com/plastic-bag-thumb.jpg",
    "aiAliases": ["plastic bag", "shopping bag", "grocery bag", "vinyl bag", "trash bag"]
  },
  "battery": {
    "id": "battery",
    "emoji": "🔋",
    "category": "general",
    "names": { "en": "Battery", "zh": "电池", "ja": "電池", "ru": "Батарейка" },
    "videoUrl": "https://sseuregi-king-videos.s3.ap-northeast-2.amazonaws.com/battery.mp4",
    "thumbnailUrl": "https://sseuregi-king-videos.s3.ap-northeast-2.amazonaws.com/battery-thumb.jpg",
    "aiAliases": ["battery", "batteries", "aa battery", "aaa battery", "alkaline battery"]
  },
  "electronic_waste": {
    "id": "electronic_waste",
    "emoji": "📱",
    "category": "large",
    "names": { "en": "Electronic Waste", "zh": "电子垃圾", "ja": "電子廃棄物", "ru": "Электронные отходы" },
    "videoUrl": "https://sseuregi-king-videos.s3.ap-northeast-2.amazonaws.com/electronic-waste.mp4",
    "thumbnailUrl": "https://sseuregi-king-videos.s3.ap-northeast-2.amazonaws.com/electronic-waste-thumb.jpg",
    "aiAliases": ["phone", "smartphone", "tablet", "laptop", "computer", "electronic device", "e-waste", "electronics"]
  }
}
```

- [ ] **Step 3: Create data/i18n/en.json**

```json
{
  "home": {
    "title": "Trash Dex",
    "subtitle": "Scan your trash to learn how to dispose of it correctly in Korea"
  },
  "scan": {
    "camera": "Camera",
    "gallery": "Gallery",
    "retake": "Retake",
    "see_guide": "See Disposal Guide"
  },
  "analyzing": { "label": "Analyzing..." },
  "overlay": {
    "tap_hint": "Tap items to select",
    "no_items": "No waste items detected. Try a clearer photo."
  },
  "video": {
    "back": "← Back",
    "no_video": "No disposal guide available for this item yet."
  },
  "collection": {
    "title": "My Collection",
    "locked": "???",
    "progress": "{n} / {total} discovered"
  },
  "categories": {
    "recycling": "Recycling ♻️",
    "food": "Food Waste 🍃",
    "general": "General 🗑️",
    "large": "Large Waste 🚛"
  },
  "nav": { "scan": "Scan", "collection": "Collection" }
}
```

- [ ] **Step 4: Create data/i18n/zh.json**

```json
{
  "home": {
    "title": "垃圾图鉴",
    "subtitle": "拍摄垃圾，了解在韩国如何正确处理"
  },
  "scan": { "camera": "拍照", "gallery": "相册", "retake": "重新拍照", "see_guide": "查看处理指南" },
  "analyzing": { "label": "分析中..." },
  "overlay": { "tap_hint": "点击选择物品", "no_items": "未检测到废弃物，请尝试更清晰的照片。" },
  "video": { "back": "← 返回", "no_video": "暂无该物品的处理指南。" },
  "collection": { "title": "我的收藏", "locked": "???", "progress": "已发现 {n} / {total}" },
  "categories": { "recycling": "可回收 ♻️", "food": "厨余垃圾 🍃", "general": "一般垃圾 🗑️", "large": "大型废弃物 🚛" },
  "nav": { "scan": "扫描", "collection": "收藏" }
}
```

- [ ] **Step 5: Create data/i18n/ja.json**

```json
{
  "home": {
    "title": "ゴミ図鑑",
    "subtitle": "ゴミを撮影して韓国での正しい捨て方を確認しましょう"
  },
  "scan": { "camera": "カメラ", "gallery": "ギャラリー", "retake": "撮り直す", "see_guide": "処分ガイドを見る" },
  "analyzing": { "label": "分析中..." },
  "overlay": { "tap_hint": "アイテムをタップして選択", "no_items": "ゴミが検出されませんでした。" },
  "video": { "back": "← 戻る", "no_video": "このアイテムの処分ガイドはまだありません。" },
  "collection": { "title": "マイコレクション", "locked": "???", "progress": "{n} / {total} 発見" },
  "categories": { "recycling": "リサイクル ♻️", "food": "生ごみ 🍃", "general": "一般ごみ 🗑️", "large": "大型廃棄物 🚛" },
  "nav": { "scan": "スキャン", "collection": "コレクション" }
}
```

- [ ] **Step 6: Create data/i18n/ru.json**

```json
{
  "home": {
    "title": "Мусор-Декс",
    "subtitle": "Сфотографируйте мусор, чтобы узнать, как правильно его утилизировать в Корее"
  },
  "scan": { "camera": "Камера", "gallery": "Галерея", "retake": "Переснять", "see_guide": "Смотреть инструкцию" },
  "analyzing": { "label": "Анализирую..." },
  "overlay": { "tap_hint": "Нажмите, чтобы выбрать", "no_items": "Мусор не обнаружен. Попробуйте более чёткое фото." },
  "video": { "back": "← Назад", "no_video": "Инструкция по утилизации пока недоступна." },
  "collection": { "title": "Моя коллекция", "locked": "???", "progress": "Обнаружено {n} / {total}" },
  "categories": { "recycling": "Переработка ♻️", "food": "Пищевые отходы 🍃", "general": "Общий мусор 🗑️", "large": "Крупногабаритный мусор 🚛" },
  "nav": { "scan": "Сканировать", "collection": "Коллекция" }
}
```

- [ ] **Step 7: Commit**

```bash
git add types/ data/
git commit -m "feat: types and data files (waste-items + i18n for 4 locales)"
```

---

### Task 3: next-intl Configuration

**Files:**
- Create: `i18n/routing.ts`
- Create: `i18n/request.ts`
- Create: `middleware.ts`
- Modify: `next.config.ts`

- [ ] **Step 1: Create i18n/routing.ts**

```typescript
// i18n/routing.ts
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'zh', 'ja', 'ru'],
  defaultLocale: 'en',
});
```

- [ ] **Step 2: Create i18n/request.ts**

```typescript
// i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !(routing.locales as readonly string[]).includes(locale)) {
    locale = routing.defaultLocale;
  }
  return {
    locale,
    messages: (await import(`../data/i18n/${locale}.json`)).default,
  };
});
```

- [ ] **Step 3: Create middleware.ts**

```typescript
// middleware.ts
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/', '/(en|zh|ja|ru)/:path*'],
};
```

The middleware auto-detects browser language via `Accept-Language` header and redirects `/` to the matching locale (e.g., `/ja`). If the browser language is not in the supported list, it falls back to `en`.

- [ ] **Step 4: Update next.config.ts**

```typescript
// next.config.ts
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {};

export default withNextIntl(nextConfig);
```

- [ ] **Step 5: Create app/[locale] directory structure**

```bash
mkdir -p "app/[locale]/scan" "app/[locale]/collection" app/api/analyze __tests__/lib __tests__/api __tests__/hooks
```

- [ ] **Step 6: Delete the default app/page.tsx**

The next-intl middleware handles root `/` redirect — no root page is needed.

```bash
rm app/page.tsx
```

- [ ] **Step 7: Verify build**

```bash
npm run build 2>&1 | tail -20
```

Expected: build succeeds (may warn about missing `app/[locale]/page.tsx` — that's fine, we'll add it in Task 12)

- [ ] **Step 8: Commit**

```bash
git add i18n/ middleware.ts next.config.ts app/
git commit -m "feat: next-intl routing with auto language detection for en/zh/ja/ru"
```

---

### Task 4: lib/storage.ts

**Files:**
- Create: `lib/storage.ts`
- Create: `__tests__/lib/storage.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// __tests__/lib/storage.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { getStorage, setLang, unlockItems, getUnlockedIds } from '@/lib/storage';

beforeEach(() => {
  localStorage.clear();
});

describe('getStorage', () => {
  it('returns defaults when localStorage is empty', () => {
    const data = getStorage();
    expect(data.lang).toBe('en');
    expect(data.unlockedIds).toEqual([]);
    expect(data.lastScanAt).toBeNull();
  });
});

describe('setLang', () => {
  it('persists lang to localStorage', () => {
    setLang('ja');
    expect(getStorage().lang).toBe('ja');
  });
});

describe('unlockItems', () => {
  it('adds new item ids', () => {
    unlockItems(['plastic_bottle']);
    unlockItems(['newspaper']);
    const ids = getUnlockedIds();
    expect(ids).toContain('plastic_bottle');
    expect(ids).toContain('newspaper');
  });

  it('deduplicates ids', () => {
    unlockItems(['plastic_bottle']);
    unlockItems(['plastic_bottle']);
    const count = getUnlockedIds().filter(id => id === 'plastic_bottle').length;
    expect(count).toBe(1);
  });

  it('sets lastScanAt to an ISO string', () => {
    unlockItems(['plastic_bottle']);
    expect(getStorage().lastScanAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- --reporter=verbose 2>&1 | tail -20
```

Expected: FAIL — `Cannot find module '@/lib/storage'`

- [ ] **Step 3: Implement lib/storage.ts**

```typescript
// lib/storage.ts
import type { Locale, StorageData } from '@/types';

const STORAGE_KEY = 'trashdex';

const defaultData: StorageData = {
  lang: 'en',
  unlockedIds: [],
  lastScanAt: null,
};

export function getStorage(): StorageData {
  if (typeof window === 'undefined') return { ...defaultData };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StorageData) : { ...defaultData };
  } catch {
    return { ...defaultData };
  }
}

function setStorage(data: Partial<StorageData>): StorageData {
  const next = { ...getStorage(), ...data };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function getLang(): Locale {
  return getStorage().lang;
}

export function setLang(lang: Locale): void {
  setStorage({ lang });
}

export function unlockItems(ids: string[]): StorageData {
  const current = getStorage();
  const merged = Array.from(new Set([...current.unlockedIds, ...ids]));
  return setStorage({ unlockedIds: merged, lastScanAt: new Date().toISOString() });
}

export function getUnlockedIds(): string[] {
  return getStorage().unlockedIds;
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test -- --reporter=verbose 2>&1 | tail -20
```

Expected: PASS — 5 tests pass

- [ ] **Step 5: Commit**

```bash
git add lib/storage.ts __tests__/lib/storage.test.ts
git commit -m "feat: localStorage helper — lang and unlock management"
```

---

### Task 5: lib/matcher.ts

**Files:**
- Create: `lib/matcher.ts`
- Create: `__tests__/lib/matcher.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// __tests__/lib/matcher.test.ts
import { describe, it, expect } from 'vitest';
import { matchItem, enrichObjects, getAllItems } from '@/lib/matcher';

describe('matchItem', () => {
  it('matches exact alias', () => {
    expect(matchItem('Plastic Bottle')?.id).toBe('plastic_bottle');
  });

  it('matches case-insensitively', () => {
    expect(matchItem('aluminum can')?.id).toBe('aluminum_can');
  });

  it('matches partial alias', () => {
    expect(matchItem('soda can')?.id).toBe('aluminum_can');
  });

  it('returns null for unknown items', () => {
    expect(matchItem('unicorn')).toBeNull();
  });
});

describe('enrichObjects', () => {
  it('enriches matched objects with itemId and videoUrl', () => {
    const result = enrichObjects([{
      nameEn: 'Newspaper', nameZh: '报纸', nameJa: '新聞紙', nameRu: 'Газета',
      category: 'recycling', bbox: { x: 10, y: 10, w: 20, h: 20 },
    }]);
    expect(result[0].itemId).toBe('newspaper');
    expect(result[0].videoUrl).toContain('newspaper');
  });

  it('sets itemId null for unknown objects', () => {
    const result = enrichObjects([{
      nameEn: 'Unknown Thing', nameZh: '?', nameJa: '?', nameRu: '?',
      category: 'general', bbox: { x: 0, y: 0, w: 10, h: 10 },
    }]);
    expect(result[0].itemId).toBeNull();
    expect(result[0].videoUrl).toBeNull();
  });
});

describe('getAllItems', () => {
  it('returns all 10 items', () => {
    expect(getAllItems()).toHaveLength(10);
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- --reporter=verbose 2>&1 | tail -20
```

Expected: FAIL — `Cannot find module '@/lib/matcher'`

- [ ] **Step 3: Implement lib/matcher.ts**

```typescript
// lib/matcher.ts
import wasteItemsData from '@/data/waste-items.json';
import type { WasteItem, WasteCategory, DetectedObject } from '@/types';

const wasteItems = wasteItemsData as Record<string, WasteItem>;

export function matchItem(nameEn: string): WasteItem | null {
  const normalized = nameEn.toLowerCase().trim();
  for (const item of Object.values(wasteItems)) {
    if (item.aiAliases.some(alias => alias.toLowerCase() === normalized)) {
      return item;
    }
  }
  return null;
}

type RawObject = {
  nameEn: string;
  nameZh: string;
  nameJa: string;
  nameRu: string;
  category: string;
  bbox: { x: number; y: number; w: number; h: number };
};

export function enrichObjects(rawObjects: RawObject[]): DetectedObject[] {
  return rawObjects.map(obj => {
    const match = matchItem(obj.nameEn);
    return {
      nameEn: obj.nameEn,
      nameZh: obj.nameZh,
      nameJa: obj.nameJa,
      nameRu: obj.nameRu,
      category: obj.category as WasteCategory,
      bbox: obj.bbox,
      itemId: match?.id ?? null,
      videoUrl: match?.videoUrl ?? null,
      thumbnailUrl: match?.thumbnailUrl ?? null,
    };
  });
}

export function getAllItems(): WasteItem[] {
  return Object.values(wasteItems);
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test -- --reporter=verbose 2>&1 | tail -20
```

Expected: PASS — 6 tests pass

- [ ] **Step 5: Commit**

```bash
git add lib/matcher.ts __tests__/lib/matcher.test.ts
git commit -m "feat: waste item matcher — maps Claude names to waste-items.json via aiAliases"
```

---

### Task 6: lib/analyze.ts + API Route

**Files:**
- Create: `lib/analyze.ts`
- Create: `app/api/analyze/route.ts`
- Create: `__tests__/api/analyze.test.ts`

- [ ] **Step 1: Create lib/analyze.ts**

```typescript
// lib/analyze.ts
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
```

- [ ] **Step 2: Set up .env.local**

```bash
echo "ANTHROPIC_API_KEY=your-api-key-here" > .env.local
echo ".env.local" >> .gitignore
```

Replace `your-api-key-here` with your actual Anthropic API key from https://console.anthropic.com.

- [ ] **Step 3: Write failing tests for the API route**

```typescript
// __tests__/api/analyze.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/analyze', () => ({
  analyzeImage: vi.fn(),
}));
vi.mock('@/lib/matcher', () => ({
  enrichObjects: vi.fn(),
}));

import { analyzeImage } from '@/lib/analyze';
import { enrichObjects } from '@/lib/matcher';
import { POST } from '@/app/api/analyze/route';

describe('POST /api/analyze', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 when image field is missing', async () => {
    const req = new Request('http://localhost/api/analyze', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns enriched objects on success', async () => {
    const mockRaw = [{ nameEn: 'Plastic Bottle', nameZh: '塑料瓶', nameJa: 'ペットボトル', nameRu: 'Пластиковая бутылка', category: 'recycling', bbox: { x: 10, y: 10, w: 20, h: 20 } }];
    const mockEnriched = [{ ...mockRaw[0], itemId: 'plastic_bottle', videoUrl: 'https://s3.../v.mp4', thumbnailUrl: 'https://s3.../t.jpg' }];
    vi.mocked(analyzeImage).mockResolvedValue(mockRaw);
    vi.mocked(enrichObjects).mockReturnValue(mockEnriched as any);

    const req = new Request('http://localhost/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ image: 'base64data' }),
    });
    const res = await POST(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.objects[0].itemId).toBe('plastic_bottle');
  });
});
```

- [ ] **Step 4: Run tests to confirm they fail**

```bash
npm test -- --reporter=verbose 2>&1 | tail -20
```

Expected: FAIL — `Cannot find module '@/app/api/analyze/route'`

- [ ] **Step 5: Create app/api/analyze/route.ts**

```typescript
// app/api/analyze/route.ts
import { NextResponse } from 'next/server';
import { analyzeImage } from '@/lib/analyze';
import { enrichObjects } from '@/lib/matcher';

export async function POST(request: Request) {
  let body: { image?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.image || typeof body.image !== 'string') {
    return NextResponse.json({ error: 'image field is required' }, { status: 400 });
  }

  try {
    const rawObjects = await analyzeImage(body.image);
    const objects = enrichObjects(rawObjects);
    return NextResponse.json({ objects });
  } catch (err) {
    console.error('analyze error:', err);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
```

- [ ] **Step 6: Run tests to confirm they pass**

```bash
npm test -- --reporter=verbose 2>&1 | tail -20
```

Expected: PASS — all tests pass

- [ ] **Step 7: Commit**

```bash
git add lib/analyze.ts app/api/analyze/route.ts __tests__/api/ .gitignore .env.local
git commit -m "feat: Claude Vision API route POST /api/analyze with error handling"
```

---

### Task 7: hooks/useCollection.ts

**Files:**
- Create: `hooks/useCollection.ts`
- Create: `__tests__/hooks/useCollection.test.tsx`

- [ ] **Step 1: Write failing tests**

```typescript
// __tests__/hooks/useCollection.test.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCollection } from '@/hooks/useCollection';

beforeEach(() => {
  localStorage.clear();
});

describe('useCollection', () => {
  it('starts with empty unlockedIds', () => {
    const { result } = renderHook(() => useCollection());
    expect(result.current.unlockedIds).toEqual([]);
  });

  it('unlock adds ids and re-renders', () => {
    const { result } = renderHook(() => useCollection());
    act(() => {
      result.current.unlock(['plastic_bottle', 'newspaper']);
    });
    expect(result.current.unlockedIds).toContain('plastic_bottle');
    expect(result.current.unlockedIds).toContain('newspaper');
  });

  it('isUnlocked returns true only for unlocked items', () => {
    const { result } = renderHook(() => useCollection());
    act(() => { result.current.unlock(['glass_bottle']); });
    expect(result.current.isUnlocked('glass_bottle')).toBe(true);
    expect(result.current.isUnlocked('battery')).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- --reporter=verbose 2>&1 | tail -20
```

Expected: FAIL — `Cannot find module '@/hooks/useCollection'`

- [ ] **Step 3: Implement hooks/useCollection.ts**

```typescript
// hooks/useCollection.ts
'use client';
import { useState, useCallback } from 'react';
import { getUnlockedIds, unlockItems } from '@/lib/storage';

export function useCollection() {
  const [unlockedIds, setUnlockedIds] = useState<string[]>(() => getUnlockedIds());

  const unlock = useCallback((ids: string[]) => {
    const updated = unlockItems(ids);
    setUnlockedIds(updated.unlockedIds);
  }, []);

  const isUnlocked = useCallback(
    (id: string) => unlockedIds.includes(id),
    [unlockedIds],
  );

  return { unlockedIds, unlock, isUnlocked };
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test -- --reporter=verbose 2>&1 | tail -20
```

Expected: PASS — all tests pass

- [ ] **Step 5: Commit**

```bash
git add hooks/useCollection.ts __tests__/hooks/useCollection.test.tsx
git commit -m "feat: useCollection hook — unlock state backed by localStorage"
```

---

### Task 8: CameraCapture Component

**Files:**
- Create: `components/CameraCapture.tsx`

- [ ] **Step 1: Create components/CameraCapture.tsx**

Resizes the image client-side to max 1024px before base64 encoding (mobile photos can be 4-10 MB).

```typescript
// components/CameraCapture.tsx
'use client';
import { useRef } from 'react';

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
  cameraLabel: string;
  galleryLabel: string;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 1024;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.8).split(',')[1]);
    };
    img.onerror = reject;
    img.src = url;
  });
}

export function CameraCapture({ onCapture, cameraLabel, galleryLabel }: CameraCaptureProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    onCapture(await fileToBase64(file));
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
      <input ref={cameraRef} type="file" accept="image/*" capture="environment"
        className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
      <input ref={galleryRef} type="file" accept="image/*"
        className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
      <button onClick={() => cameraRef.current?.click()}
        className="flex items-center justify-center gap-2 bg-blue-500 text-white rounded-2xl py-4 text-lg font-semibold active:scale-95 transition-transform">
        📷 {cameraLabel}
      </button>
      <button onClick={() => galleryRef.current?.click()}
        className="flex items-center justify-center gap-2 bg-zinc-700 text-white rounded-2xl py-4 text-lg font-semibold active:scale-95 transition-transform">
        🖼️ {galleryLabel}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/CameraCapture.tsx
git commit -m "feat: CameraCapture component with client-side image resize to 1024px"
```

---

### Task 9: ObjectOverlay Component

**Files:**
- Create: `components/ObjectOverlay.tsx`

- [ ] **Step 1: Create components/ObjectOverlay.tsx**

Floating tags positioned at `(bbox.x + bbox.w/2)%`, `(bbox.y + bbox.h/2)%` of the image. Tap to toggle selection.

```typescript
// components/ObjectOverlay.tsx
'use client';
import { useState } from 'react';
import type { DetectedObject, Locale } from '@/types';

const NAME_KEY: Record<Locale, keyof Pick<DetectedObject, 'nameEn' | 'nameZh' | 'nameJa' | 'nameRu'>> = {
  en: 'nameEn', zh: 'nameZh', ja: 'nameJa', ru: 'nameRu',
};

interface ObjectOverlayProps {
  imageBase64: string;
  objects: DetectedObject[];
  locale: Locale;
  tapHint: string;
  seeGuideLabel: string;
  onSeeGuide: (selected: DetectedObject[]) => void;
}

export function ObjectOverlay({ imageBase64, objects, locale, tapHint, seeGuideLabel, onSeeGuide }: ObjectOverlayProps) {
  const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set());

  function toggle(nameEn: string) {
    setSelectedNames(prev => {
      const next = new Set(prev);
      next.has(nameEn) ? next.delete(nameEn) : next.add(nameEn);
      return next;
    });
  }

  const nameKey = NAME_KEY[locale];
  const selected = objects.filter(o => selectedNames.has(o.nameEn));

  return (
    <div className="flex flex-col h-full">
      <div className="relative flex-1 min-h-0 bg-black">
        <img src={`data:image/jpeg;base64,${imageBase64}`} alt="scanned trash"
          className="w-full h-full object-contain" />
        {objects.map(obj => {
          const cx = obj.bbox.x + obj.bbox.w / 2;
          const cy = obj.bbox.y + obj.bbox.h / 2;
          const isSelected = selectedNames.has(obj.nameEn);
          return (
            <button key={obj.nameEn} onClick={() => toggle(obj.nameEn)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 px-3 py-1 rounded-full text-sm font-semibold shadow-lg transition-all ${
                isSelected ? 'bg-blue-500 text-white scale-110' : 'bg-zinc-800/80 text-white border border-zinc-500'
              }`}
              style={{ left: `${cx}%`, top: `${cy}%` }}>
              {obj[nameKey]}
            </button>
          );
        })}
      </div>
      <div className="p-4 bg-zinc-900 shrink-0">
        <p className="text-zinc-400 text-sm text-center mb-3">{tapHint}</p>
        <button disabled={selected.length === 0} onClick={() => onSeeGuide(selected)}
          className="w-full bg-purple-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-2xl py-4 text-lg font-semibold active:scale-95 transition-transform">
          {seeGuideLabel} →
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/ObjectOverlay.tsx
git commit -m "feat: ObjectOverlay with floating bbox tags and multi-select"
```

---

### Task 10: VideoPlayer Component

**Files:**
- Create: `components/VideoPlayer.tsx`

- [ ] **Step 1: Create components/VideoPlayer.tsx**

```typescript
// components/VideoPlayer.tsx
'use client';
import { useState } from 'react';
import type { DetectedObject, Locale } from '@/types';

const CATEGORY_COLORS: Record<string, string> = {
  recycling: 'bg-blue-500/20 text-blue-400',
  food: 'bg-green-500/20 text-green-400',
  general: 'bg-zinc-500/20 text-zinc-400',
  large: 'bg-orange-500/20 text-orange-400',
};

const NAME_KEY: Record<Locale, keyof Pick<DetectedObject, 'nameEn' | 'nameZh' | 'nameJa' | 'nameRu'>> = {
  en: 'nameEn', zh: 'nameZh', ja: 'nameJa', ru: 'nameRu',
};

interface VideoPlayerProps {
  objects: DetectedObject[];
  locale: Locale;
  categoryLabels: Record<string, string>;
  backLabel: string;
  noVideoLabel: string;
  onBack: () => void;
}

export function VideoPlayer({ objects, locale, categoryLabels, backLabel, noVideoLabel, onBack }: VideoPlayerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = objects[activeIndex];
  const nameKey = NAME_KEY[locale];

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <div className="flex items-center gap-3 p-4 border-b border-zinc-800 shrink-0">
        <button onClick={onBack} className="text-blue-400 text-sm font-medium shrink-0">{backLabel}</button>
        <span className="text-white font-semibold truncate">{active[nameKey]}</span>
        <span className={`ml-auto shrink-0 text-xs px-2 py-1 rounded-full ${CATEGORY_COLORS[active.category] ?? ''}`}>
          {categoryLabels[active.category]}
        </span>
      </div>
      {objects.length > 1 && (
        <div className="flex gap-2 px-4 py-2 overflow-x-auto border-b border-zinc-800 shrink-0">
          {objects.map((obj, i) => (
            <button key={obj.nameEn} onClick={() => setActiveIndex(i)}
              className={`shrink-0 px-3 py-1 rounded-full text-sm ${i === activeIndex ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-300'}`}>
              {obj[nameKey]}
            </button>
          ))}
        </div>
      )}
      <div className="flex-1 flex items-center justify-center p-4 min-h-0">
        {active.videoUrl
          ? <video key={active.videoUrl} src={active.videoUrl} controls autoPlay className="w-full max-h-full rounded-xl" />
          : <p className="text-zinc-400 text-center">{noVideoLabel}</p>
        }
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/VideoPlayer.tsx
git commit -m "feat: VideoPlayer with per-object tab UI and S3 video playback"
```

---

### Task 11: TrashDex and BottomNav Components

**Files:**
- Create: `components/TrashDex.tsx`
- Create: `components/BottomNav.tsx`

- [ ] **Step 1: Create components/TrashDex.tsx**

```typescript
// components/TrashDex.tsx
import type { WasteItem, Locale } from '@/types';

const CATEGORY_BORDER: Record<string, string> = {
  recycling: 'border-blue-500',
  food: 'border-green-500',
  general: 'border-zinc-500',
  large: 'border-orange-500',
};

interface TrashDexProps {
  items: WasteItem[];
  unlockedIds: string[];
  locale: Locale;
  lockedLabel: string;
  progressTemplate: string;
}

export function TrashDex({ items, unlockedIds, locale, lockedLabel, progressTemplate }: TrashDexProps) {
  const unlockedCount = items.filter(item => unlockedIds.includes(item.id)).length;
  const progress = progressTemplate
    .replace('{n}', String(unlockedCount))
    .replace('{total}', String(items.length));

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <div className="px-4 pt-6 pb-4 shrink-0">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-white text-2xl font-bold">Trash Dex</h1>
          <span className="text-blue-400 text-sm">{progress}</span>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
            style={{ width: `${items.length > 0 ? (unlockedCount / items.length) * 100 : 0}%` }} />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="grid grid-cols-4 gap-2">
          {items.map(item => {
            const unlocked = unlockedIds.includes(item.id);
            return (
              <div key={item.id}
                className={`aspect-square flex flex-col items-center justify-center rounded-xl border-2 bg-zinc-900 p-1 ${
                  unlocked ? CATEGORY_BORDER[item.category] : 'border-zinc-700 opacity-50'
                }`}>
                <span className={`text-2xl ${unlocked ? '' : 'grayscale brightness-0'}`}>{item.emoji}</span>
                <span className={`text-center text-[10px] mt-1 leading-tight ${unlocked ? 'text-white' : 'text-zinc-600'}`}>
                  {unlocked ? item.names[locale] : lockedLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create components/BottomNav.tsx**

```typescript
// components/BottomNav.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BottomNavProps {
  locale: string;
  scanLabel: string;
  collectionLabel: string;
}

export function BottomNav({ locale, scanLabel, collectionLabel }: BottomNavProps) {
  const pathname = usePathname();
  const isCollection = pathname.includes('/collection');
  return (
    <nav className="flex border-t border-zinc-800 bg-zinc-950 shrink-0">
      <Link href={`/${locale}/scan`}
        className={`flex-1 flex flex-col items-center py-3 text-xs gap-1 ${!isCollection ? 'text-blue-400' : 'text-zinc-500'}`}>
        <span className="text-xl">📷</span>{scanLabel}
      </Link>
      <Link href={`/${locale}/collection`}
        className={`flex-1 flex flex-col items-center py-3 text-xs gap-1 ${isCollection ? 'text-blue-400' : 'text-zinc-500'}`}>
        <span className="text-xl">📖</span>{collectionLabel}
      </Link>
    </nav>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/TrashDex.tsx components/BottomNav.tsx
git commit -m "feat: TrashDex collection grid and BottomNav tabs"
```

---

### Task 12: Locale Layout and Language Picker

**Files:**
- Create: `app/[locale]/layout.tsx`
- Create: `app/[locale]/page.tsx`

- [ ] **Step 1: Create app/[locale]/layout.tsx**

```typescript
// app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { BottomNav } from '@/components/BottomNav';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!(routing.locales as readonly string[]).includes(locale)) notFound();

  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: 'nav' });

  return (
    <NextIntlClientProvider messages={messages}>
      <div className="flex flex-col h-dvh max-w-md mx-auto bg-zinc-950 text-white">
        <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
        <BottomNav locale={locale} scanLabel={t('scan')} collectionLabel={t('collection')} />
      </div>
    </NextIntlClientProvider>
  );
}
```

- [ ] **Step 2: Create app/[locale]/page.tsx**

Server component — no `'use client'` needed. Language buttons navigate to `/{locale}/scan`, which updates the active locale.

```typescript
// app/[locale]/page.tsx
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import type { Locale } from '@/types';

const LANGUAGES: { code: Locale; flag: string; label: string }[] = [
  { code: 'en', flag: '🇺🇸', label: 'English' },
  { code: 'zh', flag: '🇨🇳', label: '中文' },
  { code: 'ja', flag: '🇯🇵', label: '日本語' },
  { code: 'ru', flag: '🇷🇺', label: 'Русский' },
];

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 gap-8">
      <div className="text-center">
        <div className="text-6xl mb-4">🗑️</div>
        <h1 className="text-3xl font-bold text-white">{t('title')}</h1>
        <p className="text-zinc-400 mt-2 text-sm leading-relaxed">{t('subtitle')}</p>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        {LANGUAGES.map(lang => (
          <Link key={lang.code} href={`/${lang.code}/scan`}
            className="flex items-center gap-4 bg-zinc-800 hover:bg-zinc-700 rounded-2xl px-5 py-4 text-white text-lg font-medium active:scale-95 transition-transform">
            <span className="text-2xl">{lang.flag}</span>{lang.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add "app/[locale]/layout.tsx" "app/[locale]/page.tsx"
git commit -m "feat: locale layout and language picker page"
```

---

### Task 13: Scan Page

**Files:**
- Create: `app/[locale]/scan/page.tsx`

- [ ] **Step 1: Create app/[locale]/scan/page.tsx**

Client component managing 4 states: `capture → analyzing → overlay → video`.

```typescript
// app/[locale]/scan/page.tsx
'use client';
import { useState, use } from 'react';
import { useTranslations } from 'next-intl';
import { CameraCapture } from '@/components/CameraCapture';
import { ObjectOverlay } from '@/components/ObjectOverlay';
import { VideoPlayer } from '@/components/VideoPlayer';
import { useCollection } from '@/hooks/useCollection';
import type { DetectedObject, Locale } from '@/types';

type ScanState = 'capture' | 'analyzing' | 'overlay' | 'video';

export default function ScanPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const t = useTranslations();
  const { unlock } = useCollection();

  const [state, setState] = useState<ScanState>('capture');
  const [imageBase64, setImageBase64] = useState('');
  const [objects, setObjects] = useState<DetectedObject[]>([]);
  const [selected, setSelected] = useState<DetectedObject[]>([]);
  const [error, setError] = useState('');

  async function handleCapture(base64: string) {
    setImageBase64(base64);
    setState('analyzing');
    setError('');
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      });
      if (!res.ok) throw new Error('Analysis failed');
      const data: { objects: DetectedObject[] } = await res.json();
      setObjects(data.objects);
      const validIds = data.objects.map(o => o.itemId).filter((id): id is string => id !== null);
      if (validIds.length > 0) unlock(validIds);
      setState('overlay');
    } catch {
      setError('Failed to analyze. Please try again.');
      setState('capture');
    }
  }

  if (state === 'capture') return (
    <div className="flex flex-col items-center justify-center h-full px-6 gap-8">
      <div className="text-center">
        <div className="text-5xl mb-2">📷</div>
        <p className="text-zinc-400 text-sm">{t('overlay.tap_hint')}</p>
      </div>
      {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      <CameraCapture onCapture={handleCapture}
        cameraLabel={t('scan.camera')} galleryLabel={t('scan.gallery')} />
    </div>
  );

  if (state === 'analyzing') return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className="text-5xl animate-pulse">🔍</div>
      <p className="text-white text-lg font-medium">{t('analyzing.label')}</p>
    </div>
  );

  if (state === 'overlay') return (
    <ObjectOverlay
      imageBase64={imageBase64}
      objects={objects}
      locale={locale as Locale}
      tapHint={objects.length === 0 ? t('overlay.no_items') : t('overlay.tap_hint')}
      seeGuideLabel={t('scan.see_guide')}
      onSeeGuide={sel => { setSelected(sel); setState('video'); }}
    />
  );

  return (
    <VideoPlayer
      objects={selected}
      locale={locale as Locale}
      categoryLabels={{
        recycling: t('categories.recycling'),
        food: t('categories.food'),
        general: t('categories.general'),
        large: t('categories.large'),
      }}
      backLabel={t('video.back')}
      noVideoLabel={t('video.no_video')}
      onBack={() => setState('overlay')}
    />
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/[locale]/scan/page.tsx"
git commit -m "feat: scan page — 4-state flow capture → analyzing → overlay → video"
```

---

### Task 14: Collection Page and Final Verification

**Files:**
- Create: `app/[locale]/collection/page.tsx`

- [ ] **Step 1: Create app/[locale]/collection/page.tsx**

```typescript
// app/[locale]/collection/page.tsx
'use client';
import { use } from 'react';
import { useTranslations } from 'next-intl';
import { TrashDex } from '@/components/TrashDex';
import { useCollection } from '@/hooks/useCollection';
import wasteItemsData from '@/data/waste-items.json';
import type { WasteItem, Locale } from '@/types';

const allItems = Object.values(wasteItemsData) as WasteItem[];

export default function CollectionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const t = useTranslations('collection');
  const { unlockedIds } = useCollection();

  return (
    <TrashDex
      items={allItems}
      unlockedIds={unlockedIds}
      locale={locale as Locale}
      lockedLabel={t('locked')}
      progressTemplate={t('progress')}
    />
  );
}
```

- [ ] **Step 2: Run all tests**

```bash
npm test -- --reporter=verbose
```

Expected: all tests pass

- [ ] **Step 3: Start dev server and verify manually**

```bash
npm run dev
```

Open http://localhost:3000. Verify:
1. Root `/` redirects to `/en` (auto language detection)
2. Language picker shows 4 language buttons
3. Clicking 🇯🇵 navigates to `/ja/scan` with Japanese UI
4. Bottom nav shows 📷 Scan / 📖 Collection tabs, active tab highlighted
5. Collection tab shows Trash Dex grid with all 10 items silhouetted (locked)
6. Upload a photo on Scan — analyzing spinner appears, then overlay with tags

- [ ] **Step 4: Final commit**

```bash
git add "app/[locale]/collection/page.tsx"
git commit -m "feat: collection page — Trash Dex with unlock progress bar"
```

---

## Post-Implementation Checklist

- [ ] Replace `ANTHROPIC_API_KEY` in `.env.local` with real key
- [ ] Upload disposal guide MP4 videos to S3 bucket `sseuregi-king-videos`
- [ ] Update `videoUrl` / `thumbnailUrl` in `data/waste-items.json` with real S3 URLs
- [ ] Configure S3 bucket CORS policy to allow browser video playback
- [ ] Test on real mobile device (iOS Safari + Android Chrome)
- [ ] Deploy to Vercel: `npx vercel --prod` (set `ANTHROPIC_API_KEY` in Vercel env vars)
