// Wealth-at-Creation gear shopping (see resources.md#wealth-at-character-creation),
// browsing the full Weapons & Equipment catalog (weapons.md). Split out of
// 08-resources.js since it's a self-contained interactive block, same
// pattern as roller-panel.js being split out of 14-roller.js.

import { el } from '../ui.js';
import {
  currentCreationWealth,
  creationWealthBase,
  addGearPurchase,
  removeGearPurchase,
} from '../state.js';
import { performWealthCheck } from '../roller/wealthCheck.js';

function outcomeLabel(outcome) {
  return {
    'critical-success': 'Critical Success',
    success: 'Success',
    failure: 'Failure',
    'critical-failure': 'Critical Failure',
  }[outcome];
}

function outcomeClass(outcome) {
  return outcome === 'critical-success' || outcome === 'success' ? 'status-ok' : 'status-bad';
}

export default function buildGearShop(state, data) {
  const wrap = el('div', { class: 'gear-shop' });
  const summaryEl = el('p', {});
  const resultEl = el('div', { class: 'roller-result' });
  const purchasedList = el('ul', {});
  const openCategories = new Set();

  function renderSummary() {
    summaryEl.innerHTML = '';
    summaryEl.append(
      el('strong', {}, `Current creation-Wealth: ${currentCreationWealth(state)}`),
      ` (base ${creationWealthBase(state)}${state.creationWealthLoss ? `, -${state.creationWealthLoss} from failed checks` : ''})`,
    );
  }

  function renderPurchased() {
    purchasedList.innerHTML = '';
    if (!state.gearPurchases.length) {
      purchasedList.appendChild(el('li', { class: 'detail' }, 'Nothing bought yet.'));
      return;
    }
    state.gearPurchases.forEach((p) => {
      purchasedList.appendChild(
        el('li', {}, [
          `${p.name} (${p.category}, Wealth ${p.wealth})${p.loss ? ` - cost ${p.loss} creation-Wealth` : ' - free'} `,
          el('button', {
            type: 'button',
            text: 'Remove',
            onClick: () => {
              removeGearPurchase(state, p.id);
              renderSummary();
              renderPurchased();
              renderCategories();
            },
          }),
        ]),
      );
    });
  }

  function attemptPurchase(category, item) {
    const cw = currentCreationWealth(state);
    const gap = item.wealth - cw;
    const result = performWealthCheck({ creationWealth: cw, gap });
    addGearPurchase(state, { category, name: item.name, wealth: item.wealth, loss: result.loss });
    resultEl.innerHTML = '';
    resultEl.append(
      el('p', {}, `Rolled ${result.roll.dice.join(', ')} → ${result.roll.sum} vs target ${result.target}`),
      el('p', { class: outcomeClass(result.outcome) }, [el('strong', {}, outcomeLabel(result.outcome))]),
      el(
        'p',
        {},
        result.loss
          ? `${item.name} acquired - creation-Wealth drops to ${currentCreationWealth(state)}.`
          : `${item.name} acquired free and clear.`,
      ),
    );
    renderSummary();
    renderPurchased();
    renderCategories();
  }

  const categoriesWrap = el('div', {});

  function renderCategories() {
    categoriesWrap.innerHTML = '';
    const cw = currentCreationWealth(state);
    data.equipment.forEach((cat) => {
      const otherHeaders = cat.headers.filter((h) => h !== cat.headers[0] && h !== 'Wealth');
      const table = el('table', {}, [
        el('thead', {}, el('tr', {}, [...otherHeaders, 'Wealth', ''].map((h) => el('th', {}, h)))),
        el(
          'tbody',
          {},
          cat.items.map((item) => {
            const buyable = item.wealth != null;
            const gap = item.wealth - cw;
            const affordable = buyable && gap <= cw;
            const label = !buyable
              ? '-'
              : `Buy (Wealth Check, risks ${Math.max(1, gap)} on failure)`;
            return el('tr', {}, [
              ...otherHeaders.map((h) => el('td', {}, item[h] ?? '')),
              el('td', {}, buyable ? String(item.wealth) : '-'),
              el(
                'td',
                {},
                buyable
                  ? el('button', {
                      type: 'button',
                      text: label,
                      disabled: affordable ? undefined : '',
                      onClick: () => attemptPurchase(cat.category, item),
                    })
                  : null,
              ),
            ]);
          }),
        ),
      ]);
      const details = el('details', {
        class: 'pick-card',
        open: openCategories.has(cat.category) ? '' : undefined,
      });
      details.addEventListener('toggle', () => {
        if (details.open) openCategories.add(cat.category);
        else openCategories.delete(cat.category);
      });
      details.append(el('summary', {}, cat.category), el('div', { class: 'detail' }, table));
      categoriesWrap.appendChild(details);
    });
  }

  renderSummary();
  renderPurchased();
  renderCategories();

  wrap.append(
    el('h3', {}, 'Buy Gear'),
    el(
      'p',
      { class: 'detail' },
      'Every item needs a Wealth Check - there\'s no more automatic free purchase, even for something at or under your current creation-Wealth. A gap bigger than your current creation-Wealth means it can\'t be afforded at all. This pool is temporary bookkeeping for character creation only - it never touches your purchased Wealth Resource Level, and once creation ends every purchase uses the normal Pushing a Resource rule instead.',
    ),
    summaryEl,
    categoriesWrap,
    resultEl,
    el('h4', {}, 'Purchased Gear'),
    purchasedList,
  );
  return wrap;
}
