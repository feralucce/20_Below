import { extractTableAfter } from './markdown.js';

export function parseNatures(creationMd) {
  const table = extractTableAfter(creationMd, '### Starter Natures');
  return table.rows.map((row) => ({
    name: row.Nature,
    drive: row.Drive,
    example: row['Earning a Fate Token'],
  }));
}
