# Combat

_In active design as of 2026-07-12._

## Decided so far

- **Critical success**: double damage, plus an additional GM-narrated effect.
- **Critical failure**: always fails (per core mechanic); combat-specific extra effect TBD.
- **Called shots**: impose a size-dependent difficulty modifier on the attack roll (see Special Maneuvers below).
- **Spark**: a per-player, per-session checkbox resource for forcing a bad banked roll onto the GM, granting yourself Advantage, or gifting a banked die to another player — see [core-mechanic.md](core-mechanic.md#spark--confirmed).

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

**Bank access outside a Spark spend**: players don't touch their bank except to spend it on a combat d20 roll, or as part of spending [Spark](core-mechanic.md#spark--confirmed) (forcing a banked result onto the GM, or gifting one to another player's bank).

**Advantage/Disadvantage vs. the bank** (confirmed): banked results are known values, picked from a list the player wrote down at session start — not a fresh gamble. That asymmetry governs how [Advantage/Disadvantage](core-mechanic.md#advantage--disadvantage--confirmed) interacts with the "mandatory until exhausted" rule above:

- **Net Advantage**: the character may *choose* — either roll live (2d20, take the lower), or simply spend one banked die as normal. Advantage grants the option to bypass the bank-exhaustion mandate for that one roll; it doesn't force a live roll.
- **Net Disadvantage**: the character **must roll live** (2d20, take the higher), even if their bank isn't exhausted. A banked die — a known, pre-selected value — can't be used to dodge a Disadvantaged roll; Disadvantage forces genuine live randomness.

## Action Economy — confirmed

Two resources per round — **no Reaction**. Reactions were considered (merging D&D's Bonus Action into a single Reaction resource), then **removed from the system entirely**:

- **Move** — reposition up to your **Speed** (see below). **Freeform**: not declared as part of the Declaring step, and not locked to a single moment in the turn. A character can take their move all at once, or split it around their Action any way they like — move then act, act then move, or move partway, act, then finish the move.
- **Action** — the one primary thing a character is doing this round (attack, use a Gift, dash, hide, ready, etc.). This is what gets declared, with a specific target, per the Declaring rule above.

So: 1 Move (freeform) + 1 Action (declared) per character per round. No Reaction, no Bonus Action, no interrupts outside of the Abort to Dodge rule below.

### Movement / Speed — confirmed

**Speed = 5m + (Body ÷ 2, round up)**, measured in meters. A **Move** (above) lets a character reposition up to their Speed.

The formula is deliberately a **flat base plus a Body bonus**, not a pure Body-derived value like Defense/Resolve — a Body-1 character still needs to move at a recognizable human walking pace, not be reduced to a token step. The 5m base is anchored to a real-world walking pace (~1.5 m/s) scaled down to this system's 3-second round (D&D's ~30ft/6-round baseline works out to ~4.5m over 3 seconds, rounded to a clean 5m). The Body bonus represents the swing above that baseline from raw physical capability:

| Body | Speed |
|---|---|
| 1 | 6m |
| 2 | 6m |
| 3 | 7m |
| 4 | 7m |
| 5 | 8m |
| 6 | 8m |
| 7 | 9m |
| 8 | 9m |
| 9 | 10m |
| 10 | 10m |

**Gifts may modify Speed** (flat or multiplicative, e.g. supernatural fleetness or teleportation-flavored movement) — not designed in detail yet, left as a hook for the Gift catalog's eventual combat detail pass (see [gifts.md](gifts.md)).

### Initiative — confirmed

- **Target number**: `(higher of Body or Mind) + Perception`. Fixed formula, not re-argued per-roll like a normal Skill+Attribute pairing — initiative needs to resolve fast every round, so it doesn't go through the usual negotiation.
- **Roll first**: roll 1d20 against that unmodified target number, and compute the base **Degree** (see [Degree of Success/Failure](core-mechanic.md#degree-of-success--degree-of-failure)) — this is also where crits are determined (nat 1/nat 20), off the raw, unmodified roll.
- **Then apply Gift/Perk modifiers to the Degree itself** (e.g. *Reckless Instinct*, *Danger Sense*) — not to the target number before rolling. Modifying Degree after the fact shifts a character's place in the order without touching their odds of success or of critting.
- **Rank all participants by (modified) Degree, highest first.** That ranking is both the declare order (reverse) and the resolve order (forward) for the round.
- Crit status still applies as normal on top of the ranking (nat 1 auto-top of the order; nat 20 auto-bottom), regardless of Degree modifiers.

### Declaring — confirmed

- Declaring commits a character to a **specific action and target** — full commitment, not just an action type. This is what creates the tactical tension of the reverse-declare order: low-initiative characters commit blind, high-initiative characters react to everything already on the table.
- **Free re-declare rule**: if a faster (higher-initiative) character's action does something that prevents a slower character from carrying out their declared action as declared — the target is removed, moved out of reach, the environment changes, whatever the specific reason — that slower character gets to **freely re-declare both their action and target** when their turn comes up. No penalty, no lost turn.

### Attack Resolution — confirmed

Ordinary attacks are **not** a Resisted Roll. They use the [Defense](core-mechanic.md#calculated-defensive-traits) trait instead, for speed — one roll total, not two:

1. Attacker rolls once, normally (Attribute + weapon Skill + modifiers), and computes DoS.
2. If **DoS > the target's Defense** (Mind ÷ 2, round up), the attack connects and deals damage.
3. If **DoS ≤ Defense**, the attack doesn't connect — no damage. (Narration is flexible: dodged, deflected, armor absorbed it entirely — whatever fits the defender's build; see the armor discussion in the design log.)
4. If it connects, **Soak** (armor-driven damage reduction — not yet numerically designed, waiting on an equipment subsystem) further reduces the damage actually applied to the target's current Health Level.

Special-Maneuver Resisted Rolls (Grapple, Trip, Escape — see below) are unaffected by this change; those stay full Resisted Rolls since they're genuinely mutual contests, not one-sided attacks.

## Actions — in progress

Available Actions for the round: **Attack**, **Special Maneuvers** (grapple, disarm, called shot, etc. — not yet defined, see Open Questions), **Use a Skill**, **Use a Gift**, and **Dodge**.

### Dodge — confirmed

A character can spend their turn actively defending instead of acting, for a major boost. Since attack resolution no longer involves a defense roll (see Attack Resolution above), Dodge now boosts the **Defense stat itself**, not a rolled DoS:

- **Effect**: while Dodging, the character's **Defense is multiplied by 1.5 (round up)** for the round.
- **Cost**: Dodge takes the character's **Action** for the round. Declared normally, like any other action.

### Abort to Dodge — confirmed

A more desperate, reactive version of Dodge: if a character is attacked **before their own turn comes up** in the round (i.e. a faster character targets them), they can abandon whatever they'd declared and dodge instead.

- Same effect as standard Dodge: **Defense × 1.5 (round up)** for the round.
- **Cost is total**: Abort to Dodge consumes the character's **Move and Action** for the round — both. This is a full-body scramble to survive, not a controlled defensive stance, and costs accordingly. (Standard, pre-declared Dodge only costs the Action — Move is untouched.)
- The character can take **no other action** this round once they abort to dodge — they are purely, desperately defending themselves.

### Multiple Actions — confirmed

Inspired by White Wolf's split-dice-pool multiple actions rule, adapted to our target-number system: a character can attempt more than one Action in a round by accepting an escalating penalty to their target number — starting on the very first action, not just the second. This is deliberately a gamble, not a free extra swing.

- **Declared during the Declaring step**, like any other action — a character commits to the whole intended chain (each action and target) up front, and resolves them in sequence during their initiative slot.
- **Nth action**: target number reduced by `3 × N` (so 1st action is already at −3, 2nd at −6, 3rd at −9, etc.), same flat-modifier convention as everywhere else in the system (clamped 1-20, crits always live).
- **The chain stops at the first failure** — a failed action ends the character's turn; no further action attempts are allowed after that.
- **Expanded critical failure range, starting on the 2nd action**: on the Nth action (N ≥ 2), a natural roll of `21 − N` or higher is an automatic critical failure, regardless of target number — 2nd action crit-fails on 19-20, 3rd on 18-20, 4th on 17-20, and so on. This is separate from the target penalty above and mostly matters for skilled characters: a natural 19 would normally succeed for someone with a high target number, but on their 2nd action it's an automatic critical failure anyway, overriding the normal success — same logic as natural 20 always failing, just expanded to more numbers the deeper into the chain a character pushes.

**Why 3**: for a representative "average" character (target number 10 — Attribute 5 + Skill 5, the midpoint of the 1-20 range), this gives the 1st action a 35% chance (down from a clean 50% — the real cost of committing to the gamble), the 2nd a 20% chance, and the 3rd and beyond collapse to the 5% floor (only a natural 1 succeeds). Lighter than an earlier draft's flat −5 (which left the 1st action unpenalized), deliberately, since a −3-from-the-start curve limits how often the chain gets used at all while still leaving the 2nd action a real, if worse, option. Weaker characters collapse faster; stronger characters can chain further.

### Special Maneuvers — confirmed

Compiled and deduplicated from **D&D 5e** (Grapple, Shove, Disengage, Dash, Help, Hide, Ready, Two-Weapon Fighting, Opportunity Attack, and the common DMG variant rules Called Shot/Disarm), **Hero System 6e** (which has an explicit universal Combat Maneuvers table available to everyone, no purchase required: Block, Brace, Disarm, Dodge, Grab, Grab By, Haymaker, Move By, Move Through, Multiple Attack, Set, Strike, Throw, Trip, Escape — its purchasable Martial Arts maneuvers like Killing Strike/Choke Hold are closer to our Gifts/Perks than a base Action), and **White Wolf/Storyteller** (Dodge, Block/Parry, Grapple/Clinch, Disarm, Called Shot/Aimed Blow, and **All-Out Attack** — give up your ability to defend entirely for a significant offensive bonus).

**Block/Parry was cut** — already covered by the basic defense mechanic (every attack is a Resisted Roll where the defender rolls to resist; that roll *is* the block/parry/dodge-adjacent defense, no separate maneuver needed for it).

Every maneuver below reuses existing machinery — flat target modifiers, the Dodge-style DoS multiplier, Advantage/Disadvantage, or a straight Resisted Roll — rather than introducing new subsystems per maneuver. All cost the **Action** unless noted otherwise.

**Contest-based maneuvers** (replace a normal attack roll with a straight Resisted Roll — no damage dealt, a status effect instead):

1. **Grapple** — Resisted Roll: attacker's Body + a grappling-relevant Skill vs. defender's choice of Body + Athletics, Body + Acrobatics, or Escapology. Win: target is **Grappled** — their Move drops to 0 until they escape or are released. While grappling, the grappler's own Move is halved unless dragging the target along at that reduced speed.
2. **Trip / Shove** — same contest structure as Grapple. Win: attacker's choice — target is knocked **Prone** (Disadvantage on their own attacks; melee attackers get Advantage against them until they stand back up) or pushed back a short distance.
3. **Escape / Break Free** — the Grappled character's turn to act: Resisted Roll, same skills as Grapple, roles reversed (the Grappled character is the "attacker" of this contest). Win: free of the Grapple.

**Attack-modifying maneuvers** (a normal attack, at a flat target penalty, for a special effect instead of/alongside damage):

4. **Disarm** — attack roll at **−5** to target number (targets the hands, a small target — see the size-dependent penalty below). On a hit, no damage — instead the target's held weapon/item is knocked away.
5. **Called Shot** — attack roll at a **size-dependent** target penalty (confirmed — resolves the long-open "exact called shot modifier" question). **Center of mass (torso) is the default target for any normal attack** — no penalty, and no longer a Called Shot option, since it's just what an ordinary attack already targets. Called Shot lets the attacker aim at something smaller/more specific instead, for a special effect on a hit:
   - **−5**: small/precise targets — **Head**, **Hands**, or similarly sized.
   - **−3**: larger targets — **Arms**, **Legs**, or similarly sized.

   **Proposed location effects** (inspired by Hero System 6e's hit location table — but adapted, since Hero scales its OCV penalty and STUN/BODY multiplier per location while ours only scales the target penalty by size class; the useful lesson isn't Hero's exact numeric scaling, it's the *shape* of the payoff: extremities impair or disable rather than just dealing more damage):
   - **Head** — target is **Stunned** (effect TBD).
   - **Eyes** — target is **Blinded**: Disadvantage on anything requiring sight until treated.
   - **Arms / Hands** — target is **Disarmed** or **Impaired**: weapon/item dropped, or Disadvantage on actions using that limb until healed.
   - **Legs / Feet** — target's **Move is reduced** (Prone-adjacent) until treated.

   **Damage multipliers per location are wanted** (Hero-style — hit harder in a called location, not just get a status effect) **but can't be assigned until the damage subsystem exists.** Flagged for that pass, not designed yet.

   Not yet confirmed — proposal only.

**Defense-sacrificing maneuvers** (reuse Dodge's DoS-multiplier convention, inverted for offense):

6. **All-Out Attack** — this round's attack's **DoS × 1.5** (round up), same math as Dodge. Cost: for the rest of this round, the character's **Defense is treated as 0** — any attack that connects at all (DoS > 0) hits them.
7. **Haymaker** — a bigger, slower version of All-Out Attack: this round's attack's **DoS × 2**. Cost: forfeits **Move**, and **Defense is treated as 0 until the character's next turn** (not just this round) — a much larger commitment for a much larger payoff.

**Movement/Advantage maneuvers**:

8. **Charge** — requires moving at least half the character's Move directly toward the target before attacking. Grants **Advantage** on this round's attack. Cost: **Defense is halved (round up)** until the character's next turn — committed momentum, hard to change direction or brace.
9. **Brace / Aim** — spend the Action steadying instead of attacking. Grants **Advantage** on the character's next Attack roll (made on a later turn). Cost: **Defense is halved (round up)** this round, since focus is entirely on the aim, not on self-protection.
10. **Help / Assist** — spend the Action to grant an ally **Advantage** on their next roll before the helper's own next turn. Direct reuse of the existing Advantage mechanic, same as D&D's Help action.

**Removed**: Disengage — cut, since it only existed to counter a reactive Reaction-trigger mechanic, and **Reactions have been removed from the system entirely** (see Action Economy above — no Reaction resource, no Bonus Action, no interrupts outside Abort to Dodge).

## Health Levels — confirmed

A hybrid of D&D-style numeric HP and White Wolf-style escalating wound penalties, without needing WoD's separate soak/dice-pool machinery. HP is a **numeric pool** (so weapon damage, Degree of Success, criticals, and Called Shot multipliers can all scale it cleanly), but the pool is subdivided into five active **Health Levels**, each a "container" of HP with its own capacity and its own penalty to the character's rolls once entered.

| Level | Name | HP Capacity | Penalty |
|---|---|---|---|
| 1 | **Healthy** | Body × 2 | none |
| 2 | **Sore** | Body | none |
| 3 | **Battered** | Body | −1 |
| 4 | **Wounded** | Body ÷ 2 (round up) | −3 |
| 5 | **Suffering** | Body ÷ 2 (round up) | −5 |
| 6 | **Incapacitated** | 0 | no actions possible; any further damage kills |

**Total HP pool = 5 × Body**, plus 1 if Body is odd (from rounding the two half-Body containers up). Reference table:

| Body | Healthy | Sore | Battered | Wounded | Suffering | **Total** |
|---|---|---|---|---|---|---|
| 1 | 2 | 1 | 1 | 1 | 1 | **6** |
| 2 | 4 | 2 | 2 | 1 | 1 | **10** |
| 3 | 6 | 3 | 3 | 2 | 2 | **16** |
| 4 | 8 | 4 | 4 | 2 | 2 | **20** |
| 5 | 10 | 5 | 5 | 3 | 3 | **26** |
| 6 | 12 | 6 | 6 | 3 | 3 | **30** |
| 7 | 14 | 7 | 7 | 4 | 4 | **36** |
| 8 | 16 | 8 | 8 | 4 | 4 | **40** |
| 9 | 18 | 9 | 9 | 5 | 5 | **46** |
| 10 | 20 | 10 | 10 | 5 | 5 | **50** |

**Rules:**

- Damage is applied to the character's **current** Health Level's container. When that container empties, the character drops to the next level down and any further damage applies there.
- **No overflow**: a single hit can only ever deplete the current container, down to a minimum of 0 — excess damage beyond what's left in that container is wasted, not carried into the next level. A single hit never drops a character more than one Health Level, no matter how large. Deliberate — "big damn hero" durability (see [design-log.md](../docs/design-log.md)).
- The penalty at each level is **applied to the character's rolls "across the board"** — this reuses the system's existing flat-modifier convention (−1, −3, −5 are not new numbers: −3 already means something as the Multiple Actions step, and −5 is already the system's standard max modifier elsewhere). Since Defense is a calculated trait rather than a roll, "across the board" penalties don't directly reduce it as written — whether a wounded character's Defense should *also* degrade (an intentional death-spiral) is a separate, still-open question, not automatically implied by the existing wording.
- **Incapacitated** has no buffer: no actions, and any further damage is fatal. No dying/stabilizing state currently exists — this is a deliberate lethality choice, not yet reconfirmed as final.
- **Round up** universally (per [core-mechanic.md](core-mechanic.md#rounding--ties)) applies to the Wounded/Suffering HP calculation.

**Not yet designed:**

- **Healing** — how a character moves back up a Health Level (recovers HP in a lower container) isn't designed at all yet.
- Whether Incapacitated's all-or-nothing lethality is final, or wants a last-gasp buffer state.

## Still to Design

- **Damage**: how damage is determined once a hit lands — fixed weapon value? scales with the attacker's Degree of Success (tying into the running "DoS drives magnitude" theme)? a separate damage roll? Health Levels (above) answer *how damage is tracked*, but not yet *how much damage a hit deals*. **Once this exists, Called Shot locations need a damage multiplier added (Hero-style) — flagged above, not designed yet.**
- **Soak**: armor-driven damage reduction, applied after a hit connects via Defense — conceptually gear-based (see [core-mechanic.md](core-mechanic.md#calculated-defensive-traits)), not numerically designed, waiting on an equipment subsystem.

## Deferred Skills

Combat skills (Melee, Unarmed, Firearms, Archery/Thrown, Heavy Weapons, Dodge) — see [premade-skills.md](premade-skills.md).

## Deferred Perks

Combat-adjacent Perks (Combat Reflexes, Quick Draw, Alertness) — see [perks.md](perks.md).

## Open Questions

- What is the critical failure effect in combat (weapon drop/break, self-harm, exposed position, etc.)?
- Confirm the proposed Called Shot location effects (Head/Eyes/Arms-Hands/Legs-Feet) — see Special Maneuvers above.
- Damage multiplier per Called Shot location — blocked on the damage subsystem existing first.
- How does combat interact with the free skill+attribute pairing rule (e.g. is "Melee Weapons" always Body, or can it pair with other attributes too)?
- Exact grappling-relevant Skill for the Grapple maneuver's attacker side (does it use an existing Skill, or is a new one needed?).
- Whether a wounded character's Defense should also degrade under the Health Level penalty (an intentional death-spiral), now that Defense is a calculated trait rather than a roll — not automatically implied by the existing "across the board" wording.
- Confirm "Defense halved (round up)" as the substitute for "Disadvantage on defense" (Charge, Brace/Aim) — Advantage/Disadvantage only applies to dice rolls, and Defense isn't rolled anymore, so this is a proposed fix, not a confirmed one.
