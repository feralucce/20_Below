// Wealth-at-Creation gear shopping (see resources.md#wealth-at-character-creation),
// browsing the full Weapons & Equipment catalog (weapons.md). Split out of
// 08-resources.js since it's a self-contained interactive block, same
// pattern as roller-panel.js being split out of 14-roller.js.

import { el, keyedDetails } from '../ui.js';
import {
  currentCreationWealth,
  creationWealthBase,
  addGearPurchase,
  removeGearPurchase,
  resetGearPurchases,
} from '../state.js';
import { performWealthCheck, freeBand } from '../roller/wealthCheck.js';

function outcomeLabel(outcome) {
  return {
    'critical-success': 'Critical Success',
    success: 'Success',
    failure: 'Failure',
    'catastrophic-failure': 'Catastrophic Failure',
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
    const cw = currentCreationWealth(state);
    summaryEl.append(
      el('strong', {}, `Current creation-Wealth: ${cw}`),
      ` (base ${creationWealthBase(state)}${state.creationWealthLoss ? `, -${state.creationWealthLoss} from failed checks` : ''})`,
    );
    // resources.md: "once no remaining item is affordable (via a viable
    // roll), gear shopping is over for this character creation". Said out
    // loud - every Buy button disabling itself with no explanation reads as
    // a broken page rather than the end of the shopping pass.
    if (!affordableCount()) {
      summaryEl.append(
        el('p', { class: 'hint' }, [
          el('strong', {}, 'Gear shopping is over for this character. '),
          'Nothing left in the catalog is affordable on a viable roll. Remove a purchase above to '
          + 'get creation-Wealth back, or take an Everyman Gear Package instead - that one is free '
          + 'and needs no roll. This pool is creation bookkeeping only; it never touches the Wealth '
          + 'Resource Level the character actually plays with.',
        ]),
      );
    }
  }

  // How many catalog items are still buyable at the current creation-Wealth.
  function affordableCount() {
    const cw = currentCreationWealth(state);
    return data.equipment.reduce(
      (n, cat) => n + cat.items.filter((i) => i.wealth != null && i.wealth - cw <= cw).length,
      0,
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

  // How many free picks have gone on the "at your Level or one below"
  // band. The wider band beneath it is unlimited and never counted.
  function limitedTaken() {
    const cw = currentCreationWealth(state);
    return state.gearPurchases.filter(
      (g) => g.free && g.wealth >= cw - 1 && g.wealth <= cw,
    ).length;
  }

  function bandFor(item) {
    const cw = currentCreationWealth(state);
    const band = freeBand({
      creationWealth: cw,
      itemWealth: item.wealth,
      blackMarket: item.blackMarket,
    });
    if (band === 'limited' && limitedTaken() >= cw) return 'roll';
    return band;
  }

  // Black market goods need a contact as well as the money. The rules let
  // an ally supply either half, which is a conversation at the table - the
  // app only reports what this character can reach on their own.
  function blocked(item) {
    const cw = currentCreationWealth(state);
    if (item.blackMarket && (state.resources['Black Market Access'] ?? 0) < item.blackMarket) {
      return `Needs Black Market Access ${item.blackMarket}`;
    }
    if (item.wealth - cw > cw) return 'Out of reach';
    return null;
  }

  function takeFree(category, item) {
    addGearPurchase(state, {
      category, name: item.name, wealth: item.wealth, loss: 0, free: true,
    });
    resultEl.innerHTML = '';
    resultEl.append(el('p', {}, `${item.name} acquired free - no roll needed.`));
    renderSummary();
    renderPurchased();
    renderCategories();
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
      const nameHeader = cat.headers[0];
      const otherHeaders = cat.headers.filter((h) => h !== cat.headers[0] && h !== 'Wealth');
      const table = el('table', {}, [
        el('thead', {}, el('tr', {}, [nameHeader, ...otherHeaders, 'Wealth', ''].map((h) => el('th', {}, h)))),
        el(
          'tbody',
          {},
          cat.items.map((item) => {
            const buyable = item.wealth != null;
            const gap = item.wealth - cw;
            const band = buyable ? bandFor(item) : 'roll';
            const stop = buyable ? blocked(item) : 'not purchasable';
            const affordable = buyable && !stop;
            const label = !buyable
              ? '-'
              : stop
                || (band === 'unlimited'
                  ? 'Take (free)'
                  : band === 'limited'
                    ? `Take (free, ${Math.max(0, cw - limitedTaken())} left)`
                    : `Buy (Wealth Check, risks ${Math.max(1, Math.max(0, gap))} on failure)`);
            return el('tr', {}, [
              el('td', {}, item.name ?? ''),
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
                      onClick: () => (band === 'roll'
                        ? attemptPurchase(cat.category, item)
                        : takeFree(cat.category, item)),
                    })
                  : null,
              ),
            ]);
          }),
        ),
      ]);
      const details = keyedDetails(`shop:${cat.category}`, {
        class: 'pick-card',
        open: openCategories.has(cat.category) ? '' : undefined,
      });
      details.addEventListener('toggle', () => {
        if (details.open) openCategories.add(cat.category);
        else openCategories.delete(cat.category);
      });
      // The book opens this block by telling the reader to ask first.
      const needsGM = cat.parent === 'Beyond the Ordinary';
      details.append(
        el('summary', {}, [
          cat.category,
          needsGM ? el('span', { class: 'gm-pill' }, 'Needs GM approval') : null,
        ]),
        el('div', { class: 'detail' }, [
          needsGM
            ? el('p', { class: 'gm-note' },
              'Not assumed to exist in every game. Check with your GM before taking any of it.')
            : null,
          table,
        ]),
      );
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
      'Anything two or more Levels below your creation-Wealth is free and unlimited. Anything at your Level or one below is free up to your creation-Wealth in number. Everything past that takes a Wealth Check, and the further beyond your means you reach the harder it gets. Black market goods are never free and need Black Market Access as well as money. This pool is temporary bookkeeping for character creation only - it never touches your purchased Wealth Resource Level, and once creation ends every purchase uses the normal Pushing a Resource rule instead.',
    ),
    summaryEl,
    categoriesWrap,
    resultEl,
    el('h4', {}, 'Purchased Gear'),
    el('button', {
      type: 'button',
      text: 'Reset All Purchases',
      onClick: () => {
        if (!state.gearPurchases.length && !state.creationWealthLoss) return;
        if (!window.confirm('Remove every purchased item and reset creation-Wealth back to its starting value? This can\'t be undone.')) return;
        resetGearPurchases(state);
        resultEl.innerHTML = '';
        renderSummary();
        renderPurchased();
        renderCategories();
      },
    }),
    purchasedList,
  );
  return wrap;
}
