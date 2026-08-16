import { el, counterRow, renderMarkdown } from '../ui.js';
import { resourcesPoolRemaining } from '../state.js';

export default {
  id: 'resources',
  title: 'Resources',
  render(container, { state, data, rerenderStep, rerenderPools }) {
    const remaining = resourcesPoolRemaining(state, data);
    container.append(
      el('h2', {}, 'Resources'),
      el(
        'p',
        {},
        `Each level costs a flat ${data.resourceLevelCost} points from a ${data.resourcesPoolTotal}-point pool. Remaining: ${remaining}.`,
      ),
    );

    const listEl = el('div', { class: 'pick-list' });
    container.appendChild(listEl);

    data.resources.forEach((r) => {
      const card = el('div', { class: 'pick-card' });
      const levelTable = el('table', { class: 'menu-table' }, [
        el('tr', {}, [el('th', {}, 'Level'), el('th', {}, r.scales)]),
        ...[1, 2, 3, 4, 5].map((lvl) =>
          el('tr', {}, [
            el('td', {}, String(lvl)),
            el('td', { html: renderMarkdown(r.levels[lvl] ?? '') }),
          ]),
        ),
      ]);
      card.append(
        counterRow({
          name: r.name,
          get: () => state.resources[r.name],
          set: (v) => {
            state.resources[r.name] = v;
          },
          min: 0,
          max: () =>
            Math.min(5, state.resources[r.name] + Math.floor(remaining / data.resourceLevelCost)),
          onChange: () => {
            rerenderStep();
            rerenderPools();
          },
        }),
        el('div', { class: 'detail' }, levelTable),
      );
      listEl.appendChild(card);
    });
  },
};
