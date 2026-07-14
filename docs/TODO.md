# To-Do List

A consolidated view of every open question across the ruleset, pulled from each rule doc's own "Open Questions" section. Grouped by topic so it's easy to think through in chunks. Each item links back to the doc where it lives — resolve it there when you're ready, same as everything else so far.

This file is a **summary for thinking, not a source of truth** — the individual rule docs are canonical. If this list and a rule doc's own Open Questions ever disagree, trust the rule doc and update this file to match.

## ⬆️ Pick up here next session (2026-07-13)

**Spark is resolved**, including overflow (already-full Spark gain converts to Advantage) — see [core-mechanic.md](../rules/core-mechanic.md#spark--confirmed).

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
- [ ] **Big downstream TODO**: once combat exists, the entire 76-Gift catalog needs a detail pass to convert soft narrative phrasing into concrete mechanics (ranges, durations, action costs) — [gifts.md](../rules/gifts.md), [premade-gifts.md](../rules/premade-gifts.md)

## Core Mechanic

- [x] **Advantage/Disadvantage stacking resolved** (2026-07-13): each source is worth ±1, net summed, sign determines Advantage/Disadvantage/normal — see [core-mechanic.md](../rules/core-mechanic.md#advantage--disadvantage--confirmed).
- [x] **Full trigger list resolved as deliberately non-exhaustive** (2026-07-14): compiled an illustrative candidate list from OWoD, Pathfinder 1e, CoC 7e, Exalted, Adventure!, Scion, Pendragon, Hero System, and Rifts (flanking, higher ground, surprise, teamwork, right tool/environment, narrative stunts, Passion-driven moments, Leadership-style rallying) — GM can recognize others as they arise. See [core-mechanic.md](../rules/core-mechanic.md#advantage-trigger-examples--non-exhaustive).
- [x] **Disadvantage trigger list resolved the same way** (2026-07-14): mirrored candidate list — being flanked/outnumbered, unfavorable terrain, surprised, wrong tool/hostile environment, acting against a Passion/Flaw, being intimidated/demoralized. "Rushing" isn't on the list, but not dropped as a poor fit — it's already covered by the existing Multiple Actions mechanism. See [core-mechanic.md](../rules/core-mechanic.md#disadvantage-trigger-examples--non-exhaustive).

## Character Creation & Advancement (economy — likely unlocks a lot of other answers at once)

- [x] **Creation order and pool structure resolved** (2026-07-14): Attributes → Skills → Perks → Gifts → Flaws (grant Freebie Points) → spend Freebies. The first four are separate, siloed point pools — no cross-spending between them. Freebies are the flexible final pass. See [character-creation/overview.md](../character-creation/overview.md#creation-order--confirmed).
- [x] **Addendum: Attribute Descriptors introduced** (2026-07-14): every point in an Attribute grants a player-chosen Descriptor (a specific flavor of that Attribute, e.g. Body 3 = *Agile, Fast, Durable*), and Descriptors are now how a Skill+Attribute pairing gets argued. See [core-mechanic.md](../rules/core-mechanic.md#descriptors--confirmed).
- [x] **Point cost per rank confirmed flat 1:1** (2026-07-14): 1 pool point = 1 rank, for all four dedicated pools, no scaling curve.
- [x] **Calibration step 1 done**: derived a comparable raw target number for "average human, average task" by anchoring to D&D and Hero System's shared "10 = human average" convention — three reference conversions land in a 10-13 range, recommending **10** as the working baseline (see [character-creation/overview.md](../character-creation/overview.md#calibration)). This is an input to pool sizing, not the pool size itself.
- [x] **Attribute pool size resolved** (2026-07-14): **10 points**, Attributes start at 1 each (free floor), max distributable total 13 across Body/Mind/Soul. Deliberately less than 15 (three flat "average" 5s), so an all-average build is arithmetically impossible — forces at least one above-average and one below-average Attribute, reproducing the original "one above, one average, one below" goal via the budget itself rather than hardcoded tiers. See [character-creation/overview.md](../character-creation/overview.md#calibration).
- [x] **No separate starting-creation cap on Attributes** (2026-07-14): unlike WoD's "max 3 at creation," this system only bounds Attributes by their normal min 1/max 10 range plus what the 10-point pool can afford — no redundant lower ceiling on top of that.
- [x] **Skills confirmed 0-10 system-wide (floor 0, unusable below rank 1), with a separate 6-point cap at character creation** (2026-07-14): a starting character can't begin play with a maxed-out Skill (7-10 is advancement-only). See [skills.md](../rules/skills.md#scoring--confirmed).
- [x] **Skill pool size resolved: 35 points** (2026-07-14): derived from OWoD/CoC7e/Pathfinder/Hero/Exalted starting-skill data (≈8-10 skills with real investment, at ≈60-67% of that system's starting cap) — converts to ≈9 skills at rank 4 (of the 6-point creation cap) ≈ 32-36 points, rounded to 35 to match the system's existing 1/3/5/10 numeric convention. See [character-creation/overview.md](../character-creation/overview.md#calibration).
- [x] **Perk pool size resolved: 10 points** (2026-07-14) — individual Perk costs still TBD (cost scales with strength per [perks.md](../rules/perks.md#resolved)), but the pool total is fixed regardless. See [character-creation/overview.md](../character-creation/overview.md#calibration).
- [x] **Gift pool size resolved: 8 points** (2026-07-14): checked against WoD Mage's Sphere-dot budget (5, and the acknowledged direct inspiration for the Power Level/Gift Level split), Vampire's Discipline budget (3), and Changeling's Arts/Realms budget (~5) — 8 is ~1.6× Mage's baseline, consistent with how generous the Attribute/Skill pools already are relative to WoD. Confirms the pool supports both specialization (one maxed Gift at 5 + a secondary at 3) and generalization (up to 4 Gifts at Level 2, or thinner spreads), assuming flat per-level cost. See [character-creation/overview.md](../character-creation/overview.md#calibration).
- [x] **Gift-level cost at character creation confirmed flat 1:1** (2026-07-14): 1 pool point = 1 Gift level, same convention as the other three pools. Confirms the 8-point pool's specialization/generalization math rather than that math being contingent on an assumption. XP cost to raise a Gift level after creation is still open. See [gifts.md](../rules/gifts.md#resolved).
- [x] **Freebie Points fully resolved** (2026-07-14): starting pool of **15** (flat, regardless of Flaws), spendable across all four categories at **Attribute 7/level (cap 2 levels), Skill 1/level (no extra cap), Perk 3/Perk (no cap), Gift 5/level (cap 3 levels)**. Flaws add to the 15 baseline: **1-7 Freebies** per non-Leveled Flaw (OWoD's severity range, negotiated), or **2 × level** for the 3 Leveled (Resource) Flaws. The 15 baseline alone can hit either the Attribute cap (14) or the Gift cap (15) but not both. See [character-creation/overview.md](../character-creation/overview.md#calibration).
- [ ] Individual Perk costs *within the dedicated Perk pool* (separate from the now-resolved Freebie cost of 3/Perk).
- [ ] XP cost to raise a Gift level **after** character creation — flat or a scaling curve?
- [ ] XP cost per rank for the same, during advancement — flat cost, or a scaling curve?
- [ ] How XP is earned (per session, per milestone, GM discretion?).
- [ ] Does advancement require in-fiction justification (training montage, mentor, relevant use in play), or is it free-form?
- [ ] Exact XP cost for purchasing an extra Skill Specialty.
- [ ] **New**: whether a new Attribute Descriptor can be reassigned/added without a fresh Attribute purchase.
- ([character-creation/overview.md](../character-creation/overview.md))

## Skills

- [x] **Genre-flagged skills (Occult, Mythos, Alchemy) ship as defaults, GM discretion to drop** (resolved 2026-07-13) — see [skills.md](../rules/skills.md), [premade-skills.md](../rules/premade-skills.md).

## Perks

- [x] **Perk cost scales with strength, not flat** (resolved 2026-07-14) — exact numbers deferred to the point/XP economy, same as Skills/Gifts.
- [x] **No cap on Perks, but acquiring one after character creation costs a premium** (resolved 2026-07-14) — exact premium TBD alongside cost numbers.
- [x] **No prerequisites — a Perk grants its own standing** (resolved 2026-07-14): e.g. Fringe Benefit is what creates the license/clearance, not a reward for already having it.
- [x] **Numeric edge-case Perks resolved**: Wealth and similar are a resource/currency pool, not a roll bonus, so they don't break the "no numeric bonus" rule (resolved 2026-07-14).
- [x] **Addendum: 7 Perks (Wealth, Fringe Benefit, Contacts, Base, Notable Vehicle, Followers, Fame) now use the same 1-5 level scale as Gifts** instead of being binary (resolved 2026-07-14) — exact per-level content not yet written.
- [ ] **New**: exact per-level definitions for the 7 Leveled (Resource) Perks above — same scale of work as the Gift catalog's level tables.
- [x] **"Surprised" resolved** (2026-07-14): Advantage to attacks against the surprised character, plus -5 to their Initiative Degree for the first round of combat only. Who is surprised is a GM call based on the fiction, no dedicated roll. See [combat.md](../rules/combat.md#surprise--confirmed).
- ([perks.md](../rules/perks.md))

## Flaws

- [x] **Flaw list compiled** (resolved 2026-07-14): sourced from OWoD, Hero System, and D&D 3.5e Flaws (numeric-penalty entries excluded, mirroring Perks' exclusion of numeric-bonus Feats). Categories: Physical, Mental/Cognitive, Social, Leveled (Resource), Combat-Adjacent. See [flaws.md](../rules/flaws.md#flaw-list).
- [x] **Addendum: Notoriety/Enemy/Hunted mirror Perks' Leveled (Resource) Perks** (resolved 2026-07-14) — 1-5 scale instead of binary, exact per-level content not yet written. See [flaws.md](../rules/flaws.md#leveled-resource-flaws--confirmed).
- [x] **Flaw economy confirmed** (resolved 2026-07-14): Flaws are taken only at character creation and grant extra build points to spend elsewhere. Since it's a one-time creation-time transaction, a Flaw is fixed for the character's lifetime once chosen — no buy-off mechanism. Points granted should scale with severity, by symmetry with Perk cost scaling — exact numbers still deferred to the point/XP economy.
- [ ] Is there a cap on how many Flaws a character can take?
- [ ] **New**: exact per-level definitions for the 3 Leveled (Resource) Flaws.
- ([flaws.md](../rules/flaws.md))

## Gifts

- [x] **Gift level cost at character creation confirmed flat 1:1** (2026-07-14) — see Character Creation & Advancement above.
- [ ] Does new Gift creation happen only between sessions (like new Skills), or can it also happen at character creation?
- [ ] XP cost to raise a Gift level after character creation — flat per level, or a scaling curve (WoD-style, level 5 costs much more than level 1)?
- [ ] Do Gifts require an in-fiction source/origin (bloodline, pact, training, mutation), or is that left to player flavor?
- [ ] Resource costs or drawbacks on use (mana, fatigue, corruption, backlash) — universal system, or defined per-Gift?
- [ ] **Cybernetics needs fuller treatment** — currently only one catalog entry ("Grafted Steel"). Needs more concepts, and a decision on whether it needs its own acquisition rules (surgery, cost, installation risk) instead of standard Gift creation.
- [ ] **Detail pass pending combat** (see Combat section above) — the whole 76-Gift catalog is written at a soft narrative level right now.
- [ ] **Resisted-Roll-vs-Resolve triage**: every unwilling-target Gift needs a case-by-case pass to decide whether it uses the new Resolve default or genuinely needs a full Resisted Roll. Not started.
- ([gifts.md](../rules/gifts.md), [premade-gifts.md](../rules/premade-gifts.md))

## Not Yet Started

Bigger pieces that haven't been touched at all yet:

- [ ] Combat mechanics (see above — everything else is waiting on this).
- [ ] Character creation step-by-step process (the *procedure*, not just the point economy above).
- [ ] Anything beyond character creation and advancement — session structure, downtime, equipment/gear rules, etc., haven't come up yet.

## 🔁 Full Revision Pass — planned, after everything above is done

Once every open item on this list is resolved and the system has a complete first draft, do a full pass back over **everything already written** — not just what's still open. A lot has been proposed, corrected, and revised as we went (Multiple Actions' penalty, Called Shot's modifier, Reactions being removed entirely, the whole Defense/Resolve rework), and earlier docs may still carry stale wording, outdated cross-references, or assumptions that got superseded later without every mention being caught. This pass is specifically for reconciling and polishing the finished whole, not for making new design decisions.
