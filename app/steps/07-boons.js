import { el, renderMarkdown } from '../ui.js';
import { boonsPoolRemaining } from '../state.js';

export default {
  id: 'boons',
  title: '8. Boons',
  render(container, { state, data, rerenderPools }) {
    container.append(
      el('h2', {}, '8. Boons'),
      el('p', {}, `Spend a ${data.boonsPoolTotal}-point pool. Remaining: ${boonsPoolRemaining(state, data)}.`),
    );

    const selectedEl = el('div', { class: 'pick-list' });
    const listEl = el('div', { class: 'pick-list' });

    function renderSelected() {
      selectedEl.innerHTML = '';
      if (state.boons.length === 0) {
        selectedEl.appendChild(el('p', { class: 'detail' }, 'No Boons selected yet.'));
        return;
      }
      state.boons.forEach((b, i) => {
        selectedEl.appendChild(
          el('div', { class: 'pick-card', style: 'display:flex;justify-content:space-between;align-items:center;' }, [
            el('span', {}, `${b.name} (${b.tier ?? ''} ${b.points} pts)`),
            el('button', {
              type: 'button',
              text: 'Remove',
              onClick: () => {
                state.boons.splice(i, 1);
                renderSelected();
                renderList();
                rerenderPools();
              },
            }),
          ]),
        );
      });
    }

    function renderList() {
      listEl.innerHTML = '';
      data.boons.forEach((boon) => {
        const alreadyTaken = state.boons.some((b) => b.name === boon.name);
        const disable = alreadyTaken && !boon.repeatable;
        const card = el('details', { class: 'pick-card' });
        card.append(
          el('summary', {}, [
            el('span', {}, boon.name + (disable ? ' (taken)' : '')),
          ]),
          el('div', { class: 'detail', html: renderMarkdown(boon.effect) }),
        );
        const btnRow = el('div', { style: 'display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.5rem;' });
        boon.costs.forEach((cost) => {
          btnRow.appendChild(
            el('button', {
              type: 'button',
              text: `Add (${cost.tier ?? ''} ${cost.points} pts)`,
              disabled: disable ? '' : undefined,
              onClick: () => {
                state.boons.push({ name: boon.name, points: cost.points, tier: cost.tier });
                renderSelected();
                renderList();
                rerenderPools();
              },
            }),
          );
        });
        card.appendChild(btnRow);
        listEl.appendChild(card);
      });
    }

    container.append(
      el('h3', {}, 'Selected'),
      selectedEl,
      el('h3', {}, 'Available Boons'),
      listEl,
    );
    renderSelected();
    renderList();
  },
};
