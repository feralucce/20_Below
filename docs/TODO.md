# To-Do List

A consolidated view of every open question across the ruleset, pulled from each rule doc's own "Open Questions" section. Grouped by topic so it's easy to think through in chunks. Each item links back to the doc where it lives — resolve it there when you're ready, same as everything else so far.

This file is a **summary for thinking, not a source of truth** — the individual rule docs are canonical. If this list and a rule doc's own Open Questions ever disagree, trust the rule doc and update this file to match.

## ⬆️ Pick up here next session (2026-07-13)

**Spark is resolved**, including overflow (already-full Spark gain converts to Advantage) — see [core-mechanic.md](../rules/core-mechanic.md#spark--confirmed).

**Advantage/Disadvantage stacking is resolved**: numeric ±1 per source, net sign picks Advantage/Disadvantage/normal — see [core-mechanic.md](../rules/core-mechanic.md#advantage--disadvantage--confirmed).

**Advantage/Disadvantage vs. the bank is resolved**: net Advantage lets a character choose live-roll or a banked die; net Disadvantage forces a live roll regardless of bank status — see [combat.md](../rules/combat.md#pre-rolled-combat-dice--confirmed).

**Movement/Speed is resolved**: Speed = 5m + (Body ÷ 2, round up), a flat base plus a Body bonus rather than a pure Body-derived value, so a Body-1 character still moves at a normal walking pace — see [combat.md](../rules/combat.md#movement--speed--confirmed).

See the Combat section below for what's still open in this area.

## Previous session (2026-07-12)

**Attack/Defense/Resolve decision is resolved** — see [core-mechanic.md](../rules/core-mechanic.md#calculated-defensive-traits):
- **Defense** = Mind ÷ 2 (round up). Ordinary attacks: attacker rolls once, DoS > Defense → hit; else no damage. Replaces Resisted Rolls for one-sided attacks.
- **Resolve** = Soul ÷ 2 (round up). Same logic, for Soul-targeted Gift impositions (fear, domination, charm, etc.) — **mostly**, not absolute; some Gifts still warrant a full Resisted Roll, decided case by case.
- **Soak** (armor-driven damage reduction after a hit connects) is conceptually gear-based, not Attribute-derived — not yet numerically designed, waiting on an equipment subsystem.
- Resisted Rolls are now scoped down to genuinely mutual contests (Grapple, Trip, Escape, contests of will) plus case-by-case Gift exceptions.
- Dodge/Abort to Dodge/All-Out Attack/Haymaker/Charge/Brace all updated in `combat.md` to reference Defense instead of a rolled defense DoS.

**Still open from this decision:**
- Confirm "Defense halved, round up" as the substitute for Charge/Brace's old "Disadvantage on defense" — proposed, not locked (Advantage/Disadvantage only applies to rolls, and Defense isn't rolled).
- Does a wounded character's Defense also degrade under the Health Level penalty (an intentional death-spiral)? Not automatically implied by the existing wording — separate decision.
- Every Gift with an unwilling-target use case needs a case-by-case pass: does it use the Resolve default, or genuinely need a full Resisted Roll? Not started (`gifts.md` Open Questions).

**Health Levels** — see [combat.md](../rules/combat.md#health-levels--confirmed): Healthy (Body×2, no penalty) → Sore (Body, no penalty) → Battered (Body, −1) → Wounded (Body÷2, −3) → Suffering (Body÷2, −5) → Incapacitated (0 HP, no actions, any damage kills). Total pool = 5×Body (+1 if Body is odd). No overflow between containers.
- **Still open**: is Incapacitated's "any damage kills, no buffer" the intended lethality? Healing mechanism isn't designed at all yet.

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
- [x] Called Shot location-effects proposal drafted (Hero 6e hit-location-inspired): Head (Stunned, TBD), Eyes (Blinded), Arms/Hands (Disarmed/Impaired), Legs/Feet (Move reduced). Not yet confirmed.
- [ ] Damage multiplier per Called Shot location (Hero-style) — wanted, but blocked until the damage subsystem exists.
- [ ] Exact grappling-relevant Skill for Grapple's attacker side.
- [x] **Reactions removed entirely** — confirmed, not just flagged. Action Economy, Abort to Dodge, All-Out Attack, and Haymaker all updated accordingly.
- [x] Attack/Defense resolution: **Defense trait (Mind ÷ 2), not Resisted Rolls** — see the top of this file.
- [ ] **Damage**: how it's determined on a hit (fixed weapon value? scales with attacker's Degree of Success? separate roll?) and how it's tracked (hit points vs. wound/health-level track). Needed before Called Shot damage multipliers can be assigned.
- [x] **Movement**: Speed = 5m + (Body ÷ 2, round up); a Move lets a character reposition up to Speed, freeform as already defined in Action Economy. Not costed as a full action — see [combat.md](../rules/combat.md#movement--speed--confirmed).
- [ ] Critical failure effect in combat (weapon drop/break, self-harm, exposed position, etc.).
- [ ] How does combat interact with the free skill+attribute pairing rule (e.g. is "Melee Weapons" always Body, or can it pair with other attributes too)?
- [ ] The 6 deferred combat Skills (Melee, Unarmed, Firearms, Archery/Thrown, Heavy Weapons, Dodge) — [premade-skills.md](../rules/premade-skills.md)
- [ ] The 3 deferred combat-adjacent Perks (Combat Reflexes, Quick Draw, Alertness) — [perks.md](../rules/perks.md)
- [ ] **Big downstream TODO**: once combat exists, the entire 76-Gift catalog needs a detail pass to convert soft narrative phrasing into concrete mechanics (ranges, durations, action costs) — [gifts.md](../rules/gifts.md), [premade-gifts.md](../rules/premade-gifts.md)

## Core Mechanic

- [x] **Advantage/Disadvantage stacking resolved** (2026-07-13): each source is worth ±1, net summed, sign determines Advantage/Disadvantage/normal — see [core-mechanic.md](../rules/core-mechanic.md#advantage--disadvantage--confirmed).
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
- [ ] **Resisted-Roll-vs-Resolve triage**: every unwilling-target Gift needs a case-by-case pass to decide whether it uses the new Resolve default or genuinely needs a full Resisted Roll. Not started.
- ([gifts.md](../rules/gifts.md), [premade-gifts.md](../rules/premade-gifts.md))

## Not Yet Started

Bigger pieces that haven't been touched at all yet:

- [ ] Combat mechanics (see above — everything else is waiting on this).
- [ ] Character creation step-by-step process (the *procedure*, not just the point economy above).
- [ ] Anything beyond character creation and advancement — session structure, downtime, equipment/gear rules, etc., haven't come up yet.

## 🔁 Full Revision Pass — planned, after everything above is done

Once every open item on this list is resolved and the system has a complete first draft, do a full pass back over **everything already written** — not just what's still open. A lot has been proposed, corrected, and revised as we went (Multiple Actions' penalty, Called Shot's modifier, Reactions being removed entirely, the whole Defense/Resolve rework), and earlier docs may still carry stale wording, outdated cross-references, or assumptions that got superseded later without every mention being caught. This pass is specifically for reconciling and polishing the finished whole, not for making new design decisions.
