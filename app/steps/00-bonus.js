// The first thing creation asks: are we building to the book, or has the
// GM handed out extra?
//
// A table starting above the standard build had no way to say so - the
// pools were the pools, and anything more meant lying to a later step or
// tracking it on paper. These numbers are added onto each pool's total
// before anything is spent, so every step after this one simply has more
// to work with and none of them need to know why.
//
// Granted a step at a time rather than typed, because a pool's points are
// not loose change: three of them is a Gift Level and two is nothing. A
// GM saying "take another Gift Level" should press + once, not work out
// what that costs. The step for each pool is that pool's own unit price,
// read from costs.md rather than written here.

import { el } from '../ui.js';

export default {
  id: 'bonus',
  title: 'Bonus Points',
  render(container, { state, data, rerenderStep, rerenderPools, persist }) {
    const bonus = state.bonusPoints;

    // Boons are the one pool with no levels - a Boon costs 1, 3, 5 or 7
    // by tier - so it steps by a single point and says so.
    const pools = [
      { name: 'Attributes', base: data.attributePoolTotal, step: 1, unit: 'rating point' },
      { name: 'Skills', base: data.skillsPoolTotal, step: data.skillTierPointCost, unit: 'Skill tier' },
      { name: 'Boons', base: data.boonsPoolTotal, step: 1, unit: 'point' },
      { name: 'Resources', base: data.resourcesPoolTotal, step: data.resourceLevelCost, unit: 'Resource level' },
      { name: 'Gifts', base: data.giftsPoolTotal, step: data.giftLevelCost, unit: 'Gift Level' },
    ];

    const anyGranted = () => pools.some((p) => (Number(bonus[p.name]) || 0) !== 0);

    const status = el('p', { class: 'detail' });
    function sayStatus() {
      status.textContent = anyGranted()
        ? 'Building with GM-granted bonus points.'
        : 'Building to the standard creation rules.';
    }

    function row(pool) {
      const granted = () => Number(bonus[pool.name]) || 0;
      const value = el('span', { class: 'value' }, String(granted()));
      const summary = el('span', { class: 'bonus-base' });

      // Drawing the row for the first time should not also write the
      // draft and rebuild the badges - nothing has changed yet.
      function redraw(initial) {
        value.textContent = String(granted());
        const steps = granted() / pool.step;
        summary.textContent = granted()
          ? `${steps} × ${pool.unit}${steps === 1 ? '' : 's'} - pool of ${pool.base + granted()}`
          : `${pool.step} per ${pool.unit} - pool of ${pool.base}`;
        minus.disabled = granted() <= 0;
        sayStatus();
        if (initial) return;
        rerenderPools();
        persist?.();
      }

      const minus = el('button', {
        type: 'button',
        text: '−',
        disabled: true,
        onClick: () => {
          bonus[pool.name] = Math.max(0, granted() - pool.step);
          redraw();
        },
      });
      const plus = el('button', {
        type: 'button',
        text: '+',
        onClick: () => {
          bonus[pool.name] = granted() + pool.step;
          redraw();
        },
      });

      const node = el('div', { class: 'counter-row bonus-row' }, [
        el('span', { class: 'name' }, pool.name),
        minus,
        value,
        plus,
        summary,
      ]);
      redrawRows.push(redraw);
      return node;
    }

    const redrawRows = [];
    const rows = el('div', { class: 'bonus-grid' });
    pools.forEach((p) => rows.appendChild(row(p)));
    redrawRows.forEach((fn) => fn(true));

    container.append(
      el('h2', {}, 'Bonus Points'),
      el('p', { class: 'attr-caption' },
        'Most characters are built with the pools exactly as the book sets '
        + 'them. If your GM is starting the table above that - veterans, a '
        + 'campaign picking up mid-story - grant what they gave you here '
        + 'before you spend anything. Each press is one whole step: a Gift '
        + 'Level, a Skill tier, a Resource level.'),
      el('button', {
        type: 'button',
        class: 'file-link',
        text: 'Use default creation rules',
        onClick: () => {
          pools.forEach((p) => { bonus[p.name] = 0; });
          persist?.();
          rerenderStep();
        },
      }),
      el('h3', {}, 'GM Granted Bonus Points'),
      rows,
      status,
    );
    sayStatus();
  },
};
