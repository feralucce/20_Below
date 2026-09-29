// Raises one desktop app's minimum in app-versions.json from a release tag.
// Run by .github/workflows/required-update.yml; also safe to run by hand.
//
//   node tools/raise-min-version.mjs combat-tracker-v0.3.5
//
// Never lowers a minimum. Writes changed=true|false to $GITHUB_OUTPUT
// when there is one.

import { readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Tag prefix -> key in app-versions.json. Matches GATED_APPS in
// app/update-gate.js.
export const TAGS = [
  [/^combat-tracker-v(\d+\.\d+\.\d+)$/, 'battle-tracker'],
  [/^brewery-v(\d+\.\d+\.\d+)$/, 'brewery'],
  [/^prep-v(\d+\.\d+\.\d+)$/, 'prep'],
  [/^v(\d+\.\d+\.\d+)$/, 'creator'],
];

export function appForTag(tag) {
  for (const [re, key] of TAGS) {
    const m = re.exec(tag);
    if (m) return { key, version: m[1] };
  }
  return null;
}

export function isOlder(a, b) {
  const x = String(a).split('.').map(Number);
  const y = String(b).split('.').map(Number);
  for (let i = 0; i < 3; i += 1) {
    if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) < (y[i] || 0);
  }
  return false;
}

export function raise(floors, tag) {
  const app = appForTag(tag);
  if (!app) return { floors, changed: false, reason: `"${tag}" is not a desktop app release.` };
  const current = floors[app.key] || '0.0.0';
  if (!isOlder(current, app.version)) {
    return { floors, changed: false, reason: `${app.key} already requires v${current}.` };
  }
  return { floors: { ...floors, [app.key]: app.version }, changed: true, reason: `${app.key}: v${current} -> v${app.version}` };
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const tag = process.argv[2] || '';
  const file = join(dirname(fileURLToPath(import.meta.url)), '..', 'app-versions.json');
  const result = raise(JSON.parse(readFileSync(file, 'utf8')), tag);
  if (result.changed) writeFileSync(file, JSON.stringify(result.floors, null, 2) + '\n');
  console.log(result.reason);
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `changed=${result.changed}\n`);
}
