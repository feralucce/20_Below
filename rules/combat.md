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

**Proposed, not yet confirmed:**
- Initiative roll reuses [Degree of Success/Failure](core-mechanic.md#degree-of-success--degree-of-failure) math rather than a separate mechanic: everyone rolls Perception + Attribute against their own target number, rank by DoS (highest first), crits override (nat 1 vaults to the top).
- Declaring commits a character to a specific action *and target*, not just an action type — this is what creates the tactical tension of the reverse-declare order. (Softer alternative: declare action type only, target revealed at resolution.)
- If a declared target becomes invalid before a character's turn resolves (e.g. already killed), that character gets to freely redirect the action rather than losing the turn.
- Attack/defense reuses [Resisted Rolls](core-mechanic.md#resisted-rolls) directly: attacker rolls Attribute + weapon Skill, defender rolls Attribute + Dodge (or other relevant defense), DoS/DoF compared, ties favor the defender.

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
