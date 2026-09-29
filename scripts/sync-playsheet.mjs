// Builds the 20_Below_Dice repo - the Owlbear Rodeo extension, now "20 Below
// Character Sheet" - from playsheet/ in this repo.
//
// It started as a dice roller with its own copy of the roll rules, and by
// September that copy had drifted from them. Then it took the engine
// (the old sync-dice.mjs). Now it is the player's whole sheet in Owlbear:
// the character's numbers, the sheet's automation and the Roll dice
// window, all of it the Creator's own code. The repo keeps its name
// because its manifest URL is already installed in people's rooms.
//
// playsheet/ imports the Creator's modules from ../app/, which does not
// exist beside the extension, so the copy imports them from ./lib/ and
// lib/ is laid out the way app/ is, so the modules' own relative imports
// still resolve. The rules are baked into rules-data.json here, from the
// same parsers the Creator runs, so the extension needs nothing from the
// site to open.
//
//   node scripts/sync-playsheet.mjs [path-to-20_Below_Dice]

import {
  copyFileSync, mkdirSync, existsSync, readFileSync, writeFileSync, rmSync,
} from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '..');
const dest = resolve(process.argv[2] || join(repo, '..', '20 Below Dice'));

if (!existsSync(dest)) {
  console.error(`Extension repo not found: ${dest}`);
  process.exit(1);
}

// Every module the page reaches, at the same path under lib/ as under app/.
export const LIB = [
  'ui.js',
  'state.js',
  'roller/core.js',
  'roller/damage.js',
  'roller/giftCheck.js',
  'roller/resourceCheck.js',
  'steps/roller-panel.js',
  'sheet/sheet-model.js',
  'sheet/panels.js',
  // Spending XP, the Creator's own Advancement sections.
  'steps/tab-advancement.js',
  'steps/07-boons.js',
  'describe-spec.js',
  // The Report a bug dialog.
  'bug-report.js',
];

// The page's own files, and how each is rewritten for the extension.
export const PAGE = [
  ['playsheet/index.html', 'index.html'],
  ['playsheet/playsheet.js', 'playsheet.js'],
  ['playsheet/playsheet.css', 'playsheet.css'],
];

// Must match forExtension() in tools/check-desktop-drift.py.
export function forExtension(text) {
  return text
    .replaceAll("'../app/", "'./lib/")
    .replaceAll('"../app/', '"./lib/')
    .replaceAll('"../vendor/marked.min.js"', '"./lib/marked.min.js"');
}

// The old dice-only engine layout left files this page no longer loads.
rmSync(join(dest, 'lib', 'roller', 'wealthCheck.js'), { force: true });

for (const f of LIB) {
  const out = join(dest, 'lib', f);
  mkdirSync(dirname(out), { recursive: true });
  copyFileSync(join(repo, 'app', f), out);
  console.log(`  app/${f}  ->  lib/${f}`);
}
copyFileSync(join(repo, 'vendor', 'marked.min.js'), join(dest, 'lib', 'marked.min.js'));
console.log('  vendor/marked.min.js  ->  lib/marked.min.js');

// The page says where it comes from; the drift check strips this back off.
const BANNER = '<!--\n  GENERATED FILE - do not edit here. Built from playsheet/ in\n'
  + '  https://github.com/feralucce/20_Below by scripts/sync-playsheet.mjs; edit it\n'
  + '  there and re-run the sync. Anything changed in this repo is overwritten.\n-->\n';
for (const [from, to] of PAGE) {
  let text = forExtension(readFileSync(join(repo, from), 'utf8').replace(/\r\n/g, '\n'));
  if (to === 'index.html') text = text.replace('<!doctype html>', `${BANNER}<!doctype html>`);
  writeFileSync(join(dest, to), text, 'utf8');
  console.log(`  ${from}  ->  ${to}`);
}

// The rules, parsed the way the Creator parses them. fetchText asks for
// "../rules/x.md" relative to app/; here that is a file on disk.
globalThis.fetch = async (path) => {
  const file = resolve(repo, 'app', String(path));
  const text = readFileSync(file, 'utf8');
  return { ok: true, status: 200, statusText: 'OK', text: async () => text };
};
const { loadRulesData } = await import(pathToFileURL(join(repo, 'app', 'rules-data.js')).href);
const data = await loadRulesData();
writeFileSync(join(dest, 'rules-data.json'), JSON.stringify(data), 'utf8');
console.log('  rules/*.md  ->  rules-data.json');

const MANIFEST = {
  name: '20 Below Character Sheet',
  version: '2.0.0',
  manifest_version: 1,
  author: 'Feralucce',
  homepage_url: 'https://github.com/feralucce/20_Below_Dice',
  icon: 'https://feralucce.github.io/20_Below_Dice/icon.svg',
  // Owlbear Rodeo takes 128 characters at most.
  description: 'Your 20 Below character at the table: the full sheet, self-tracking Vitals, '
    + 'Ki and Fate, and dice rolls the whole room sees.',
  action: {
    title: '20 Below Character Sheet',
    icon: 'https://feralucce.github.io/20_Below_Dice/icon.svg',
    popover: 'https://feralucce.github.io/20_Below_Dice/index.html',
    height: 780,
    width: 613,
  },
};
if (MANIFEST.description.length > 128) {
  console.error(`manifest description is ${MANIFEST.description.length} characters; Owlbear Rodeo allows 128`);
  process.exit(1);
}
writeFileSync(join(dest, 'manifest.json'), `${JSON.stringify(MANIFEST, null, 2)}\n`, 'utf8');
console.log('  manifest.json  (20 Below Character Sheet)');

writeFileSync(
  join(dest, 'lib', 'README.md'),
  [
    '# lib/ - generated, do not edit',
    '',
    'Copied from the main [20_Below](https://github.com/feralucce/20_Below) repo by',
    '`scripts/sync-playsheet.mjs`, laid out the way `app/` is. Edit the originals',
    'there and re-run the sync; anything changed here is overwritten.',
    '',
    '| File | Source |',
    '| --- | --- |',
    ...LIB.map((f) => `| \`${f}\` | \`app/${f}\` |`),
    '| `marked.min.js` | `vendor/marked.min.js` |',
    '',
  ].join('\n'),
  'utf8',
);

console.log(`\nSynced to ${dest}`);
