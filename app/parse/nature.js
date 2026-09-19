import { extractTableAfter } from './markdown.js';

export function parseNatures(creationMd) {
  const table = extractTableAfter(creationMd, '### Starter Natures');
  return table.rows.map((row) => ({
    name: row.Nature,
    drive: row.Drive,
    example: row['Playing to it looks like'],
  }));
}
