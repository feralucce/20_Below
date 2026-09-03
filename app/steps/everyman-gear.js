// Everyman Gear Packages (weapons.md#everyman-gear-packages) - a free,
// no-roll alternative to Wealth Check shopping in gear-shop.js. Exactly one
// pick, from every package at or under the character's creation-Wealth
// Level, cumulative downward. Split out the same way gear-shop.js was split
// from 08-resources.js - a self-contained interactive block.

import { el, captureOpenDetails, restoreOpenDetails } from '../ui.js';
import { creationWealthBase, setEverymanGearPackage } from '../state.js';

export default function buildEverymanGear(state, data) {
  const wrap = el('div', { class: 'everyman-gear' });
  const listWrap = el('div', {});

  function packageKey(level, name) {
    return `${level}::${name}`;
  }

  function render() {
    const openDetails = captureOpenDetails(listWrap);
    listWrap.innerHTML = '';
    const eligibleBase = creationWealthBase(state);
    const current = state.everymanGearPackage;

    // Level 0 is exclusive to a genuine creation-Wealth of 0 (Destitute) -
    // everyone else gets cumulative access from Level 1 up through their own
    // Level, same as any other pool, but never sees Level 0 at all.
    data.everymanGearPackages
      .filter((lvl) => (eligibleBase === 0 ? lvl.level === 0 : lvl.level >= 1 && lvl.level <= eligibleBase))
      .forEach((lvl) => {
        const levelWrap = el('div', { class: 'everyman-gear-level' });
        levelWrap.append(el('h4', {}, `Level ${lvl.level}`));
        const cards = el('div', { class: 'everyman-gear-cards' });
        lvl.packages.forEach((pkg) => {
          const isSelected =
            current && current.level === lvl.level && current.name === pkg.name;
          // A twirl-down card like every other pick in the app - there are
          // thirteen per level now, and a wall of open ones is unreadable.
          // The summary carries the pick marker so the chosen package is
          // still obvious with all of them shut.
          const card = el('details', {
            class: `pick-card everyman-gear-card${isSelected ? ' selected' : ''}`,
            open: isSelected ? '' : undefined,
          });
          card.append(
            el('summary', {}, [
              el('span', {}, pkg.name),
              isSelected ? el('span', { class: 'cost' }, 'Selected') : null,
            ]),
            el('p', { class: 'detail' }, pkg.contents),
            el('button', {
              type: 'button',
              text: isSelected ? 'Selected' : 'Pick This Package',
              disabled: isSelected ? '' : undefined,
              onClick: () => {
                setEverymanGearPackage(state, { level: lvl.level, name: pkg.name, contents: pkg.contents });
                render();
              },
            }),
          );
          cards.appendChild(card);
        });
        levelWrap.appendChild(cards);
        listWrap.appendChild(levelWrap);
      });
    restoreOpenDetails(listWrap, openDetails);
  }

  render();

  const clearBtn = el('button', {
    type: 'button',
    text: 'Clear Pick',
    onClick: () => {
      setEverymanGearPackage(state, null);
      render();
    },
  });

  wrap.append(
    el('h3', {}, 'Everyman Gear Packages'),
    el(
      'p',
      { class: 'detail' },
      'A free alternative to Wealth Check shopping below - not instead of it, a character can still shop normally on top of taking a package here. Pick exactly one package from every level at or under your creation-Wealth Level (cumulative downward). Picking a new one replaces any earlier pick.',
    ),
    listWrap,
    clearBtn,
  );
  return wrap;
}
