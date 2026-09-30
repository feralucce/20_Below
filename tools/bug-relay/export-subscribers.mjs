// Exports the email list to a CSV any newsletter service can import
// (MailerLite, Kit, Buttondown and others all take email plus extra
// columns). Run it from this folder while logged in to Wrangler:
//
//   node export-subscribers.mjs                 -> subscribers.csv here
//   node export-subscribers.mjs path\to\list.csv
//
// The CSV holds people's addresses: keep it out of git (*.csv is
// ignored in this folder) and delete it once the import is done.

import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const out = process.argv[2] || 'subscribers.csv';
const raw = execSync('npx wrangler kv key list --binding SUBSCRIBERS --remote', {
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
});
// Wrangler may print warnings first; the list is the line that starts with [.
const keys = JSON.parse(raw.slice(raw.search(/^\[/m)));

const cell = (v) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};
const rows = [['email', 'source', 'signed_up']];
for (const k of keys.sort((a, b) => String(a.metadata?.at).localeCompare(String(b.metadata?.at)))) {
  rows.push([k.name, k.metadata?.source || '', k.metadata?.at || '']);
}
writeFileSync(out, rows.map((r) => r.map(cell).join(',')).join('\n') + '\n');
console.log(`${keys.length} address(es) written to ${out}`);
