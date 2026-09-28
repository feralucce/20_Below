import { el } from '../ui.js';
import buildPortraitField from './portrait-field.js';

export default {
  id: 'identity',
  title: 'Name & Concept',
  render(container, { state, persist, rerenderStep }) {
    container.append(
      el('h2', {}, 'Name'),
      el('p', {}, 'Give your character a name. Purely cosmetic, no mechanical weight.'),
      el('div', { class: 'field' }, [
        el('input', {
          type: 'text',
          value: state.name,
          placeholder: 'Character name',
          onInput: (e) => {
            state.name = e.target.value;
          },
        }),
      ]),
      el('h2', {}, 'Concept'),
      el(
        'p',
        {},
        'A few words capturing who this character is at a glance - not a full backstory.',
      ),
      el('div', { class: 'field' }, [
        el('textarea', {
          rows: 3,
          placeholder: 'e.g. "burned-out paramedic who won\'t stop running toward danger"',
          onInput: (e) => {
            state.concept = e.target.value;
          },
          text: state.concept,
        }),
      ]),
      el('h2', {}, 'Portrait'),
      el('p', {}, 'Optional. A picture of your character, for the sheet and the table.'),
      buildPortraitField(state, { persist, rerender: rerenderStep }),
    );
  },
};
