# Gangnam Bulky Waste Registration Card

**Date:** 2026-05-16  
**Status:** Approved  
**Source:** https://www.gangnam.go.kr/waste/apply/info.do?mid=ID03_020704

---

## Overview

When a scan result classifies an item as `large` (대형폐기물) category, show a Gangnam-gu specific registration guide card inside `DisposalDetail`. The card surfaces the actual registration URLs, phone numbers, and key rules from the official Gangnam-gu waste disposal page — information that previously required users to navigate to the district website themselves.

---

## Trigger Condition

- Screen: `DisposalDetail` component
- Condition: `category.id === 'large'`
- Assumption: The app currently only has real data for Gangnam-gu, so no district check is needed. If multi-district support is added later, a `districtCode` prop can be introduced at that point.

---

## New Component: `GangnamBulkyWasteCard`

**File:** `components/GangnamBulkyWasteCard.tsx`

### Layout (top to bottom)

```
┌─────────────────────────────────────────────────┐
│  🛋️  [title: gangnam_bulky.title]               │
├─────────────────────────────────────────────────┤
│  [Section 1] Small/Large Appliances — Free      │
│  [label: gangnam_bulky.appliances.label]        │
│  [desc: gangnam_bulky.appliances.desc]          │
│  [Button] → https://www.15990903.or.kr          │
│  [Phone chip] 1599-0903                         │
├─────────────────────────────────────────────────┤
│  [Section 2] Furniture & Other — Paid           │
│  [label: gangnam_bulky.furniture.label]         │
│  [desc: gangnam_bulky.furniture.desc]           │
│  [Button] → clean.gangnam.go.kr registration    │
│  [Phone chip] 1522-3833 (태화용역)              │
├─────────────────────────────────────────────────┤
│  ⚠️ [note: gangnam_bulky.note]                  │
│  Register 3 days before, Mon–Sat pickup         │
└─────────────────────────────────────────────────┘
```

### Visual Style

Follow existing component patterns:
- Container: `rounded-2xl border border-line bg-surface-elev px-4 py-4`
- Section divider: `border-t border-line`
- Buttons: same style as `YoutubeLinkCard` CTA — full-width, rounded, `bg-blue-600` or `border border-line`
- Note box: `rounded-xl border border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 px-3 py-2 text-xs text-fg-muted`

### Props

```typescript
interface GangnamBulkyWasteCardProps {
  locale: Locale;
}
```

No district prop needed at this stage.

---

## Changes to `DisposalDetail`

**File:** `components/DisposalDetail.tsx`

Add at the bottom of the scroll area, after the `examples` section:

```tsx
{category.id === 'large' && (
  <div className="px-4 pt-2 pb-8">
    <GangnamBulkyWasteCard locale={locale} />
  </div>
)}
```

---

## i18n Keys

Add `gangnam_bulky` namespace to all four locale files:
`data/i18n/en.json`, `zh.json`, `ja.json`, `ru.json`

### Key structure

```json
"gangnam_bulky": {
  "title": "Gangnam-gu Bulky Waste Registration",
  "appliances": {
    "label": "Home appliances — Free pickup",
    "desc": "Small electronics (1–4 items) or large appliances (fridge, washer, AC, TV). Free of charge.",
    "cta": "Apply online"
  },
  "furniture": {
    "label": "Furniture & other items — Paid",
    "desc": "Register at least 3 days in advance. Write your receipt number on the item before placing it outside.",
    "cta": "Apply online"
  },
  "phone": "Call",
  "note": "Collection: Mon–Sat (excluding public holidays). Must register 3 days before. Item left outside without registration number = fine."
}
```

Translations to produce for all 4 locales (en, zh, ja, ru).

---

## External URLs (hardcoded in component)

| Purpose | URL |
|---|---|
| Appliance free pickup (online) | `https://www.15990903.or.kr` |
| Furniture/bulky paid registration | `https://clean.gangnam.go.kr/use/biwa/USEBIWA02010000.do` |
| Appliance free pickup (phone) | `1599-0903` |
| Furniture/bulky paid (phone, 태화용역) | `1522-3833` |

URLs are stable government/public-entity pages. No fetch or server-side call needed — rendered as `<a href>` / `tel:` links.

---

## Out of Scope

- Fetching live fee schedules from the Gangnam-gu API (hardcoded representative examples only)
- District detection logic changes
- Adding a `districtCode` prop to `DisposalDetail` (deferred)
- Supporting other districts' bulky waste pages

---

## Files Changed

| File | Change |
|---|---|
| `components/GangnamBulkyWasteCard.tsx` | New component |
| `components/DisposalDetail.tsx` | Add `GangnamBulkyWasteCard` when `category.id === 'large'` |
| `data/i18n/en.json` | Add `gangnam_bulky` keys |
| `data/i18n/zh.json` | Add `gangnam_bulky` keys |
| `data/i18n/ja.json` | Add `gangnam_bulky` keys |
| `data/i18n/ru.json` | Add `gangnam_bulky` keys |
