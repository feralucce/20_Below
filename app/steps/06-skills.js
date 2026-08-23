import { el, counterRow, renderSelectedAvailable } from '../ui.js';
import { skillsPoolRemaining, skillTierName } from '../state.js';

function inline(md) {
  return window.marked ? window.marked.parseInline(md) : md;
}

export default {
  id: 'skills',
  title: 'Skills',
  render(container, { state, data, rerenderStep, rerenderPools }) {
    const remaining = skillsPoolRemaining(state, data);
    const jackOfAllTrades = state.boons.find((b) => b.name === 'Jack of all Trades');
    const poolBlocked = jackOfAllTrades && jackOfAllTrades.points === 5;
    container.append(
      el('h2', {}, 'Skills'),
      el(
        'p',
        {},
        poolBlocked
          ? `Jack of all Trades (Tier 1) already gives you Trained in every Skill and caps every Skill at Trained - the Skills Pool has nothing left to buy, so it's locked at 0 rather than freed up for anything else. Remaining: ${remaining}.`
          : `Everyman Skills (${data.everymanSkills.join(', ')}) start Trained for free. Beyond that, a ${data.skillsPoolTotal}-point pool, 1 point per tier climbed. Remaining: ${remaining}.`,
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
            picker.render();
          },
        }),
      ]),
    );

    let filterValue = '';
    const baselineOf = (s) => (data.everymanSkills.includes(s.name) ? 2 : 0);
    const isSelected = (s) => state.skills[s.name] > baselineOf(s);

    function renderCard(s) {
      const baseline = baselineOf(s);
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
            picker.render();
          },
        }),
      );
      if (s.defaultElement) {
        row.append(
          el(
            'p',
            { class: 'detail', style: 'color:var(--text-dim);font-size:0.85rem;margin:0.15rem 0 0.5rem;' },
            s.defaultElement === 'Context-dependent'
              ? 'Default Element: set for this weapon when defined.'
              : `Default Element: ${s.defaultElement} - challenge it with a Descriptor to use a different Attribute.`,
          ),
        );
      }
      return row;
    }

    const picker = renderSelectedAvailable(container, {
      label: 'Skills',
      // Selected skills always show regardless of the search box; unselected
      // ones are filtered so the search box still narrows what you're
      // browsing to pick next.
      getItems: () => data.skillCatalog.filter((s) => isSelected(s) || s.name.toLowerCase().includes(filterValue)),
      isSelected,
      renderCard,
    });
  },
};
