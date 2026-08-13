import { el, counterRow } from '../ui.js';
import { skillsPoolRemaining } from '../state.js';

const TIER_NAMES = ['Untrained', 'Novice', 'Trained', 'Adept', 'Expert', 'Master'];

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
              hint: TIER_NAMES[state.skills[s.name]],
              get: () => state.skills[s.name],
              set: (v) => {
                state.skills[s.name] = v;
              },
              min: baseline,
              max: () => Math.min(5, state.skills[s.name] + rem),
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
