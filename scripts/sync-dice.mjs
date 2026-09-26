// Copies the rules engine into the 20_Below_Dice repo (the Owlbear Rodeo
// dice extension).
//
// Dice was written by hand, with its own copy of the roll rules, and by
// September it had drifted from them: no Lucky Number, no critical-hit
// damage, no Social or Mental attacks. It now imports the same code the
// character creator rolls with, copied into its lib/ the way the Roster
// extension's is (see sync-roster.mjs). Its page stays its own - it is a
// player's roller, not the tracker - so only the engine is synced.
//
//   node scripts/sync-dice.mjs [path-to-20_Below_Dice]

import { copyFileSync, mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '..');
const dest = resolve(process.argv[2] || join(repo, '..', '20 Below Dice'));

if (!existsSync(dest)) {
  console.error(`Dice repo not found: ${dest}`);
  process.exit(1);
}

// Relative layout kept so damage.js's own import of ./core.js resolves.
const LIB = [
  ['app/roller/core.js', 'lib/roller/core.js'],
  ['app/roller/damage.js', 'lib/roller/damage.js'],
  ['app/state.js', 'lib/state.js'],
];

for (const [from, to] of LIB) {
  const out = join(dest, to);
  mkdirSync(dirname(out), { recursive: true });
  copyFileSync(join(repo, from), out);
  console.log(`  ${from}  ->  ${to}`);
}

writeFileSync(
  join(dest, 'lib', 'README.md'),
  [
    '# lib/ - generated, do not edit',
    '',
    'Copied from the main [20_Below](https://github.com/feralucce/20_Below) repo by',
    '`scripts/sync-dice.mjs`. Edit the originals there and re-run the sync; anything',
    'changed here is overwritten. `index.html` is this repo\'s own and is not synced.',
    '',
    '| File | Source |',
    '| --- | --- |',
    ...LIB.map(([from, to]) => `| \`${to.replace('lib/', '')}\` | \`${from}\` |`),
    '',
  ].join('\n'),
  'utf8',
);

console.log(`\nSynced to ${dest}`);
