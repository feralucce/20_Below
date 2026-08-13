import { el } from '../ui.js';

export default {
  id: 'nature',
  title: '3. Nature',
  render(container, { state, data, rerenderStep }) {
    container.append(
      el('h2', {}, '3. Nature'),
      el(
        'p',
        {},
        'Pick a starter Nature or write your own. Playing to it at a dramatically appropriate moment earns a Fate Token.',
      ),
    );

    const list = el('div', { class: 'pick-list' });
    data.natures.forEach((n) => {
      const checked = state.nature.picked === n.name;
      const card = el('label', { class: 'pick-card', style: 'display:flex;gap:0.75rem;align-items:flex-start;cursor:pointer;' }, [
        el('input', {
          type: 'radio',
          name: 'nature',
          checked: checked ? '' : undefined,
          onChange: () => {
            state.nature = { picked: n.name, custom: null };
            rerenderStep();
          },
        }),
        el('span', {}, [
          el('strong', {}, n.name),
          el('br'),
          el('span', { class: 'detail' }, `${n.drive} - ${n.example}`),
        ]),
      ]);
      list.appendChild(card);
    });

    const customChecked = state.nature.custom != null;
    const customCard = el('label', { class: 'pick-card', style: 'display:flex;gap:0.75rem;align-items:flex-start;cursor:pointer;' }, [
      el('input', {
        type: 'radio',
        name: 'nature',
        checked: customChecked ? '' : undefined,
        onChange: () => {
          state.nature = { picked: null, custom: { label: '', drive: '', trigger: '' } };
          rerenderStep();
        },
      }),
      el('span', {}, 'Write your own'),
    ]);
    list.appendChild(customCard);
    container.appendChild(list);

    if (customChecked) {
      const custom = state.nature.custom;
      container.append(
        el('div', { class: 'field' }, [
          el('label', {}, 'Label (one or two words)'),
          el('input', {
            type: 'text',
            value: custom.label,
            onInput: (e) => {
              custom.label = e.target.value;
            },
          }),
        ]),
        el('div', { class: 'field' }, [
          el('label', {}, 'Drive (one sentence)'),
          el('input', {
            type: 'text',
            value: custom.drive,
            onInput: (e) => {
              custom.drive = e.target.value;
            },
          }),
        ]),
        el('div', { class: 'field' }, [
          el('label', {}, 'Playing to it looks like (a concrete, repeatable trigger)'),
          el('input', {
            type: 'text',
            value: custom.trigger,
            onInput: (e) => {
              custom.trigger = e.target.value;
            },
          }),
        ]),
      );
    }
  },
};
