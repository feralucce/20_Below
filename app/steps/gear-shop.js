// Wealth-at-Creation gear shopping (see resources.md#wealth-at-character-creation),
// browsing the full Weapons & Equipment catalog (weapons.md). Split out of
// 08-resources.js since it's a self-contained interactive block, same
// pattern as roller-panel.js being split out of 14-roller.js.

import { el, keyedDetails, purchasedPill } from '../ui.js';
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
    if (cw <= 0) {
      summaryEl.append(
        el('p', { class: 'hint' }, [
          el('strong', {}, 'Creation-Wealth is spent. '),
          'No more Wealth Checks and nothing further above your Level - but your free items are '
          + 'measured against the Wealth you bought, not what is left of this pool, so anything '
          + 'two or more Levels below it is still yours for the taking. Remove a purchase above to '
          + 'get creation-Wealth back. This pool is creation bookkeeping only; it never touches '
          + 'the Wealth Resource Level the character actually plays with.',
        ]),
      );
    }
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
  // Both free bands sit against the Level actually bought. Spending the
  // pool down closes the rolling, not the shelves the character can
  // already reach without one.
  function limitedTaken() {
    const base = creationWealthBase(state);
    return state.gearPurchases.filter(
      (g) => g.free && g.wealth >= base - 1 && g.wealth <= base,
    ).length;
  }

  function bandFor(item) {
    const base = creationWealthBase(state);
    const band = freeBand({
      creationWealth: base,
      itemWealth: item.wealth,
      blackMarket: item.blackMarket,
    });
    if (band === 'limited' && limitedTaken() >= base) return 'roll';
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
    // Rolling and splurging both need something left in the pool. The
    // free bands do not, and are deliberately not checked here.
    if (cw <= 0 && bandFor(item) !== 'unlimited' && bandFor(item) !== 'limited') {
      return 'Wealth spent';
    }
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

  // An item above the character's Level. No roll - they can have it, and
  // having it is the last thing the pool pays for.
  function takeSplurge(category, item) {
    const cw = currentCreationWealth(state);
    addGearPurchase(state, {
      category, name: item.name, wealth: item.wealth, loss: cw,
    });
    resultEl.innerHTML = '';
    resultEl.append(el('p', {}, `${item.name} acquired - creation-Wealth drops straight to 0. `
      + 'Your Starting Packages and free items are still yours; nothing else can be bought or rolled for.'));
    renderSummary();
    renderPurchased();
    renderCategories();
  }

  function attemptPurchase(category, item) {
    const cw = currentCreationWealth(state);
    const result = performWealthCheck({ creationWealth: cw });
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
            const band = buyable ? bandFor(item) : 'roll';
            const stop = buyable ? blocked(item) : 'not purchasable';
            const affordable = buyable && !stop;
            const label = !buyable
              ? '-'
              : stop
                || (band === 'unlimited'
                  ? 'Take (free)'
                  : band === 'limited'
                    ? `Take (free, ${Math.max(0, creationWealthBase(state) - limitedTaken())} left)`
                    : band === 'splurge'
                      ? 'Take (drops creation-Wealth to 0)'
                      : 'Buy (Wealth Check, risks 1 on failure, 2 on a critical)');
            // An item already bought, so the shop shows what you have as
            // well as what you could have. Counted rather than flagged:
            // nothing stops a character owning three flashlights.
            const owned = state.gearPurchases.filter((g) => g.name === item.name).length;
            return el('tr', { class: owned ? 'purchased' : undefined }, [
              el('td', {}, [
                item.name ?? '',
                owned ? purchasedPill(owned) : null,
              ]),
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
                        : band === 'splurge'
                          ? takeSplurge(cat.category, item)
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
      // Two sections need somebody's permission rather than only money:
      // the GM for one, a contact for the other. Keyed off the parent
      // heading, so a new sub-table inherits the label.
      // Occult goods ask the same question Beyond the Ordinary does:
      // whether any of it works at all is the table's call, not the
      // character's money. Detection is the exception - an EMF meter is
      // consumer electronics and the section says so itself.
      const needsGM = cat.parent === 'Beyond the Ordinary'
        || (cat.parent === 'Occult' && cat.category !== 'Occult - Detection');
      const needsContact = cat.parent === 'The Black Market';
      details.append(
        el('summary', {}, [
          cat.category,
          needsGM ? el('span', { class: 'gm-pill' }, 'Needs GM approval') : null,
          needsContact ? el('span', { class: 'bm-pill' }, 'Requires Black Market Access') : null,
        ]),
        el('div', { class: 'detail' }, [
          needsGM
            ? el('p', { class: 'gm-note' },
              'Not assumed to exist in every game. Check with your GM before taking any of it.')
            : null,
          needsContact
            ? el('p', { class: 'gm-note' },
              'Gated twice - you need the Wealth to pay and Black Market Access to find it. Nothing here is ever free.')
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
      'Your Level in the Wealth Resource dictates what you can buy.',
    ),
    el('ul', { class: 'gear-bands' }, [
      el('li', {}, 'Items with a Wealth Rating two or more Levels below your Wealth are free, and unlimited.'),
      el('li', {}, 'Items at your Wealth Level or one below are free up to your Wealth Level in number - Wealth 5 gives you five free items of this tier, Wealth 3 only three.'),
      el('li', {}, 'Items at your Wealth Level or one below take a Wealth Check once those free items are gone.'),
      el('li', {}, 'Items with a Wealth Rating higher than your Wealth are attainable, but instantly reduce your Wealth to zero. Take one at creation and you get your Starting Packages, your free items, and that one item.'),
      el('li', {}, 'Black market goods are never free and need Black Market Access as well as money.'),
      el('li', {}, 'This pool is temporary bookkeeping for character creation only: once creation ends every purchase uses the normal Pushing a Resource rule instead.'),
    ]),
    summaryEl,
    resultEl,
    // What you already have, before the catalogue of what you don't. It
    // used to sit under eighteen collapsed categories, so checking your
    // own loadout meant scrolling past the whole shop.
    el('h4', {}, 'Purchased Gear'),
    purchasedList,
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
    categoriesWrap,
  );
  return wrap;
}
