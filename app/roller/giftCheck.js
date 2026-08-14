// The Gift Check (see gifts.md#resolution): a resource-risk roll, 2d10
// against current Ki + Stamina, roll-under. Success is free; failure costs
// 1 Ki. Deliberately its own distinct roll type - no critical
// success/failure, no Lucky Number (both confirmed as core-roll-only,
// not extended to the Gift Check).

import { rollPlain } from './core.js';

export function performGiftCheck({ ki, stamina }) {
  const target = ki + stamina;
  const roll = rollPlain();
  const outcome = roll.sum <= target ? 'success' : 'failure';
  return { target, roll, outcome, kiCost: outcome === 'failure' ? 1 : 0 };
}
