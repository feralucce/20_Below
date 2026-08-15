// Pushing a Resource (see resources.md#pushing-a-resource): 2d10 against
// Resource Level + Difficulty, roll-under, same Difficulty Chart as any
// other roll. Unlike the Gift Check, this uses the ordinary critical
// success/failure rule (no Skill Tier involved, so never widened) - a
// character always gets what they were after either way; the roll only
// decides whether the Resource takes a temporary Level hit.

import { rollPlain, classifyRoll } from './core.js';

export function performResourceCheck({ resourceLevel, difficulty }) {
  const target = resourceLevel + difficulty;
  const roll = rollPlain();
  const outcome = classifyRoll(roll.sum, target, false);
  const resourceReduced = outcome === 'failure' || outcome === 'critical-failure';
  return { target, roll, outcome, resourceReduced };
}
