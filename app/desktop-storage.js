// Local file persistence for the standalone desktop app (Tauri) only - the
// browser build keeps using localStorage exclusively (see loadSavedState/
// saveState in main.js), since it has no file-system access at all. Files
// live in a "characters" folder inside the app's own per-user data
// directory. Goes through three first-party Rust commands (src-tauri/src/
// lib.rs) rather than the fs plugin directly - the fs plugin's own ACL
// scope matching (fs:allow-write-text-file/allow-read-text-file) never
// actually matched a resolved absolute path in this Tauri version, throwing
// "forbidden path" on every real save despite following its documented
// scope syntax exactly. Custom app commands aren't subject to that ACL
// system at all, so routing through them sidesteps the bug.

export const isDesktopApp = typeof window !== 'undefined' && Boolean(window.__TAURI__);

// Always writes to a file named after the character's own Name field -
// saving again just overwrites that same file, no separate "Save As" step.
export async function saveCharacterToFile(state) {
  return window.__TAURI__.core.invoke('save_character', {
    name: state.name ?? '',
    contents: JSON.stringify(state, null, 2),
  });
}

export async function listSavedCharacters() {
  return window.__TAURI__.core.invoke('list_characters');
}

export async function loadCharacterFromFile(name) {
  const text = await window.__TAURI__.core.invoke('load_character', { name });
  return JSON.parse(text);
}
