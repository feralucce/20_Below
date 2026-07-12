# Combat

_In active design as of 2026-07-12._

## Decided so far

- **Critical success**: double damage, plus an additional GM-narrated effect.
- **Critical failure**: always fails (per core mechanic); combat-specific extra effect TBD.
- **Called shots**: impose a difficulty modifier on the attack roll (exact value TBD).

## Round Structure (in progress)

1. **Roll initiative every round** — not just once per combat, so initiative reflects the changing state of the battlefield round to round.
2. **Declare actions in reverse initiative order** — lowest initiative declares first, highest declares last. The initiative winner acts with full knowledge of everyone else's committed action for the round; low initiative means committing blind.
3. **Resolve actions in (forward) initiative order** — highest initiative acts first.
4. Repeat every round.

**Round length: 3 seconds** (confirmed). Chosen over the more common 6-second round (D&D/Pathfinder standard) deliberately — a shorter round means more rounds cycle per real fight, which fits the "reflects reality better, more can happen quickly" goal, and reinforces why re-rolling initiative every round makes sense (the battlefield genuinely can shift that fast). This also anchors movement distance-per-round and gives concrete meaning to vague Gift-duration wording ("briefly," "a short while") once those get their detail pass.

## Pre-Rolled Combat Dice — confirmed

A table-speed tool, since initiative re-rolling every 3-second round means a lot of d20 rolls over the course of a fight:

- At the **start of each game session**, every player rolls **1d20 ten times** and writes the results down. This is a per-*session* ritual, not per-combat or per-character-encounter.
- These 10 results are a **bank the player draws from for every d20 roll made in combat** (attacks, defense, initiative, Gift use, anything that calls for a d20 roll during a fight) — **not** for non-combat rolls, which are still rolled live as normal.
- The player picks **which banked result to spend on which roll, in any order** — full control over which of their 10 numbers gets used where, not a fixed sequence.
- **Mandatory, not optional**: a player must exhaust all 10 banked rolls before they're allowed to roll live in combat again.
- The bank is **discarded at the end of the session** — no carryover. A fresh 10 are rolled at the start of the next session.

This means once a player runs through their 10, further combat rolls that session go back to live rolling — the bank is a speed-up for the *bulk* of combat rolls, not a full replacement forever.

## Action Economy — confirmed

Three resources per round, not D&D's four — **Bonus Action is merged into Reaction** rather than kept as a separate category:

- **Move** — reposition up to your speed. **Freeform**: not declared as part of the Declaring step, and not locked to a single moment in the turn. A character can take their move all at once, or split it around their Action any way they like — move then act, act then move, or move partway, act, then finish the move.
- **Action** — the one primary thing a character is doing this round (attack, use a Gift, dash, disengage, hide, ready, etc.). This is what gets declared, with a specific target, per the Declaring rule above.
- **Reaction** — everyone gets exactly one per round. **Not declared by default** — used opportunistically as needed (an interrupt, a triggered response, a supplementary action off a Skill/Perk/Gift), the same way D&D's reaction works, unless a specific Perk or Gift explicitly says its use must be declared instead.

So: 1 Move (freeform) + 1 Action (declared) + 1 Reaction (not declared, unless a Perk/Gift says otherwise) per character per round.

### Initiative — confirmed

- **Target number**: `(higher of Body or Mind) + Perception`. Fixed formula, not re-argued per-roll like a normal Skill+Attribute pairing — initiative needs to resolve fast every round, so it doesn't go through the usual negotiation.
- **Roll first**: roll 1d20 against that unmodified target number, and compute the base **Degree** (see [Degree of Success/Failure](core-mechanic.md#degree-of-success--degree-of-failure)) — this is also where crits are determined (nat 1/nat 20), off the raw, unmodified roll.
- **Then apply Gift/Perk modifiers to the Degree itself** (e.g. *Reckless Instinct*, *Danger Sense*) — not to the target number before rolling. Modifying Degree after the fact shifts a character's place in the order without touching their odds of success or of critting.
- **Rank all participants by (modified) Degree, highest first.** That ranking is both the declare order (reverse) and the resolve order (forward) for the round.
- Crit status still applies as normal on top of the ranking (nat 1 auto-top of the order; nat 20 auto-bottom), regardless of Degree modifiers.

### Declaring — confirmed

- Declaring commits a character to a **specific action and target** — full commitment, not just an action type. This is what creates the tactical tension of the reverse-declare order: low-initiative characters commit blind, high-initiative characters react to everything already on the table.
- **Free re-declare rule**: if a faster (higher-initiative) character's action does something that prevents a slower character from carrying out their declared action as declared — the target is removed, moved out of reach, the environment changes, whatever the specific reason — that slower character gets to **freely re-declare both their action and target** when their turn comes up. No penalty, no lost turn.

**Still proposed, not yet confirmed:**
- Attack/defense reuses [Resisted Rolls](core-mechanic.md#resisted-rolls) directly: attacker rolls Attribute + weapon Skill, defender rolls Attribute + Dodge (or other relevant defense), Degree compared, ties favor the defender.

## Still to Design

- **Damage**: how damage is determined once a hit lands (fixed weapon value? scales with the attacker's Degree of Success, tying into the running "DoS drives magnitude" theme? a separate damage roll?), and how it's tracked (hit points vs. a wound/health-level track with escalating penalties, à la Storyteller/WFRP).
- **Movement**: how far a character can move in a turn, whether movement costs a full action or is bundled with other actions, how range/distance is abstracted (grid, zones, narrative distance bands).

## Deferred Skills

Combat skills (Melee, Unarmed, Firearms, Archery/Thrown, Heavy Weapons, Dodge) — see [premade-skills.md](premade-skills.md).

## Deferred Perks

Combat-adjacent Perks (Combat Reflexes, Quick Draw, Alertness) — see [perks.md](perks.md).

## Open Questions

- What is the critical failure effect in combat (weapon drop/break, self-harm, exposed position, etc.)?
- Exact difficulty modifier for called shots — flat value, or scaled by target size/body part?
- How does combat interact with the free skill+attribute pairing rule (e.g. is "Melee Weapons" always Body, or can it pair with other attributes too)?
