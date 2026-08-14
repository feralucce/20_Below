import { extractTableAfter } from './markdown.js';

// The Difficulty Chart, rules.md#difficulty-chart - an 11-step ladder
// (0 Nearly Impossible through 10 Trivial) used to label a Difficulty
// picker rather than hand-typing the labels into the app separately.
export function parseDifficultyChart(rulesMd) {
  const table = extractTableAfter(rulesMd, '| Difficulty | Label | Example task |');
  return table.rows.map((row) => ({
    difficulty: Number(row.Difficulty),
    label: row.Label,
  }));
}
