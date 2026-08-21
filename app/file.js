import { mergeCharacterState } from './state.js';
import { el } from './ui.js';
import { loadRulesData } from './rules-data.js';
import { isDesktopApp, saveCharacterToFile, listSavedCharacters, loadCharacterFromFile } from './desktop-storage.js';

const STORAGE_KEY = '20below-character-draft';

const status = document.getElementById('file-status');
const controls = document.getElementById('file-controls-main');

function currentDraft() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

function showStatus(message, isError = false) {
  status.textContent = message;
  status.className = isError ? 'file-status error' : 'file-status';
}

// Merges a loaded/imported character over a fresh initial state (see
// mergeCharacterState in state.js - same helper loadSavedState in main.js
// uses), writes it as the new working draft, then hands off to the
// character creator - this page has no rendering of its own for step data,
// just file operations. A catalog entry *renamed* since the character was
// saved (a Gift/Skill/Resource that no longer exists under that name)
// isn't caught here - that's a different, narrower risk than a new entry
// being *added*, which mergeCharacterState does handle.
function applyCharacterAndReturn(data, loaded) {
  const merged = mergeCharacterState(data, loaded);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  window.location.href = 'index.html';
}

async function main() {
  let data;
  try {
    data = await loadRulesData();
  } catch (err) {
    console.error(err);
    showStatus('Failed to load rules data - try again from the Character Creator.', true);
    return;
  }

  // Plain HTML file input works fine for the browser build, but a WebView2
  // <input type=file> inside the packaged Tauri app never opens a native
  // dialog at all (confirmed live - a genuine OS-level click on the button
  // produced no dialog anywhere on screen, not a permissions/CSP block,
  // just not wired up the same way a browser tab is) - so the desktop build
  // uses Tauri's own dialog plugin instead, reading the chosen path through
  // the custom read_character_file command (see lib.rs) rather than the fs
  // plugin's own readTextFile - that JS API has no fs:allow-* permission
  // granted since the 2026-08-20 capabilities cleanup, so every real Import
  // was silently failing with a permission error shown as "not a valid
  // character file" until this was caught and fixed.
  const importInput = el('input', {
    type: 'file',
    accept: 'application/json,.json',
    style: 'display:none',
    onChange: async (e) => {
      const file = e.target.files[0];
      e.target.value = '';
      if (!file) return;
      try {
        applyCharacterAndReturn(data, JSON.parse(await file.text()));
      } catch (err) {
        console.error(err);
        showStatus(`Failed to import "${file.name}" - not a valid character file.`, true);
      }
    },
  });
  const importBtn = el('button', {
    type: 'button',
    class: 'import-btn',
    text: 'Import character…',
    onClick: async () => {
      if (!isDesktopApp) {
        importInput.click();
        return;
      }
      try {
        const path = await window.__TAURI__.dialog.open({
          multiple: false,
          filters: [{ name: 'Character', extensions: ['json'] }],
        });
        if (!path) return;
        applyCharacterAndReturn(data, JSON.parse(await window.__TAURI__.core.invoke('read_character_file', { path })));
      } catch (err) {
        console.error(err);
        showStatus('Failed to import - not a valid character file.', true);
      }
    },
  });

  controls.append(importInput, importBtn);

  if (!isDesktopApp) {
    const note = el(
      'p',
      { class: 'file-note' },
      'Saving and loading named characters is a desktop-app feature. In the browser, your in-progress character is kept automatically - use Import to bring in a character exported elsewhere.',
    );
    controls.append(note);
    return;
  }

  const select = el('select', { class: 'character-select' }, [
    el('option', { value: '' }, 'Load a saved character…'),
  ]);
  try {
    (await listSavedCharacters()).forEach((name) => {
      select.appendChild(el('option', { value: name }, name));
    });
  } catch (err) {
    console.error('Failed to list saved characters', err);
    showStatus('Failed to list saved characters.', true);
  }
  select.addEventListener('change', async () => {
    const name = select.value;
    if (!name) return;
    try {
      applyCharacterAndReturn(data, await loadCharacterFromFile(name));
    } catch (err) {
      console.error(err);
      showStatus(`Failed to load "${name}".`, true);
      select.value = '';
    }
  });

  const saveBtn = el('button', {
    type: 'button',
    class: 'save-btn',
    text: 'Save current character',
    onClick: async () => {
      const draft = currentDraft();
      if (!draft) {
        showStatus('No in-progress character to save yet.', true);
        return;
      }
      try {
        const filename = await saveCharacterToFile(draft);
        showStatus(`Saved as "${filename}".`);
      } catch (err) {
        console.error(err);
        showStatus('Save failed.', true);
      }
    },
  });

  controls.append(saveBtn, select);
}

main();
