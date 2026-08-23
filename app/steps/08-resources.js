import { el, counterRow, renderMarkdown, renderSelectedAvailable } from '../ui.js';
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

    function counterCfg(r) {
      return {
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
      };
    }

    function levelTableFor(r) {
      return el('div', { class: 'detail' }, [
        el('table', { class: 'menu-table' }, [
          el('tr', {}, [el('th', {}, 'Level'), el('th', {}, r.scales)]),
          ...[1, 2, 3, 4, 5].map((lvl) =>
            el('tr', {}, [
              el('td', {}, String(lvl)),
              el('td', { html: renderMarkdown(r.levels[lvl] ?? '') }),
            ]),
          ),
        ]),
      ]);
    }

    // Available: name + counter, click the name to twirl the level table out.
    function renderCard(r) {
      const card = el('div', { class: 'pick-card' });
      card.append(counterRow({ ...counterCfg(r), detail: levelTableFor(r) }));
      return card;
    }

    // Selected: just the name and counter - no description clutter.
    function renderSelectedCard(r) {
      const card = el('div', { class: 'pick-card' });
      card.append(counterRow(counterCfg(r)));
      return card;
    }

    renderSelectedAvailable(container, {
      label: 'Resources',
      getItems: () => data.resources,
      isSelected: (r) => state.resources[r.name] > 0,
      renderCard,
      renderSelectedCard,
    });
  },
};
