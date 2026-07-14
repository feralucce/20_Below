# Core Mechanic

## Attributes

Three base attribute categories:

| Attribute | Domain |
|---|---|
| Body | Physical |
| Mind | Mental |
| Soul | Soul |

Attributes are scored **1-10** (1 = lowest, 10 = highest).

## Power Level

**Power Level** is a fourth statistic, separate from Body/Mind/Soul, that governs magnitude when using [Gifts](gifts.md) (Power Level + Attribute vs. roll-under d20). It is scored **1-10**, same scale as the three core Attributes.

Critically, **Power Level is its own independently-assigned statistic — not a "figured" characteristic derived or calculated from Body, Mind, Soul, or any combination of them.** It's bought and advanced on its own, the same way an Attribute is.

(Name is a placeholder — see [gifts.md](gifts.md) Open Questions.)

## Calculated Defensive Traits

Three fixed-formula traits, one per Attribute, each `Attribute ÷ 2 (round up)`. Not purchased, not rolled — computed once and updated when the underlying Attribute changes, the same way Initiative is a fixed formula rather than a negotiated Skill+Attribute pairing. Deliberately scaled small (1-5 for Attribute 1-10) because they're compared against **Degree of Success**, not against a fresh d20 roll, and DoS realistically clusters in the single digits — a trait drawn from the full 1-20 scale (like Power Level + Attribute) would make hitting anyone nearly impossible.

This gives every Attribute a matching defensive trait, without overloading any one of them:

| Attribute | Defensive Trait | Formula | Governs |
|---|---|---|---|
| Body | **Health Levels** (HP pool) | 5 × Body (see [combat.md](combat.md#health-levels--confirmed)) | Physical punishment absorbed before going down |
| Mind | **Defense** | Mind ÷ 2, round up | Whether a physical attack connects at all |
| Soul | **Resolve** | Soul ÷ 2, round up | Resistance to Soul-targeted impositions — fear, domination, charm, corruption, possession, and similar mind/spirit-affecting effects |

**How Defense and Resolve resolve an attack**: the attacker/imposer rolls once, normally, and computes DoS. If **DoS ≥ the target's Defense (or Resolve)**, the effect connects; if DoS < Defense/Resolve, it doesn't — no second roll from the defending side. The tie case (DoS exactly equal to Defense/Resolve) is a hit, per [ties go to the aggressor](#rounding--ties). This replaces a Resisted Roll for the common case of one character imposing something on another.

**Resisted Rolls are still used**, but now reserved for genuinely mutual contests where both sides are actively straining against each other (a Grapple, a contest of wills) rather than every one-sided attack or imposition. Individual Gifts may still specify a full Resisted Roll instead of the Resolve default where that fits better — **decided case by case, not as a blanket rule** (see [gifts.md](gifts.md)).

**Soak** (armor-driven damage reduction, applied after a hit connects via Defense) is conceptually gear-based, not Attribute-derived — see [combat.md](combat.md) for the reasoning. Not yet numerically designed; waiting on an equipment subsystem.

## Spark — confirmed

A **binary, table-wide resource** — a single checkbox per player, not a pool (contrast with [Pre-Rolled Combat Dice](combat.md#pre-rolled-combat-dice--confirmed), which *is* a pool). Every player starts each session with Spark checked. This is the answer to the combat.md TODO on forcing the GM's hand with a banked roll.

**Spending Spark** does one of the following, then it's checked off until regained:

1. **Force one of your own bad banked rolls onto the GM.** Hand the GM one of the results from your own Pre-Rolled Combat Dice bank; they must use it for the roll in question instead of their own banked/live result. Declare it **after the roll is attempted but before its effect resolves** — you know a roll is happening and can see how the fiction is shaping up, but you're committing Spark before the numeric outcome is revealed, not after seeing it and deciding it's bad for you. **Combat-only**, since it depends on the bank existing.
2. **Grant yourself Advantage** on a d20 roll (2d20, take lower, per the core Advantage rule above). Not combat-restricted — usable on any roll, in or out of combat.
3. **Give one of your banked Pre-Rolled Combat Dice results to another player**, adding it to their bank. **Combat-only**, same reason as #1.

**Bank access is restricted to combat and to Spark spends** — outside of combat, and outside of spending Spark, players don't touch the Pre-Rolled Combat Dice bank at all.

**Regaining Spark** (confirmed): refills automatically at the **start of each session**, same timing as the Pre-Rolled Combat Dice bank reset. If a player has already spent their Spark mid-session, the **GM may hand it back** for standout roleplay, heroism, or clever play — discretionary, no fixed formula, judged in the moment (same model as D&D 5e Inspiration; the DMG's rough pacing guideline is about once per session per player).

**Overflow** (confirmed): Spark is binary, so a character can't hold two. Any time a character would gain Spark while already holding it — in practice, a GM award landing on a full character — they gain **Advantage on their next roll** instead, per the numeric [Advantage/Disadvantage](#advantage--disadvantage--confirmed) rule above (+1 to that roll's net).

**Open questions**:
- Does unspent Spark carry over indefinitely session to session, or is there ever a reason to cap/reset it beyond "always topped up at session start"?

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

### Advantage / Disadvantage — confirmed

A separate tool from flat modifiers. Reserved for specific triggers (e.g. certain Gifts, called shots, spending [Spark](#spark--confirmed), or GM calling a situation "genuinely uncertain") rather than everyday circumstance stacking.

**Stacking is numeric; the roll itself stays binary.** Each source of Advantage is worth **+1**, each source of Disadvantage is worth **-1**. Sum every source that applies to the roll into one net value:

- **Net positive** → roll with Advantage: 2d20, take the lower.
- **Net negative** → roll with Disadvantage: 2d20, take the higher.
- **Net zero** → roll normally, 1d20 (equal sources cancel out).

Only the sign matters, not the magnitude — three sources of Advantage against two of Disadvantage nets to +1, which is an ordinary single Advantage roll (2d20 take lower), not a stronger one. There's no "double Advantage"; the count just decides which side of zero, if either, the roll lands on.

#### Advantage Trigger Examples — non-exhaustive

Compiled from situational-bonus mechanics across the systems referenced elsewhere in this project (OWoD, Pathfinder 1e, Call of Cthulhu 7e, Exalted, Adventure!, Scion, Pendragon, Hero System, Rifts). This list is **illustrative, not exclusive** — the GM can recognize any other genuinely fitting trigger as it comes up in play, same spirit as the existing "GM calls a situation genuinely uncertain" trigger. Already-confirmed mechanical triggers (Specialty match, spending Spark, Spark overflow, Charge, Brace/Aim, Help/Assist, attacking a Prone target, winning Trip/Shove) aren't repeated here.

- **Positional / Tactical**
  - Flanking a target with an ally on the opposite side.
  - Fighting from higher ground or otherwise favorable terrain.
  - Attacking an unaware or surprised target.
  - Using your own cover to set up a shot the target can't easily answer.
- **Teamwork**
  - An ally actively assisting outside of combat (the non-combat counterpart to Help/Assist).
- **Preparation / Right Tool**
  - Having exactly the right tool or equipment for the task at hand.
  - A favorable environment or setup for the task (a proper workshop vs. improvising in the field).
- **Narrative / Roleplay-Driven**
  - A vividly or cleverly described action ("stunting," Exalted/Scion/Adventure!-style) — rewards descriptive engagement, distinct from the GM's general "genuinely uncertain" call.
  - A character's Passion, Flaw, or defining motivation directly driving the moment (Pendragon-style).
- **Morale / Inspiration**
  - Being rallied by an ally's Leadership-type Skill use, distinct from a single-target Help/Assist.

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

## Degree of Success / Degree of Failure

Every roll produces more than a binary pass/fail — it produces a magnitude, computed with a single formula:

```
Degree = target number − die result
```

- If **Degree ≥ 0** (die ≤ target, a success), it's your **Degree of Success (DoS)** — always a positive number (zero counts as a bare, minimal success). The further under your target you rolled, the higher your DoS, and the more decisive/impressive the success.
- If **Degree < 0** (die > target, a failure), it's your **Degree of Failure (DoF)** — always a negative number. The further over your target you rolled, the more negative your DoF, and the worse the failure.

Because it's one signed number line, DoS and DoF can always be compared directly — higher is simply better, no separate rules needed for comparing a success to a failure. This isn't just flavor: it's what Resisted Rolls compare (below), and it's expected to drive magnitude of effect elsewhere in the system (e.g. combat initiative, combat damage) as those subsystems get built.

## Resisted Rolls

Some rolls aren't against a static difficulty — they're opposed by another character actively resisting. Since [Defense and Resolve](#calculated-defensive-traits) now handle the common one-sided case (an attack or imposition against an unwilling target), Resisted Rolls are reserved for genuinely **mutual** contests — both sides actively straining against each other (a Grapple, a contest of wills) — plus any specific Gift that calls for one on a case-by-case basis. Resisted Rolls reuse the standard roll: no new dice mechanic, just a way to compare two normal rolls against each other using Degree of Success/Failure.

1. Both sides build a target number as normal (Attribute + Skill/Gift/Perk-adjacent bonus + any modifiers) and roll 1d20 against it.
2. Each side computes their own **Degree** (DoS if positive, DoF if negative) as defined above.
3. **Whoever has the higher Degree wins the contest** — regardless of whether either roll was technically a success or a failure. Since DoF is always negative, a real success always beats a failure, but between two failures the less-negative one (the "almost made it" side) still wins.
4. Critical results override Degree, same hierarchy as normal rolls:
   - A natural 1 (critical success) wins outright over anything except another natural 1.
   - A natural 20 (critical failure) loses outright to anything except another natural 20.
   - If both sides land the same critical result, or DoS/DoF are exactly tied, **the aggressor wins ties** — see [Rounding & Ties](#rounding--ties). ("Aggressor" = whichever side initiated the contest; GM calls it if that's ambiguous.)

Advantage/Disadvantage and flat modifiers apply per side as normal before DoS/DoF is computed — a side rolling with Advantage just resolves their own 2d20-take-lower first, then that becomes the die result used for their DoS/DoF.

## Rounding & Ties

Two universal conventions, used anywhere the system needs them, not just in the specific rules that first introduced them:

- **Always round up.** Any time a calculation produces a fraction (e.g. Dodge's ×1.5 DoS, or a Health Level's HP), round up. One rounding rule everywhere, no case-by-case exceptions.
- **Ties go to the aggressor** (superseded 2026-07-13; was "ties go to the defender"). Applies anywhere the system produces a tie, not just Resisted Rolls — including a plain attack roll landing DoS exactly equal to the target's Defense/Resolve (see [Calculated Defensive Traits](#calculated-defensive-traits)): that's a hit, not a miss. "Aggressor" = whichever side initiated the roll/contest; where there's no clear aggressor (e.g. a multi-way tie), the GM calls it. Deliberately keeps the same "unusual, not textbook-RPG" character as rounding up and rolling low: this system already breaks from the norm in the attacker's favor in two other places, so ties join them instead of reverting to the more conventional defender-favored default.

## Open Questions

- Combat critical failure effect, and the exact called-shot difficulty modifier — deferred to combat design.

## Resolved

- **Advantage/disadvantage stacking** (2026-07-13): numeric, not override-based — see [Advantage/Disadvantage](#advantage--disadvantage--confirmed) above.
- **"Full list of triggers" resolved as deliberately non-exhaustive** (2026-07-14): rather than a closed list, [Advantage Trigger Examples](#advantage-trigger-examples--non-exhaustive) above compiles illustrative triggers pulled from the systems referenced elsewhere in this project; the GM can recognize other fitting triggers as they arise in play.
