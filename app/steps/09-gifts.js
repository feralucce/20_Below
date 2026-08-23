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
        `Your current Gift Check target: Ki (${computeFiguredCharacteristics(state).Ki}) + Stamina (${state.subStats.Stamina}) = ${giftCheckTarget(state)}.`,
      ),
      el(
        'p',
        {},
        `Each Gift Level costs a flat ${data.giftLevelCost} points from a ${data.giftsPoolTotal}-point pool (Limiters reduce this per-Gift, floored at 1). Remaining: ${remaining}.`,
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

    // The Gift's full writeup, plus the "see Gift Menus" note where it
    // applies - twirled out from the Available list by clicking its name.
    function descriptionFor(gift) {
      const wrap = el('div', {});
      if (gift.menu) {
        wrap.appendChild(el('p', { class: 'hint' }, 'No standard Level table for this Gift - see Gift Menus.'));
      }
      wrap.appendChild(el('div', { class: 'detail', html: renderMarkdown(gift.markdown) }));
      return wrap;
    }

    // Adders/limiters checkboxes - twirled out from the Selected list by
    // clicking the Gift's name, once you've actually put a level into it.
    function addersLimitersFor(gift) {
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
      return wrap;
    }

    // Available: name + counter, click the name to twirl the description out.
    function renderCard(gift) {
      const card = el('div', { class: 'pick-card' });
      card.append(counterRow({ ...counterCfg(gift), detail: descriptionFor(gift) }));
      return card;
    }

    // Selected: name + counter, click the name to twirl adders/limiters out
    // instead - the description stays back in the Available entry.
    function renderSelectedCard(gift) {
      const card = el('div', { class: 'pick-card' });
      const hasAddersOrLimiters = gift.adders.length > 0 || gift.limiters.length > 0;
      card.append(
        counterRow({
          ...counterCfg(gift),
          detail: hasAddersOrLimiters ? addersLimitersFor(gift) : undefined,
        }),
      );
      return card;
    }

    renderSelectedAvailable(container, {
      label: 'Gifts',
      getItems: () => data.gifts,
      isSelected: (gift) => getOrCreateGiftState(state, gift.name).level > 0,
      renderCard,
      renderSelectedCard,
    });
  },
};
