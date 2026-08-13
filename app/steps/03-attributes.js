import { el, counterRow } from '../ui.js';
import { attributePointsSpent } from '../state.js';

export default {
  id: 'attributes',
  title: '4. Attributes',
  render(container, { state, data, rerenderStep, rerenderPools }) {
    const total = data.attributePoolTotal + state.discretionaryExtra.Attributes;
    const spent = attributePointsSpent(state, data);
    container.append(
      el('h2', {}, '4. Attributes'),
      el(
        'p',
        {},
        `Every Attribute starts at ${data.attributeFloor}. You have ${total} points to spend, cap ${data.attributeCap} per Attribute. Spent: ${spent}/${total}.`,
      ),
    );

    data.attributes.forEach((a) => {
      const remaining = total - attributePointsSpent(state, data);
      container.append(
        counterRow({
          name: a.name,
          hint: a.splitsInto.join(' / '),
          get: () => state.attributes[a.name],
          set: (v) => {
            state.attributes[a.name] = v;
          },
          min: data.attributeFloor,
          max: () => Math.min(data.attributeCap, state.attributes[a.name] + remaining),
          onChange: () => {
            rerenderStep();
            rerenderPools();
          },
        }),
        el('p', { class: 'detail', style: 'color:var(--text-dim);font-size:0.85rem;margin:0 0 0.75rem;' }, a.description),
      );
    });
  },
};
