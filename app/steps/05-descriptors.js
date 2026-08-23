import { el } from '../ui.js';
import { descriptorSlots } from '../state.js';

export default {
  id: 'descriptors',
  title: 'Descriptors',
  render(container, { state, data }) {
    container.append(
      el('h2', {}, 'Descriptors'),
      el(
        'p',
        {},
        "For every point spent in a sub-stat, you get one free Descriptor - a short, one or two-word adjective (Brawny, Brutal, Indefatigable, Headstrong) capturing a specific flavor of it. Core traits: free, fixed once chosen, and there's no way to buy an extra one beyond what a sub-stat's points earn. Every Skill defaults to an Attribute/Element - point to a Descriptor when you challenge that default in play.",
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
            el('strong', {}, 'Sample Descriptors (examples - write your own instead if none of these fit): '),
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
    });
  },
};
