// Copies the shared rules and combat engine into the 20_Below_Roster repo.
//
// The Owlbear extension has to keep serving its own copy: its manifest URL
// is already installed in people's rooms, and unlike the small rules
// helpers, a whole combat engine has no sensible offline fallback - so it
// ships with the extension rather than being fetched from the site.
//
// These are generated files. Edit them in this repo; never in the Roster.
//
//   node scripts/sync-roster.mjs [path-to-20_Below_Roster]

import { copyFileSync, mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '..');
const dest = resolve(
  process.argv[2] || join(repo, '..', '20 Below Roster'),
);

if (!existsSync(dest)) {
  console.error(`Roster repo not found: ${dest}`);
  process.exit(1);
}

// [source relative to this repo, destination relative to the Roster repo]
// The relative layout is preserved so model.js's own imports resolve.
const FILES = [
  ['app/state.js', 'lib/state.js'],
  ['app/roller/core.js', 'lib/roller/core.js'],
  ['app/combat/model.js', 'lib/combat/model.js'],
];

for (const [from, to] of FILES) {
  const src = join(repo, from);
  const out = join(dest, to);
  mkdirSync(dirname(out), { recursive: true });
  copyFileSync(src, out);
  console.log(`  ${from}  ->  ${to}`);
}

writeFileSync(
  join(dest, 'lib', 'README.md'),
  [
    '# lib/ - generated, do not edit',
    '',
    'Copied from the main [20_Below](https://github.com/feralucce/20_Below) repo by',
    '`scripts/sync-roster.mjs`. Edit the originals there and re-run the sync; anything',
    'changed here is overwritten.',
    '',
    '| File | Source |',
    '| --- | --- |',
    ...FILES.map(([from, to]) => `| \`${to.replace('lib/', '')}\` | \`${from}\` |`),
    '',
  ].join('\n'),
  'utf8',
);
console.log(`\nSynced ${FILES.length} files to ${dest}`);
