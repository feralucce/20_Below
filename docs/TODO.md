# To-Do List

A consolidated view of every open question across the ruleset, pulled from each rule doc's own "Open Questions" section. Grouped by topic so it's easy to think through in chunks. Each item links back to the doc where it lives — resolve it there when you're ready, same as everything else so far.

This file is a **summary for thinking, not a source of truth** — the individual rule docs are canonical. If this list and a rule doc's own Open Questions ever disagree, trust the rule doc and update this file to match.

## Combat (the big one — most other systems are waiting on this)

**In active design as of 2026-07-12** — see [combat.md](../rules/combat.md) for full detail.

- [x] Round structure: roll initiative every round → declare actions in reverse initiative order → resolve in forward initiative order → repeat.
- [x] Initiative roll mechanic: roll `(higher of Body or Mind) + Perception` first (crits determined here), then apply Gift/Perk modifiers to the resulting Degree, then rank.
- [x] Declaring commits a character to a specific action and target (full commitment). Free re-declare (action + target) if a faster character's action invalidates the declared plan — no lost turn.
- [ ] Confirm attack/defense reuses Resisted Rolls as-is (attacker vs. defender, DoS/DoF comparison).
- [ ] **Damage**: how it's determined on a hit (fixed weapon value? scales with attacker's Degree of Success? separate roll?) and how it's tracked (hit points vs. wound/health-level track).
- [ ] **Movement**: distance per turn, whether it costs a full action, how range/distance is abstracted.
- [ ] Critical failure effect in combat (weapon drop/break, self-harm, exposed position, etc.).
- [ ] Exact difficulty modifier for called shots — flat value, or scaled by target size/body part?
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
