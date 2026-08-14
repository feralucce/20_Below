import { el, counterRow } from '../ui.js';
import { descriptorSlots, discretionaryRemaining } from '../state.js';

export default {
  id: 'descriptors',
  title: '6. Descriptors',
  render(container, { state, data, rerenderStep, rerenderPools }) {
    container.append(
      el('h2', {}, '6. Descriptors'),
      el(
        'p',
        {},
        'For every point spent in a sub-stat, you get one free Descriptor - a short word or phrase capturing a specific flavor of it. Extra Descriptors beyond that cost Discretionary points (see step 12).',
      ),
    );

    data.subStats.forEach((s) => {
      const slots = descriptorSlots(state, s.name);
      if (slots === 0 && state.subStats[s.name] === 0) return;

      container.append(el('h3', {}, s.name));
      const samples = data.sampleDescriptors[s.name];
      if (samples?.length) {
        container.append(
          el('p', { class: 'detail', style: 'margin:0 0 0.5rem;' }, [
            el('strong', {}, 'Sample Descriptors: '),
            samples.join(', '),
          ]),
        );
      }
      const arr = state.descriptors[s.name];
      while (arr.length < slots) arr.push('');
      while (arr.length > slots) arr.pop();

      arr.forEach((val, i) => {
        container.append(
          el('div', { class: 'field' }, [
            el('input', {
              type: 'text',
              value: val,
              placeholder: `Descriptor ${i + 1}`,
              onInput: (e) => {
                arr[i] = e.target.value;
              },
            }),
          ]),
        );
      });

      const rate = data.discretionaryRates.Descriptors ?? 1;
      const discRemaining = discretionaryRemaining(state, data);
      container.append(
        counterRow({
          name: 'Extra Descriptors (Discretionary)',
          get: () => state.extraDescriptors[s.name],
          set: (v) => {
            state.extraDescriptors[s.name] = v;
          },
          min: 0,
          max: () => state.extraDescriptors[s.name] + Math.floor(discRemaining / rate),
          onChange: () => {
            rerenderStep();
            rerenderPools();
          },
        }),
      );
    });
  },
};
