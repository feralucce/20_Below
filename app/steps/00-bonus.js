// The first thing creation asks: are we building to the book, or has the
// GM handed out extra?
//
// A table starting above the standard build had no way to say so - the
// pools were the pools, and anything more meant lying to a later step or
// tracking it on paper. These numbers are added onto each pool's total
// before anything is spent, so every step after this one simply has more
// to work with and none of them need to know why.

import { el } from '../ui.js';

const POOLS = ['Attributes', 'Skills', 'Boons', 'Resources', 'Gifts'];

export default {
  id: 'bonus',
  title: 'Bonus Points',
  render(container, { state, data, rerenderStep, rerenderPools, persist }) {
    const bonus = state.bonusPoints;
    const anyGranted = () => POOLS.some((p) => (Number(bonus[p]) || 0) !== 0);

    const status = el('p', { class: 'detail' });
    function sayStatus() {
      status.textContent = anyGranted()
        ? 'Building with GM-granted bonus points.'
        : 'Building to the standard creation rules.';
    }

    const fields = el('div', { class: 'bonus-grid' }, POOLS.map((pool) => {
      const base = {
        Attributes: data.attributePoolTotal,
        Skills: data.skillsPoolTotal,
        Boons: data.boonsPoolTotal,
        Resources: data.resourcesPoolTotal,
        Gifts: data.giftsPoolTotal,
      }[pool];
      const input = el('input', {
        type: 'number',
        min: '0',
        value: String(Number(bonus[pool]) || 0),
        onInput: (e) => {
          bonus[pool] = Math.max(0, Number(e.target.value) || 0);
          sayStatus();
          // The pool badges along the bottom are the whole point of this
          // step, so they move as the number is typed.
          rerenderPools();
          persist?.();
        },
      });
      return el('div', { class: 'bonus-row' }, [
        el('label', {}, pool),
        input,
        el('span', { class: 'bonus-base' }, `on top of ${base}`),
      ]);
    }));

    container.append(
      el('h2', {}, 'Bonus Points'),
      el('p', { class: 'attr-caption' },
        'Most characters are built with the pools exactly as the book sets '
        + 'them. If your GM is starting the table above that - veterans, a '
        + 'campaign picking up mid-story - put what they granted here before '
        + 'you spend anything.'),
      el('button', {
        type: 'button',
        class: 'file-link',
        text: 'Use default creation rules',
        onClick: () => {
          POOLS.forEach((p) => { bonus[p] = 0; });
          persist?.();
          rerenderStep();
        },
      }),
      el('h3', {}, 'GM Granted Bonus Points'),
      fields,
      status,
    );
    sayStatus();
  },
};
