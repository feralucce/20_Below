// Wealth at Character Creation (see resources.md#wealth-at-character-creation):
// 2d10 against creation-Wealth + (10 - gap), roll-under, standard critical
// results apply. The character always gets the item either way; the roll
// only decides whether creation-Wealth drops, by the gap and by at least 1
// on any failure, doubled on a catastrophic failure.
//
// The target used to be a flat creation-Wealth + 6, which meant the item's
// price never entered the roll at all: Wealth 5 had identical odds on a
// pocketknife and a helicopter and failed both nearly half the time. The
// gap is in the target now, so reaching one Level up is easy and reaching
// three is a gamble - the same shape the Resource Index gives the general
// Pushing a Resource check.
//
// A negative gap counts as zero. An item at or below your Level is meant to
// be free (see freeBand below); a roll only happens there once that band's
// free allowance is spent, and it should not beat the target's own ceiling.
//
// Distinct from the general Pushing a Resource check (see resourceCheck.js),
// which uses a GM-set Difficulty and never grants the thing on a failure -
// that rule is unchanged and still applies to every Wealth push once
// character creation ends.

import { rollPlain, classifyRoll } from './core.js';

export function performWealthCheck({ creationWealth, gap }) {
  const reach = Math.max(0, gap);
  const target = creationWealth + (10 - reach);
  const roll = rollPlain();
  const outcome = classifyRoll(roll.sum, target, false);
  const failed = outcome === 'failure' || outcome === 'catastrophic-failure';
  const flooredLoss = Math.max(1, reach);
  const loss = failed ? (outcome === 'catastrophic-failure' ? flooredLoss * 2 : flooredLoss) : 0;
  return { target, roll, outcome, loss };
}

/* What a character simply has, before any dice are involved.
 *
 * Two bands, and the wide one is the point: past a certain distance below
 * your Level a thing stops being a purchase at all. A Wealth 5 character
 * does not count flashlights.
 *
 *   two or more Levels below    free, unlimited
 *   at your Level or one below  free, up to creationWealth of them
 *   above your Level            a Wealth Check
 *
 * Black market goods are exempt from every part of this. However cheap the
 * thing is, somebody still has to be willing to sell it to you, so this
 * returns 'roll' for them whatever the numbers say.
 */
export function freeBand({ creationWealth, itemWealth, blackMarket }) {
  if (blackMarket) return 'roll';
  if (itemWealth <= creationWealth - 2) return 'unlimited';
  if (itemWealth <= creationWealth) return 'limited';
  return 'roll';
}
