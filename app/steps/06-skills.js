import { el, counterRow } from '../ui.js';
import { skillsPoolRemaining, skillTierName } from '../state.js';

function inline(md) {
  return window.marked ? window.marked.parseInline(md) : md;
}

export default {
  id: 'skills',
  title: '7. Skills',
  render(container, { state, data, rerenderStep, rerenderPools }) {
    const remaining = skillsPoolRemaining(state, data);
    container.append(
      el('h2', {}, '7. Skills'),
      el(
        'p',
        {},
        `Everyman Skills (${data.everymanSkills.join(', ')}) start Trained for free. Beyond that, a ${data.skillsPoolTotal}-point pool, 1 point per tier climbed. Remaining: ${remaining}.`,
      ),
    );

    const tierTable = el('table', {}, [
      el('tr', {}, [el('th', {}, 'Tier'), el('th', {}, 'Roll')]),
      ...data.skillTiers.map((t) => el('tr', {}, [el('td', {}, t.name), el('td', { html: inline(t.roll) })])),
    ]);
    container.append(el('div', { class: 'detail', style: 'margin-bottom:1rem;' }, tierTable));

    container.append(
      el('div', { class: 'field' }, [
        el('input', {
          type: 'text',
          placeholder: 'Filter skills...',
          onInput: (e) => {
            filterValue = e.target.value.toLowerCase();
            renderList();
          },
        }),
      ]),
    );

    const listEl = el('div', { class: 'pick-list' });
    container.appendChild(listEl);
    let filterValue = '';

    function renderList() {
      listEl.innerHTML = '';
      data.skillCatalog
        .filter((s) => s.name.toLowerCase().includes(filterValue))
        .forEach((s) => {
          const baseline = data.everymanSkills.includes(s.name) ? 2 : 0;
          const rem = skillsPoolRemaining(state, data);
          const row = el('div', { class: 'pick-card' });
          row.append(
            counterRow({
              name: `${s.name}${baseline ? ' (Everyman)' : ''}`,
              get: () => state.skills[s.name],
              set: (v) => {
                state.skills[s.name] = v;
              },
              min: baseline,
              max: () => Math.min(5, state.skills[s.name] + rem),
              format: (v) => skillTierName(data, v),
              onChange: () => {
                rerenderPools();
                renderList();
              },
            }),
          );
          listEl.appendChild(row);
        });
    }
    renderList();
  },
};
