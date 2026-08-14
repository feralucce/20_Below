// Local file persistence for the standalone desktop app (Tauri) only - the
// browser build keeps using localStorage exclusively (see loadSavedState/
// saveState in main.js), since it has no file-system access at all. Files
// live in a "characters" folder inside the app's own per-user data
// directory (via Tauri's fs plugin, exposed on window.__TAURI__ because
// tauri.conf.json sets withGlobalTauri: true), scoped by the fs
// permissions in desktop/src-tauri/capabilities/default.json.

export const isDesktopApp = typeof window !== 'undefined' && Boolean(window.__TAURI__);

function sanitizeFilename(name) {
  const cleaned = (name ?? '').replace(/[\\/:*?"<>|]+/g, '_').trim();
  return cleaned || 'Unnamed Character';
}

async function charactersDir() {
  const appData = await window.__TAURI__.path.appDataDir();
  return window.__TAURI__.path.join(appData, 'characters');
}

async function ensureCharactersDir() {
  const dir = await charactersDir();
  if (!(await window.__TAURI__.fs.exists(dir))) {
    await window.__TAURI__.fs.mkdir(dir, { recursive: true });
  }
  return dir;
}

// Always writes to a file named after the character's own Name field -
// saving again just overwrites that same file, no separate "Save As" step.
export async function saveCharacterToFile(state) {
  const dir = await ensureCharactersDir();
  const filename = `${sanitizeFilename(state.name)}.json`;
  const path = await window.__TAURI__.path.join(dir, filename);
  await window.__TAURI__.fs.writeTextFile(path, JSON.stringify(state, null, 2));
  return filename;
}

export async function listSavedCharacters() {
  const dir = await ensureCharactersDir();
  const entries = await window.__TAURI__.fs.readDir(dir);
  return entries
    .filter((e) => e.name?.toLowerCase().endsWith('.json'))
    .map((e) => e.name.slice(0, -'.json'.length))
    .sort((a, b) => a.localeCompare(b));
}

export async function loadCharacterFromFile(name) {
  const dir = await charactersDir();
  const path = await window.__TAURI__.path.join(dir, `${name}.json`);
  const text = await window.__TAURI__.fs.readTextFile(path);
  return JSON.parse(text);
}
