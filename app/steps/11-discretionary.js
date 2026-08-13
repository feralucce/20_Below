import { el, counterRow } from '../ui.js';
import {
  discretionaryTotal,
  discretionaryPointsSpent,
  discretionaryRemaining,
  flawsPointsGranted,
} from '../state.js';

const TARGETS = ['Resources', 'Skills', 'Boons', 'Gifts', 'Attributes', 'Fate Tokens'];

export default {
  id: 'discretionary',
  title: '12. Discretionary Points',
  render(container, { state, data, rerenderStep, rerenderPools }) {
    const total = discretionaryTotal(state, data);
    const spent = discretionaryPointsSpent(state, data);
    const remaining = discretionaryRemaining(state, data);

    container.append(
      el('h2', {}, '12. Discretionary Points'),
      el(
        'p',
        {},
        `Base ${data.discretionaryBase} + ${flawsPointsGranted(state)} from Flaws = ${total} total. Spent: ${spent}. Remaining: ${remaining}.`,
      ),
      el('div', { class: 'field' }, [
        el('label', {}, "GM's per-campaign cap on Flaw-earned Discretionary (optional, blank = uncapped)"),
        el('input', {
          type: 'number',
          min: '0',
          value: state.discretionaryCap ?? '',
          onInput: (e) => {
            state.discretionaryCap = e.target.value === '' ? null : Number(e.target.value);
            rerenderStep();
            rerenderPools();
          },
        }),
      ]),
      el('p', {}, 'Buy extra points in another pool, at the conversion rate below (Descriptors are bought per-sub-stat back on step 6).'),
    );

    TARGETS.forEach((target) => {
      const rate = data.discretionaryRates[target];
      container.append(
        counterRow({
          name: target,
          hint: `${rate} Discretionary/point`,
          get: () => state.discretionaryExtra[target],
          set: (v) => {
            state.discretionaryExtra[target] = v;
          },
          min: 0,
          max: () =>
            state.discretionaryExtra[target] + Math.floor(discretionaryRemaining(state, data) / rate),
          onChange: () => {
            rerenderStep();
            rerenderPools();
          },
        }),
      );
    });
  },
};
