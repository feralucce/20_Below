# Core Mechanic

## Attributes

Three base attribute categories:

| Attribute | Domain |
|---|---|
| Body | Physical |
| Mind | Mental |
| Soul | Soul |

Attributes are scored **1-10** (1 = lowest, 10 = highest).

## Character Capabilities

- **Skills** — learned abilities. Scored 1-10.
- **Perks** — small advantages, greater than a skill but not extraordinary. Have **no levels or ranks** — a character either has a Perk or doesn't. Usually a rule exception or unlocked narrative option rather than a numeric bonus. See [perks.md](perks.md).
- **Gifts** — abilities that make a character truly exceptional. Scored **1-5**, not 1-10 — each Gift is unique/narrow in scope, and each of its 5 levels is a specific, cumulative, defined capability (World of Darkness Discipline-style). See [gifts.md](gifts.md).

## Resolution

To perform a task:

1. Add the relevant **Attribute** to the relevant **secondary score** (Skill/Gift). This total is the **target number**, ranging from 1-20 (unmodified).
2. Roll **1d20**. Roll the target number **or lower** to succeed ("roll under").

### Modifiers

The GM may apply a flat modifier of **-5 to +5** to the target number.

- Positive modifiers raise the target number (easier).
- Negative modifiers lower the target number (harder).
- Each point of modifier is worth exactly **5% probability**, since the die and the target scale are both 1-20 (1:1 correspondence). A ±5 modifier is therefore a ±25 percentage-point swing — meaningful, but not so large that it trivializes a roll except at the natural extremes of the target range.
- The modified target number is clamped to **1-20** for the purposes of rolling, but see Critical Results below — the extremes stay "live" regardless of clamping.

### Advantage / Disadvantage

A separate, binary tool from flat modifiers. Reserved for specific triggers (e.g. certain Gifts, called shots, or GM calling a situation "genuinely uncertain") rather than everyday circumstance stacking.

- **Advantage**: roll 2d20, take the lower result.
- **Disadvantage**: roll 2d20, take the higher result.
- Does not stack — multiple sources of advantage (or disadvantage) still just apply once. If a roll has both advantage and disadvantage from different sources, they cancel and the roll is made normally (default assumption — confirm if a different interaction is wanted).

### Critical Results

Regardless of modifiers or the clamped target number:

- **Natural 1** = critical success, always.
- **Natural 20** = critical failure, always.

This keeps a 5% chance of critical success and a 5% chance of critical failure "live" at every roll, even when the modified target number is pushed below 1 (normally impossible) or above 20 (normally automatic).

**Extra effects beyond the auto-success/auto-failure are narrated by the GM.** The system is purposely designed around social interaction and GM authority over the fiction, so there is no fixed mechanical table for what a critical result does on top of succeeding/failing — the GM narrates a fitting extra effect (a boon on a crit success, a complication on a crit failure) in the moment.

**Combat is the exception.** Combat has its own fixed critical effects rather than pure GM narration:

- **Critical success**: double damage, plus an additional GM-narrated effect.
- **Critical failure**: effect TBD (see [combat.md](combat.md), deferred until after skills are finished).
- **Called shots** impose a difficulty modifier (exact value TBD, see [combat.md](combat.md)).

## Resisted Rolls

Some rolls aren't against a static difficulty — they're opposed by another character actively resisting (e.g. a Gift used against an unwilling target, a grapple, a social contest of wills). Resisted Rolls reuse the standard roll: no new dice mechanic, just a way to compare two normal rolls against each other.

1. Both sides build a target number as normal (Attribute + Skill/Gift/Perk-adjacent bonus + any modifiers) and roll 1d20 against it.
2. Each side computes their own **margin**: `margin = target number − die result`.
   - A successful roll (die ≤ target) produces a positive margin — the further under your target you rolled, the bigger it is.
   - A failed roll (die > target) produces a negative margin — the further over your target you rolled, the more negative it is.
3. **Whoever has the higher margin wins the contest** — regardless of whether either roll was technically a success or a failure. Succeeding by a lot beats succeeding by a little; even a narrow failure beats a bad one. This means it's possible for two failing rolls to still resolve a contest (the side that "almost made it" wins), and a strong success always beats a failure.
4. Critical results override margin, same hierarchy as normal rolls:
   - A natural 1 (critical success) wins outright over anything except another natural 1.
   - A natural 20 (critical failure) loses outright to anything except another natural 20.
   - If both sides land the same critical result, or margins are exactly tied, **the defender wins ties** — the side being resisted needs to actually overcome the resistance, not just match it. ("Defender" = whichever side didn't initiate the contest; GM calls it if that's ambiguous.)

Advantage/Disadvantage and flat modifiers apply per side as normal before the margin is computed — a side rolling with Advantage just resolves their own 2d20-take-lower first, then that becomes the die result used for their margin.

## Open Questions

- Do advantage and disadvantage from different sources cancel, or does disadvantage override advantage (or vice versa)?
- Full list of triggers that grant advantage/disadvantage.
- Combat critical failure effect, and the exact called-shot difficulty modifier — deferred to combat design.
