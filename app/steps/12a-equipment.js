// Equipment shopping (see resources.md#wealth-at-character-creation), placed
// after Discretionary Points on request - Discretionary can fund the Wealth
// Resource itself, so creation-Wealth needs to be fully settled before this
// shopping pass runs its math against it.

import { el } from '../ui.js';
import buildGearShop from './gear-shop.js';

export default {
  id: 'equipment',
  title: 'Equipment',
  render(container, { state, data }) {
    container.append(el('h2', {}, 'Equipment'), buildGearShop(state, data));
  },
};
