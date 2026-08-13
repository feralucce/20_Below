import { extractTableAfter, extractAllNumbers } from './markdown.js';

const TIER_NAMES = { 1: 'Trivial', 3: 'Lesser', 5: 'Greater', 7: 'Legendary' };

// boons.md's Points column is free text: "3 (Lesser)", "3 or 5",
// "1, 3, 5, or 7", "3 (Lesser), may be purchased multiple times". Every
// number present is a valid, tiered cost the player can pick for that Boon;
// repeatable ones are flagged separately.
function parseCostOptions(pointsText) {
  const costs = extractAllNumbers(pointsText).map((points) => ({
    points,
    tier: TIER_NAMES[points] ?? null,
  }));
  const repeatable = /purchased multiple times/i.test(pointsText);
  return { costs, repeatable };
}

export function parseBoons(boonsMd) {
  const table = extractTableAfter(boonsMd, '## Boon List');
  return table.rows.map((row) => {
    const { costs, repeatable } = parseCostOptions(row.Points);
    return {
      name: row.Boon,
      costs,
      repeatable,
      effect: row.Effect,
    };
  });
}
