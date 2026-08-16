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

    data.resources.forEach((r) => {
      const card = el('details', { class: 'pick-card' });
      const levelText = state.resources[r.name] > 0
        ? renderMarkdown(r.levels[state.resources[r.name]] ?? '')
        : '';
      card.append(
        el('summary', {}, `${r.name} - ${r.scales}`),
        el('div', { class: 'detail', html: levelText }),
      );
      container.appendChild(card);
      container.appendChild(
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
      );
    });
  },
};
