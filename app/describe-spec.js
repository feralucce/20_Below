/* Which entries ask the player to define something, and what to ask.
 *
 * Not every Boon, Flaw or Gift does. Berserker and Battle Sense define
 * nothing - a field on those asks the player to describe an absence.
 * The ones listed here make you settle something at creation that the
 * character then carries: what the Familiar is, which weapon system
 * Special Weapons bought, what kind of animal follows you around.
 *
 * The membership of these three lists is derived from the rules text by
 * tools/derive-describe-spec.py, which can re-derive it when the text
 * moves and has a --check mode that fails if the two disagree. The
 * prompts are written by hand, because "what the rules are asking for"
 * is not something a regex can phrase.
 *
 * `count` is how many fields the entry gets. Most want one. A few scale
 * with what was actually bought - a second Animal Companion, a fourth
 * Feature - and those take a function of the purchase.
 */

const one = () => 1;

// How many tiers deep a tiered purchase went: 1/3/5/7 points -> 1..4.
function tierIndex(entry) {
  const points = entry?.points ?? 0;
  if (points >= 7) return 4;
  if (points >= 5) return 3;
  if (points >= 3) return 2;
  return 1;
}

export const BOON_DESCRIBE = {
  'Duelist': {
    prompt: 'Which weapon Category?',
    // Tier 3 names a second one.
    count: (boon) => (tierIndex(boon) >= 3 ? 2 : 1),
  },
  'Enchanting Voice': { prompt: 'Which Skill?', count: one },
  'Familiar': { prompt: 'What is it? What do you call it?', count: one },
  'Features': {
    prompt: 'Which feature?',
    // One per tier bought, up to four.
    count: tierIndex,
  },
  'Special Weapons': { prompt: 'What is it?', count: one },
  'Trained by a Master': {
    prompt: 'Which Skill?',
    count: tierIndex,
  },
};

export const FLAW_DESCRIBE = {
  'Incantations': { prompt: 'What do you have to say out loud?', count: one },
  'Pariah': { prompt: 'What category do people put you in?', count: one },
  'Shaken Confidence': { prompt: 'What happened?', count: one },
};

export const GIFT_DESCRIBE = {
  'Alternate Form': { prompt: 'What do you turn into?', count: one },
  'Animal Friendship': {
    prompt: 'What kind of animal? What is its name?',
    // Second Companion buys another, and each one is its own animal.
    count: (gift) => (gift?.adders?.includes('Second Companion') ? 2 : 1),
  },
  'Claws / Fangs': { prompt: 'What are they?', count: one },
  'Conjured Armory': { prompt: 'What do you call, and what does it look like?', count: one },
  'Cybernetics': { prompt: 'What is installed, and where?', count: one },
  'Drone Swarm': { prompt: 'What are the drones?', count: one },
  'Elemental Aura': { prompt: 'Which element, and what does it look like?', count: one },
  'Elemental Manipulation': { prompt: 'Which domain do you command?', count: one },
  'Forcefield': { prompt: 'What does it look like when it comes up?', count: one },
  'Heightened Senses': { prompt: 'Which sense?', count: one },
  'Necromancy': { prompt: 'What do your raised dead look like?', count: one },
  'Transmutation': { prompt: 'What do you change, and into what?', count: one },
};

/* The fields one entry should show right now: its prompt, and how many
 * of them, given what has actually been bought. Anything not listed
 * gets none at all, which is the point. */
export function describeFields(kind, name, entry) {
  const table = kind === 'boon' ? BOON_DESCRIBE
    : kind === 'flaw' ? FLAW_DESCRIBE
      : GIFT_DESCRIBE;
  const spec = table[name];
  if (!spec) return 0;
  const n = spec.count(entry);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export function describePrompt(kind, name) {
  const table = kind === 'boon' ? BOON_DESCRIBE
    : kind === 'flaw' ? FLAW_DESCRIBE
      : GIFT_DESCRIBE;
  return table[name]?.prompt ?? '';
}
