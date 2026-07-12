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

### Initiative — confirmed

- **Target number**: `(higher of Body or Mind) + Perception`. Fixed formula, not re-argued per-roll like a normal Skill+Attribute pairing — initiative needs to resolve fast every round, so it doesn't go through the usual negotiation.
- **Roll first**: roll 1d20 against that unmodified target number, and compute the base **Degree** (see [Degree of Success/Failure](core-mechanic.md#degree-of-success--degree-of-failure)) — this is also where crits are determined (nat 1/nat 20), off the raw, unmodified roll.
- **Then apply Gift/Perk modifiers to the Degree itself** (e.g. *Reckless Instinct*, *Danger Sense*) — not to the target number before rolling. Modifying Degree after the fact shifts a character's place in the order without touching their odds of success or of critting.
- **Rank all participants by (modified) Degree, highest first.** That ranking is both the declare order (reverse) and the resolve order (forward) for the round.
- Crit status still applies as normal on top of the ranking (nat 1 auto-top of the order; nat 20 auto-bottom), regardless of Degree modifiers.

**Still proposed, not yet confirmed:**
- Declaring commits a character to a specific action *and target*, not just an action type — this is what creates the tactical tension of the reverse-declare order. (Softer alternative: declare action type only, target revealed at resolution.)
- If a declared target becomes invalid before a character's turn resolves (e.g. already killed), that character gets to freely redirect the action rather than losing the turn.
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
