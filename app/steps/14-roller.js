import { el } from '../ui.js';
import buildRollerPanel from './roller-panel.js';

export default {
  id: 'roller',
  title: 'Dice Roller',
  render(container, { state, data }) {
    container.append(el('h2', {}, 'Dice Roller'), buildRollerPanel(state, data));
  },
};
