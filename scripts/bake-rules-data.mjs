// The rules as the Creator reads them, parsed once and written to a JSON
// file, for the builds that open without the site: the Owlbear extensions
// and the desktop Battle Tracker. The site itself reads the rules live.
//
//   node scripts/bake-rules-data.mjs <out-file>

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '..');

export async function bakeRulesData(out) {
  // fetchText asks for "../rules/x.md" relative to app/; here that is a
  // file on disk.
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (path) => {
    const text = readFileSync(resolve(repo, 'app', String(path)), 'utf8');
    return { ok: true, status: 200, statusText: 'OK', text: async () => text };
  };
  try {
    const { loadRulesData } = await import(pathToFileURL(join(repo, 'app', 'rules-data.js')).href);
    writeFileSync(out, JSON.stringify(await loadRulesData()), 'utf8');
  } finally {
    globalThis.fetch = realFetch;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const out = process.argv[2];
  if (!out) {
    console.error('usage: node scripts/bake-rules-data.mjs <out-file>');
    process.exit(1);
  }
  await bakeRulesData(resolve(out));
  console.log(`rules -> ${out}`);
}
