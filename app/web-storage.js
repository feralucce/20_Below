// localStorage-backed named-character save/load for the browser build - the
// same idea as desktop-storage.js's file-based save/list/load, but for
// players who don't have the desktop app. Every saved character lives under
// one JSON object (keyed by name) in a single localStorage key, rather than
// N separate keys, so listing them doesn't require scanning localStorage's
// whole keyspace.
const CHARACTERS_KEY = '20below-saved-characters';

// Mirrors desktop/src-tauri/src/lib.rs's sanitize_name (minus the
// filesystem-illegal-character stripping, irrelevant here) so a blank name
// behaves identically whether saved from the browser or the desktop app.
function sanitizeName(name) {
  const trimmed = (name ?? '').trim();
  return trimmed === '' ? 'Unnamed Character' : trimmed;
}

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(CHARACTERS_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function writeAll(all) {
  localStorage.setItem(CHARACTERS_KEY, JSON.stringify(all));
}

// Always writes under the character's own (sanitized) Name field - saving
// again just overwrites that same entry, same "no separate Save As" model
// the desktop build uses. Returns the name it was actually saved under.
export function saveCharacterToLocalStorage(state) {
  const name = sanitizeName(state.name);
  const all = readAll();
  all[name] = state;
  writeAll(all);
  return name;
}

export function listSavedCharactersLocalStorage() {
  return Object.keys(readAll()).sort();
}

export function loadCharacterFromLocalStorage(name) {
  const all = readAll();
  if (!(name in all)) throw new Error(`No saved character named "${name}"`);
  return all[name];
}
