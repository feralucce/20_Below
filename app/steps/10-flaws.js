import { el, counterRow, renderMarkdown } from '../ui.js';
import { flawsPointsGranted } from '../state.js';

function getOrCreateFlawState(state, name) {
  let f = state.flaws.find((x) => x.name === name);
  if (!f) {
    f = { name, level: 0 };
    state.flaws.push(f);
  }
  return f;
}

export default {
  id: 'flaws',
  title: '11. Flaws',
  render(container, { state, data, rerenderStep, rerenderPools }) {
    container.append(
      el('h2', {}, '11. Flaws'),
      el(
        'p',
        {},
        `Optional. Each Flaw's points equal the Level taken, feeding Discretionary Points (step 12). Total granted so far: ${flawsPointsGranted(state)}.`,
      ),
    );

    data.flaws.forEach((flaw) => {
      const fState = getOrCreateFlawState(state, flaw.name);
      const card = el('details', { class: 'pick-card' });
      const levelRows = flaw.levels
        ? `<table><tr><th>Level</th><th>Effect</th></tr>${flaw.levels
            .map((l) => `<tr><td>${l.level}</td><td>${window.marked ? window.marked.parseInline(l.effect) : l.effect}</td></tr>`)
            .join('')}</table>`
        : renderMarkdown(flaw.blurb);
      card.append(
        el('summary', {}, `${flaw.name}${fState.level ? ` - Level ${fState.level}` : ''}`),
        el('div', { class: 'detail', html: levelRows }),
      );
      container.appendChild(card);
      container.appendChild(
        counterRow({
          name: flaw.name,
          get: () => fState.level,
          set: (v) => {
            fState.level = v;
          },
          min: 0,
          max: 5,
          onChange: () => {
            rerenderStep();
            rerenderPools();
          },
        }),
      );
    });
  },
};
