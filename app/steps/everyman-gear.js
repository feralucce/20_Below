// Starting Packages (weapons.md#starting-packages) - step one of creation
// shopping, not an alternative to it. Every character takes one package
// from every Level up to and including their creation-Wealth: one from
// each, not several from the top. The free items and the Wealth Checks in
// gear-shop.js come afterwards. Split out the same way gear-shop.js was
// split from 08-resources.js - a self-contained interactive block.

import { el, keyedDetails, setOpenState } from '../ui.js';
import { creationWealthBase, setEverymanGearPackage } from '../state.js';

export default function buildEverymanGear(state, data) {
  const wrap = el('div', { class: 'everyman-gear' });
  const listWrap = el('div', {});

  function packageKey(level, name) {
    return `${level}::${name}`;
  }

  function render() {
    listWrap.innerHTML = '';
    const eligibleBase = creationWealthBase(state);
    const current = state.everymanGearPackages || {};

    // Level 0 is exclusive to a genuine creation-Wealth of 0 (Destitute) -
    // everyone else gets cumulative access from Level 1 up through their own
    // Level, same as any other pool, but never sees Level 0 at all.
    data.everymanGearPackages
      .filter((lvl) => (eligibleBase === 0 ? lvl.level === 0 : lvl.level >= 1 && lvl.level <= eligibleBase))
      .forEach((lvl) => {
        // A <details> per Level, so a Level can be shut once its pick is
        // made - thirteen cards each, and a creation-Wealth 5 character
        // has five Levels of them open at once otherwise. keyedDetails
        // remembers the open state across the re-render a pick triggers.
        const picked = current[lvl.level];
        const levelWrap = keyedDetails(`starting-pkg:${lvl.level}`, {
          class: 'everyman-gear-level pick-card',
          open: picked ? undefined : '',
        });
        levelWrap.append(el('summary', {}, [
          `Level ${lvl.level}`,
          picked ? el('span', { class: 'level-picked' }, picked.name) : null,
        ]));
        const cards = el('div', { class: 'everyman-gear-cards' });
        lvl.packages.forEach((pkg) => {
          const isSelected =
            current[lvl.level] && current[lvl.level].name === pkg.name;
          // A twirl-down card like every other pick in the app - there are
          // thirteen per level now, and a wall of open ones is unreadable.
          // The summary carries the pick marker so the chosen package is
          // still obvious with all of them shut.
          // Keyed by package, not by summary: the summary gains the word
          // "Selected" on the pick, and the old pick loses it, so matching
          // on the label shut both of them.
          const card = keyedDetails(`everyman:${packageKey(lvl.level, pkg.name)}`, {
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
                // Shut the Level once it has its pick. Re-picking the same
                // package clears it, and then the Level opens again so
                // there is somewhere to choose from.
                const stillPicked = !!state.everymanGearPackages[lvl.level];
                setOpenState(`starting-pkg:${lvl.level}`, !stillPicked);
                render();
              },
            }),
          );
          cards.appendChild(card);
        });
        levelWrap.appendChild(cards);
        listWrap.appendChild(levelWrap);
      });
  }

  render();

  const clearBtn = el('button', {
    type: 'button',
    text: 'Clear All Picks',
    onClick: () => {
      setEverymanGearPackage(state, null);
      // Every Level shut itself when it got its pick. Clearing them all
      // without reopening leaves a column of closed twirls and nothing
      // to choose from.
      data.everymanGearPackages.forEach((lvl) => {
        setOpenState(`starting-pkg:${lvl.level}`, true);
      });
      render();
    },
  });

  wrap.append(
    el('h3', {}, 'Starting Packages'),
    el(
      'p',
      { class: 'detail' },
      'Every character starts with these, on top of everything the Wealth Check buys below. Take one package from every Level up to and including your creation-Wealth - one from each Level, not several from the top. Picking a new package at a Level replaces the earlier pick at that Level.',
    ),
    listWrap,
    clearBtn,
  );
  return wrap;
}
