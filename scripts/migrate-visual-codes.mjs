// One-shot migration: V01-V40 visual codes → icon-filename codes (27).
// Updates data/trash-items.json, data/waste-categories.json, data/visual-actions.json.
// Run with: node scripts/migrate-visual-codes.mjs
//
// After running, all step codes match files in public/step-icons/<CODE>.png.

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TRASH_ITEMS = join(ROOT, 'data', 'trash-items.json');
const WASTE_CATEGORIES = join(ROOT, 'data', 'waste-categories.json');
const VISUAL_ACTIONS = join(ROOT, 'data', 'visual-actions.json');

// V## → new code (every V-code is mapped — no data loss).
const MAP = {
  V01: 'REMOVE_CAP_OR_LID_PUMP',
  V02: 'PEEL_OFF_LABEL_FILM',
  V03: 'CRUSH',
  V04: 'EMPTY_CONTENTS',
  V05: 'RINSE_LIGHTLY',
  V06: 'REMOVE_FOOD_WASTE',
  V07: 'TIE_BUNDLE',
  V08: 'FLATTEN_BOX',
  V09: 'PUT_IN_GENERAL_BIN',
  V10: 'BREAK_PIECES',
  V11: 'BREAK_PIECES',
  V12: 'REMOVE_TAPE',
  V13: 'PUT_IN_GENERAL_BIN',
  V14: 'FLATTEN_BOX',
  V15: 'TIE_BUNDLE',
  V16: 'PEEL_OFF_LABEL_FILM',
  V17: 'PUT_IN_RECYCLE_GLASS',
  V18: 'SEPARATE_BY_MATERIAL',
  V19: 'PUT_IN_GENERAL_BIN',
  V20: 'REMOVE_CAP_OR_LID_PUMP',
  V21: 'EMPTY_SPRAY_CAN',
  V22: 'RELEASE_GAS',
  V23: 'SEPARATE_BY_MATERIAL',
  V24: 'CALL_COMMUNITY_CENTER',
  V25: 'PUT_IN_RECYCLE_BATTERIES_BULBS',
  V26: 'CALL_COMMUNITY_CENTER',
  V27: 'CALL_COMMUNITY_CENTER',
  V28: 'CALL_COMMUNITY_CENTER',
  V29: 'CALL_COMMUNITY_CENTER',
  V30: 'EMPTY_CONTENTS',
  V31: 'FOOD_WASTE_SEPARATE',
  V32: 'DONATION_BIN',
  V33: 'DONATION_BIN',
  V34: 'WIPE_FOOD_RESIDUE_BEFORE_RECYCLING',
  V35: 'REMOVE_FOOD_WASTE',
  V36: 'SEPARATE_BY_MATERIAL',
  V37: 'BREAK_PIECES',
  V38: 'TIE_BUNDLE',
  V39: 'REMOVE_TAPE',
  V40: 'SEPARATE_BY_MATERIAL',
};

// Authoritative metadata for the 27 new codes (en only; other locales left blank
// to match the existing visual-actions.json convention).
const NEW_ACTIONS = {
  // Preparation
  REMOVE_CAP_OR_LID_PUMP: {
    name: 'Remove Cap / Lid / Pump',
    description: 'Twist off a bottle cap, container lid, or pump nozzle.',
    animation: 'Twist-off motion',
  },
  PEEL_OFF_LABEL_FILM: {
    name: 'Peel Off Label / Film',
    description: 'Peel paper labels, shrink films, or plastic windows off packaging.',
    animation: 'Peeling motion',
  },
  EMPTY_CONTENTS: {
    name: 'Empty Contents',
    description: 'Pour out liquid or shake out remaining contents.',
    animation: 'Tipping / pouring motion',
  },
  EMPTY_DRINKS_CONTAINER: {
    name: 'Empty Drinks Container',
    description: 'Finish or pour out drink before recycling the container.',
    animation: 'Pouring motion',
  },
  EMPTY_SPRAY_CAN: {
    name: 'Empty Spray Can',
    description: 'Use up aerosol contents completely; shake to confirm no liquid remains.',
    animation: 'Shake-check motion',
  },
  RELEASE_GAS: {
    name: 'Release Gas (Outdoors)',
    description: 'Puncture pressurised can outdoors to release residual gas safely.',
    animation: 'Puncture with caution icon',
  },
  RINSE_LIGHTLY: {
    name: 'Rinse Lightly',
    description: 'Quick rinse with tap water to clear residue.',
    animation: 'Water splash',
  },
  WIPE_FOOD_RESIDUE_BEFORE_RECYCLING: {
    name: 'Wipe Food Residue',
    description: 'Wipe off grease or food residue before recycling.',
    animation: 'Wiping motion',
  },
  REMOVE_FOOD_WASTE: {
    name: 'Remove Food Waste',
    description: 'Scrape out food bits or leftover solids from the container.',
    animation: 'Scraping motion',
  },
  REMOVE_TAPE: {
    name: 'Remove Tape / Strings',
    description: 'Peel sticky tape, shipping labels, or attached strings off the item.',
    animation: 'Peeling motion',
  },
  FLATTEN_BOX: {
    name: 'Flatten Box',
    description: 'Press or stomp cardboard / paper packaging completely flat.',
    animation: 'Stomp / flatten',
  },
  CRUSH: {
    name: 'Crush Flat',
    description: 'Crush a PET or plastic bottle flat to reduce volume.',
    animation: 'Squish / compress motion',
  },
  CRUSH_CANS_BOTTLES: {
    name: 'Crush Cans / Bottles',
    description: 'Crush metal cans flat to save space in recycling.',
    animation: 'Stomp / crush motion',
  },
  BREAK_PIECES: {
    name: 'Break Into Pieces',
    description: 'Break large or bulky items into smaller pieces (e.g., styrofoam).',
    animation: 'Snap / break motion',
  },
  TIE_BUNDLE: {
    name: 'Tie Into A Bundle',
    description: 'Stack and tie paper or cardboard into a string bundle.',
    animation: 'Tying motion',
  },
  SEPARATE_BY_MATERIAL: {
    name: 'Separate By Material',
    description: 'Disassemble or pull apart mixed-material items into their components.',
    animation: 'Pull-apart motion',
  },
  SEPARATIING_CUP_PARTS: {
    name: 'Separate Cup Parts',
    description: 'Split paper cup parts (lid, sleeve, body) before recycling.',
    animation: 'Pull-apart motion',
  },
  RECYCLE_METALS: {
    name: 'Sort Out Metals',
    description: 'Pull out and recycle metal components separately.',
    animation: 'Sort motion',
  },
  // Terminal
  PUT_IN_GENERAL_BIN: {
    name: 'Put In General Waste',
    description: 'Drop into the white 일반쓰레기 bag (Gangnam-gu general waste).',
    animation: 'Drop-in motion',
  },
  PUT_IN_RECYCLE_PAPER: {
    name: 'Put In Paper Recycling',
    description: 'Place into the paper / cardboard recycling collection.',
    animation: 'Drop-in motion',
  },
  PUT_IN_RECYCLE_PLASTIC_PET: {
    name: 'Put In PET / Plastic Recycling',
    description: 'Place into the transparent PET or plastic recycling collection.',
    animation: 'Drop-in motion',
  },
  PUT_IN_RECYCLE_GLASS: {
    name: 'Put In Glass Recycling',
    description: 'Carefully place glass bottle into the green glass recycling bin.',
    animation: 'Gentle placement',
  },
  PUT_IN_RECYCLE_CANS_METALS: {
    name: 'Put In Can / Metal Recycling',
    description: 'Place into the can / metal recycling collection.',
    animation: 'Drop-in motion',
  },
  PUT_IN_RECYCLE_BATTERIES_BULBS: {
    name: 'Put In Battery / Bulb Box',
    description: 'Drop into the dedicated battery or fluorescent-bulb collection box.',
    animation: 'Drop-in motion',
  },
  DONATION_BIN: {
    name: 'Donation Bin',
    description: 'Place wearable clothing or accessories into the 의류수거함.',
    animation: 'Drop into donation bin',
  },
  FOOD_WASTE_SEPARATE: {
    name: 'Put In Food Waste',
    description: 'Drop into the yellow food-waste bag or RFID food-waste bin.',
    animation: 'Drop into yellow',
  },
  CALL_COMMUNITY_CENTER: {
    name: 'Call Community Center',
    description: 'Call 1599-0903 or contact the 주민센터 / district office for pickup or registration.',
    animation: 'Phone call',
  },
};

const ALLOWED = new Set(Object.keys(NEW_ACTIONS));

function dedupeConsecutive(arr, key = (v) => v) {
  const out = [];
  let prev;
  for (const v of arr) {
    const k = key(v);
    if (k !== prev) out.push(v);
    prev = k;
  }
  return out;
}

function remapCode(code) {
  if (ALLOWED.has(code)) return code; // already a new code (idempotent)
  if (MAP[code]) return MAP[code];
  throw new Error(`Unknown visual code: ${code}`);
}

async function readJson(p) {
  return JSON.parse(await readFile(p, 'utf8'));
}

async function writeJson(p, obj) {
  await writeFile(p, JSON.stringify(obj, null, 2) + '\n');
}

async function migrateTrashItems() {
  const file = await readJson(TRASH_ITEMS);
  let totalRemapped = 0;
  let totalDeduped = 0;
  for (const item of file.items) {
    if (!Array.isArray(item.actionSteps)) continue;
    const before = item.actionSteps.length;
    const remapped = item.actionSteps.map((s) => ({ ...s, visualId: remapCode(s.visualId) }));
    totalRemapped += remapped.length;
    const deduped = dedupeConsecutive(remapped, (s) => s.visualId);
    totalDeduped += before - deduped.length;
    item.actionSteps = deduped;
    if (deduped.length === 0) {
      throw new Error(`Item ${item.id} ended up with 0 steps after dedupe`);
    }
  }
  await writeJson(TRASH_ITEMS, file);
  return { totalRemapped, totalDeduped, items: file.items.length };
}

async function migrateWasteCategories() {
  const file = await readJson(WASTE_CATEGORIES);
  let categoriesTouched = 0;
  let totalDeduped = 0;
  for (const [key, val] of Object.entries(file)) {
    if (key === '_sources') continue;
    if (!Array.isArray(val.steps)) continue;
    const before = val.steps.length;
    const remapped = val.steps.map(remapCode);
    const deduped = dedupeConsecutive(remapped);
    if (deduped.length === 0) {
      throw new Error(`Category ${key} ended up with 0 steps after dedupe`);
    }
    val.steps = deduped;
    totalDeduped += before - deduped.length;
    categoriesTouched++;
  }
  await writeJson(WASTE_CATEGORIES, file);
  return { categoriesTouched, totalDeduped };
}

async function rebuildVisualActions() {
  const actions = {};
  for (const [id, meta] of Object.entries(NEW_ACTIONS)) {
    actions[id] = {
      id,
      name: { en: meta.name, zh: '', ja: '', ru: '' },
      description: meta.description,
      animation: meta.animation,
    };
  }
  await writeJson(VISUAL_ACTIONS, { actions });
  return { count: Object.keys(actions).length };
}

async function verify() {
  const trash = await readJson(TRASH_ITEMS);
  const wc = await readJson(WASTE_CATEGORIES);
  const issues = [];

  for (const item of trash.items) {
    for (const step of item.actionSteps ?? []) {
      if (!ALLOWED.has(step.visualId)) {
        issues.push(`trash-items: ${item.id} has unknown visualId "${step.visualId}"`);
      }
    }
    for (let i = 1; i < (item.actionSteps?.length ?? 0); i++) {
      if (item.actionSteps[i].visualId === item.actionSteps[i - 1].visualId) {
        issues.push(`trash-items: ${item.id} has consecutive duplicate at index ${i}`);
      }
    }
  }

  for (const [key, val] of Object.entries(wc)) {
    if (key === '_sources') continue;
    if (!Array.isArray(val.steps)) continue;
    for (const s of val.steps) {
      if (!ALLOWED.has(s)) {
        issues.push(`waste-categories: ${key} has unknown step "${s}"`);
      }
    }
    for (let i = 1; i < val.steps.length; i++) {
      if (val.steps[i] === val.steps[i - 1]) {
        issues.push(`waste-categories: ${key} has consecutive duplicate at index ${i}`);
      }
    }
  }

  return issues;
}

(async () => {
  const a = await migrateTrashItems();
  console.log(`trash-items.json: ${a.items} items, ${a.totalRemapped} step codes remapped, ${a.totalDeduped} consecutive duplicates removed.`);
  const b = await migrateWasteCategories();
  console.log(`waste-categories.json: ${b.categoriesTouched} categories migrated, ${b.totalDeduped} consecutive duplicates removed.`);
  const c = await rebuildVisualActions();
  console.log(`visual-actions.json: ${c.count} action codes written.`);
  const issues = await verify();
  if (issues.length > 0) {
    console.error('\nVerification failed:');
    for (const i of issues) console.error('  -', i);
    process.exit(1);
  }
  console.log('\nVerification passed.');
})();
