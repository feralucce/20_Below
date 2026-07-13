# To-Do List

A consolidated view of every open question across the ruleset, pulled from each rule doc's own "Open Questions" section. Grouped by topic so it's easy to think through in chunks. Each item links back to the doc where it lives — resolve it there when you're ready, same as everything else so far.

This file is a **summary for thinking, not a source of truth** — the individual rule docs are canonical. If this list and a rule doc's own Open Questions ever disagree, trust the rule doc and update this file to match.

## ⬆️ Pick up here next session (2026-07-12, paused mid-decision)

**Decide: flat Defense stat vs. Resisted Roll for ordinary attacks.** Resisted Rolls on every attack are two rolls per exchange — a real cost given initiative rerolls every round and fights can have several combatants. The alternative: every character has a precomputed flat **Defense stat**; an attacker rolls once, and the defender's Defense is subtracted from the attacker's DoS (result < 0 = the attack doesn't connect). Cuts ordinary attacks to one roll.

- If adopted, **Dodge and Abort to Dodge need redefining** — they currently multiply a rolled defense DoS by 1.5, but there's no defense roll under this model. Would need to instead multiply/boost the Defense *stat* itself for the round.
- Also need to decide **scope**: does this replace only ordinary Attack resolution, or also the Resisted-Roll-based maneuvers (Grapple, Trip, Escape)? Leaning toward keeping those as full Resisted Rolls (occasional, weightier) while ordinary attacks (highest roll volume) get the fast treatment — not confirmed.

**Health Levels are now written up** — see [combat.md](../rules/combat.md#health-levels--confirmed): Healthy (Body×2, no penalty) → Sore (Body, no penalty) → Battered (Body, −1) → Wounded (Body÷2, −3) → Suffering (Body÷2, −5) → Incapacitated (0 HP, no actions, any damage kills). Total pool = 5×Body (+1 if Body is odd). No overflow between containers. Full Body 1-10 reference table included.
- **Still open**: is Incapacitated's "any damage kills, no buffer" the intended lethality (no dying/stabilizing state)? Healing mechanism (how a character moves back up a level) isn't designed at all yet. Whether the per-level penalty applies to defense too depends on the still-pending flat-Defense-stat decision above.

## Combat (the big one — most other systems are waiting on this)

**In active design as of 2026-07-12** — see [combat.md](../rules/combat.md) for full detail.

- [x] Round structure: roll initiative every round → declare actions in reverse initiative order → resolve in forward initiative order → repeat.
- [x] Initiative roll mechanic: roll `(higher of Body or Mind) + Perception` first (crits determined here), then apply Gift/Perk modifiers to the resulting Degree, then rank.
- [x] Declaring commits a character to a specific action and target (full commitment). Free re-declare (action + target) if a faster character's action invalidates the declared plan — no lost turn.
- [x] Round length: 3 seconds.
- [x] Action economy: **1 Move (freeform, split any way around the Action) + 1 Action (declared, with target) only — no Reaction.** Reactions were considered, then removed from the system entirely.
- [x] Pre-Rolled Combat Dice: 10 d20s banked per player at session start, spent on combat rolls in any order, mandatory before live rolling resumes, discarded at session end.
- [ ] **Mechanism to force the GM to use one of their banked rolls** in a given situation — presumes the GM keeps a bank too. Needs a trigger (Perk/Gift/resource spend/in-fiction condition?) and a scope (force *which* roll, or just force *a* roll to come from the bank?).
- [x] Actions list: Attack, Special Maneuvers (not yet defined), Use a Skill, Use a Gift, Dodge.
- [x] Dodge: multiplies defense DoS by 1.5 (round up), costs the Action.
- [x] Abort to Dodge: same ×1.5 DoS effect, reactive (triggered when attacked before your turn), costs Move + Action (Reaction removed from its cost).
- [x] Multiple Actions: declared during Declaring as a full chain; target drops by 3×N per action (1st = −3); chain stops at first failure; expanded critical failure range starting 2nd action (natural roll ≥ 21−N auto-crit-fails).
- [x] **Special Maneuvers fully mechanized** (10, from D&D 5e/Hero 6e/White Wolf): Grapple/Trip/Escape (Resisted Rolls, status effects, no damage); Disarm/Called Shot (attack at a size-dependent target penalty); All-Out Attack/Haymaker (Dodge-style DoS ×1.5/×2, defenseless 1 round vs. until next turn); Charge/Brace/Help (grant Advantage). Disengage removed.
- [x] Called shot difficulty modifier: **size-dependent** — −5 for small/precise targets (Head, Hands), −3 for larger ones (Arms, Legs). Torso removed as an option — center of mass is the default target for any ordinary attack, no penalty.
- [x] Called Shot location-effects proposal drafted (Hero 6e hit-location-inspired): Head (Stunned, TBD), Eyes (Blinded), Arms/Hands (Disarmed/Impaired), Legs/Feet (Move reduced). Not yet confirmed.
- [ ] Damage multiplier per Called Shot location (Hero-style) — wanted, but blocked until the damage subsystem exists.
- [ ] Exact grappling-relevant Skill for Grapple's attacker side.
- [x] **Reactions removed entirely** — confirmed, not just flagged. Action Economy, Abort to Dodge, All-Out Attack, and Haymaker all updated accordingly.
- [ ] Confirm attack/defense reuses Resisted Rolls as-is (attacker vs. defender, DoS/DoF comparison).
- [ ] **Damage**: how it's determined on a hit (fixed weapon value? scales with attacker's Degree of Success? separate roll?) and how it's tracked (hit points vs. wound/health-level track). Needed before Called Shot damage multipliers can be assigned.
- [ ] **Movement**: distance per turn (now anchored to a 3-second round), whether it costs a full action, how range/distance is abstracted.
- [ ] Critical failure effect in combat (weapon drop/break, self-harm, exposed position, etc.).
- [ ] How does combat interact with the free skill+attribute pairing rule (e.g. is "Melee Weapons" always Body, or can it pair with other attributes too)?
- [ ] The 6 deferred combat Skills (Melee, Unarmed, Firearms, Archery/Thrown, Heavy Weapons, Dodge) — [premade-skills.md](../rules/premade-skills.md)
- [ ] The 3 deferred combat-adjacent Perks (Combat Reflexes, Quick Draw, Alertness) — [perks.md](../rules/perks.md)
- [ ] **Big downstream TODO**: once combat exists, the entire 76-Gift catalog needs a detail pass to convert soft narrative phrasing into concrete mechanics (ranges, durations, action costs) — [gifts.md](../rules/gifts.md), [premade-gifts.md](../rules/premade-gifts.md)

## Core Mechanic

- [ ] Do Advantage and Disadvantage cancel when both apply from different sources, or does one override the other? — [core-mechanic.md](../rules/core-mechanic.md)
- [ ] Full list of triggers that grant Advantage/Disadvantage — [core-mechanic.md](../rules/core-mechanic.md)

## Character Creation & Advancement (economy — likely unlocks a lot of other answers at once)

- [ ] Size of the starting point pool.
- [ ] Point cost per rank for Attributes, Skills, Perks, Gifts at creation.
- [ ] XP cost per rank for the same, during advancement — flat cost, or a scaling curve?
- [ ] How XP is earned (per session, per milestone, GM discretion?).
- [ ] Does advancement require in-fiction justification (training montage, mentor, relevant use in play), or is it free-form?
- [ ] Exact XP cost for purchasing an extra Skill Specialty.
- [ ] What taking a Flaw grants the player, whether it's uniform or varies by severity, and whether there's a cap on how many can be taken.
- ([character-creation/overview.md](../character-creation/overview.md))

## Skills

- [ ] Which genre-flagged skills (Occult, Mythos, Alchemy) ship as defaults vs. GM-added modules per campaign? — [skills.md](../rules/skills.md), [premade-skills.md](../rules/premade-skills.md)

## Perks

- [ ] Flat cost to acquire a Perk — same currency as Skills, but uniform across all Perks or varies by strength?
- [ ] Is there a cap on how many Perks a character can take?
- [ ] Do any Perks have prerequisites (e.g. Fringe Benefit requiring an established social position)?
- [ ] How to handle the genuine numeric-edge-case Perks (Wealth, and anything found later) without breaking the "no numeric bonus" rule of thumb.
- ([perks.md](../rules/perks.md))

## Flaws

- [ ] What does taking a Flaw grant the player, and is the amount uniform or severity-based?
- [ ] Is there a cap on how many Flaws a character can take?
- [ ] Can a Flaw ever be bought off or removed during play, or is it fixed once chosen at creation?
- [ ] Compile an example Flaw list (mirroring premade-skills.md/perks.md), drawn from WoD Merits & Flaws — not started yet.
- ([flaws.md](../rules/flaws.md))

## Gifts

- [ ] Does new Gift creation happen only between sessions (like new Skills), or can it also happen at character creation?
- [ ] Cost to acquire/raise a Gift level — flat per level, or a scaling curve (WoD-style, level 5 costs much more than level 1)?
- [ ] Do Gifts require an in-fiction source/origin (bloodline, pact, training, mutation), or is that left to player flavor?
- [ ] Resource costs or drawbacks on use (mana, fatigue, corruption, backlash) — universal system, or defined per-Gift?
- [ ] **Cybernetics needs fuller treatment** — currently only one catalog entry ("Grafted Steel"). Needs more concepts, and a decision on whether it needs its own acquisition rules (surgery, cost, installation risk) instead of standard Gift creation.
- [ ] **Detail pass pending combat** (see Combat section above) — the whole 76-Gift catalog is written at a soft narrative level right now.
- ([gifts.md](../rules/gifts.md), [premade-gifts.md](../rules/premade-gifts.md))

## Not Yet Started

Bigger pieces that haven't been touched at all yet:

- [ ] Combat mechanics (see above — everything else is waiting on this).
- [ ] Character creation step-by-step process (the *procedure*, not just the point economy above).
- [ ] Anything beyond character creation and advancement — session structure, downtime, equipment/gear rules, etc., haven't come up yet.
