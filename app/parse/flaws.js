import { extractTableAfter, extractTableAfter as extractTable, splitByHeading } from './markdown.js';

export function parseFlaws(flawsMd) {
  const summary = extractTableAfter(flawsMd, '## Flaw List');
  const sections = splitByHeading(flawsMd, '##').filter((b) => b.title !== 'Flaw List');
  const levelTableByName = {};
  sections.forEach(({ title, body }) => {
    try {
      const table = extractTable(body, '| Level | Effect |');
      levelTableByName[title] = table.rows.map((row) => ({
        level: Number(row.Level),
        effect: row.Effect,
      }));
    } catch (err) {
      console.warn(`Flaw "${title}": no standard Level table found (${err.message})`);
    }
  });

  return summary.rows.map((row) => ({
    name: row.Flaw,
    points: row.Points,
    blurb: row.Effect,
    levels: levelTableByName[row.Flaw] ?? null,
  }));
}
