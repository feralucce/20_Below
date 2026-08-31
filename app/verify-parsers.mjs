// Regression check for the rules-file parsers.
//
// The parsers in ./parse/ anchor on exact literal strings - table header rows and
// section headings - inside rules/*.md. Prose edits are safe; renaming a heading,
// retitling a table, or reordering a column breaks the character creator SILENTLY:
// no error, just missing or empty data in the app.
//
// Run this before committing any change to rules/*.md:
//
//     node app/verify-parsers.mjs
//
// Exits non-zero if any parser throws or returns an empty result.

import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const parser = (f) => pathToFileURL(join(here, 'parse', f)).href;
// Normalized the same way fetchText does at runtime, so this checks the
// parsers against the text the app actually sees rather than failing on a
// Windows checkout's CRLF.
const md = (f) => readFileSync(join(here, '..', 'rules', f), 'utf8').replace(/\r\n/g, '\n');

const { parseAttributes, parseEverymanSkills } = await import(parser('attributes.js'));
const { parseBoons } = await import(parser('boons.js'));
const { parseCosts } = await import(parser('costs.js'));
const { parseSampleDescriptors } = await import(parser('descriptors.js'));
const { parseDifficultyChart } = await import(parser('difficulty.js'));
const { parseFlaws } = await import(parser('flaws.js'));
const { parseGifts, parseGiftCheckText } = await import(parser('gifts.js'));
const { parseNatures } = await import(parser('nature.js'));
const { parseResources } = await import(parser('resources.js'));
const { parseSkillTiers, parseSkillCatalog } = await import(parser('skills.js'));
const { parseEquipment, parseEverymanGearPackages } = await import(parser('weapons.js'));

const rulesMd = md('rules.md');
const creationMd = md('character-creation.md');
const giftsMd = md('gifts.md');
const weaponsMd = md('weapons.md');

const size = (v) =>
  v == null ? 'NULL'
    : Array.isArray(v) ? v.length
      : typeof v === 'object' ? Object.keys(v).length
        : typeof v === 'string' ? `${v.length} chars`
          : String(v);

const checks = [
  ['parseDifficultyChart      (rules.md)', () => parseDifficultyChart(rulesMd)],
  ['parseSampleDescriptors    (rules.md)', () => parseSampleDescriptors(rulesMd)],
  ['parseAttributes           (character-creation.md)', () => parseAttributes(creationMd)],
  ['parseEverymanSkills       (character-creation.md)', () => parseEverymanSkills(creationMd)],
  ['parseCosts                (costs.md)', () => parseCosts(md('costs.md'))],
  ['parseBoons                (boons.md)', () => parseBoons(md('boons.md'))],
  ['parseFlaws                (flaws.md)', () => parseFlaws(md('flaws.md'))],
  ['parseGifts                (gifts.md)', () => parseGifts(giftsMd, 3)],
  ['parseGiftCheckText        (gifts.md)', () => parseGiftCheckText(giftsMd)],
  ['parseNatures              (fate.md)', () => parseNatures(md('fate.md'))],
  ['parseResources            (resources.md)', () => parseResources(md('resources.md'))],
  ['parseSkillTiers           (skills.md)', () => parseSkillTiers(md('skills.md'))],
  ['parseSkillCatalog         (premade-skills.md)', () => parseSkillCatalog(md('premade-skills.md'))],
  ['parseEquipment            (weapons.md)', () => parseEquipment(weaponsMd)],
  ['parseEverymanGearPackages (weapons.md)', () => parseEverymanGearPackages(weaponsMd)],
];

let failures = 0;
for (const [name, fn] of checks) {
  try {
    const out = fn();
    const n = size(out);
    const empty = n === 0 || n === 'NULL';
    if (empty) failures++;
    console.log(`${empty ? 'EMPTY ' : 'ok    '} ${name.padEnd(52)} -> ${n}`);
  } catch (e) {
    failures++;
    console.log(`THREW  ${name.padEnd(52)} -> ${e.message}`);
  }
}

if (failures > 0) {
  console.error(`\n${failures} parser(s) failed or returned empty - do not commit.`);
  process.exit(1);
}
console.log('\nAll parsers OK.');
