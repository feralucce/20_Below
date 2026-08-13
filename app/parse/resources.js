import { extractTableAfter, extractAllTables, findSection } from './markdown.js';

// resources.md lists all 9 Resources once in a catalog table, then splits
// their per-level (1-5) descriptions across 4 separate "Level | X | Y | Z"
// tables (3+3+2+1 columns) rather than one big table. Merge them back
// together keyed by Resource name.
export function parseResources(resourcesMd) {
  const catalog = extractTableAfter(resourcesMd, '## What a Resource Is');
  const resources = {};
  catalog.rows.forEach((row) => {
    resources[row.Resource] = {
      name: row.Resource,
      scales: row['What Scales by Level'],
      levels: {},
    };
  });

  const perLevelSection = findSection(resourcesMd, 'Per-Level Content', '##');
  const levelTables = extractAllTables(perLevelSection);
  levelTables.forEach((table) => {
    const resourceColumns = table.headers.filter((h) => h !== 'Level');
    table.rows.forEach((row) => {
      const level = Number(row.Level);
      resourceColumns.forEach((name) => {
        if (!resources[name]) {
          throw new Error(`Per-Level Content table references unknown Resource: "${name}"`);
        }
        resources[name].levels[level] = row[name];
      });
    });
  });

  return Object.values(resources);
}
