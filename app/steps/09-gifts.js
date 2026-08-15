import { el, counterRow, renderMarkdown } from '../ui.js';
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
  title: '10. Gifts',
  render(container, { state, data, rerenderStep, rerenderPools }) {
    const remaining = giftsPoolRemaining(state, data);
    container.append(
      el('h2', {}, '10. Gifts'),
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

    data.gifts.forEach((gift) => {
      const gState = getOrCreateGiftState(state, gift.name);
      const card = el('details', { class: 'pick-card' });
      const perLevel = giftLevelCost(data, gState.limiters.length);
      card.append(
        el('summary', {}, `${gift.name}${gift.flagged ? ' [flagged, not final]' : ''} - ${giftPointsSpent(gState, data)} pts spent`),
        el('div', { class: 'detail', html: renderMarkdown(gift.markdown) }),
      );
      if (gift.menu) {
        card.append(el('p', { class: 'hint' }, 'No standard Level table for this Gift - see Gift Menus.'));
      }
      container.appendChild(card);

      container.appendChild(
        counterRow({
          name: `${gift.name} Level`,
          hint: `${perLevel} pts/level`,
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
        }),
      );

      if (gState.level > 0 || gState.adders.length || gState.limiters.length) {
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
          container.appendChild(addersRow);
        }
        if (gift.limiters.length) {
          const limitersRow = el('div', { style: 'margin:0 0 1rem 0.5rem;' });
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
          container.appendChild(limitersRow);
        }
      }
    });
  },
};
