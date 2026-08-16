// Wealth at Character Creation (see resources.md#wealth-at-character-creation):
// 2d10 against creation-Wealth + a flat Difficulty 6, roll-under, standard
// critical results apply. The character always gets the item either way -
// the roll only decides whether creation-Wealth drops by the gap (doubled
// on a critical failure). Distinct from the general Pushing a Resource
// check (see resourceCheck.js), which uses GM-set Difficulty and never
// grants the thing on a failure.

import { rollPlain, classifyRoll } from './core.js';

export function performWealthCheck({ creationWealth, gap }) {
  const target = creationWealth + 6;
  const roll = rollPlain();
  const outcome = classifyRoll(roll.sum, target, false);
  const failed = outcome === 'failure' || outcome === 'critical-failure';
  const loss = failed ? (outcome === 'critical-failure' ? gap * 2 : gap) : 0;
  return { target, roll, outcome, loss };
}
