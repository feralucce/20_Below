// Wealth at Character Creation (see resources.md#wealth-at-character-creation):
// 2d10 against creation-Wealth + 10, roll-under, standard critical results
// apply. The character always gets the item either way; the roll only
// decides whether creation-Wealth drops - by 1 on a failure, by 2 on a
// critical failure, the same cost the general Resource Check carries.
//
// Only one band ever rolls: an item at the character's Level or one below
// it, once that band's free allowance is spent. Anything above their Level
// doesn't roll at all - it can simply be had, and having it empties the
// pool (see splurge below).
//
// Distinct from the general Pushing a Resource check (see resourceCheck.js),
// which uses a GM-set Difficulty and never grants the thing on a failure -
// that rule is unchanged and still applies to every Wealth push once
// character creation ends.

import { rollPlain, classifyRoll } from './core.js';

export function performWealthCheck({ creationWealth }) {
  const target = creationWealth + 10;
  const roll = rollPlain();
  const outcome = classifyRoll(roll.sum, target, false);
  const loss = outcome === 'catastrophic-failure'
    ? 2
    : (outcome === 'failure' ? 1 : 0);
  return { target, roll, outcome, loss };
}

/* What a character simply has, before any dice are involved.
 *
 * Measured against the Wealth Level they actually bought, never against
 * what is left of the creation pool. Spending yourself to 0 stops the
 * rolling; it does not take away your own flashlights.
 *
 *   two or more Levels below    free, unlimited
 *   at your Level or one below  free, up to creationWealth of them, then a roll
 *   above your Level            no roll - take it, and the pool goes to 0
 *
 * Black market goods are exempt from the free bands entirely. However
 * cheap the thing is, somebody still has to be willing to sell it to you,
 * so they always cost something whatever the numbers say.
 */
export function freeBand({ creationWealth, itemWealth, blackMarket }) {
  if (blackMarket) return itemWealth > creationWealth ? 'splurge' : 'roll';
  if (itemWealth <= creationWealth - 2) return 'unlimited';
  if (itemWealth <= creationWealth) return 'limited';
  return 'splurge';
}
