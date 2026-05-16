// CSV → JSON converter for the visual-action definitions. Re-run after editing the CSV.
// Run with: node scripts/build-trash-data.mjs
// Reads:
//   docs/data-sources/visual_actions_library.csv  (V01–V40 visual action definitions)
// Writes:
//   data/visual-actions.json

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const VISUAL_CSV = join(ROOT, 'docs', 'data-sources', 'visual_actions_library.csv');
const OUT_VISUAL = join(ROOT, 'data', 'visual-actions.json');

// Minimal RFC-4180-ish CSV parser (handles quoted fields with commas).
function parseCsv(text) {
  const rows = [];
  let row = [], cur = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cur += '"'; i++; } else { inQ = false; }
      } else { cur += ch; }
    } else {
      if (ch === '"') inQ = true;
      else if (ch === ',') { row.push(cur); cur = ''; }
      else if (ch === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; }
      else if (ch === '\r') { /* skip */ }
      else cur += ch;
    }
  }
  if (cur !== '' || row.length > 0) { row.push(cur); rows.push(row); }
  return rows.filter(r => r.length > 1 || (r.length === 1 && r[0] !== ''));
}

function rowsToObjects(rows) {
  const [header, ...data] = rows;
  return data.map(r => Object.fromEntries(header.map((h, i) => [h, (r[i] ?? '').trim()])));
}

function localized(en) {
  return { en: en ?? '', zh: '', ja: '', ru: '' };
}

async function main() {
  const visualText = await readFile(VISUAL_CSV, 'utf8');

  // ── Visual actions ──────────────────────────────────────────
  const actionRows = parseCsv(visualText);
  const actionObjs = rowsToObjects(actionRows);
  const actions = {};
  for (const a of actionObjs) {
    if (!a.id || !a.id.startsWith('V')) continue;
    actions[a.id] = {
      id: a.id,
      name: localized(a.action_name),
      description: a.description_for_illustration,
      animation: a.animation_suggestion,
    };
  }
  await writeFile(OUT_VISUAL, JSON.stringify({ actions }, null, 2) + '\n', 'utf8');
  console.log(`wrote ${Object.keys(actions).length} actions → ${OUT_VISUAL}`);
}

main().catch(err => { console.error(err); process.exit(1); });
