// CSV → JSON converter for the visual-database. Re-run after editing the CSVs.
// Run with: node scripts/build-trash-data.mjs
// Reads:
//   docs/data-sources/trash_master_database_FULL.csv   (150 items)
//   docs/data-sources/visual_actions_library.csv       (V01–V45 + B01–B04 bag definitions, split by `=== BAG VISUALS ===` marker)
// Writes:
//   data/trash-items.json
//   data/visual-actions.json

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MASTER_CSV = join(ROOT, 'docs', 'data-sources', 'trash_master_database_FULL.csv');
const VISUAL_CSV = join(ROOT, 'docs', 'data-sources', 'visual_actions_library.csv');
const OUT_ITEMS  = join(ROOT, 'data', 'trash-items.json');
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

// CSV category+sub_category → existing WasteCategory id.
function mapCategory(category, sub) {
  const c = category.trim();
  const s = sub.trim();
  if (c === 'Recyclable') {
    if (s.startsWith('Clear PET')) return 'plastic';
    if (s.startsWith('Plastic')) return 'plastic';
    if (s === 'Vinyl/Film') return 'vinyl';
    if (s === 'Styrofoam') return 'styrofoam';
    if (s === 'Glass') return 'glass';
    if (s === 'Metal/Can') return 'metal_can';
    if (s === 'Paper (carton)') return 'paper_carton';
    if (s.startsWith('Paper')) return 'paper';
    return 'general';
  }
  if (c === 'General Waste') {
    if (s === 'Bulb') return 'lightbulb';
    return 'general';
  }
  if (c === 'Food Waste') return 'food';
  if (c === 'Hazardous') {
    if (s.startsWith('Bulb')) return 'lightbulb';
    if (s === 'Battery') return 'e_waste';
    return 'e_waste';
  }
  if (c === 'Bulky Waste') return 'large';
  if (c === 'Free Pickup') {
    if (s.startsWith('Appliance')) return 'large';
    return 'e_waste';
  }
  if (c === 'Donation') return 'clothing';
  return 'general';
}

// CSV bag_color → existing BagColor enum.
function mapBagColor(raw) {
  const v = raw.trim();
  if (!v || v.toLowerCase() === 'none') return 'none';
  if (v === 'White') return 'white';
  if (v === 'Yellow') return 'yellow';
  if (v === 'Transparent') return 'transparent';
  if (v === 'Clear PET') return 'transparent'; // chip overlay renders "PET"
  return 'none';
}

function localized(en) {
  return { en: en ?? '', zh: '', ja: '', ru: '' };
}

function parseBool(v) {
  return String(v).trim().toLowerCase() === 'true';
}

function pipes(v) {
  return v.split('|').map(s => s.trim()).filter(Boolean);
}

function buildSteps(row) {
  const out = [];
  for (let n = 1; n <= 3; n++) {
    const vid = row[`step_${n}_visual_id`]?.trim();
    const txt = row[`step_${n}_text`]?.trim();
    if (!vid) continue;
    out.push({ visualId: vid, text: localized(txt) });
  }
  return out;
}

const KNOWN_BAG_COLORS = new Set(['transparent', 'yellow', 'white', 'green', 'special', 'none']);
const KNOWN_CATEGORIES = new Set([
  'paper', 'paper_carton', 'glass', 'metal_can', 'plastic', 'vinyl', 'styrofoam',
  'clothing', 'lightbulb', 'food', 'general', 'large', 'e_waste', 'etc',
]);

async function main() {
  const masterText = await readFile(MASTER_CSV, 'utf8');
  const visualText = await readFile(VISUAL_CSV, 'utf8');

  // ── Trash items ─────────────────────────────────────────────
  const masterRows = parseCsv(masterText);
  const masterObjs = rowsToObjects(masterRows);
  const items = masterObjs.map(r => {
    const category = mapCategory(r.category, r.sub_category);
    const bagColor = mapBagColor(r.bag_color);
    if (!KNOWN_CATEGORIES.has(category)) throw new Error(`${r.item_id}: bad category mapping → ${category}`);
    if (!KNOWN_BAG_COLORS.has(bagColor))  throw new Error(`${r.item_id}: bad bag color mapping → ${bagColor}`);
    return {
      id: r.item_id,
      category,
      subCategory: r.sub_category,
      names: localized(r.item_name_en),
      koreanTag: r.korean_tag,
      aliases: pipes(r.aliases),
      destination: localized(r.destination),
      bagColor,
      actionSteps: buildSteps(r),
      funnyMascot: localized(r.mascot_funny_text),
      funnyFact: localized(r.funny_fact),
      isBulky: parseBool(r.is_bulky),
      isHazardous: parseBool(r.is_hazardous),
      bulkyWebsiteUrl: r.bulky_website_url || null,
      specialNote: localized(r.special_note),
    };
  });
  await writeFile(OUT_ITEMS, JSON.stringify({ _source: 'trash_master_database_FULL.csv', items }, null, 2) + '\n', 'utf8');
  console.log(`wrote ${items.length} items → ${OUT_ITEMS}`);

  // ── Visual actions ──────────────────────────────────────────
  // The visual CSV has two sections separated by `=== BAG VISUALS ===`. Only the first
  // section (visual_id rows) is relevant to this PR — bag visuals are out of scope.
  const marker = '=== BAG VISUALS ===';
  const cut = visualText.indexOf(marker);
  const actionText = cut === -1 ? visualText : visualText.slice(0, cut);
  const actionRows = parseCsv(actionText);
  const actionObjs = rowsToObjects(actionRows);
  const actions = {};
  for (const a of actionObjs) {
    if (!a.visual_id || !a.visual_id.startsWith('V')) continue;
    actions[a.visual_id] = {
      id: a.visual_id,
      name: localized(a.action_name),
      description: a.description_for_illustration,
      animation: a.animation_suggestion,
    };
  }
  await writeFile(OUT_VISUAL, JSON.stringify({ actions }, null, 2) + '\n', 'utf8');
  console.log(`wrote ${Object.keys(actions).length} actions → ${OUT_VISUAL}`);

  // ── Cross-check ─────────────────────────────────────────────
  const validVids = new Set(Object.keys(actions));
  const orphan = new Set();
  for (const it of items) {
    for (const step of it.actionSteps) {
      if (!validVids.has(step.visualId)) orphan.add(`${it.id}:${step.visualId}`);
    }
  }
  if (orphan.size) {
    console.warn(`⚠ ${orphan.size} step references to undefined visualIds:`, [...orphan]);
  } else {
    console.log('all step visualIds resolved');
  }
}

main().catch(err => { console.error(err); process.exit(1); });
