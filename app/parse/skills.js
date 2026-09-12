import { extractTableAfter } from './markdown.js';

export function parseSkillTiers(skillsMd) {
  const table = extractTableAfter(skillsMd, '## Training Tiers');
  return table.rows.map((row) => ({
    tier: Number(row.Tier),
    name: row.Name,
    roll: row.Roll,
  }));
}

// The catalog and the tiers now live in one file. The anchor is
// '## The Skill List' rather than '## Skills' because extractTableAfter
// locates a section with indexOf, and '## Skills' matches
// '## Skills Default to an Element' first - which would hand back the
// Training Tiers table, correctly shaped and completely wrong.
export function parseSkillCatalog(skillsMd) {
  const table = extractTableAfter(skillsMd, '## The Skill List');
  return table.rows.map((row) => ({
    name: row.Skill,
    defaultElement: row['Default Element'],
    definition: row.Definition,
  }));
}
