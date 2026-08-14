import { extractTableAfter } from './markdown.js';

// Sample Descriptors table lives in rules.md's Sub-Stat Descriptors
// section - one row per sub-stat, a comma-separated starter list a player
// can pick from (or ignore and write their own).
export function parseSampleDescriptors(rulesMd) {
  const table = extractTableAfter(rulesMd, '**Sample Descriptors**');
  const bySubStat = {};
  table.rows.forEach((row) => {
    bySubStat[row['Sub-Stat']] = row['Sample Descriptors'].split(',').map((s) => s.trim());
  });
  return bySubStat;
}
