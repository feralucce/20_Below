# Combat

_In active design as of 2026-07-12._

## Decided so far

- **Critical success**: double damage, plus an additional GM-narrated effect.
- **Critical failure**: always fails (per core mechanic); combat gets a category × severity-tier table, keyed off `|DoF|` — see [Critical Failure](#critical-failure--confirmed) below.
- **Called shots**: impose a size-dependent difficulty modifier on the attack roll (see Special Maneuvers below).
- **Resonance**: a per-player 1-20 pool (supersedes Spark, named 2026-07-14, widened from 1-10 to 1-20 on 2026-07-15) with a full cost-tiered spend menu — Advantage, rerolls, canceling a critical failure, refilling a lost Health Level, auto-stabilizing, a bonus Action, boosting DoS/an NPC's DoF, and forcing a GM reroll — see [core-mechanic.md](core-mechanic.md#resonance--confirmed).
- **Damage**: Weapon Base (1-10, by weapon class) + (DoS − Defense); only the Weapon Base doubles on a crit — see [Damage](#damage--confirmed) below.

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

**Bank access**: players only touch their bank to spend a result on a combat d20 roll. **Updated 2026-07-14**: earlier drafts had Spark/Willpower interact directly with the bank (forcing a banked result onto the GM, gifting one to another player) — [Resonance's spend menu](core-mechanic.md#resonance--confirmed) replaced those with different effects (rerolls, forcing a GM reroll, etc.) that don't touch the bank at all, so Resonance and the dice bank are now fully independent systems.

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

### Surprise — confirmed

**Resolved 2026-07-14** (Option C from the research pass, plus an added Initiative penalty): who is surprised is a **GM call based on the fiction** (an ambush, an unseen threat, a scene that opens mid-danger) — no dedicated roll to determine it, consistent with this system's general GM-authority philosophy over narrative framing. A surprised character:

- **Grants Advantage to attacks made against them** — reuses the existing [Advantage/Disadvantage](core-mechanic.md#advantage--disadvantage--confirmed) mechanic rather than a new subsystem; "attacking an unaware or surprised target" was already listed as a candidate Advantage trigger (see [core-mechanic.md](core-mechanic.md#advantage-trigger-examples--non-exhaustive)), so this locks that candidate in as a confirmed trigger specifically for Surprise.
- **Takes -5 to their Initiative Degree, for the first round of combat only** — applied the same way as Combat Reflexes' +5 (a flat shift to the rolled Degree, not the target number, per the existing Initiative-modifier convention above). After the first round, this penalty no longer applies even if the fight continues.

Researched D&D 5e (lose your action/movement entirely on the surprise round), Pathfinder 1e (flat-footed, no surprise-round action), Hero System (Surprise Attack: attacker OCV bonus, target loses DCV), and Rifts/OWoD (surprised side loses the initiative contest or acts last) before settling on this combination — it reuses two mechanics the system already has (Advantage/Disadvantage, Degree modifiers) rather than inventing a new "lose your turn" rule, while still being a meaningfully harder hit than either piece alone.

**[Alertness](perks.md#combat-adjacent--confirmed)** grants immunity to both effects above while conscious, unless a mind-altering effect specifically allows the surprise. **[Reduced Reactions](flaws.md#combat-adjacent)** is the mirror — no immunity, and GMs may treat borderline "was this character surprised?" calls against that character more readily.

### Declaring — confirmed

- Declaring commits a character to a **specific action and target** — full commitment, not just an action type. This is what creates the tactical tension of the reverse-declare order: low-initiative characters commit blind, high-initiative characters react to everything already on the table.
- **Free re-declare rule**: if a faster (higher-initiative) character's action does something that prevents a slower character from carrying out their declared action as declared — the target is removed, moved out of reach, the environment changes, whatever the specific reason — that slower character gets to **freely re-declare both their action and target** when their turn comes up. No penalty, no lost turn.

### Attack Resolution — confirmed

Ordinary attacks are **not** a Resisted Roll. They use the [Defense](core-mechanic.md#calculated-defensive-traits) trait instead, for speed — one roll total, not two:

1. Attacker rolls once, normally (Attribute + weapon Skill + modifiers), and computes DoS.
2. If **DoS > the target's Defense** (Mind ÷ 2, round up), the attack connects and deals damage.
3. If **DoS ≤ Defense**, the attack doesn't connect — no damage. (Narration is flexible: dodged, deflected, armor absorbed it entirely — whatever fits the defender's build; see the armor discussion in the design log.)
4. If it connects, **Soak** (a flat integer that reduces the damage actually applied — see [Soak](#soak--confirmed) below) further reduces the damage actually applied to the target's current Health Level.

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

1. **Grapple** — Resisted Roll: attacker's Body + **Unarmed Combat** (resolved 2026-07-13 — see [premade-skills.md](premade-skills.md#combat--confirmed)) vs. defender's choice of Body + Athletics, Body + Acrobatics, or Escapology. Win: target is **Grappled** — their Move drops to 0 until they escape or are released. While grappling, the grappler's own Move is halved unless dragging the target along at that reduced speed.
2. **Trip / Shove** — same contest structure as Grapple. Win: attacker's choice — target is knocked **Prone** (Disadvantage on their own attacks; melee attackers get Advantage against them until they stand back up) or pushed back a short distance.
3. **Escape / Break Free** — the Grappled character's turn to act: Resisted Roll, same skills as Grapple, roles reversed (the Grappled character is the "attacker" of this contest). Win: free of the Grapple.

**Attack-modifying maneuvers** (a normal attack, at a flat target penalty, for a special effect instead of/alongside damage):

4. **Disarm** — attack roll at **−5** to target number (targets the hands, a small target — see the size-dependent penalty below). On a hit, no damage — instead the target's held weapon/item is knocked away.
5. **Called Shot** — attack roll at a **size-dependent** target penalty (confirmed — resolves the long-open "exact called shot modifier" question). **Center of mass (torso) is the default target for any normal attack** — no penalty, and no longer a Called Shot option, since it's just what an ordinary attack already targets. Called Shot lets the attacker aim at something smaller/more specific instead, for a special effect on a hit:
   - **−5**: small/precise targets — **Head**, **Hands**, or similarly sized.
   - **−3**: larger targets — **Arms**, **Legs**, or similarly sized.

   **Location effects — confirmed**, tiered by severity (inspired by Hero System 6e's hit location table, and by the broader convention shared by Rolemaster/Mythras/WFRP/Cyberpunk RED/Fallout of scaling crit tables from minor setbacks to permanent/lethal injuries — adapted here to reuse mechanics the system already has, not import new subsystems like attribute drain or exhaustion tracks). **Severity tier is set by leftover DoS — `DoS − Defense`, the exact same number that already drives bonus [Damage](#damage--confirmed)** — so this adds no new roll or number to track:

   | Tier | Leftover DoS (`DoS − Defense`) |
   |---|---|
   | Minor | 0-2 |
   | Moderate | 3-5 |
   | Severe | 6-8 |
   | Catastrophic | 9+ |

   **Head** (−5 penalty):
   | Tier | Effect |
   |---|---|
   | Minor | Dazed — Disadvantage on the target's next roll |
   | Moderate | Stunned — target loses their next Action (keeps Move) |
   | Severe | Concussed — target is knocked Prone, loses their entire next turn (Move + Action), Disadvantage on rolls until end of that turn |
   | Catastrophic | On a **Standard NPC**: killed outright, regardless of remaining HP. On a **Named NPC or PC**: the hit drains whatever's left in the target's current Health Level container and carries the excess into the next level down (added to the overflow exception below, alongside Ordnance/Siege) — a Healthy target is dropped to Sore and takes further damage there; a Suffering target drops to Incapacitated. **No autokill beyond the normal Incapacitated rule** — dropping *into* Incapacitated this way doesn't itself kill; a target already *at* Incapacitated who takes any further damage still dies, same as always. |

   **Arms / Hands** (−5 penalty):
   | Tier | Effect |
   |---|---|
   | Minor | Grip slips — Disadvantage on the target's next roll using that arm |
   | Moderate | **Disarmed** — held item/weapon knocked away (same effect as the Disarm maneuver above) |
   | Severe | Arm impaired — Disadvantage on all actions using that arm until treated |
   | Catastrophic | Arm disabled — unusable for the rest of the fight until treated |

   **Legs / Feet** (−3 penalty):
   | Tier | Effect |
   |---|---|
   | Minor | Stumble — Disadvantage on the target's next Move this round |
   | Moderate | Speed halved (round up) until treated |
   | Severe | Knocked Prone, and Speed halved until treated |
   | Catastrophic | Speed drops to 0 — can't Move under their own power until treated |

   **"Standard" vs. "Named" NPC** is a new distinction, introduced here for the first time — not otherwise defined elsewhere in the system yet. Intent: Standard NPCs are disposable/mook-tier threats (dying outright to a called headshot is a deliberate genre convention, not a bug); Named NPCs are recurring/significant characters (including BBEGs) who play by the same Health Level rules as PCs. No formal mechanical definition of the split exists yet — GM judgment call until/unless one gets written.

   **Every "until treated" effect depends on the Healing mechanic**, which isn't designed yet (open TODO item) — the effects are real, but open-ended in duration until that exists.

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
- **No overflow, with exceptions**: a single hit can only ever deplete the current container, down to a minimum of 0 — excess damage beyond what's left in that container is wasted, not carried into the next level. A single hit never drops a character more than one Health Level, no matter how large. Deliberate — "big damn hero" durability (see [design-log.md](../docs/design-log.md)). **Exceptions that do carry excess damage into subsequent Health Levels:**
  - Hits from **Ordnance or Siege/Cataclysmic weapons** (Weapon Base +9 or +10, see [Damage](#damage--confirmed)) — heavy weapons, anti-materiel rifles, explosives, mounted/vehicle weapons.
  - A **Catastrophic Called Shot to the Head against a Named NPC or PC** (see Special Maneuvers above).
- The penalty at each level is **applied to the character's rolls "across the board"** — this reuses the system's existing flat-modifier convention (−1, −3, −5 are not new numbers: −3 already means something as the Multiple Actions step, and −5 is already the system's standard max modifier elsewhere). Since Defense is a calculated trait rather than a roll, "across the board" penalties don't directly reduce it as written — whether a wounded character's Defense should *also* degrade (an intentional death-spiral) is a separate, still-open question, not automatically implied by the existing wording.
- **Incapacitated** has no buffer: no actions, and any further damage is fatal. No dying/stabilizing state currently exists — this is a deliberate lethality choice, not yet reconfirmed as final.
- **Round up** universally (per [core-mechanic.md](core-mechanic.md#rounding--ties)) applies to the Wounded/Suffering HP calculation.

**Not yet designed:**

- **Healing** — how a character moves back up a Health Level (recovers HP in a lower container) isn't designed at all yet.
- Whether Incapacitated's all-or-nothing lethality is final, or wants a last-gasp buffer state.

## Damage — confirmed

**Damage = Weapon Base + (DoS − Defense)**. No separate damage roll — this reuses the attack roll's own DoS, continuing the system's "DoS drives magnitude" theme (see [core-mechanic.md](core-mechanic.md#degree-of-success--degree-of-failure)) instead of adding a second roll that would also break the Pre-Rolled Combat Dice bank (a second, non-d20 damage die doesn't fit the bank at all).

**On a critical success, only the Weapon Base doubles: `(Weapon Base × 2) + (DoS − Defense)`** — not the whole total. A crit already guarantees the hit outright (natural 1) and the leftover-DoS term is already unbounded/variable; doubling that variable term too would compound two sources of swing on top of each other. Doubling just the fixed, known component keeps crits hit noticeably harder without becoming degenerate.

Because [ties now go to the aggressor](core-mechanic.md#rounding--ties), a hit requires `DoS ≥ Defense`, so `DoS − Defense` is always ≥ 0 on a connecting hit — a bare/tied hit still deals the weapon's full base damage, never less.

**Weapon Base** is a flat integer, 1-10 (matching the system's universal 1-10 Attribute/Skill scale), assigned by weapon class rather than a per-weapon catalog:

| Base | Class | Melee examples | Ranged examples |
|---|---|---|---|
| +1 | Unarmed | fists, bite, claws | — |
| +2 | Improvised | broken bottles, chairs, brass knuckles | thrown rocks |
| +3 | Light | daggers, knives | pistols, thrown weapons |
| +4 | Simple | hatchets, clubs, batons | slings, light bows |
| +5 | Medium | swords, axes, maces | SMGs, crossbows |
| +6 | Martial | spears, flails, war-picks | carbines, hunting rifles |
| +7 | Heavy | greatswords, polearms, warhammers | battle rifles, shotguns |
| +8 | Superheavy | mauls, siege blades | sniper rifles, LMGs |
| +9 | **Ordnance** | (rare — magic/ritual-grade melee) | heavy weapons, anti-materiel rifles, grenade launchers |
| +10 | **Siege/Cataclysmic** | (rare — magic/ritual-grade melee) | explosives, rocket launchers, mounted/vehicle weapons |

Melee and ranged weapons of comparable "weight class" share the same base — a dagger and a pistol both sit at Light — rather than firearms being a flatly higher-damage ladder. This is a deliberate abstraction: real-world trauma data shows gunshot wounds run meaningfully more lethal than blade wounds (see [design-log.md](../docs/design-log.md)), but the system chose to represent guns' real advantage as **range**, not raw damage, keeping melee and ranged combat comparably dangerous once a fight closes to any distance.

**Only Ordnance (+9) and Siege/Cataclysmic (+10) can spill damage across Health Levels** — every other weapon class is bound by the standard No Overflow rule above (a hit caps at whatever's left in the current container). This keeps the top two tiers meaningfully catastrophic without making every heavy weapon a one-shot machine.

Calibration check, average character (Body 5, Mind 5 → Defense 3, Healthy pool 10 HP), average leftover DoS on a connecting hit ≈ 3:

| Base | Avg dmg | Effect on a Healthy (10 HP) target |
|---|---|---|
| +1 | 4 | ~2-3 hits to drain |
| +2 | 5 | ~2 hits |
| +3 | 6 | ~1-2 hits |
| +4 | 7 | ~1-2 hits |
| +5 | 8 | ~1-2 hits |
| +6 | 9 | ~1 hit |
| +7 | 10 | exactly drains Healthy in 1 hit |
| +8 | 11 | drains Healthy, no spillover (capped) |
| +9 | 12 | drains Healthy, **spills into Sore** |
| +10 | 13 | drops **multiple** Health Levels in one hit |

**Called Shot locations no longer need a separate damage multiplier** — superseded by the DoS-tiered location effects above (see Special Maneuvers), which scale severity off the same leftover-DoS number instead of a second numeric multiplier.

## Soak — confirmed

**Resolved 2026-07-15**: Soak is a **flat integer**, applied as `Damage − Soak` after Weapon Base has already doubled on a crit, with **no minimum-damage floor** — if Soak meets or exceeds total Damage, the hit deals 0. This mirrors GURPS/Hero System/Cyberpunk RED's flat-subtraction convention rather than [Health Levels'](#health-levels--confirmed) explicitly-avoided WoD soak-dice-pool model.

**Source: the [Bulwark](premade-gifts.md#bulwark-damage-resistance) Gift**, not a dedicated equipment subsystem (which doesn't exist yet). Bulwark grants flat Soak `+1` per Level (1-5), using Hero System's **Special Effect** convention: the mechanic is fixed, but the fictional source is the player's choice at creation — tough skin, a mystic ward, subdermal plating, hardened chi, whatever fits the character — and the GM may let that fictional flavor matter narratively (a ward can be dispelled, skin can't) without changing the numbers. If/when a full equipment subsystem gets designed later, gear-based armor could layer on as an additional, independent Soak source rather than replacing Bulwark — not decided yet, flagged as a future consideration.

Calibration against the existing Damage table (average character, leftover DoS ≈ 3): a Bulwark 4 (Soak +4) fully stops a Light weapon (+3 base, ~6 avg damage reduced to ~2) and meaningfully blunts a Medium one, while even Bulwark 5 (Soak +5) still lets a Heavy weapon (+7 base, ~10 avg damage) through for a real hit (~5) — armor-equivalent Soak blunts the top of the weapon ladder rather than neutralizing it.

## Critical Failure — confirmed

Triggers on a natural 20 (or, in a Multiple Actions chain, any roll in the expanded crit-fail range already defined). Outside combat, a critical failure stays pure GM narration (per [core-mechanic.md](core-mechanic.md#critical-results)) — this table is combat-only, mirroring how Called Shot's location effects are also combat-only.

**Severity tier reuses the same bands as Called Shot's location effects**, keyed off Degree of Failure instead of DoS:

- **`DoF = target − 20`, always** — simplified, not `target − (actual triggering die)`. Even when a Multiple Actions chain triggers the crit-fail on a roll below 20 (per its expanded range), DoF is still computed as if the die were 20. One number, no need to track which specific roll in the chain triggered it.
- Tier is set by `|DoF|` (`20 − target`):

| Tier | \|DoF\| (`20 − target`) |
|---|---|
| Minor | 0-2 |
| Moderate | 3-5 |
| Severe | 6-8 |
| Catastrophic | 9+ |

Lower-skilled characters (low target number) land more severe fumbles; a highly-skilled character's nat 20 is already close to their target, so it fumbles lightly.

**GM picks whichever category below best fits the fiction** — melee/ranged mishap, self-injury, positional, defensive, or (with an ally in the line of fire) team — same as they already pick a Called Shot location.

**Weapon Mishap** (melee or ranged — one table covers both; the mechanical shape doesn't need to differ by weapon type):
| Tier | Effect |
|---|---|
| Minor | Grip slips / shot goes wide — Disadvantage on your next attack |
| Moderate | Weapon dropped or jams — lose your next Action recovering it |
| Severe | Weapon damaged — unusable for the rest of the fight |
| Catastrophic | Weapon destroyed, and the backfire hits you: take damage equal to your own Weapon Base (no leftover) |

**Self-Injury**:
| Tier | Effect |
|---|---|
| Minor | Disadvantage on your next roll |
| Moderate | You strike yourself for your Weapon Base (no leftover) — reuses the Damage formula directly |
| Severe | As Moderate, and you're knocked Prone |
| Catastrophic | You strike yourself for `Weapon Base × 2`, as if critically hit |

**Positional Failure**:
| Tier | Effect |
|---|---|
| Minor | Lose 2m off your remaining Move this round |
| Moderate | Knocked Prone |
| Severe | Knocked Prone, and lose your next Move entirely |
| Catastrophic | GM narrates a real environmental consequence (off a ledge, into a hazard) — open-ended, same as any GM-narrated extra |

**Defensive Failure**:
| Tier | Effect |
|---|---|
| Minor | The next attack against you gains a source of Advantage |
| Moderate | Your Defense is halved (round up) until your next turn — reuses Charge/Brace's convention |
| Severe | Your Defense is treated as 0 until your next turn — reuses All-Out Attack/Haymaker's convention |
| Catastrophic | As Severe, and you're knocked Prone |

**Team Mishap** (friendly fire — only relevant with an ally in the line of fire):
| Tier | Effect |
|---|---|
| Minor | An ally must adjust position — GM narrates the inconvenience |
| Moderate | An ally takes Disadvantage on their next roll |
| Severe | An ally takes damage equal to your Weapon Base (no leftover) |
| Catastrophic | An ally takes `Weapon Base × 2` damage, as if you'd critically hit them by mistake |

Dropped from consideration, not forgotten: Social and Skill-check fumble tables (Athletics, Stealth, Thievery, etc.) and Magical Mishaps. Those stay under the existing "GM narrates a fitting complication" rule for non-combat rolls — only combat gets a fixed table, per the core mechanic's own design philosophy. Magical Mishaps specifically will be revisited once the Gift catalog gets its combat detail pass.

## Combat Skills — confirmed

No longer deferred (2026-07-13, revised 2026-07-13) — see [premade-skills.md](premade-skills.md#combat--confirmed) for the finalized list: Melee Combat, Unarmed Combat, Firearms/Archery (merged), Special Weapons (now an exception Skill for a single exotic/siege-class weapon rather than a broad category). Dodge/Evasion was dropped as a Skill — avoiding attacks is handled by the Defense trait instead.

## Deferred Perks

Combat-adjacent Perks (Combat Reflexes, Quick Draw, Alertness) — see [perks.md](perks.md).

## Open Questions

- Combat-adjacent Perks (Combat Reflexes, Quick Draw, Alertness) — deferred, coming back to these soon.

## Resolved (2026-07-13)

- **"Standard NPC" vs. "Named NPC/PC"**, introduced by Catastrophic Head, is now defined: **Standard NPCs** are general-purpose threats pulled straight from a rogues' gallery or bestiary — disposable, no special mechanical access. **Named NPCs** have access to the same mechanisms as PCs (Health Levels, Damage, Called Shot, etc.) **except Resonance** — that stays player-only. Named NPCs are typically BBEGs or their significant henchmen.
- **Combat follows the same free skill+attribute pairing rule as everything else** — no combat-specific lock-in. It's situational and re-argued per attempt, same as any Skill+Attribute pairing (see [skills.md](skills.md)): a Melee Combat attack most often pairs with Body, but a sufficiently clever character could argue a feinting attack pairs with Mind instead, subject to the GM's usual case-by-case approval.
- **Grapple's attacker Skill is Unarmed Combat** — see [premade-skills.md](premade-skills.md#combat--confirmed).
- **Confirmed: "Defense halved (round up)" stands** as Charge/Brace's cost, substituting for the old "Disadvantage on defense" now that Defense is a calculated trait rather than a roll.
- **A wounded character's Defense does NOT degrade under the Health Level penalty.** Defense stays level regardless of Health Level — only the −1/−3/−5 "across the board" penalty applies to actual rolls. Deliberate: letting Defense also degrade would create a death-spiral severe enough to cripple a wounded character's ability to avoid follow-up hits entirely.
- **Incapacitated lethality, partially resolved**: "any further damage kills" now requires the damage to be **intentional** — an attacker specifically trying to kill the Incapacitated character. Incidental/unintentional damage does not trigger death. **First Aid introduced as the first piece of the Healing mechanism**: a First Aid Skill roll (see [premade-skills.md](premade-skills.md#medical)) that, on success, restores HP equal to DoS — capped so it **cannot raise the character above Suffering**. Healing beyond Suffering (back to Battered/Sore/Healthy) is still undesigned, presumably requiring real medical treatment, rest, or other means not yet written.
