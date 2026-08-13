import { el, counterRow } from '../ui.js';
import { subStatPoolRemaining } from '../state.js';

export default {
  id: 'substats',
  title: '5. Sub-Stat Division',
  render(container, { state, data, rerenderStep, rerenderPools }) {
    container.append(
      el('h2', {}, '5. Sub-Stat Division'),
      el(
        'p',
        {},
        'Each Attribute generates a pool of points equal to its own rating, split between its two sub-stats however you like.',
      ),
    );

    data.attributes.forEach((a) => {
      const [subA, subB] = a.splitsInto;
      const remaining = subStatPoolRemaining(state, data, a.name);
      container.append(
        el('h3', {}, `${a.name} (${state.attributes[a.name]} points, ${remaining} unspent)`),
      );
      [subA, subB].forEach((subName) => {
        const subInfo = data.subStats.find((s) => s.name === subName);
        container.append(
          counterRow({
            name: subName,
            get: () => state.subStats[subName],
            set: (v) => {
              state.subStats[subName] = v;
            },
            min: 0,
            max: () => state.subStats[subName] + subStatPoolRemaining(state, data, a.name),
            onChange: () => {
              rerenderStep();
              rerenderPools();
            },
          }),
          el('p', { class: 'detail', style: 'color:var(--text-dim);font-size:0.85rem;margin:0 0 0.5rem;' }, subInfo?.description ?? ''),
        );
      });
    });
  },
};
