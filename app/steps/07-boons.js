import { el, renderMarkdown } from '../ui.js';
import { boonsPoolRemaining, addBoon, removeBoon } from '../state.js';

// Shared by the Boons step (spend the Boons pool) and the Discretionary Points step (spend Discretionary
// points on a Boon at the converted rate) - `source` tags each purchase so
// removing it later refunds the right currency, `getRemaining`/`toCurrency`
// let the caller price it in whichever pool applies.
export function renderBoonPicker(container, ctx, allBoons, { source, getRemaining, toCurrency, currencyLabel }) {
  const { state, rerenderStep, rerenderPools } = ctx;
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
          el('span', {}, `${b.name} (${b.tier ?? ''} ${b.points} pts${b.source === 'discretionary' ? ', via Discretionary' : ''})`),
          el('button', {
            type: 'button',
            text: 'Remove',
            onClick: () => {
              removeBoon(state, i);
              rerenderPools();
              rerenderStep();
            },
          }),
        ]),
      );
    });
  }

  function renderList() {
    listEl.innerHTML = '';
    const remaining = getRemaining();
    allBoons.forEach((boon) => {
      const alreadyTaken = state.boons.some((b) => b.name === boon.name);
      const disable = alreadyTaken && !boon.repeatable;
      const card = el('details', { class: 'pick-card' });
      card.append(
        el('summary', {}, [el('span', {}, boon.name + (disable ? ' (taken)' : ''))]),
        el('div', { class: 'detail', html: renderMarkdown(boon.effect) }),
      );
      const btnRow = el('div', { style: 'display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.5rem;' });
      boon.costs.forEach((cost) => {
        const currencyCost = toCurrency(cost.points);
        btnRow.appendChild(
          el('button', {
            type: 'button',
            text: `Add (${cost.tier ?? ''} ${currencyCost} ${currencyLabel})`,
            disabled: disable || currencyCost > remaining ? '' : undefined,
            onClick: () => {
              addBoon(state, boon.name, cost, source);
              rerenderPools();
              rerenderStep();
            },
          }),
        );
      });
      card.appendChild(btnRow);
      listEl.appendChild(card);
    });
  }

  container.append(el('h3', {}, 'Selected Boons'), selectedEl, el('h3', {}, 'Available Boons'), listEl);
  renderSelected();
  renderList();
}

export default {
  id: 'boons',
  title: 'Boons',
  render(container, ctx) {
    const { state, data } = ctx;
    container.append(
      el('h2', {}, 'Boons'),
      el('p', {}, `Spend a ${data.boonsPoolTotal}-point pool. Remaining: ${boonsPoolRemaining(state, data)}. Anything left unspent converts 1:1 into Discretionary points (the Discretionary Points step).`),
    );
    renderBoonPicker(container, ctx, data.boons, {
      source: 'pool',
      getRemaining: () => boonsPoolRemaining(state, data),
      toCurrency: (points) => points,
      currencyLabel: 'pts',
    });
  },
};
