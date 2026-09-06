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
// Exits non-zero if any parser throws, returns an empty result, warns, or
// comes back the right SHAPE with the content hollowed out. That last case is
// the one that actually shipped: a voice pass moved a full stop inside a bold
// run, parseGiftCheckText stopped matching and returned '', and this file
// printed "ok -> 0 chars / All parsers OK" because an empty string is not 0.
// Breaking every "**Adders**:" label in gifts.md passed the same way - 50
// warnings, 50 Gifts still counted, exit 0. Counts alone do not prove the data
// survived, so the depth checks below look inside what the parsers return.

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

// Several parsers degrade rather than throw: a Gift whose "**Adders**:" label
// was renamed warns and returns zero Adders, and the Gift is still counted. So
// warnings are collected and treated as failures instead of printed and lost.
const warnings = [];
console.warn = (msg) => warnings.push(String(msg));

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
    // '0 chars' is not 0 - spelling this out is what the old check missed.
    const empty = n === 0 || n === 'NULL' || n === '0 chars'
      || (typeof out === 'string' && !out.trim());
    if (empty) failures++;
    console.log(`${empty ? 'EMPTY ' : 'ok    '} ${name.padEnd(52)} -> ${n}`);
  } catch (e) {
    failures++;
    console.log(`THREW  ${name.padEnd(52)} -> ${e.message}`);
  }
}

// ---------------------------------------------------------------- depth
//
// A count proves a table was found, not that its cells arrived. Everything
// below reaches into the parsed structures and asserts the things the app
// actually reads - so a renamed column, a retitled sub-label or a reworded
// bullet shows up here instead of as a blank field in the character sheet.

const findings = [];
const chk = (cond, msg) => { if (!cond) findings.push(msg); };

try {
  const gifts = parseGifts(giftsMd, { Lesser: 3, Greater: 6 });
  gifts.forEach((g) => {
    chk(g.name && g.name.trim(), 'a Gift parsed with a blank name');
    chk(g.markdown && g.markdown.length > 50,
      `Gift "${g.name}": body text is ${g.markdown ? g.markdown.length : 0} chars`);
    chk(g.levels || g.menu, `Gift "${g.name}": neither a Level table nor a build menu`);
    (g.levels || []).forEach((l) =>
      chk(Number.isFinite(l.level) && l.effect,
        `Gift "${g.name}": a Level row lost its number or its effect`));
    (g.menu ? g.menu.items : []).forEach((i) =>
      chk(i.cost, `Gift "${g.name}": build-menu option "${i.option}" has an unparseable cost`));
  });
  // Gifts carry Adders and Limiters throughout the file. If not one of them
  // parses, the label moved - which is what a silent 50-warning pass looked
  // like before warnings counted for anything.
  chk(gifts.some((g) => g.adders.length),
    'no Gift anywhere parsed an Adder - the "**Adders**:" label has probably moved');
  chk(gifts.some((g) => g.limiters.length),
    'no Gift anywhere parsed a Limiter - the "**Limiters**:" label has probably moved');

  parseFlaws(md('flaws.md')).forEach((f) => {
    chk(f.name && f.points, `Flaw "${f.name}": missing name or points`);
    chk(f.levels && f.levels.length === 5,
      `Flaw "${f.name}": ${f.levels ? f.levels.length : 'no'} Levels, expected 5`);
  });

  parseBoons(md('boons.md')).forEach((b) => {
    chk(b.name && b.effect, `Boon "${b.name}": missing effect`);
    chk(b.costs.length > 0, `Boon "${b.name}": no cost parsed out of "${b.points}"`);
    b.costs.forEach((c) => chk(c.tier, `Boon "${b.name}": cost ${c.points} matches no tier name`));
  });

  parseResources(md('resources.md')).forEach((r) => {
    chk(r.scales, `Resource "${r.name}": no "What Scales by Level" text`);
    chk(Object.keys(r.levels).length === 5,
      `Resource "${r.name}": ${Object.keys(r.levels).length} Levels, expected 5`);
  });

  parseEquipment(weaponsMd).forEach((cat) => {
    chk(cat.items.length, `Equipment category "${cat.category}": no items`);
    cat.items.forEach((i) => {
      chk(i.name, `Equipment category "${cat.category}": a row has no name`);
      chk(i.wealth === null || Number.isFinite(i.wealth),
        `Equipment "${i.name}": Wealth "${i.Wealth}" is not a number`);
    });
  });
  parseEverymanGearPackages(weaponsMd).forEach((l) =>
    chk(l.packages.length, `Everyman gear Level ${l.level}: no packages`));

  parseSkillCatalog(md('premade-skills.md')).forEach((s) =>
    chk(s.name && s.defaultElement && s.definition,
      `Skill "${s.name}": missing Element or definition`));
  parseSkillTiers(md('skills.md')).forEach((t) =>
    chk(t.name && t.roll, `Skill tier ${t.tier}: missing name or roll`));
  parseNatures(md('fate.md')).forEach((n) =>
    chk(n.name && n.drive, `Nature "${n.name}": missing drive`));
  parseDifficultyChart(rulesMd).forEach((d) =>
    chk(d.label && Number.isFinite(d.difficulty), 'a Difficulty row lost its label or number'));
  Object.entries(parseSampleDescriptors(rulesMd)).forEach(([k, v]) =>
    chk(v.length >= 3, `Sample Descriptors for "${k}": only ${v.length}`));

  // costs.js keys every field off an exact row label. Rename a row and the
  // field comes back undefined while the table itself still parses - the app
  // then prices something at NaN. So every leaf is checked for a real value.
  const walkCosts = (o, path = '') => {
    Object.entries(o).forEach(([k, v]) => {
      const q = path ? `${path}.${k}` : k;
      if (v && typeof v === 'object' && !Array.isArray(v)) walkCosts(v, q);
      else chk(!(v === undefined || (typeof v === 'number' && Number.isNaN(v))),
        `costs.md: ${q} did not resolve (${v}) - a row label probably changed`);
    });
  };
  walkCosts(parseCosts(md('costs.md')));

  Object.entries(parseAttributes(creationMd)).forEach(([k, v]) =>
    chk(!(v === undefined || (typeof v === 'number' && Number.isNaN(v))),
      `character-creation.md: ${k} did not resolve (${v})`));
} catch (e) {
  findings.push(`depth checks aborted: ${e.message}`);
}

findings.forEach((f) => console.log(`DEPTH  ${f}`));
warnings.forEach((w) => console.log(`WARN   ${w}`));

const total = failures + findings.length + warnings.length;
if (total > 0) {
  console.error(`\n${failures} parser failure(s), ${findings.length} depth finding(s), `
    + `${warnings.length} warning(s) - do not commit.`);
  process.exit(1);
}
console.log(`\nAll parsers OK - ${checks.length} parsers, no warnings, depth checks clean.`);
