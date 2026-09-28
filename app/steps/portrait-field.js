// The character's portrait: a picture the player picks, kept in the
// character file itself (state.portrait) so the Battle Tracker and the
// Owlbear sheet show it with no second file to hand over. Offered on
// Name & Concept, where a character begins, and above the sheet, where it
// lives once it exists - a portrait is something people change later.

import { el } from '../ui.js';
import { portraitOf } from '../state.js';
import { portraitFromFile } from '../media.js';

export default function buildPortraitField(state, { persist = () => {}, rerender = () => {}, compact = false } = {}) {
  const current = portraitOf(state);
  const note = el('span', { class: 'portrait-note' });

  const input = el('input', {
    type: 'file',
    accept: 'image/png,image/jpeg,image/webp,image/gif',
    class: 'portrait-input',
    onChange: async (e) => {
      const file = e.target.files?.[0];
      e.target.value = ''; // picking the same picture again still fires
      if (!file) return;
      try {
        state.portrait = await portraitFromFile(file);
        persist();
        rerender();
      } catch (err) {
        note.textContent = err.message;
      }
    },
  });

  return el('div', { class: `portrait-field${compact ? ' compact' : ''}` }, [
    current
      ? el('img', { class: 'portrait-img', src: current, alt: `Portrait of ${state.name || 'this character'}` })
      : el('div', { class: 'portrait-img portrait-empty', 'aria-hidden': 'true' }, '?'),
    el('div', { class: 'portrait-controls' }, [
      el('label', { class: 'file-link portrait-pick' }, [current ? 'Change portrait' : 'Add a portrait', input]),
      current ? el('button', {
        type: 'button',
        class: 'file-link',
        text: 'Remove',
        onClick: () => {
          state.portrait = null;
          persist();
          rerender();
        },
      }) : null,
      compact ? null : el('span', { class: 'portrait-hint' },
        'Saved in the character file, so the Battle Tracker and the Owlbear sheet show it too. Cropped to a square.'),
      note,
    ]),
  ]);
}
