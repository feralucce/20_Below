import { el } from '../ui.js';

// The three kinds, one per Vital (rules.md#scars). The keys are the ones
// the sheet's page 5 already writes - 'battle' for Health and 'poise' for
// Poise predate the Social name, and saved characters carry them.
const KINDS = [
  { kind: 'battle', label: 'Physical', vital: 'Health', example: 'Bad Knee, Shaky Hand, Night Blind...' },
  { kind: 'poise', label: 'Social', vital: 'Poise', example: 'The Nickname, Burned Bridge, Stammer...' },
  { kind: 'mental', label: 'Mental', vital: 'Sanity', example: 'The Trigger, Night Terrors, Phobia...' },
];

function nextScarId(state) {
  return state.scars.reduce((max, s) => Math.max(max, s.id), 0) + 1;
}

// A scar saved before the Social split only recorded physical or not, so
// the flag stands in for the kind when there isn't one - the same reading
// the sheet uses (sheet-model.js, scarsOfKind).
function kindOf(scar) {
  return scar.kind ?? (scar.physical ? 'battle' : 'mental');
}

function scarList(state, k, refresh) {
  const list = el('div', { class: 'pick-list' });
  const entries = state.scars.filter((s) => kindOf(s) === k.kind);
  if (entries.length === 0) {
    list.append(el('p', { class: 'detail' }, 'None yet.'));
  }
  entries.forEach((scar) => {
    const card = el('div', { class: 'pick-card' });
    if (!refresh) {
      card.append(el('strong', {}, scar.title || '(untitled)'), scar.description ? el('p', {}, scar.description) : null);
      list.appendChild(card);
      return;
    }
    card.append(
      el('div', { style: 'display:flex;justify-content:space-between;gap:0.5rem;' }, [
        el('input', {
          type: 'text',
          value: scar.title,
          placeholder: `Name (${k.example})`,
          style: 'flex:1;',
          onInput: (e) => {
            scar.title = e.target.value;
          },
        }),
        el('button', {
          type: 'button',
          text: 'Remove',
          onClick: () => {
            state.scars = state.scars.filter((s) => s.id !== scar.id);
            refresh();
          },
        }),
      ]),
      el('textarea', {
        rows: 2,
        placeholder: 'What it does, and the moment it came from',
        text: scar.description,
        onInput: (e) => {
          scar.description = e.target.value;
        },
      }),
    );
    list.appendChild(card);
  });
  return list;
}

export default function buildScarsTab(state, data, refresh) {
  const wrap = el('div', {});
  wrap.append(
    el('h2', {}, 'Scars'),
    el(
      'p',
      { class: 'detail' },
      "At 0, a Vital leaves a mark that is only for show - a scar, a nervous habit, a tic. Below 0 it leaves a real scar: one narrow, lasting effect, Physical from Health, Social from Poise, Mental from Sanity. One per crossing, picked by the GM or agreed with them, and permanent until healed. A Social scar can't be healed - a reputation has to be rebuilt. See rules.md#scars for the lists and how each one heals.",
    ),
  );
  KINDS.forEach((k) => {
    wrap.append(el('h3', {}, `${k.label} (${k.vital})`), scarList(state, k, refresh));
    if (refresh) {
      wrap.append(
        el('button', {
          type: 'button',
          text: `Add ${k.label} Scar`,
          onClick: () => {
            state.scars.push({ id: nextScarId(state), kind: k.kind, physical: k.kind === 'battle', title: '', description: '' });
            refresh();
          },
        }),
      );
    }
  });
  return [wrap];
}
