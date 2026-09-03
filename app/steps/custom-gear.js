// Gear the catalog doesn't have, in two kinds.
//
// Odds and ends are free and unlimited - a cardboard box, a dead man's
// watch, a lucky coin. They carry no Wealth Level and no mechanical effect,
// so nothing needs pricing and nothing needs checking; they exist so a
// character sheet can hold the things a player actually cares about.
//
// A custom item is the other case: a real piece of gear weapons.md happens
// not to list. It needs a Wealth Level, and once it has one it buys through
// exactly the same Wealth Check as anything in the catalog - same roll, same
// risk, same creation-Wealth loss on a failure. Whoever sets that Level is
// the GM's business, not the app's.

import { el } from '../ui.js';
import {
  currentCreationWealth,
  addGearPurchase,
  addFlavorItem,
  removeFlavorItem,
} from '../state.js';
import { performWealthCheck } from '../roller/wealthCheck.js';

const CUSTOM_CATEGORY = 'Custom';

export default function buildCustomGear(state, data, onPurchase = () => {}) {
  const wrap = el('div', { class: 'custom-gear' });
  const flavorList = el('ul', {});
  const resultEl = el('div', { class: 'roller-result' });

  // ---- Odds and ends (free) ----

  function renderFlavor() {
    flavorList.innerHTML = '';
    if (!state.flavorItems.length) {
      flavorList.appendChild(el('li', { class: 'detail' }, 'Nothing yet.'));
      return;
    }
    state.flavorItems.forEach((text, i) => {
      flavorList.appendChild(
        el('li', {}, [
          `${text} `,
          el('button', {
            type: 'button',
            text: 'Remove',
            onClick: () => {
              removeFlavorItem(state, i);
              renderFlavor();
            },
          }),
        ]),
      );
    });
  }

  const flavorInput = el('input', {
    type: 'text',
    placeholder: 'a cardboard box',
    maxlength: '120',
  });

  function commitFlavor() {
    const text = flavorInput.value.trim();
    if (!text) return;
    addFlavorItem(state, text);
    flavorInput.value = '';
    renderFlavor();
  }

  flavorInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitFlavor();
    }
  });

  // ---- A custom item with a real Wealth Level ----

  const customInput = el('input', {
    type: 'text',
    placeholder: 'Harpoon gun',
    maxlength: '120',
  });
  const wealthSelect = el('select', {});
  [1, 2, 3, 4, 5].forEach((w) => wealthSelect.appendChild(el('option', { value: String(w) }, `Wealth ${w}`)));

  const buyBtn = el('button', { type: 'button', text: 'Buy (Wealth Check)' });

  function renderBuyState() {
    const cw = currentCreationWealth(state);
    const wealthValue = Number(wealthSelect.value);
    const gap = wealthValue - cw;
    // Same affordability rule the catalog uses: a gap wider than your
    // current creation-Wealth is out of reach at any risk.
    const affordable = gap <= cw;
    buyBtn.disabled = !affordable;
    buyBtn.textContent = affordable
      ? `Buy (Wealth Check, risks ${Math.max(1, gap)} on failure)`
      : `Out of reach at creation-Wealth ${cw}`;
  }

  wealthSelect.addEventListener('change', renderBuyState);

  buyBtn.addEventListener('click', () => {
    const name = customInput.value.trim();
    if (!name) {
      resultEl.innerHTML = '';
      resultEl.appendChild(el('p', { class: 'status-bad' }, 'Give the item a name first.'));
      return;
    }
    const wealthValue = Number(wealthSelect.value);
    const cw = currentCreationWealth(state);
    const result = performWealthCheck({ creationWealth: cw, gap: wealthValue - cw });
    addGearPurchase(state, {
      category: CUSTOM_CATEGORY,
      name,
      wealth: wealthValue,
      loss: result.loss,
    });
    resultEl.innerHTML = '';
    resultEl.append(
      el('p', {}, `Rolled ${result.roll.dice.join(', ')} → ${result.roll.sum} vs target ${result.target}`),
      el(
        'p',
        {},
        result.loss
          ? `${name} acquired - creation-Wealth drops to ${currentCreationWealth(state)}.`
          : `${name} acquired free and clear.`,
      ),
    );
    customInput.value = '';
    renderBuyState();
    onPurchase();
  });

  renderFlavor();
  renderBuyState();

  wrap.append(
    el('h3', {}, 'Odds and Ends'),
    el(
      'p',
      { class: 'detail' },
      "Things you own that the catalog will never list. Free, as many as you like, no Wealth Level and no mechanical effect - a cardboard box, your brother's jacket, a key to a door that no longer exists. If it would do something in play, it belongs below instead.",
    ),
    el('div', { class: 'custom-gear-row' }, [flavorInput, el('button', { type: 'button', text: 'Add', onClick: commitFlavor })]),
    flavorList,
    el('h3', {}, 'Something Not in the Catalog'),
    el(
      'p',
      { class: 'detail' },
      'Real gear that weapons.md happens not to list. Agree a Wealth Level with your GM, then buy it exactly like anything else - same Wealth Check, same risk to your creation-Wealth.',
    ),
    el('div', { class: 'custom-gear-row' }, [customInput, wealthSelect, buyBtn]),
    resultEl,
  );
  return wrap;
}
