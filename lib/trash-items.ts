import trashItemsData from '@/data/trash-items.json';
import type { Locale, TrashItem, TrashItemsFile } from '@/types';

const file = trashItemsData as TrashItemsFile;
const items: TrashItem[] = file.items;

const byId = new Map<string, TrashItem>(items.map(item => [item.id, item]));

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function tokens(s: string): string[] {
  return normalize(s).split(' ').filter(Boolean);
}

const byAlias = (() => {
  const m = new Map<string, TrashItem>();
  for (const item of items) {
    for (const alias of [...item.aliases, item.names.en]) {
      const key = normalize(alias);
      if (key && !m.has(key)) m.set(key, item);
    }
  }
  return m;
})();

export function getTrashItemById(id: string): TrashItem | undefined {
  return byId.get(id);
}

// Word-boundary lookup: match contiguous token windows of the detected label
// against the alias index. We prefer the longest matching window so that
// "AA battery" picks `batteries` via the 2-token alias before the 1-token one,
// and so that "tablet" never matches an alias like "table" by character substring.
export function findTrashItemByLabel(label: string): TrashItem | undefined {
  const labelTokens = tokens(label);
  if (labelTokens.length === 0) return undefined;

  for (let win = labelTokens.length; win > 0; win--) {
    for (let start = 0; start + win <= labelTokens.length; start++) {
      const key = labelTokens.slice(start, start + win).join(' ');
      const hit = byAlias.get(key);
      if (hit) return hit;
    }
  }
  return undefined;
}

export function getTrashItemName(item: TrashItem, locale: Locale): string {
  return item.names[locale] || item.names.en || item.id;
}

export function getTrashItemDestination(item: TrashItem, locale: Locale): string {
  return item.destination[locale] || item.destination.en || '';
}

export function getTrashItemMascot(item: TrashItem, locale: Locale): string {
  return item.funnyMascot[locale] || item.funnyMascot.en || '';
}

export function getTrashItemFunnyFact(item: TrashItem, locale: Locale): string {
  return item.funnyFact[locale] || item.funnyFact.en || '';
}
