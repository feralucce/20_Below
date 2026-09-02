// Wealth at Character Creation (see resources.md#wealth-at-character-creation):
// 2d10 against creation-Wealth + a flat Difficulty 6, roll-under, standard
// critical results apply. Every purchase during creation requires this
// roll now, even an item at or under current creation-Wealth (gap can be
// zero or negative in that case) - the character always gets the item
// either way, the roll only decides whether creation-Wealth drops, floored
// at a minimum of 1 on any failure (doubled on a catastrophic failure).
// Distinct from the general Pushing a Resource check (see
// resourceCheck.js), which uses GM-set Difficulty and never grants the
// thing on a failure - that rule is unchanged and still applies to every
// Wealth push once character creation ends.

import { rollPlain, classifyRoll } from './core.js';

export function performWealthCheck({ creationWealth, gap }) {
  const target = creationWealth + 6;
  const roll = rollPlain();
  const outcome = classifyRoll(roll.sum, target, false);
  const failed = outcome === 'failure' || outcome === 'catastrophic-failure';
  const flooredLoss = Math.max(1, gap);
  const loss = failed ? (outcome === 'catastrophic-failure' ? flooredLoss * 2 : flooredLoss) : 0;
  return { target, roll, outcome, loss };
}
