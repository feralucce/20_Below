// Shared helpers for pulling structured data out of the rules/*.md source files.
// Every parser in this folder is built on these three primitives: fetch a raw
// file, find a section by heading, and extract a pipe table or a number from it.
// Keeping parsing this literal (vs. hand-copying data) is the whole point of the
// app: edit a rules file, reload, the app reflects it.

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/feralucce/20_Below/main/';
const REPO_FETCH_TIMEOUT_MS = 5000;

// The desktop shell (Tauri) ships a bundled snapshot of rules/*.md that goes
// stale the moment the live repo changes, unlike the browser build, which is
// already served straight from the repo (GitHub Pages) and stays current for
// free. Only the desktop build needs this - detected via withGlobalTauri in
// tauri.conf.json, which is what actually exposes window.__TAURI__.
const isDesktopApp = typeof window !== 'undefined' && Boolean(window.__TAURI__);

// Set when a desktop live fetch fails and the snapshot bundled into the
// installer is served instead. That snapshot is only as current as the release
// the user installed, so the UI surfaces it rather than silently showing stale
// rules - see the rules-source indicator in main.js.
let servedFromBundle = false;

export function isServingBundledRules() {
  return servedFromBundle;
}

async function fetchFromGitHub(repoRelativePath) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REPO_FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(GITHUB_RAW_BASE + repoRelativePath, {
      cache: 'no-store',
      signal: controller.signal,
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null; // offline, DNS failure, timeout, etc. - fall back to the bundled copy
  } finally {
    clearTimeout(timeout);
  }
}

// Every parser here is line-oriented, and the table regex in particular
// anchors on `$` with only [ \t] allowed before it - so a CRLF file leaves a
// stray \r that makes tables invisible and throws "Not enough lines to be a
// table". GitHub raw and Pages both serve LF, but a Windows checkout is CRLF
// (core.autocrlf), and that checkout is what the desktop build bundles.
// Normalize once, here, so it cannot matter where the markdown came from.
export function normalizeEol(text) {
  return text.replace(/\r\n/g, '\n');
}

export async function fetchText(path) {
  if (isDesktopApp) {
    // Every call site passes a path like "../rules/rules.md", relative to
    // app/index.html - strip the leading "../" to get the path relative to
    // the repo root, which is exactly what the GitHub raw URL needs.
    const repoRelativePath = path.replace(/^(\.\.\/)+/, '');
    const live = await fetchFromGitHub(repoRelativePath);
    if (live !== null) return normalizeEol(live);
    servedFromBundle = true;
  }

  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`Failed to load ${path}: ${res.status} ${res.statusText}`);
  }
  return normalizeEol(await res.text());
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Returns the raw text of a section starting at a heading (e.g. "## Nature")
// up to (not including) the next heading of the same or shallower depth.
export function findSection(markdown, title, hashes) {
  const startRegex = new RegExp(`^${hashes} ${escapeRegex(title)}\\s*$`, 'm');
  const m = startRegex.exec(markdown);
  if (!m) {
    throw new Error(`Section not found: "${hashes} ${title}"`);
  }
  const start = m.index + m[0].length;
  const rest = markdown.slice(start);
  const stopRegex = new RegExp(`^#{1,${hashes.length}} `, 'm');
  const stopMatch = stopRegex.exec(rest);
  const end = stopMatch ? start + stopMatch.index : markdown.length;
  return markdown.slice(start, end).trim();
}

// Splits a chunk of markdown into blocks at every heading of an exact depth
// (e.g. "###"), returning [{ title, body }] where body includes the heading
// line itself through to (not including) the next heading of that same depth.
export function splitByHeading(markdown, hashes) {
  const regex = new RegExp(`^${hashes} (.+)$`, 'gm');
  const matches = [...markdown.matchAll(regex)];
  const blocks = [];
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const end = i + 1 < matches.length ? matches[i + 1].index : markdown.length;
    blocks.push({ title: matches[i][1].trim(), body: markdown.slice(start, end).trim() });
  }
  return blocks;
}

// Parses a single markdown pipe table into { headers, rows }, rows being
// plain objects keyed by header text.
export function parseTable(tableText) {
  const lines = tableText
    .trim()
    .split('\n')
    .filter((line) => line.trim().startsWith('|'));
  if (lines.length < 2) {
    throw new Error('Not enough lines to be a table');
  }
  const headers = lines[0]
    .split('|')
    .slice(1, -1)
    .map((cell) => cell.trim());
  const rows = lines.slice(2).map((line) => {
    const cells = line.split('|').slice(1, -1).map((cell) => cell.trim());
    const row = {};
    headers.forEach((header, i) => {
      row[header] = cells[i] ?? '';
    });
    return row;
  });
  return { headers, rows };
}

// Finds the first pipe table appearing anywhere after `anchorText` in
// `markdown` and parses it.
export function extractTableAfter(markdown, anchorText) {
  const idx = markdown.indexOf(anchorText);
  if (idx === -1) {
    throw new Error(`Anchor text not found: "${anchorText}"`);
  }
  const rest = markdown.slice(idx);
  const tableMatch = rest.match(/((?:^\|[^\n]*\|[ \t]*$\n?)+)/m);
  if (!tableMatch) {
    throw new Error(`No table found after anchor: "${anchorText}"`);
  }
  return parseTable(tableMatch[1]);
}

// Finds every pipe table in a chunk of markdown, in document order.
// (Note: \s in the line-end check would also match \n, which lets the
// regex silently bridge a blank line and merge two separate tables into
// one - use [ \t]* to stop strictly at end of line instead.)
export function extractAllTables(markdown) {
  const matches = markdown.matchAll(/((?:^\|[^\n]*\|[ \t]*$\n?)+)/gm);
  return [...matches].map((m) => parseTable(m[1]));
}

// Pulls a bold number (e.g. "**20 points**", "maximum of **10**") out of the
// text following an anchor phrase, within a bounded window so an unrelated
// later number in the same file can't be picked up by accident.
export function extractNumberNear(markdown, anchorText, numberRegex, windowSize = 400) {
  const idx = markdown.indexOf(anchorText);
  if (idx === -1) {
    throw new Error(`Anchor text not found: "${anchorText}"`);
  }
  const window = markdown.slice(idx, idx + windowSize);
  const m = window.match(numberRegex);
  if (!m) {
    throw new Error(`Number pattern not found near anchor: "${anchorText}"`);
  }
  return Number(m[1]);
}

// Extracts every number found in a string (used for messy multi-cost cells
// like "1, 3, 5, or 7" or "3 or 5").
export function extractAllNumbers(text) {
  return [...text.matchAll(/\d+/g)].map(Number);
}
