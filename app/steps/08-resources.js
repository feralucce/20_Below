import { el, counterRow, renderMarkdown, renderSelectedAvailable } from '../ui.js';
import { resourcesPoolRemaining, canBuyWealthAtCreation } from '../state.js';

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
        // Destitute holds Wealth at 0 for the whole of creation - the Flaw
        // has to be bought off before any Wealth can be bought.
        max: () =>
          r.name === 'Wealth' && !canBuyWealthAtCreation(state)
            ? 0
            : Math.min(5, state.resources[r.name] + Math.floor(remaining / data.resourceLevelCost)),
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

    // Name + counter, click the name to twirl the level table out - same
    // in both the Selected and Available lists.
    function renderCard(r) {
      const card = el('div', { class: 'pick-card' });
      card.append(counterRow({ ...counterCfg(r), key: `resource:${r.name}`, detail: levelTableFor(r) }));
      if (r.name === 'Wealth' && !canBuyWealthAtCreation(state)) {
        card.append(
          el('p', { class: 'hint' },
            'Destitute holds Wealth at 0 for character creation. Drop the Destitute Flaw first if '
            + 'you want to buy Wealth - XP can raise it normally once play begins.'),
        );
      }
      return card;
    }

    renderSelectedAvailable(container, {
      label: 'Resources',
      getItems: () => data.resources,
      isSelected: (r) => state.resources[r.name] > 0,
      renderCard,
    });
  },
};
