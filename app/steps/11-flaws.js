import { el, counterRow, renderMarkdown, renderSelectedAvailable } from '../ui.js';
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
  title: 'Flaws',
  render(container, { state, data, rerenderStep, rerenderPools }) {
    container.append(
      el('h2', {}, 'Flaws'),
      el(
        'p',
        {},
        `Optional. Each Flaw's points equal the Level taken, feeding Discretionary Points (the Discretionary Points step). Total granted so far: ${flawsPointsGranted(state)}.`,
      ),
    );

    function counterCfg(flaw) {
      const fState = getOrCreateFlawState(state, flaw.name);
      return {
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
      };
    }

    function descriptionFor(flaw) {
      const levelRows = flaw.levels
        ? `<table><tr><th>Level</th><th>Effect</th></tr>${flaw.levels
            .map((l) => `<tr><td>${l.level}</td><td>${window.marked ? window.marked.parseInline(l.effect) : l.effect}</td></tr>`)
            .join('')}</table>`
        : renderMarkdown(flaw.blurb);
      return el('div', { class: 'detail', html: levelRows });
    }

    // Name + counter, click the name to twirl the levels/blurb out - same
    // in both the Selected and Available lists.
    function renderCard(flaw) {
      const card = el('div', { class: 'pick-card' });
      card.append(counterRow({ ...counterCfg(flaw), detail: descriptionFor(flaw) }));
      return card;
    }

    renderSelectedAvailable(container, {
      label: 'Flaws',
      getItems: () => data.flaws,
      isSelected: (flaw) => getOrCreateFlawState(state, flaw.name).level > 0,
      renderCard,
    });
  },
};
