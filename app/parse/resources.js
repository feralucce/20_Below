import { extractTableAfter, extractAllTables, findSection } from './markdown.js';

// resources.md lists all 9 Resources once in a catalog table, then splits
// their per-level (1-5) descriptions across 4 separate "Level | X | Y | Z"
// tables (3+3+2+1 columns) rather than one big table. Merge them back
// together keyed by Resource name.
// The bolded Resource names in the "Only six Resources can be pushed"
// sentence. Reading them out of the prose keeps one list, in the book.
function pushableFrom(resourcesMd) {
  const line = resourcesMd.split('\n')
    .find((l) => l.startsWith('**Only six Resources can be pushed**'));
  if (!line) return new Set();
  return new Set([...line.matchAll(/\*\*([^*]+)\*\*/g)]
    .map((m) => m[1].trim())
    .filter((n) => n !== 'Only six Resources can be pushed'));
}

export function parseResources(resourcesMd) {
  const pushableNames = pushableFrom(resourcesMd);
  const catalog = extractTableAfter(resourcesMd, '## What a Resource Is');
  const resources = {};
  catalog.rows.forEach((row) => {
    resources[row.Resource] = {
      name: row.Resource,
      scales: row['What Scales by Level'],
      // Most Resources are a standing fact with nothing to roll about.
      // The six that can be stretched are named in the Pushing a Resource
      // section, so the list is read from there rather than kept here.
      pushable: pushableNames.has(row.Resource),
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
