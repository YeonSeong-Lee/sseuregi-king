# Language Picker Header — Design Spec

**Date:** 2026-05-09  
**Status:** Approved

## Problem

The app currently shows a full-screen language selection page at `/[locale]/` on every first visit. This adds an unnecessary step before users reach the actual app. The browser already sends `Accept-Language`, which the middleware already uses to redirect `/` to the correct locale — so the manual picker page is redundant.

## Goal

1. Remove the language selection landing page; route `/[locale]/` directly to `/[locale]/scan`
2. Move language switching to a persistent `🌐 EN ▾` button in a thin top header bar visible on all pages

## Architecture

### Files Changed

| File | Change |
|------|--------|
| `app/[locale]/page.tsx` | Replace with a server-side `redirect()` to `/[locale]/scan` |
| `app/[locale]/layout.tsx` | Add `<header>` above `<main>` containing `LanguagePicker` |
| `components/LanguagePicker.tsx` | New client component — locale switcher dropdown |

### `app/[locale]/page.tsx`

Becomes a one-liner redirect. No UI rendered.

```tsx
import { redirect } from 'next/navigation';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/scan`);
}
```

### `components/LanguagePicker.tsx`

Client component. Responsibilities:
- Display current locale as `🌐 [CODE] ▾` (e.g., `🌐 EN ▾`)
- Toggle a dropdown listing all 4 locales (flag + name)
- On selection: read `usePathname()` from `next/navigation`, replace the locale segment, push the new path via `useRouter()`
- Highlight the active locale in the dropdown
- Close dropdown on outside click (via `useEffect` + `document` event listener)

**Locale switching logic:**
```
pathname = usePathname()       // e.g. "/en/scan"
segments = pathname.split('/') // ['', 'en', 'scan']
segments[1] = newLocale        // ['', 'zh', 'scan']
router.push(segments.join('/')) // '/zh/scan'
```

**Locale data (defined inside the component):**
```
en → 🇺🇸 English
zh → 🇨🇳 中文
ja → 🇯🇵 日本語
ru → 🇷🇺 Русский
```

Props: `locale: string` (current locale, passed from layout)

### `app/[locale]/layout.tsx`

Add a thin header (`~36px`) above `<main>`:

```tsx
<div className="flex flex-col h-dvh w-full max-w-md mx-auto bg-zinc-950 text-white">
  <header className="flex justify-end items-center px-4 py-2 border-b border-zinc-800 flex-shrink-0">
    <LanguagePicker locale={locale} />
  </header>
  <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
  <BottomNav ... />
</div>
```

### Middleware

No changes. `proxy.ts` already detects `Accept-Language` and redirects `/` to the matching locale.

## Data Flow

```
User opens app
  → middleware detects Accept-Language
  → redirects / → /en (or /zh, /ja, /ru)
  → /[locale]/page.tsx calls redirect(/[locale]/scan)
  → scan page renders with correct locale
  → header shows 🌐 EN ▾

User taps 🌐 EN ▾
  → dropdown opens
  → user selects 中文
  → LanguagePicker: /en/scan → /zh/scan
  → page re-renders in Chinese, header shows 🌐 ZH ▾
```

## Out of Scope

- Persisting language preference to localStorage (URL is source of truth; middleware handles detection on re-entry)
- Animating the dropdown
- Any changes to translation files or i18n config

## Verification

1. `npm run dev` — open `http://localhost:3000`
2. Confirm `/` redirects directly to `/en/scan` (or browser language)
3. Confirm no language selection page appears
4. Confirm header shows `🌐 EN ▾` in top-right on both scan and collection pages
5. Click `🌐 EN ▾`, select 中文 → URL changes to `/zh/scan`, UI renders in Chinese
6. Navigate to collection page → header still shows `🌐 ZH ▾`
7. Click outside dropdown → dropdown closes
