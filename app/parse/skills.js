import { extractTableAfter } from './markdown.js';

export function parseSkillTiers(skillsMd) {
  const table = extractTableAfter(skillsMd, '## Training Tiers');
  return table.rows.map((row) => ({
    tier: Number(row.Tier),
    name: row.Name,
    roll: row.Roll,
  }));
}

export function parseSkillCatalog(premadeMd) {
  const table = extractTableAfter(premadeMd, '## Skills');
  return table.rows.map((row) => ({
    name: row.Skill,
    defaultElement: row['Default Element'],
    definition: row.Definition,
  }));
}
