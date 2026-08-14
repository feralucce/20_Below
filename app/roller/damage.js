// Weapon/Gift damage dice pools and the Passive Wall Triad's per-die
// resolution (see rules.md#the-passive-wall-triad---soak-presence-psyche,
// rules.md#ki-infusion, rules.md#health-levels). Pure logic, no DOM.

import { rollD10 } from './core.js';

// Ki Infusion boosts are committed blind, before any dice are rolled - the
// caller passes which die indices (0-based) are boosted, decided before
// this function ever generates a result. `boostAmount` is the attacker's
// own matching sub-stat (Ferocity for Physical, Presence for Social,
// Psyche for Mental), added to that specific die's raw result. Die ≤ wall
// is absorbed; die > wall connects - a wall of 10 guarantees 0% connect
// on an unboosted die, true full negation.
export function rollDamagePool({ diceCount, wall, boostedDice = [], boostAmount = 0 }) {
  const boosted = new Set(boostedDice);
  const dice = [];
  for (let i = 0; i < diceCount; i++) {
    const raw = rollD10();
    const isBoosted = boosted.has(i);
    const result = isBoosted ? raw + boostAmount : raw;
    dice.push({ raw, boosted: isBoosted, result, connects: result > wall });
  }
  const connectCount = dice.filter((d) => d.connects).length;
  return { dice, wall, connectCount };
}

// Applies connecting dice to a Health Level or Sanity Level track, honoring
// the crossing-zero throttle (rules.md#health-levels): a single attack can
// never carry the track straight past 0 from positive - excess connecting
// dice beyond what it takes to reach exactly 0 are discarded. Once the
// track is already at or below 0, any further connecting attack removes
// only 1 more Level total, regardless of how many dice connected.
export function applyThrottledDamage(current, connectCount) {
  if (connectCount <= 0) return current;
  if (current > 0) {
    return Math.max(0, current - connectCount);
  }
  return current - 1;
}

// Poise has no negative range at all (rules.md#poise): it floors hard at
// 0, and once there, further connecting Social dice have no effect -
// unlike Health/Sanity, which still lose 1 more Level per further attack
// once already at or below 0.
export function applyPoiseDamage(current, connectCount) {
  if (current <= 0) return current;
  return Math.max(0, current - connectCount);
}
