import { el } from '../ui.js';
import {
  giftMenuPool, giftMenuSpent, giftMenuRemaining, addGiftMenuPurchase, updateGiftMenuPurchaseNote,
  removeGiftMenuPurchase, giftMenuBuilds, giftMenuBuildName, giftMenuPurchases,
} from '../state.js';

function purchaseRow(giftName, purchase, ctx) {
  return el('div', { class: 'counter-row' }, [
    el('span', { class: 'name' }, `${purchase.option} (${purchase.cost} pt${purchase.cost === 1 ? '' : 's'})`),
    el('input', {
      type: 'text',
      placeholder: 'note (which sub-stat, which Gift, etc.)',
      value: purchase.note,
      style: 'flex:1;margin:0 0.5rem;',
      onInput: (e) => {
        updateGiftMenuPurchaseNote(ctx.state, giftName, purchase.id, e.target.value);
      },
    }),
    el('button', {
      type: 'button',
      text: 'Remove',
      onClick: () => {
        removeGiftMenuPurchase(ctx.state, giftName, purchase.id);
        ctx.rerenderStep();
        ctx.rerenderPools();
      },
    }),
  ]);
}

function buyControl(giftName, item, remaining, ctx, build = 1) {
  if (!item.cost) return el('span', { class: 'hint' }, '(cost unparseable - see rules text)');

  if (item.cost.type === 'flat') {
    const affordable = remaining >= item.cost.cost;
    return el('button', {
      type: 'button',
      text: `Buy (${item.cost.cost} pt${item.cost.cost === 1 ? '' : 's'})`,
      disabled: affordable ? undefined : '',
      onClick: () => {
        addGiftMenuPurchase(ctx.state, giftName, { option: item.option, cost: item.cost.cost, build });
        ctx.rerenderStep();
        ctx.rerenderPools();
      },
    });
  }

  if (item.cost.type === 'perUnit') {
    const qtyInput = el('input', { type: 'number', min: 1, value: 1, style: 'width:3.5rem;' });
    const buyBtn = el('button', {
      type: 'button',
      text: `Buy (${item.cost.rate} pt/${item.cost.unit})`,
      onClick: () => {
        const qty = Math.max(1, Number(qtyInput.value) || 1);
        const cost = qty * item.cost.rate;
        if (cost > remaining) return;
        addGiftMenuPurchase(ctx.state, giftName, { option: item.option, cost, note: `${qty} ${item.cost.unit}${qty === 1 ? '' : 's'}`, build });
        ctx.rerenderStep();
        ctx.rerenderPools();
      },
    });
    return el('span', {}, [qtyInput, ' ', buyBtn]);
  }

  if (item.cost.type === 'choice') {
    const select = el(
      'select',
      {},
      item.cost.options.map((n) => el('option', { value: n }, `${n} pts`)),
    );
    const buyBtn = el('button', {
      type: 'button',
      text: 'Buy',
      onClick: () => {
        const cost = Number(select.value);
        if (cost > remaining) return;
        addGiftMenuPurchase(ctx.state, giftName, { option: item.option, cost, build });
        ctx.rerenderStep();
        ctx.rerenderPools();
      },
    });
    return el('span', {}, [select, ' ', buyBtn]);
  }

  return null;
}

export default {
  id: 'gift-menus',
  title: 'Gift Menus',
  render(container, ctx) {
    const { state, data } = ctx;
    container.append(
      el('h2', {}, 'Gift Menus'),
      el(
        'p',
        {},
        'A few Gifts (Alternate Form, Cybernetics) spend their own separate points pool on a build menu instead of a flat per-Level table. Buy at least one Level of one of these Gifts on the Gifts step to unlock its menu here.',
      ),
    );

    const menuGifts = data.gifts.filter((g) => g.menu);
    const ownedMenuGifts = menuGifts.filter((g) => {
      const gState = state.gifts.find((x) => x.name === g.name);
      return gState && gState.level > 0;
    });

    if (!ownedMenuGifts.length) {
      container.append(el('p', { class: 'hint' }, 'No build-menu Gifts owned yet.'));
      return;
    }

    ownedMenuGifts.forEach((giftData) => {
      const gState = state.gifts.find((x) => x.name === giftData.name);
      const pool = giftMenuPool(gState, giftData);
      const builds = giftMenuBuilds(gState);

      const card = el('div', { class: 'pick-card', style: 'padding:0.75rem;margin-bottom:1rem;' });
      card.append(el('h3', {}, `${giftData.name} - Level ${gState.level}`));
      if (builds.length > 1) {
        card.append(el('p', { class: 'hint' },
          `Two builds, each with the full ${pool}-point pool. Only one is active at a time.`));
      }

      // One block per build: its own pool, what it has bought, and the menu.
      builds.forEach((build) => {
        const spent = giftMenuSpent(gState, build);
        const remaining = giftMenuRemaining(gState, giftData, build);
        if (builds.length > 1) card.append(el('h4', { class: 'build-name' }, giftMenuBuildName(gState, build)));
        card.append(el('p', {}, `Pool: ${pool} pts. Spent: ${spent} pts. Remaining: ${remaining} pts.`));

        const bought = giftMenuPurchases(gState, build);
        if (bought.length) {
          card.append(el('h4', {}, 'Purchased'));
          bought.forEach((purchase) => card.append(purchaseRow(giftData.name, purchase, ctx)));
        }

        card.append(el('h4', {}, 'Menu'));
        const menuTable = el('table', { class: 'menu-table' });
        giftData.menu.items.forEach((item) => {
          menuTable.append(
            el('tr', {}, [
              el('td', {}, el('strong', {}, item.option)),
              el('td', { class: 'hint' }, item.effect),
              el('td', {}, buyControl(giftData.name, item, remaining, ctx, build)),
            ]),
          );
        });
        card.append(menuTable);
      });

      // A second build bought, then its Adder dropped: the purchases are
      // kept so taking the Adder back restores them, but they do nothing.
      if (builds.length === 1 && giftMenuPurchases(gState, 2).length) {
        card.append(el('p', { class: 'hint' },
          `${giftMenuPurchases(gState, 2).length} purchase(s) for the second build are kept but unused until its Adder is taken again.`));
      }

      container.appendChild(card);
    });
  },
};
