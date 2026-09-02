/* Open and save the markdown source on the user's own machine.
 *
 * Two backends behind one interface. The File System Access API is
 * used where it exists (Chromium), because it can save back to the
 * same file the user opened. Everywhere else falls back to a file
 * input for opening and a download for saving.
 *
 * A third backend (Tauri fs/dialog) slots in here if this is ever
 * bundled into the desktop app - nothing outside this file needs
 * to know which one is in use.
 */

const CAN_FS = typeof window !== 'undefined' && 'showSaveFilePicker' in window;

const TYPES = [{
  description: 'Markdown',
  accept: { 'text/markdown': ['.md', '.markdown', '.txt'] },
}];

let handle = null;      // FileSystemFileHandle, when we have one
let name = 'untitled.md';

export function currentName() {
  return name;
}

export function supportsSaveInPlace() {
  return CAN_FS;
}

/** Returns the opened text, or null if the user cancelled. */
export async function open(fallbackInput) {
  if (CAN_FS) {
    try {
      const [h] = await window.showOpenFilePicker({ types: TYPES, multiple: false });
      handle = h;
      name = h.name;
      return await (await h.getFile()).text();
    } catch (err) {
      if (err && err.name === 'AbortError') return null;
      throw err;
    }
  }
  return new Promise((resolve) => {
    fallbackInput.onchange = async () => {
      const file = fallbackInput.files[0];
      fallbackInput.value = '';
      if (!file) return resolve(null);
      name = file.name;
      handle = null;
      resolve(await file.text());
    };
    fallbackInput.click();
  });
}

/** Save. `forceNew` forces the picker even when a handle exists. */
export async function save(text, forceNew = false) {
  if (CAN_FS) {
    try {
      if (!handle || forceNew) {
        handle = await window.showSaveFilePicker({ suggestedName: name, types: TYPES });
        name = handle.name;
      }
      const writable = await handle.createWritable();
      await writable.write(text);
      await writable.close();
      return name;
    } catch (err) {
      if (err && err.name === 'AbortError') return null;
      // fall through to the download path on anything else
    }
  }
  const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
  return name;
}
