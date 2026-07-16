# To-Do List

A consolidated view of every open question across the ruleset, pulled from each rule doc's own "Open Questions" section. Grouped by topic so it's easy to think through in chunks. Each item links back to the doc where it lives — resolve it there when you're ready, same as everything else so far.

This file is a **summary for thinking, not a source of truth** — the individual rule docs are canonical. If this list and a rule doc's own Open Questions ever disagree, trust the rule doc and update this file to match.

## ⬆️ Pick up here next session (2026-07-15)

**Resonance widened to 1-20**; XP multiplier revised to **current × 6** (down from ×7) to account for the wider cap — starting value, regain formula, and existing spend costs stay unchanged. See Advancement section below.

**Gift activation cost in Resonance: going to playtest, not a paper decision** — all three candidates get trialed at the table in order: `= Level` (12345) first, then `ceil(Level÷2)` (11223), then flat 1. See Advancement section below and [core-mechanic.md](../rules/core-mechanic.md#gift-activation-cost--in-playtesting).

**⏸️ Revisit after the playtest**: once all three Gift-cost formulas have been tried at the table, come back here to pick one and mark it confirmed in [core-mechanic.md](../rules/core-mechanic.md#gift-activation-cost--in-playtesting), [gifts.md](../rules/gifts.md#resolved), and this file's Advancement/Gifts sections below. Don't resolve this from argument alone — wait for actual play feedback.

**Flaw cap resolved: 15 points of Wildcard Points from Flaws, max** — see [flaws.md](../rules/flaws.md#resolved) and the Flaws section below.

**Every non-Leveled Perk tagged with a Minor/Moderate/Major cost tier** — see [perks.md](../rules/perks.md#resolved) and the Perks section below.

**No in-fiction justification required for advancement** — XP spend is free-form, GM approval only. See [character-creation/overview.md](../character-creation/overview.md#resolved-creation-specific-not-already-covered-above).

**Per-level content written for all 10 Leveled (Resource) Perks/Flaws** (7 Perks: Wealth, Fringe Benefit, Contacts, Base, Notable Vehicle, Followers, Fame; 3 Flaws: Notoriety, Enemy, Hunted) — see [perks.md](../rules/perks.md#leveled-resource-perks--confirmed) and [flaws.md](../rules/flaws.md#leveled-resource-flaws--confirmed).

**The original Advancement/Gifts open-item batch from this session is now closed out except Gift activation cost**, which stays parked in playtesting (see above) until tried at the table.

**The full Gift catalog detail pass is done** — every level of every Gift now has Action/Range/Duration/Resolution plus richer flavor text, and the Resisted-Roll-vs-Resolve triage was resolved alongside it. See [premade-gifts.md](../rules/premade-gifts.md) and [gifts.md](../rules/gifts.md#resolved).

**Grafted Steel (the sole cybernetics Gift) removed** — cybernetics now has zero catalog representation, pending a decision on whether it needs its own acquisition rules before adding it back. Catalog total is now **75 Gifts**. See [premade-gifts.md](../rules/premade-gifts.md#cybernetics--note).

**New Gift creation timing and in-fiction source, both resolved 2026-07-15**: new Gifts are created only between sessions (same as new Skills, GM approval required); Gifts need no in-fiction source or origin — a character simply has one, the setting's own "the world is weird" premise doing the explanatory work instead. See [gifts.md](../rules/gifts.md#resolved).

**Only Cybernetics' fuller treatment remains open** in the Gifts section — more catalog entries, and a decision on whether cybernetics needs its own acquisition rules (surgery, cost, installation risk) instead of standard Gift creation.

**"Freebie Points" renamed to "Wildcard Points"** (2026-07-15, same mechanic) — see [design-log.md](design-log.md).

## Previous session (2026-07-13)

**Spark is resolved** *(superseded 2026-07-14 — Spark was eliminated and folded into [Willpower](../rules/core-mechanic.md#willpower--confirmed), see below)*, including overflow (already-full Spark gain converts to Advantage).

**Advantage/Disadvantage stacking is resolved**: numeric ±1 per source, net sign picks Advantage/Disadvantage/normal — see [core-mechanic.md](../rules/core-mechanic.md#advantage--disadvantage--confirmed).

**Advantage/Disadvantage vs. the bank is resolved**: net Advantage lets a character choose live-roll or a banked die; net Disadvantage forces a live roll regardless of bank status — see [combat.md](../rules/combat.md#pre-rolled-combat-dice--confirmed).

**Movement/Speed is resolved**: Speed = 5m + (Body ÷ 2, round up), a flat base plus a Body bonus rather than a pure Body-derived value, so a Body-1 character still moves at a normal walking pace — see [combat.md](../rules/combat.md#movement--speed--confirmed).

**Ties now go to the aggressor everywhere, superseding "ties go to the defender"** — see [core-mechanic.md](../rules/core-mechanic.md#rounding--ties). DoS exactly equal to Defense/Resolve is now a hit, not a miss. Consistent with the system's existing unconventional-favors-the-active-side choices (round up, roll low).

**Damage is resolved**: `Weapon Base (1-10, by weapon class) + (DoS − Defense)`; only the Weapon Base doubles on a crit (2026-07-13 correction — not the whole total). A 10-tier weapon class ladder (Unarmed through Siege/Cataclysmic) where melee and ranged weapons of comparable weight share the same base, representing real-world firearm lethality as range rather than extra damage. Only the top two tiers (Ordnance, Siege/Cataclysmic) can spill damage across Health Levels. See [combat.md](../rules/combat.md#damage--confirmed).

**Called Shot location effects are resolved and tiered by severity** — Head, Arms/Hands, Legs/Feet each get a 4-tier (Minor/Moderate/Severe/Catastrophic) effect table, keyed off leftover DoS (`DoS − Defense`, the same number driving bonus damage). Catastrophic Head kills a Standard NPC outright; against a Named NPC/PC it drains the current Health Level and spills into the next (added to the Ordnance/Siege overflow exception), with no autokill beyond the normal Incapacitated rule. Introduces a new (informal, GM-judgment) Standard vs. Named NPC distinction. See [combat.md](../rules/combat.md#special-maneuvers--confirmed).

**Combat Critical Failure is resolved**: same tier shape as Called Shot (Minor/Moderate/Severe/Catastrophic), keyed off `|DoF| = 20 − target`. Five categories (Weapon Mishap, Self-Injury, Positional, Defensive, Team), GM picks whichever fits. Non-combat crit-fails stay pure GM narration, unchanged. See [combat.md](../rules/combat.md#critical-failure--confirmed).

**A round of small Combat loose ends resolved**: Grapple's attacker Skill (Unarmed Combat); Standard vs. Named NPC formally defined; combat skill+attribute pairing confirmed free/situational like every other Skill; the 6 combat Skills finalized (no longer deferred); "Defense halved" locked for Charge/Brace; wounded Defense does NOT degrade under Health Level penalties; Incapacitated lethality now requires intentional damage, and First Aid was introduced as the first piece of Healing (restores HP = DoS, capped at Suffering). See [combat.md](../rules/combat.md#resolved-2026-07-13).

See the Combat section below for what's still open in this area.

## Previous session (2026-07-12)

**Attack/Defense/Resolve decision is resolved** — see [core-mechanic.md](../rules/core-mechanic.md#calculated-defensive-traits):
- **Defense** = Mind ÷ 2 (round up). Ordinary attacks: attacker rolls once, DoS > Defense → hit; else no damage. Replaces Resisted Rolls for one-sided attacks.
- **Resolve** = Soul ÷ 2 (round up). Same logic, for Soul-targeted Gift impositions (fear, domination, charm, etc.) — **mostly**, not absolute; some Gifts still warrant a full Resisted Roll, decided case by case.
- **Soak** (armor-driven damage reduction after a hit connects) is conceptually gear-based, not Attribute-derived — not yet numerically designed, waiting on an equipment subsystem.
- Resisted Rolls are now scoped down to genuinely mutual contests (Grapple, Trip, Escape, contests of will) plus case-by-case Gift exceptions.
- Dodge/Abort to Dodge/All-Out Attack/Haymaker/Charge/Brace all updated in `combat.md` to reference Defense instead of a rolled defense DoS.

**Still open from this decision:**
- Every Gift with an unwilling-target use case needs a case-by-case pass: does it use the Resolve default, or genuinely need a full Resisted Roll? Not started (`gifts.md` Open Questions).

**Resolved 2026-07-13**:
- **"Defense halved, round up" confirmed** as Charge/Brace's cost, not just proposed.
- **A wounded character's Defense does NOT degrade** under the Health Level penalty — Defense stays level; only the flat roll penalty (−1/−3/−5) applies to actual rolls. Deliberate: full death-spiral on top of the roll penalty would be too crippling.
- **Incapacitated lethality, partially resolved**: "any further damage kills" now requires **intentional** damage — incidental damage doesn't kill. **First Aid introduced** as the first piece of Healing: a First Aid roll restores HP equal to DoS, capped at the Suffering Health Level (can't fully heal via field first aid). Healing beyond Suffering is still undesigned.

**Health Levels** — see [combat.md](../rules/combat.md#health-levels--confirmed): Healthy (Body×2, no penalty) → Sore (Body, no penalty) → Battered (Body, −1) → Wounded (Body÷2, −3) → Suffering (Body÷2, −5) → Incapacitated (0 HP, no actions, intentional further damage kills). Total pool = 5×Body (+1 if Body is odd). No overflow between containers (except Catastrophic Head vs. a Named NPC/PC, and Ordnance/Siege weapons).

## Combat (the big one — most other systems are waiting on this)

**In active design as of 2026-07-12** — see [combat.md](../rules/combat.md) for full detail.

- [x] Round structure: roll initiative every round → declare actions in reverse initiative order → resolve in forward initiative order → repeat.
- [x] Initiative roll mechanic: roll `(higher of Body or Mind) + Perception` first (crits determined here), then apply Gift/Perk modifiers to the resulting Degree, then rank.
- [x] Declaring commits a character to a specific action and target (full commitment). Free re-declare (action + target) if a faster character's action invalidates the declared plan — no lost turn.
- [x] Round length: 3 seconds.
- [x] Action economy: **1 Move (freeform, split any way around the Action) + 1 Action (declared, with target) only — no Reaction.** Reactions were considered, then removed from the system entirely.
- [x] Pre-Rolled Combat Dice: 10 d20s banked per player at session start, spent on combat rolls in any order, mandatory before live rolling resumes, discarded at session end.
- [x] **Spark** (resolved 2026-07-13): a per-player, per-session checkbox resource, not combat-specific itself but two of its three uses depend on the combat-only dice bank — see [core-mechanic.md](../rules/core-mechanic.md#spark--confirmed). Spends: force a banked roll onto the GM, grant yourself Advantage, or gift a banked die to another player. Regains at session start, or mid-session at GM discretion for standout play (5e Inspiration model). Small open questions remain (redirecting an award when already full; how Advantage interacts with a banked roll) — flagged in the doc itself.
- [x] Actions list: Attack, Special Maneuvers (not yet defined), Use a Skill, Use a Gift, Dodge.
- [x] Dodge: multiplies the Defense trait by 1.5 (round up), costs the Action.
- [x] Abort to Dodge: same ×1.5 Defense effect, reactive (triggered when attacked before your turn), costs Move + Action (Reaction removed from its cost).
- [x] Multiple Actions: declared during Declaring as a full chain; target drops by 3×N per action (1st = −3); chain stops at first failure; expanded critical failure range starting 2nd action (natural roll ≥ 21−N auto-crit-fails).
- [x] **Special Maneuvers fully mechanized** (10, from D&D 5e/Hero 6e/White Wolf): Grapple/Trip/Escape (Resisted Rolls, status effects, no damage); Disarm/Called Shot (attack at a size-dependent target penalty); All-Out Attack/Haymaker (Dodge-style DoS ×1.5/×2, defenseless 1 round vs. until next turn); Charge/Brace/Help (grant Advantage). Disengage removed.
- [x] Called shot difficulty modifier: **size-dependent** — −5 for small/precise targets (Head, Hands), −3 for larger ones (Arms, Legs). Torso removed as an option — center of mass is the default target for any ordinary attack, no penalty.
- [x] **Called Shot location effects resolved and confirmed** (2026-07-13, superseding the earlier proposal): Head/Arms-Hands/Legs-Feet each get a 4-tier severity table (Minor/Moderate/Severe/Catastrophic) keyed off leftover DoS. No separate damage multiplier needed — severity does that job instead. Catastrophic Head: outright kill on a Standard NPC; drains + spills a Health Level on a Named NPC/PC (no autokill beyond the normal Incapacitated rule). See [combat.md](../rules/combat.md#special-maneuvers--confirmed).
- [x] **Grapple's attacker Skill is Unarmed Combat** (resolved 2026-07-13) — see [premade-skills.md](../rules/premade-skills.md#combat--confirmed).
- [x] **"Standard NPC" vs. "Named NPC/PC" formally defined** (resolved 2026-07-13): Standard NPCs are disposable rogues'-gallery/bestiary threats with no special mechanical access. Named NPCs (BBEGs, significant henchmen) use the same mechanisms as PCs **except Spark and forcing dice from the bank**. See [combat.md](../rules/combat.md#resolved-2026-07-13).
- [x] **Reactions removed entirely** — confirmed, not just flagged. Action Economy, Abort to Dodge, All-Out Attack, and Haymaker all updated accordingly.
- [x] Attack/Defense resolution: **Defense trait (Mind ÷ 2), not Resisted Rolls** — see the top of this file.
- [x] **Damage** (resolved 2026-07-13): `Weapon Base (1-10, by weapon class) + (DoS − Defense)`; only the Weapon Base doubles on a crit. Weapon Base is a 10-tier class ladder (Unarmed through Siege/Cataclysmic) where melee and ranged weapons of comparable weight share the same base — real-world firearm lethality is represented via range, not extra damage. Only the top two tiers (Ordnance, Siege/Cataclysmic), plus Catastrophic Head vs. a Named NPC/PC, can spill damage across Health Levels; every other class is capped by the existing No Overflow rule. See [combat.md](../rules/combat.md#damage--confirmed).
- [x] **Movement**: Speed = 5m + (Body ÷ 2, round up); a Move lets a character reposition up to Speed, freeform as already defined in Action Economy. Not costed as a full action — see [combat.md](../rules/combat.md#movement--speed--confirmed).
- [x] **Critical Failure resolved** (2026-07-13): combat gets a category × severity-tier table (Weapon Mishap, Self-Injury, Positional, Defensive, Team). Severity keyed off `|DoF|` (`20 − target`, simplified to always use the nat-20 case even for Multiple Actions' expanded crit-fail range), same tier bands as Called Shot's DoS tiers. GM picks whichever category fits the fiction. Social/Skill/Magical fumble tables explicitly excluded — those stay pure GM narration outside combat, per the core mechanic's existing philosophy. See [combat.md](../rules/combat.md#critical-failure--confirmed).
- [x] **Combat follows the same free skill+attribute pairing rule as everything else** (resolved 2026-07-13) — situational, re-argued per attempt, no combat-specific lock-in (e.g. a feinting melee attack could argue Mind instead of Body).
- [x] **The combat Skills are finalized, no longer deferred** (2026-07-13, revised 2026-07-13): now 4 — Melee Combat, Unarmed Combat, Firearms/Archery (merged), Special Weapons (exception Skill for a single exotic/siege-class weapon, not a broad category). Dodge/Evasion dropped as a Skill — covered by the Defense trait instead. See [premade-skills.md](../rules/premade-skills.md#combat--confirmed).
- [x] **The 3 combat-adjacent Perks are resolved** (2026-07-14): Combat Reflexes (+5 to the Initiative Degree, per the existing Perk-modifies-Degree convention), Quick Draw (readying a weapon costs no Action), Alertness (immune to Surprise, see below). See [perks.md](../rules/perks.md#combat-adjacent--confirmed).
- [x] **Surprise resolved** (2026-07-14): Advantage to attacks against the surprised character, plus -5 to their Initiative Degree for the first round of combat only; who is surprised is a GM call based on the fiction. See [combat.md](../rules/combat.md#surprise--confirmed).
- [x] **Big downstream TODO, resolved 2026-07-15**: the entire Gift catalog now has concrete mechanics (Action cost, Range, Duration, Resolution) on every level entry, plus richer flavor text. See [premade-gifts.md](../rules/premade-gifts.md) and [gifts.md](../rules/gifts.md#resolved).

## Core Mechanic

- [x] **Advantage/Disadvantage stacking resolved** (2026-07-13): each source is worth ±1, net summed, sign determines Advantage/Disadvantage/normal — see [core-mechanic.md](../rules/core-mechanic.md#advantage--disadvantage--confirmed).
- [x] **Full trigger list resolved as deliberately non-exhaustive** (2026-07-14): compiled an illustrative candidate list from OWoD, Pathfinder 1e, CoC 7e, Exalted, Adventure!, Scion, Pendragon, Hero System, and Rifts (flanking, higher ground, surprise, teamwork, right tool/environment, narrative stunts, Passion-driven moments, Leadership-style rallying) — GM can recognize others as they arise. See [core-mechanic.md](../rules/core-mechanic.md#advantage-trigger-examples--non-exhaustive).
- [x] **Disadvantage trigger list resolved the same way** (2026-07-14): mirrored candidate list — being flanked/outnumbered, unfavorable terrain, surprised, wrong tool/hostile environment, acting against a Passion/Flaw, being intimidated/demoralized. "Rushing" isn't on the list, but not dropped as a poor fit — it's already covered by the existing Multiple Actions mechanism. See [core-mechanic.md](../rules/core-mechanic.md#disadvantage-trigger-examples--non-exhaustive).

## Character Creation (the point-buy economy — largely resolved)

- [x] **Creation order and pool structure resolved** (2026-07-14): Attributes → Skills → Perks → Gifts → Flaws (grant Wildcard Points) → spend Wildcard Points. The first four are separate, siloed point pools — no cross-spending between them. Wildcard Points are the flexible final pass. See [character-creation/overview.md](../character-creation/overview.md#creation-order--confirmed).
- [x] **Addendum: Attribute Descriptors introduced** (2026-07-14): every point in an Attribute grants a player-chosen Descriptor (a specific flavor of that Attribute, e.g. Body 3 = *Agile, Fast, Durable*), and Descriptors are now how a Skill+Attribute pairing gets argued. See [core-mechanic.md](../rules/core-mechanic.md#descriptors--confirmed).
- [x] **Point cost per rank confirmed flat 1:1** (2026-07-14): 1 pool point = 1 rank, for all four dedicated pools, no scaling curve.
- [x] **Calibration step 1 done**: derived a comparable raw target number for "average human, average task" by anchoring to D&D and Hero System's shared "10 = human average" convention — three reference conversions land in a 10-13 range, recommending **10** as the working baseline (see [character-creation/overview.md](../character-creation/overview.md#calibration)). This is an input to pool sizing, not the pool size itself.
- [x] **Attribute pool size resolved** (2026-07-14): **10 points**, Attributes start at 1 each (free floor), max distributable total 13 across Body/Mind/Soul. Deliberately less than 15 (three flat "average" 5s), so an all-average build is arithmetically impossible — forces at least one above-average and one below-average Attribute, reproducing the original "one above, one average, one below" goal via the budget itself rather than hardcoded tiers. See [character-creation/overview.md](../character-creation/overview.md#calibration).
- [x] **No separate starting-creation cap on Attributes** (2026-07-14): unlike WoD's "max 3 at creation," this system only bounds Attributes by their normal min 1/max 10 range plus what the 10-point pool can afford — no redundant lower ceiling on top of that.
- [x] **Skills confirmed 0-10 system-wide (floor 0, unusable below rank 1), with a separate 6-point cap at character creation** (2026-07-14): a starting character can't begin play with a maxed-out Skill (7-10 is advancement-only). See [skills.md](../rules/skills.md#scoring--confirmed).
- [x] **Skill pool size resolved: 35 points** (2026-07-14): derived from OWoD/CoC7e/Pathfinder/Hero/Exalted starting-skill data (≈8-10 skills with real investment, at ≈60-67% of that system's starting cap) — converts to ≈9 skills at rank 4 (of the 6-point creation cap) ≈ 32-36 points, rounded to 35 to match the system's existing 1/3/5/10 numeric convention. See [character-creation/overview.md](../character-creation/overview.md#calibration).
- [x] **Perk pool size resolved: 10 points** (2026-07-14) — individual Perk costs still TBD (cost scales with strength per [perks.md](../rules/perks.md#resolved)), but the pool total is fixed regardless. See [character-creation/overview.md](../character-creation/overview.md#calibration).
- [x] **Gift pool size resolved: 8 points** (2026-07-14): checked against WoD Mage's Sphere-dot budget (5, and the acknowledged direct inspiration for the Power Level/Gift Level split), Vampire's Discipline budget (3), and Changeling's Arts/Realms budget (~5) — 8 is ~1.6× Mage's baseline, consistent with how generous the Attribute/Skill pools already are relative to WoD. Confirms the pool supports both specialization (one maxed Gift at 5 + a secondary at 3) and generalization (up to 4 Gifts at Level 2, or thinner spreads), assuming flat per-level cost. See [character-creation/overview.md](../character-creation/overview.md#calibration).
- [x] **Gift-level cost at character creation confirmed flat 1:1** (2026-07-14): 1 pool point = 1 Gift level, same convention as the other three pools. Confirms the 8-point pool's specialization/generalization math rather than that math being contingent on an assumption. See [gifts.md](../rules/gifts.md#resolved).
- [x] **Wildcard Points fully resolved** (2026-07-14, renamed from "Freebie Points" 2026-07-15): starting pool of **15** (flat, regardless of Flaws), spendable across all four categories at **Attribute 7/level (cap 2 levels), Skill 1/level (no extra cap), Perk 3/Perk (no cap), Gift 5/level (cap 3 levels)**. Flaws add to the 15 baseline: **1-7 Wildcard Points** per non-Leveled Flaw (OWoD's severity range, negotiated), or **2 × level** for the 3 Leveled (Resource) Flaws, **capped at 15 total from Flaws** (resolved 2026-07-15). The 15 baseline alone can hit either the Attribute cap (14) or the Gift cap (15) but not both. See [character-creation/overview.md](../character-creation/overview.md#calibration).
- [x] **Individual Perk costs resolved: 3-tier system** (2026-07-14): Minor 1 / Moderate 2 / Major 3 points, GM/player negotiated per Perk (same spirit as Flaw severity negotiation); Leveled (Resource) Perks are a flat 1 point/level. Assigning a tier to every specific Perk in the catalog is still a follow-up content pass, same shape as the Leveled Perk/Flaw level tables. See [perks.md](../rules/perks.md#resolved).
- [x] **No Attribute Descriptor reassignment** (2026-07-14): Descriptors are free at creation (one per Attribute point) and fixed once chosen — no drifting. A new Descriptor is only gained by raising the Attribute again, which after creation means spending XP during Advancement. See [core-mechanic.md](../rules/core-mechanic.md#descriptors--confirmed).
- **Character creation (the point-buy economy) is now fully resolved.**
- ([character-creation/overview.md](../character-creation/overview.md))

## Advancement (XP economy — character progression, post-creation)

Split out from Character Creation above (2026-07-14) since it's a genuinely separate phase — XP governs what happens *after* a character exists, not how one is built.

**XP spend costs, confirmed 2026-07-14** — a WoD-style `current rating × multiplier` scaling model, ratios deliberately weighted by how much systemic reach each category has:

| Item | Formula | X |
|---|---|---|
| Attribute | current × X | **9** (highest in the system — touches nearly everything) |
| Power Level | current × X | **7** |
| Gift level | current level × X | **5** |
| Skill | current × X | **2** |
| New Gift (0→1) | flat | **7** |
| New Skill (0→1) | flat | **3** |
| Attribute Descriptor (extra) | # descriptors × X | **1** |
| Skill Specialty (extra) | # specialties × X | **1** |
| New Perk | flat, by tier | **Tier × 3** (Minor 3 / Moderate 6 / Major 9) |
| Resonance | current × X | **6** (revised 2026-07-15, down from 7, to account for the wider 1-20 cap) — priced as a "meta" stat (gates all Gift use plus a broad toolkit) but below Attribute's ×9 since it only grows pool capacity, not an always-on bonus |

- [x] **XP cost per rank for Attributes/Skills/Perks/Gifts, resolved** (2026-07-14) — see table above and [core-mechanic.md](../rules/core-mechanic.md), [skills.md](../rules/skills.md#resolved), [gifts.md](../rules/gifts.md#resolved), [perks.md](../rules/perks.md#resolved).
- [x] **XP award rate resolved: 5 per session** (2026-07-14), via a WoD/Pathfinder-blended category checklist (Attendance, Roleplaying, Heroism, Learning, Standout Moment — 1 XP each) plus separate Pathfinder-style Story Awards for major milestones. Derived from the fact that most of our per-category costs are direct WoD imports except Attribute (×9 vs. WoD's ×4) — reusing WoD's own 5 XP/session rate means everything WoD-derived advances at WoD's pace, and Attributes land 2.25× slower automatically. See [character-creation/overview.md](../character-creation/overview.md#advancement).
- [x] **No in-fiction justification required for advancement** (resolved 2026-07-15): XP purchases are free-form, GM approval only — no training montage, mentor, or relevant in-play use needed. See [character-creation/overview.md](../character-creation/overview.md#resolved-creation-specific-not-already-covered-above).
- [x] **Spark eliminated, folded into Resonance** (named 2026-07-14, superseding an interim "Willpower" placeholder): a full cost-tiered spend menu (1-3 Resonance per effect: Advantage, reroll, cancel a crit-fail, refill a lost Health Level, auto-stabilize, a bonus Action, boost your own DoS or an NPC's DoF, force a GM reroll) replaces Spark's old flat 3-option menu entirely. See [core-mechanic.md](../rules/core-mechanic.md#resonance--confirmed).
- [x] **Resonance regain triggers resolved: 6 total** (2026-07-14): full night's rest (max ÷ 4, rounded up — supersedes the earlier flat 1/session trickle), full refill between adventures, discretionary GM award for standout play, Compel a Flaw (Fate Core import, 1 Resonance for leaning into a GM-invoked Flaw complication), Critical Success (1 Resonance on a natural 1), and Ritual/deliberate downtime (2 Resonance for spending real scene time on meditation/prayer/attunement/training). See [core-mechanic.md](../rules/core-mechanic.md#regaining-resonance--confirmed).
- [x] **Power Level and Resonance starting value + Wildcard Point cost, resolved** (2026-07-14): both start at **1** at character creation, raised only with Wildcard Points (**3/level**, at creation) or XP (afterward) — neither gets a dedicated creation pool. See [core-mechanic.md](../rules/core-mechanic.md#power-level) and [core-mechanic.md](../rules/core-mechanic.md#resonance--confirmed).
- [x] **Resonance's XP-during-advancement multiplier: current × 6** (revised 2026-07-15, down from the original ×7 set 2026-07-14, to account for the wider 1-20 cap below). See [core-mechanic.md](../rules/core-mechanic.md#resonance--confirmed).
- [ ] **Gift activation cost in Resonance — now in active playtesting** (2026-07-15), not a paper decision. All three candidate formulas go to the table in order: **1) `= Level` (1,2,3,4,5)**, **2) `ceil(Level÷2)` (1,1,2,2,3)**, **3) flat 1** regardless of Level. Whichever plays best gets confirmed. See [core-mechanic.md](../rules/core-mechanic.md#gift-activation-cost--in-playtesting).
- [x] **Resonance's scale widened from 1-10 to 1-20** (resolved 2026-07-15) — starting value, regain formula (`max ÷ 4, round up`), and existing spend costs (1-3) are all unchanged; only the cap and the XP multiplier (now ×6, see above) moved. See [core-mechanic.md](../rules/core-mechanic.md#resonance--confirmed).
- ([character-creation/overview.md](../character-creation/overview.md))

## Skills

- [x] **Genre-flagged skills (Occult, Mythos, Alchemy) ship as defaults, GM discretion to drop** (resolved 2026-07-13) — see [skills.md](../rules/skills.md), [premade-skills.md](../rules/premade-skills.md).

## Perks

- [x] **Perk cost scales with strength, not flat** (resolved 2026-07-14) — exact numbers deferred to the point/XP economy, same as Skills/Gifts.
- [x] **No cap on Perks, but acquiring one after character creation costs a premium** (resolved 2026-07-14) — premium is now quantified at **tier × 3 XP** (Minor 3 / Moderate 6 / Major 9), see Advancement section above.
- [x] **No prerequisites — a Perk grants its own standing** (resolved 2026-07-14): e.g. Fringe Benefit is what creates the license/clearance, not a reward for already having it.
- [x] **Numeric edge-case Perks resolved**: Wealth and similar are a resource/currency pool, not a roll bonus, so they don't break the "no numeric bonus" rule (resolved 2026-07-14).
- [x] **Addendum: 7 Perks (Wealth, Fringe Benefit, Contacts, Base, Notable Vehicle, Followers, Fame) now use the same 1-5 level scale as Gifts** instead of being binary (resolved 2026-07-14) — exact per-level content not yet written.
- [x] **Per-level content for the 7 Leveled (Resource) Perks, resolved** (2026-07-15) — see [perks.md](../rules/perks.md#leveled-resource-perks--confirmed) for the full level tables (Wealth, Fringe Benefit, Contacts, Base, Notable Vehicle, Followers, Fame).
- [x] **"Surprised" resolved** (2026-07-14): Advantage to attacks against the surprised character, plus -5 to their Initiative Degree for the first round of combat only. Who is surprised is a GM call based on the fiction, no dedicated roll. See [combat.md](../rules/combat.md#surprise--confirmed).
- [x] **Every non-Leveled Perk tagged with a cost tier** (resolved 2026-07-15) — all 20 non-Leveled Perks (Physical, Mental/Cognitive, Social, Combat-Adjacent) now carry a Minor/Moderate/Major tag in their table, anchored against the three tiers already fixed by example. Leveled (Resource) Perks excluded — they use their own flat 1 point/level cost. See [perks.md](../rules/perks.md#resolved).
- ([perks.md](../rules/perks.md))

## Flaws

- [x] **Flaw list compiled** (resolved 2026-07-14): sourced from OWoD, Hero System, and D&D 3.5e Flaws (numeric-penalty entries excluded, mirroring Perks' exclusion of numeric-bonus Feats). Categories: Physical, Mental/Cognitive, Social, Leveled (Resource), Combat-Adjacent. See [flaws.md](../rules/flaws.md#flaw-list).
- [x] **Addendum: Notoriety/Enemy/Hunted mirror Perks' Leveled (Resource) Perks** (resolved 2026-07-14) — 1-5 scale instead of binary, exact per-level content not yet written. See [flaws.md](../rules/flaws.md#leveled-resource-flaws--confirmed).
- [x] **Flaw economy confirmed** (resolved 2026-07-14): Flaws are taken only at character creation and grant extra build points to spend elsewhere. Since it's a one-time creation-time transaction, a Flaw is fixed for the character's lifetime once chosen — no buy-off mechanism. Points granted should scale with severity, by symmetry with Perk cost scaling — exact numbers still deferred to the point/XP economy.
- [x] **Flaw cap confirmed: 15 points of Wildcard Points from Flaws, max** (resolved 2026-07-15) — caps the total Wildcard Points Flaws can grant, not the number of Flaws; mirrors the 15-point automatic Wildcard Point baseline so Flaws can double it but never exceed it. See [flaws.md](../rules/flaws.md#resolved).
- [x] **Per-level content for the 3 Leveled (Resource) Flaws, resolved** (2026-07-15) — see [flaws.md](../rules/flaws.md#leveled-resource-flaws--confirmed) for the full level table (Notoriety, Enemy, Hunted).
- ([flaws.md](../rules/flaws.md))

## Gifts

- [x] **Gift level cost at character creation confirmed flat 1:1** (2026-07-14) — see Character Creation above.
- [x] **XP costs resolved** (2026-07-14): new Gift flat 7 XP, raising an existing Gift's level costs current level × 5. See Advancement section above and [gifts.md](../rules/gifts.md#resolved).
- [x] **New Gift creation happens only between sessions, resolved 2026-07-15** — same timing as new Skill creation, GM approval required. Picking an existing catalog Gift at character creation is unaffected. See [gifts.md](../rules/gifts.md#resolved).
- [x] **Gifts require no in-fiction source or origin, resolved 2026-07-15** — a character simply has a Gift, no bloodline/pact/training/mutation needed to justify it. See [gifts.md](../rules/gifts.md#resolved).
- [x] **Resource cost on use, partially resolved** (2026-07-14): every Gift costs Resonance to activate — a universal system, not per-Gift. Exact amount is in active playtesting, tracked under Advancement above (Gift activation cost in Resonance).
- [ ] **Cybernetics needs fuller treatment** — currently only one catalog entry ("Grafted Steel"). Needs more concepts, and a decision on whether it needs its own acquisition rules (surgery, cost, installation risk) instead of standard Gift creation.
- [x] **Detail pass complete, and Resisted-Roll-vs-Resolve triage resolved** (both 2026-07-15) — every Gift's 5 levels now have an Action cost, Range, Duration, and Resolution (Resolve default or flagged Resisted Roll, decided per-Gift as part of this same pass). See [gifts.md](../rules/gifts.md#resolved) and [premade-gifts.md](../rules/premade-gifts.md).
- [x] **Grafted Steel removed, cybernetics now has no catalog representation** (2026-07-15) — catalog total is **75 Gifts**. Still open: whether cybernetics needs its own acquisition rules before it's added back. See [premade-gifts.md](../rules/premade-gifts.md#cybernetics--note).
- ([gifts.md](../rules/gifts.md), [premade-gifts.md](../rules/premade-gifts.md))

## Not Yet Started

Bigger pieces that haven't been touched at all yet:

- [ ] Combat mechanics (see above — everything else is waiting on this).
- [ ] Character creation step-by-step process (the *procedure*, not just the point economy above).
- [ ] Anything beyond character creation and advancement — session structure, downtime, equipment/gear rules, etc., haven't come up yet.

## 🔁 Full Revision Pass — planned, after everything above is done

Once every open item on this list is resolved and the system has a complete first draft, do a full pass back over **everything already written** — not just what's still open. A lot has been proposed, corrected, and revised as we went (Multiple Actions' penalty, Called Shot's modifier, Reactions being removed entirely, the whole Defense/Resolve rework), and earlier docs may still carry stale wording, outdated cross-references, or assumptions that got superseded later without every mention being caught. This pass is specifically for reconciling and polishing the finished whole, not for making new design decisions.
