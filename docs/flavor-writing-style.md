# Flavor Writing Style Rules

Applies to all narrative/flavor prose in this project (Gift intros, Gift level Capability
text, and similar descriptive writing) — not to mechanical text (Action/Range/Duration/
Resolution columns, rule definitions, numbers).

**Origin**: identified 2026-07-15 during a review of the first full Gift-catalog flavor
pass. The original prose was serviceable but had a recognizable set of AI-writing tics,
confirmed by direct, honest self-assessment rather than the user pointing them out first.
This file exists so every future batch gets checked against the same list instead of the
tics quietly creeping back in over a long run of similar entries.

## Rules

1. **No em dashes.** Not "rare," not "one per entry" — zero. Use a period, a comma, or a
   colon instead. Em dashes were the single most overused device in the original pass.
2. **Short sentences.** Break up compound/run-on sentences. If a sentence has two or more
   clauses joined by "and," "but," or a dash, look hard at whether it should be two
   sentences instead.
3. **Concrete detail over vague intensifiers.** Cut words like "genuinely," "really,"
   "actually," "real," "true," "quiet," "natural" when they're doing no work except
   inflating the sentence. Replace vague claims ("a genuinely useful trait") with a
   specific image (claws, gills, a name, a number, a place).
4. **Vary sentence openings.** Don't start consecutive entries (or consecutive sentences
   within one entry) the same way. Watch specifically for "Something about you...",
   "X isn't quite Y...", and starting every Level 1 with "You can sense/notice/feel...".
5. **No formulaic triads.** Avoid the "X, Y, or Z" escalating-list pattern as a default
   sentence shape. One well-chosen concrete detail beats three vague ones.
6. **No repeated sentence architecture across entries.** If two Gifts in the same batch
   land on the same sentence shape (even with different words), rewrite one of them.

## Process

- Work through [premade-gifts.md](../rules/premade-gifts.md) in **batches of 4 Gifts**
  (intro line + all 5 level entries per Gift).
- Present each batch before writing it into the file, per the project's usual
  propose-then-confirm workflow.
- **After every batch, re-check the batch against this file** before moving to the next
  one — re-read the 6 rules above and verify the batch just written doesn't violate any
  of them, rather than assuming the earlier good result holds automatically.
- **This batches-of-4 process is for a pure prose/style pass** (no mechanics changes).
  For the deeper concrete-mechanics review, use the ruleset below instead.

## Gift-by-Gift Concrete-Mechanics Review Ruleset

**Added 2026-07-16.** Governs the deeper review pass that replaces vague narrative
effects ("harm barely registers," "more reliably now") with real mechanics: a bolded,
named sub-ability per level plus a number drawn from the system's existing vocabulary,
not an invented one-off subsystem.

- **One Gift at a time.** Not batches. Each Gift gets its own proposal and its own
  confirmation before moving to the next one — corrected 2026-07-16 after an attempt to
  batch 4 Gifts together.
- **Check for overlap first.** Before rewriting a Gift's mechanics, check whether its
  capability now genuinely duplicates another Gift's, not just shares a theme or flavor
  word. If it does, resolve the overlap (merge, differentiate, or split) before finalizing
  the rewrite, the same way the 2026-07-16 cross-catalog audit did. If it doesn't, say so
  and move on rather than merging on flavor resemblance alone.
- **Propose, then write.** Present the rewritten levels before editing the file. Wait for
  confirmation. **Overridden 2026-07-16 for the full-catalog mechanics pass**: user opted
  for an autonomous run (write directly, no per-Gift confirmation) followed by one
  consolidated report, then a separate monitored review pass afterward. Default back to
  propose-then-write for any future one-off Gift work outside that specific pass.
- **Reuse existing mechanics, don't invent new ones.** Prefer the system's own vocabulary
  (the [1/3/5 DoS/DoF bonus-penalty steps](../rules/core-mechanic.md#degree-of-success--degree-of-failure),
  Advantage/Disadvantage, Soak, Resisted Rolls, Defense/Resolve) over a bespoke number or
  subsystem unique to one Gift.
- **Check the finished entry against the 6 style rules above** before moving on, same
  requirement as the prose-only pass.
- **Update [gift-review-progress.md](gift-review-progress.md) after each Gift** is
  confirmed and written, not batched up for later.
- **Anti-drift protocol, added 2026-07-16**: re-read this entire file immediately before
  drafting each Gift's rewrite, not just at the start of the session. A long run of
  similar entries is exactly how the original em-dash/triad/vague-intensifier tics crept
  in the first time, and exactly how a mechanics pass could quietly drift off the
  established power level the same way.
- **Match the established power level.** Numbers should land in the same range as the
  Gifts already reviewed (Unseen's -1/-3/-5 DoS, Marked for the Hunt's +1/+3/+5 DoS,
  Undying Fury's and Untouchable's own +1/+3/+5 and -1/-3/-5 DoS steps): a Level 1 is a
  small, situational edge, a Level 3 is a real, reliable capability, a Level 5 is a
  scene-defining, near-absolute one. No Gift's Level 5 should casually outclass another
  reviewed Gift's Level 5 in the same lane (offense, defense, utility) without a specific
  reason.
- **Soak is Bulwark-exclusive.** Per [core-mechanic.md](../rules/core-mechanic.md#calculated-defensive-traits),
  Soak comes from the Bulwark Gift alone, not a general equipment/toughness subsystem. Use
  the DoS-penalty convention (attacks against a target suffer -1/-3/-5 DoS) for any other
  Gift's damage-resistance effect instead of granting it Soak too.
- **Offensive Gifts deal damage via the Weapon Base table**, per
  [combat.md](../rules/combat.md#damage--confirmed): a Level 3 attack effect uses **Base
  +3** (Light), Level 4 uses **Base +6** (Martial), Level 5 uses **Base +9** (Ordnance,
  can spill across Health Levels), resolved as an Attack vs. the target's **Defense**, not
  Resolve, since physical damage is a Body-adjacent effect, not a Soul-targeted one.
  Resolve is reserved for effects that impose fear, domination, charm, or a similar
  Soul-targeted effect instead of raw damage.
