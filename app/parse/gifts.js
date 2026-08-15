import { findSection, splitByHeading, extractTableAfter } from './markdown.js';

const ADDER_ITEM = /^- \*\*(.+?)\*\* \((Lesser|Greater), \d+ ?pts?\):?\s*(.*)$/;
const LIMITER_ITEM = /^- \*\*(.+?)\*\*:?\s*(.*)$/;

function extractBulletsBetween(body, startLabel, endLabel) {
  const startIdx = body.indexOf(startLabel);
  if (startIdx === -1) return { items: [], found: false };
  const from = startIdx + startLabel.length;
  const to = endLabel ? body.indexOf(endLabel, from) : body.length;
  const chunk = body.slice(from, to === -1 ? body.length : to);
  const items = chunk
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '));
  return { items, found: true };
}

// Parses a build-menu option's cost cell into a purchase shape the UI can
// act on: a flat one-time price ("1 pt"), a per-unit price where the buyer
// picks a quantity ("2 pts/point", "3 pts/Level"), or a choice among a few
// fixed prices ("1/3/5/7 pts", one per Boon tier).
function parseMenuCost(costText) {
  const perUnit = costText.match(/^(\d+)\s*pts?\s*\/\s*(\w+)$/i);
  if (perUnit) {
    return { type: 'perUnit', rate: Number(perUnit[1]), unit: perUnit[2] };
  }
  const choice = costText.match(/^(\d+(?:\s*\/\s*\d+)+)\s*pts?$/i);
  if (choice) {
    return { type: 'choice', options: choice[1].split('/').map((n) => Number(n.trim())) };
  }
  const flat = costText.match(/^(\d+)\s*pts?$/i);
  if (flat) {
    return { type: 'flat', cost: Number(flat[1]) };
  }
  return null;
}

// A Gift using the custom Pool/Build-menu structure (see parseGifts below)
// has a "**Pool by Level**:" table (Level -> point pool) and a "**Build
// menu**:" table (Option/Cost/Effect) instead of the standard Level/Effect
// table. Returns null if neither marker is present - the normal case.
function parseGiftMenu(body) {
  if (!body.includes('**Pool by Level**:') || !body.includes('**Build menu**:')) return null;

  const poolTable = extractTableAfter(body, '**Pool by Level**:');
  const poolByLevel = poolTable.rows.map((row) => ({
    level: Number(row.Level),
    pool: Number(String(row.Pool).match(/\d+/)?.[0] ?? 0),
  }));

  const menuTable = extractTableAfter(body, '**Build menu**:');
  const items = menuTable.rows.map((row) => {
    const cost = parseMenuCost(row.Cost.trim());
    if (!cost) {
      console.warn(`Gift build menu: option "${row.Option}" has an unparseable cost: "${row.Cost}"`);
    }
    return { option: row.Option, costText: row.Cost, cost, effect: row.Effect };
  });

  return { poolByLevel, items };
}

// Gifts don't share a uniform level-table shape (each is a hand-built
// power), so this only structures what's needed for point-tracking
// (Adders/Limiters and their costs) and leaves the rest of each Gift's
// block as raw markdown for the picker's detail view to render as-is.
//
// `giftAdderCost` (from costs.md, e.g. { Lesser: 3, Greater: 6 }) is the
// authoritative price by tier - each Adder line's own printed number
// (e.g. "Lesser, 3 pts") is parsed for its tier name only and otherwise
// ignored, so changing costs.md's rate reprices every Adder in the game
// without needing to hand-edit every line in gifts.md to match.
export function parseGifts(giftsMd, giftAdderCost) {
  const listSection = findSection(giftsMd, 'Gift List', '##');
  const blocks = splitByHeading(listSection, '###');

  return blocks.map(({ title, body }) => {
    const flagged = /\[FLAGGED/.test(body);

    const { items: adderLines, found: hasAdders } = extractBulletsBetween(
      body,
      '**Adders**:',
      '**Limiters**:',
    );
    if (!hasAdders) {
      console.warn(`Gift "${title}": no "**Adders**:" section found, skipping cost extraction`);
    }
    const adders = adderLines
      .map((line) => {
        const m = line.match(ADDER_ITEM);
        if (!m) {
          console.warn(`Gift "${title}": Adder line didn't match expected pattern: "${line}"`);
          return null;
        }
        return { name: m[1], tier: m[2], points: giftAdderCost[m[2]], text: m[3] };
      })
      .filter(Boolean);

    const { items: limiterLines, found: hasLimiters } = extractBulletsBetween(
      body,
      '**Limiters**:',
      null,
    );
    if (!hasLimiters) {
      console.warn(`Gift "${title}": no "**Limiters**:" section found, skipping cost extraction`);
    }
    const limiters = limiterLines
      .map((line) => {
        const m = line.match(LIMITER_ITEM);
        if (!m) {
          console.warn(`Gift "${title}": Limiter line didn't match expected pattern: "${line}"`);
          return null;
        }
        return { name: m[1], text: m[2] };
      })
      .filter(Boolean);

    // Most Gifts have a standard "| Level | Effect |" table right after the
    // intro prose. A few (Alternate Form, Cybernetics) use a custom
    // Pool/Build-menu structure instead - `levels` is null for those, and
    // callers fall back to the raw markdown for that case.
    let levels = null;
    try {
      const table = extractTableAfter(body, '| Level | Effect |');
      levels = table.rows.map((row) => ({ level: Number(row.Level), effect: row.Effect }));
    } catch {
      // no standard Level table for this Gift - leave levels null
    }

    const menu = levels === null ? parseGiftMenu(body) : null;

    return { name: title, flagged, adders, limiters, levels, menu, markdown: body };
  });
}

// Pulls the "The Gift Check" bullet out of gifts.md's Resolution section, so
// the app can display the live rule text (e.g. its target number) rather
// than a hardcoded copy that could drift from the actual rules file.
export function parseGiftCheckText(giftsMd) {
  const section = findSection(giftsMd, 'Resolution', '##');
  const line = section.split('\n').find((l) => l.trim().startsWith('- **The Gift Check**'));
  if (!line) {
    console.warn('Gift Check bullet not found in gifts.md Resolution section');
    return '';
  }
  return line.trim().replace(/^- /, '');
}
