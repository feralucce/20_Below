// Save, Load, Import and Export, done where the character already is.
//
// These four used to live behind one link to file.html, which meant every
// save was a round trip out of the creator and back into it, and Load was
// a page you visited rather than a list you opened. The operations are the
// same; what changed is that they run against the working draft in place
// and report into the header.
//
// Desktop and browser keep their different backing stores - files in the
// app's own data directory, or a keyed object in localStorage - and this
// picks between them once, so nothing above it has to know which it got.

import { mergeCharacterState } from './state.js';
import { el } from './ui.js';
import {
  isDesktopApp,
  saveCharacterToFile,
  listSavedCharacters,
  loadCharacterFromFile,
} from './desktop-storage.js';
import {
  saveCharacterToLocalStorage,
  listSavedCharactersLocalStorage,
  loadCharacterFromLocalStorage,
} from './web-storage.js';
import { downloadJson } from './export/toJson.js';

export const listNames = isDesktopApp
  ? listSavedCharacters
  : async () => listSavedCharactersLocalStorage();

export const loadByName = isDesktopApp
  ? loadCharacterFromFile
  : async (name) => loadCharacterFromLocalStorage(name);

export const saveCharacter = isDesktopApp
  ? saveCharacterToFile
  : async (draft) => saveCharacterToLocalStorage(draft);

// A WebView2 <input type=file> inside the packaged Tauri app never opens a
// native dialog at all, so the desktop build asks Tauri for one and reads
// the chosen path through the read_character_file command in lib.rs. The
// fs plugin's own readTextFile is not an option: it has had no fs:allow-*
// permission since the 2026-08-20 capabilities cleanup, and every import
// through it failed as "not a valid character file".
export function pickCharacterFile() {
  if (isDesktopApp) {
    return (async () => {
      const path = await window.__TAURI__.dialog.open({
        multiple: false,
        filters: [{ name: 'Character', extensions: ['json'] }],
      });
      if (!path) return null;
      const text = await window.__TAURI__.core.invoke('read_character_file', { path });
      return { name: String(path).split(/[\\/]/).pop(), character: JSON.parse(text) };
    })();
  }

  return new Promise((resolve, reject) => {
    const input = el('input', {
      type: 'file',
      accept: 'application/json,.json',
      style: 'display:none',
      onChange: async (e) => {
        const file = e.target.files[0];
        input.remove();
        if (!file) {
          resolve(null);
          return;
        }
        try {
          resolve({ name: file.name, character: JSON.parse(await file.text()) });
        } catch (err) {
          reject(err);
        }
      },
    });
    document.body.appendChild(input);
    input.click();
  });
}

// Everything that arrives from outside - a saved file, an import, a
// character exported from the web app - goes over a fresh initial state
// first, so a build made before a Gift or Resource existed comes back with
// that entry present and empty rather than missing.
export function adopt(data, loaded) {
  return mergeCharacterState(data, loaded);
}

export { downloadJson };
