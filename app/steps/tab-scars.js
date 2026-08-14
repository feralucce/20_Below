import { el } from '../ui.js';

function nextScarId(state) {
  return state.scars.reduce((max, s) => Math.max(max, s.id), 0) + 1;
}

function scarList(state, physical, refresh) {
  const list = el('div', { class: 'pick-list' });
  const entries = state.scars.filter((s) => s.physical === physical);
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
          placeholder: 'Name (a scar, a limp, a changed voice...)',
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
        placeholder: 'Description',
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
      'Battle Scars are purely cosmetic, no mechanical effect - a scar, a limp, a changed voice, whatever fits the wound (see rules.md#battle-scars). Dropping below 0 Health can instead impose a real Flaw until healed; note that below if it happens.',
    ),
    el('h3', {}, 'Physical'),
    scarList(state, true, refresh),
  );
  if (refresh) {
    wrap.append(
      el('button', {
        type: 'button',
        text: 'Add Physical Scar',
        onClick: () => {
          state.scars.push({ id: nextScarId(state), physical: true, title: '', description: '' });
          refresh();
        },
      }),
    );
  }
  wrap.append(el('h3', {}, 'Mental'), scarList(state, false, refresh));
  if (refresh) {
    wrap.append(
      el('button', {
        type: 'button',
        text: 'Add Mental Scar',
        onClick: () => {
          state.scars.push({ id: nextScarId(state), physical: false, title: '', description: '' });
          refresh();
        },
      }),
    );
  }
  return [wrap];
}
