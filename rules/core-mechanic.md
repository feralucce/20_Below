# Core Mechanic

## Attributes

Three base attribute categories:

| Attribute | Domain |
|---|---|
| Body | Physical |
| Mind | Mental |
| Soul | Soul |

Attributes are scored **1-10** (1 = lowest, 10 = highest).

**XP cost to raise an Attribute during Advancement, confirmed 2026-07-14**: `current rating × 9`. Deliberately the single most expensive scaling cost anywhere in the system — more than Power Level (×7) or a Gift level (×5) — because an Attribute touches nearly everything: Health Levels, Defense, Resolve, Initiative, Speed, every Skill roll via pairing, and Descriptors. Raising an Attribute from 1 to 10 costs `9 × (1+2+...+9)` = **405 XP** total. See [docs/TODO.md](../docs/TODO.md#advancement-xp-economy--character-progression-post-creation) for the still-open question of how much XP a character actually earns to spend against this.

### Descriptors — confirmed

**Resolved 2026-07-14**: for **every point invested in an Attribute, the character gains one Descriptor** — a short player-chosen word or phrase capturing one specific flavor of that Attribute for this character. Example: Body 3 might be *Agile, Fast, Durable* — three distinct physical qualities, not three copies of "strong." A character doesn't have to spend every Descriptor on a different flavor, but the more varied the set, the more situations it covers.

**Descriptors are how a player argues a [Skill+Attribute pairing](skills.md#skills-are-not-attribute-locked)**: instead of improvising a justification from scratch each time, the player points to one of their character's own chosen Descriptors as the concrete hook — "I'm using Body here because I'm being *Agile*," not just "I'm using Body because it feels right." This doesn't replace the GM's final say on whether the pairing fits the situation (still re-argued per attempt, not banked as precedent, per the existing rule) — it grounds the argument in a pre-established character fact instead of a fresh improvisation every time.

**No reassignment, confirmed 2026-07-14**: Descriptors are **free at character creation** (one per Attribute point, no separate cost) and **fixed once chosen** — a character doesn't get to drift away from a Descriptor later.

**Buying an extra Descriptor, confirmed 2026-07-14**: after creation, a character can gain an **additional** Descriptor on an Attribute they already have **without raising the Attribute's score** — a standalone XP purchase, priced below the cost of a full Attribute raise, that adds versatility (another angle to argue a Skill+Attribute pairing from) without touching the underlying number. This is separate from — and cheaper than — the "raise the Attribute, gain a Descriptor" path above; a player who just wants more ways to justify pairings doesn't have to pay the full Attribute-raise price to get one. **Cost, confirmed 2026-07-14**: `current number of Descriptors on that Attribute × 1` XP — deliberately cheap and gently scaling, nowhere near the ×9 cost of an actual Attribute raise.

**Power Level** is a fourth statistic, separate from Body/Mind/Soul, that governs magnitude when using [Gifts](gifts.md) (Power Level + Attribute vs. roll-under d20). It is scored **1-10**, same scale as the three core Attributes.

Critically, **Power Level is its own independently-assigned statistic — not a "figured" characteristic derived or calculated from Body, Mind, Soul, or any combination of them.** It's bought and advanced on its own, the same way an Attribute is.

**Unlike Attributes/Skills/Perks/Gifts, Power Level gets no dedicated pool at character creation.** **Starting value and Wildcard Point cost, confirmed 2026-07-14** (Wildcard Points, renamed from "Freebie Points" 2026-07-15): every character begins with **Power Level 1**, raised only with Wildcard Points (at creation) or XP (afterward) — **3 Wildcard Points per level**, the same rate as Perks.

**XP cost to raise Power Level during Advancement, confirmed 2026-07-14**: `current rating × 7`. Second-most-expensive scaling cost in the system, below Attributes (×9) but above a Gift level (×5) — Power Level governs the potency of *every* Gift a character has, a narrower reach than an Attribute (which touches non-Gift rolls too) but still broad within its own domain.

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

**Soak** (a flat integer, applied after a hit connects via Defense) is not Attribute-derived — it comes from the [Bulwark](gifts.md) Gift (+1 per Level, Hero System Special Effect convention: any fictional source, same fixed numbers), not a dedicated equipment subsystem. See [combat.md](combat.md#soak--confirmed) for the full mechanic.

## Resonance — confirmed

**Named 2026-07-14** (superseding the "Willpower" placeholder, which itself superseded Spark). Resonance is a **pool scored 1-20** (widened from 1-10 to 1-20, confirmed 2026-07-15 — Resonance backs *every* Gift activation plus its own spend menu, a wider footprint than a normal Attribute or Power Level, so it gets its own extended scale; starting value, regain formula, and existing spend costs below are all unchanged by the cap increase, see the note at the end of this section) — not a binary checkbox, and not every spend costs the same amount. **Starting value and acquisition, confirmed 2026-07-14**: every character begins with **Resonance 1**, raised only with Wildcard Points (at creation) or XP (afterward) — **3 Wildcard Points per level**, same rate as Power Level and Perks. It gets no dedicated creation pool, same as Power Level.

**XP cost to raise Resonance during Advancement**: `current rating × 6` (**revised 2026-07-15**, down from ×7, to account for the wider 1-20 ceiling — climbing the same number of ranks now costs less per rank than Power Level's still-×7 rate, so a longer climb doesn't compound as steeply). Originally set at ×7 to match Power Level exactly (2026-07-14): priced as a "meta" stat, not WoD's own cheap Willpower rate (×1), since it gates **all** Gift activation and backs a 10-effect toolkit reaching well beyond Gifts. Still doesn't reach Attribute's ×9 because raising Resonance only grows *pool capacity* — every individual use still costs its own 1-3 points, and the pool refills slowly, so the always-on-bonus logic that justifies Attribute's premium doesn't fully apply here.

### Spending Resonance — confirmed

**Resolved 2026-07-14**: replaces the old Spark-derived menu entirely with a full cost-tiered list. Each effect below costs a different number of Resonance points, spent from the current pool:

| Cost | Effect |
|---|---|
| 1 | Grant yourself Advantage on one roll. |
| 2 | Reroll after seeing the result. Can stack with Advantage, but if the first roll was already made at Advantage, using this on the *second* roll costs another Resonance point of its own. |
| 1 | Cancel the effects of a critical failure, turning it into a normal failure. |
| **X** | **Activate a Gift.** Every Gift costs Resonance to use — cost scales with the Gift's own Level (1-5). **In active playtesting** (started 2026-07-15), not yet locked to a single formula — see below. |
| 2 | When a hit would drop you a Health Level, spend a point to refill that Health Level instead of losing it. |
| 1 | Stabilize automatically when dying — moves a character from Incapacitated back to Suffering. |
| 1 | Gain an extra Action this round, **not** subject to the Multiple Actions penalty. Usable **once per round** only. |
| 2 | Add a d6 to your own Degree of Success. |
| 3 | Add a d6 to an NPC's Degree of Failure. |
| 3 | Force the GM to reroll a result after seeing it. |

This is a deliberate mix the old Spark menu never had: several of these are **defensive/reactive saves** (cancel a crit-fail, auto-stabilize, refill a Health Level) rather than purely proactive plays — closing the exact gap flagged when the source-system research was done (OWoD/Pathfinder/Exalted all give their Willpower-equivalents a defensive use that Spark lacked).

### Regaining Resonance — confirmed

**Resolved 2026-07-14**, addressing the fact that Resonance is a genuinely **fluid pool** — with this many cheap, frequently-useful spends, a refill scheme built only around "between adventures" would leave it dry for long stretches of play. Six regain triggers:

1. **A full night's rest** — regain `max Resonance ÷ 4, rounded up`. **Supersedes the earlier flat "1 per session" trickle** — this scales with the character's actual pool size instead of being a flat number, and ties the recovery to an in-fiction event (a real rest, GM-adjudicated the same way a "full night's rest" would be in any system with one) rather than a pure metagame session boundary. A starting character (max 1) still recovers 1; a character with max 10 recovers 3.
2. **Full refill between adventures** — a larger story boundary than a single session (a completed arc, a return to safety/downtime, whatever the GM designates as the edge of "an adventure").
3. **Discretionary GM award for standout play** — heroism, cleverness, or great roleplay grants back Resonance points mid-adventure, judged in the moment (same model as D&D 5e Inspiration) — not necessarily a full refill unless the GM says so.
4. **Compel a Flaw** (Fate Core import) — regain **1 Resonance** when the GM invokes one of a character's Flaws to create a genuine complication in the fiction and the player leans into it instead of narrating around it. Gives Flaws ongoing weight during play instead of mattering only once, at creation, for a Wildcard Point grant.
5. **Critical Success** — regain **1 Resonance** on a natural 1. A small, unconditional trickle tied to a moment of good fortune, fitting the name.
6. **Ritual / deliberate downtime** — regain **2 Resonance** for spending real in-fiction time and narrative spotlight on something that fits Resonance's framing (meditation, prayer, attunement, training). Priced above the passive/reactive triggers above since it costs the player actual scene time to invoke, not just a lucky roll or an accepted complication.

**Overflow** (confirmed, carried over from Spark): if an award would push a character above their maximum, they gain **Advantage on their next roll** instead, per the numeric [Advantage/Disadvantage](#advantage--disadvantage--confirmed) rule above (+1 to that roll's net).

### Gift Activation Cost — in playtesting

**Not yet locked to a single formula.** 2026-07-15 research pass compared several systems: Vampire/Werewolf/Changeling Discipline/Gift/Art costs are largely **flat** per activation regardless of dot level (dot rating gates scope, not cost — the closest structural match to how this game's own Gift Level already works); Hero System (END = Active Points ÷ 10) and Shadowrun (Drain = Force ÷ 2, floored) both scale cost directly with power level, but both are point-buy/energy-invested models rather than WoD-style discrete scope-gates. Rather than pick one on paper, **all three candidates go to the table**, trialed in order until one feels right:

1. **`= Level` (1,2,3,4,5)** — try first. Steepest curve; a Level-5 Gift alone can cost more than any other single Resonance spend in the game.
2. **`ceil(Level ÷ 2)` (1,1,2,2,3)** — try second. Keeps Gift activation inside the same 1-3 range as every other item on the spend menu above.
3. **Flat 1, regardless of Level** — try third. Matches the WoD Discipline precedent most directly; Gift Level does all the differentiating work, cost does none.

Whichever formula ships up playing well at the table (pacing, whether Resonance drains too fast/slow, whether high-Level Gifts feel appropriately gated) gets written back in here as confirmed. Until then, GM's call at the table on which of the three is currently being trialed.

**Open questions**:
- **Resonance's 1-20 rescale (2026-07-15)**: starting value (1), the regain formula (`max ÷ 4, round up`), and every existing spend cost above are all unchanged from the original 1-10 design — only the cap and the XP formula (now ×6, see above) moved. A pool that grows to 20 still drains proportionally slower per spend than it used to at a max of 10; whether that pacing shift is desirable, or whether the regain formula or spend costs should also be revisited to compensate, was explicitly deferred rather than decided.

## Character Capabilities

- **Skills** — learned abilities. Scored **0-10**, system-wide. Unlike Attributes (floor of 1 — everyone has *some* baseline physical/mental/spiritual capability), Skills have a **floor of 0**: a character with 0 in a Skill hasn't learned it at all and **cannot roll it** — a minimum of 1 is required to attempt anything with that Skill. See [skills.md](skills.md) for the character-creation-time cap.
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

#### Disadvantage Trigger Examples — non-exhaustive

The mirror of the Advantage list above, same sourcing and same caveat: **illustrative, not exclusive** — the GM can recognize other fitting triggers as they come up. Already-confirmed mechanical triggers (net Disadvantage forcing a live roll against the dice bank, Prone against the target's own attacks, the specific Dazed/Concussed/Grip-slips/Arm-impaired/Stumble/Team-mishap effects from Called Shots and Critical Failures, and [Multiple Actions](combat.md#multiple-actions--confirmed) — which already covers "rushing," via its per-action target penalty rather than Disadvantage) aren't repeated here, since those are already locked into combat.md rather than open triggers.

- **Positional / Tactical**
  - Being flanked by two or more opponents.
  - Fighting from lower ground or otherwise unfavorable terrain.
  - Being caught unaware or surprised (the target's own Disadvantage, as opposed to the attacker's Advantage for causing it).
  - The enemy exploiting cover you can't answer.
- **Outnumbered / Overwhelmed**
  - Being mobbed or surrounded by multiple opponents at once (Hero System, Rifts).
- **Preparation / Wrong Tool**
  - Missing or improvising without the right tool or equipment for the task.
  - A hostile or poor environment for the task (darkness, cramped quarters, a storm).
- **Narrative / Roleplay-Driven**
  - Acting directly against a character's own Passion, Flaw, or defining motivation (Pendragon-style — the inverse of a Passion driving the moment for Advantage).
  - A Flaw actively working against the character in the moment (a triggered phobia, exploited prejudice, etc.).
- **Morale / Intimidation**
  - Being intimidated or demoralized by an enemy's Leadership- or Intimidation-type Skill use, mirroring the ally-rally Advantage trigger.

**"Rushing" isn't on this list** — not dropped as a poor fit (unlike "taking extra time" on the Advantage side), but because it's already mechanized: [Multiple Actions](combat.md#multiple-actions--confirmed) already covers acting fast/rushed via its own per-action target penalty, so it doesn't need a second treatment as a Disadvantage trigger.

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
