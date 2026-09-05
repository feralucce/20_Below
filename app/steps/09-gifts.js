import { el, counterRow, renderMarkdown, renderSelectedAvailable } from '../ui.js';
import {
  giftsPoolRemaining,
  giftLevelCost,
  giftPointsSpent,
  giftCheckTarget,
  computeFiguredCharacteristics,
} from '../state.js';

function getOrCreateGiftState(state, name) {
  let g = state.gifts.find((x) => x.name === name);
  if (!g) {
    g = { name, level: 0, adders: [], limiters: [] };
    state.gifts.push(g);
  }
  return g;
}

export default {
  id: 'gifts',
  title: 'Gifts',
  render(container, { state, data, rerenderStep, rerenderPools }) {
    const remaining = giftsPoolRemaining(state, data);
    container.append(
      el('h2', {}, 'Gifts'),
      el('div', { class: 'detail', style: 'margin-bottom:1rem;', html: renderMarkdown(data.giftCheckText) }),
      el(
        'p',
        {},
        `Your Gift Check target is your current Ki: ${giftCheckTarget(state)} (max ${computeFiguredCharacteristics(state).Ki}).`,
      ),
      el(
        'p',
        {},
        `Each Gift Level costs a flat ${data.giftLevelCost} points from a ${data.giftsPoolTotal}-point pool (Limiters reduce this per-Gift, floored at 1). Remaining: ${remaining}. Anything left unspent converts into Discretionary points (the Discretionary Points step) at ${data.giftsLeftoverRate}:1.`,
      ),
    );

    function counterCfg(gift) {
      const gState = getOrCreateGiftState(state, gift.name);
      const perLevel = giftLevelCost(data, gState.limiters.length);
      return {
        name: `${gift.name}${gift.flagged ? ' [flagged, not final]' : ''}`,
        hint: `${perLevel} pts/level, ${giftPointsSpent(gState, data)} pts spent`,
        get: () => gState.level,
        set: (v) => {
          gState.level = v;
        },
        min: 0,
        max: () => Math.min(5, gState.level + Math.floor(remaining / perLevel)),
        onChange: () => {
          rerenderStep();
          rerenderPools();
        },
      };
    }

    // Adders/limiters checkboxes, plus the "see Gift Menus" note and the
    // Gift's full writeup - twirled out (both Available and Selected) by
    // clicking the Gift's name.
    function detailFor(gift) {
      const gState = getOrCreateGiftState(state, gift.name);
      const wrap = el('div', {});
      if (gift.adders.length) {
        const addersRow = el('div', { style: 'margin:0.25rem 0 0.5rem 0.5rem;' });
        gift.adders.forEach((adder) => {
          const checked = gState.adders.includes(adder.name);
          addersRow.appendChild(
            el('label', { style: 'display:block;font-size:0.85rem;' }, [
              el('input', {
                type: 'checkbox',
                checked: checked ? '' : undefined,
                onChange: (e) => {
                  if (e.target.checked) gState.adders.push(adder.name);
                  else gState.adders = gState.adders.filter((a) => a !== adder.name);
                  rerenderStep();
                  rerenderPools();
                },
              }),
              ` ${adder.name} (${adder.tier}, ${adder.points} pts)`,
            ]),
          );
        });
        wrap.appendChild(addersRow);
      }
      if (gift.limiters.length) {
        const limitersRow = el('div', { style: 'margin:0 0 0.5rem 0.5rem;' });
        gift.limiters.forEach((limiter) => {
          const checked = gState.limiters.includes(limiter.name);
          limitersRow.appendChild(
            el('label', { style: 'display:block;font-size:0.85rem;' }, [
              el('input', {
                type: 'checkbox',
                checked: checked ? '' : undefined,
                onChange: (e) => {
                  if (e.target.checked) gState.limiters.push(limiter.name);
                  else gState.limiters = gState.limiters.filter((l) => l !== limiter.name);
                  rerenderStep();
                  rerenderPools();
                },
              }),
              ` ${limiter.name} (-1 pt/Level)`,
            ]),
          );
        });
        wrap.appendChild(limitersRow);
      }
      if (gift.menu) {
        wrap.appendChild(el('p', { class: 'hint' }, 'No standard Level table for this Gift - see Gift Menus.'));
      }
      wrap.appendChild(el('div', { class: 'detail', html: renderMarkdown(gift.markdown) }));
      return wrap;
    }

    // Name + counter, click the name to twirl the entire detail out
    // (adders/limiters, then the full description) - same in both the
    // Selected and Available lists.
    function renderCard(gift) {
      const card = el('div', { class: 'pick-card' });
      card.append(counterRow({ ...counterCfg(gift), key: `gift:${gift.name}`, detail: detailFor(gift) }));
      return card;
    }

    renderSelectedAvailable(container, {
      label: 'Gifts',
      getItems: () => data.gifts,
      isSelected: (gift) => getOrCreateGiftState(state, gift.name).level > 0,
      renderCard,
    });
  },
};
