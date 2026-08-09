# Core Mechanic

## Attributes

Five attributes, each linked to a classical element. Each pairs a felt **domain** (what it represents narratively) with a **mechanical role** (what it drives in the rules) — the derived formulas for each role are still open, tracked in [design-log.md](../docs/design-log.md#open-questions).

| Attribute | Domain | Mechanical Role |
|---|---|---|
| **Earth** | Physical power/endurance | Soak / Potence |
| **Air** | Agility/adaptability, mind/intellect | Initiative / Psyche |
| **Fire** | Drive/aggression | Damage / Presence |
| **Water** | Perception/empathy | Stamina / Health |
| **Wyrd** | Fate/destiny/the supernatural | Warp / Weft |

**Restructured 2026-07-22**: Air's old sub-stat **Luck is retired from Air and folded into Weft** (Wyrd's sub-stat) — fate/fortune fits Wyrd's whole domain better than Air's. In its place, Air gains **Psyche**, a Mind/Intellect-flavored sub-stat, giving Air a mental-resistance role matching the classical/pagan association of Air with the mind. This also builds toward a triad of passive "wall" sub-stats working like Defense: **Soak (Physical, Earth), Presence (Social, Fire), Psyche (Mental, Air)** — both now confirmed, see [The Passive Wall Triad](#the-passive-wall-triad--soak-presence-psyche).

**Earth's Healing scrapped for good, replaced by Potence** — Healing never found a mechanic that made sense as its own stat (repeatedly dead-ended, including a brief detour where it moved to Weft and got reverted). Earth's second sub-stat is now **Potence** — raw physical power/strength (carrying capacity, immovability, mass, forcing/breaking things). Exact mechanic still TBD.

Attributes are scored **1-10** (1 = lowest, 10 = highest).

### Sub-Category Allocation

Every Attribute's Mechanical Role is actually **two sub-stats** (e.g. Earth = Soak / Healing). The Attribute's own score is **always the number used to roll** (see [Resolution](#resolution)) — it is never reduced or consumed by the split below.

Separately, that same score also generates a **pool of points equal to the Attribute's rating**, which the player allocates across its two sub-stats — a player choice, not an even split. An Attribute of 10 both rolls as 10 *and* grants 10 points to divide, e.g. 7 Soak / 3 Healing, or 5/5, or any other division. What each allocated point actually *buys* in each sub-stat (the formula/scale) is still TBD — see [design-log.md](../docs/design-log.md#open-questions).

**Repealed 2026-07-22**: the earlier blanket rule ("sub-stats never affect pass/fail, they add to the effect of a success") is dropped. In practice it was never actually implemented for any sub-stat's effect formula, so nothing concrete depended on it — see [design-log.md](../docs/design-log.md#open-questions) for what each sub-stat actually does, decided case by case rather than under one universal rule.

### Health Levels

**Proposed 2026-07-22**, referencing but simplifying [v1's Health Levels](../archive/v1/rules/combat.md#health-levels--confirmed): **Health Levels are a count of discrete hit-boxes**, not a numeric HP pool. Each Health Level can absorb damage **once** — a binary hit-box, not a container with its own capacity.

**Baseline, confirmed 2026-07-22**: every character starts with **5 Health Levels**, flat, before anything else is added — fixes the earlier problem where a character with 0 points in Health (Water's sub-stat) could end up with 0 Health Levels, effectively dead at character creation.

- **`PC Health Levels = 5 + Health (sub-stat)`** — the flat baseline, plus whatever a PC invests in Water's Health sub-stat.
- **NPCs will most often just be the flat 5**, with no Health sub-stat added — a deliberate design choice: minor/"weenie" NPCs are meant to go down in a single connecting hit, while PCs are built tougher by default.

**What happens at 0, resolved 2026-08-09** (established alongside the [Unstoppable Boon](boons.md)): at **0 Health Levels**, a character falls unconscious and can't act. Health Levels can still be tracked into negative territory from further damage — at **Health Levels ≤ −(Health sub-stat)**, the character dies. Ordinarily this negative range plays out off-screen, since an unconscious character can't act or be aware of it; [Unstoppable](boons.md#major) is the exception that lets a character stay conscious and act throughout that same negative range instead of blacking out at 0.

**Crossing zero, resolved 2026-08-09** — deliberately anime-flavored: a single attack can never skip a character straight past 0 into negative territory. If enough connecting dice from one attack (see [Damage — Per-Die Resolution](#damage--per-die-resolution)) would carry a character's Health Levels below 0, the excess is simply discarded — they land exactly at 0, no further, no matter how many dice connected. **Once a character is already at 0 Health Levels** — unconscious under the rule above, or still conscious via Unstoppable — **any further attack can only remove 1 Health Level, total, regardless of how many dice connect.** The normal "multiple Health Levels from one attack" rule only applies while a character is still above 0; below it, every hit costs exactly one Level, turning the drop toward the −(Health sub-stat) death threshold into a slow, grinding countdown rather than a single unlucky roll ending things outright.

### Damage — Per-Die Resolution

**Revised 2026-07-22**, replacing the earlier "sum all dice, compare once" version, which broke down mathematically (a fixed-ceiling Soak couldn't keep pace with an unbounded dice sum — see [design-log.md](../docs/design-log.md) for the math that killed it).

On a successful hit, the attacker's **Damage sub-stat sets how many d10 are rolled** — one die per point of Damage. **Each die is resolved individually against the defender's Soak**, not summed together:

- **Die result > Soak** — that die connects, and costs the defender **one Health Level**.
- **Die result ≤ Soak** — that die is fully absorbed, no effect.

Because a single die (1-10) and Soak (0-10) sit on the exact same scale, this is a fair, bounded comparison — unlike the old summed version. **Soak 10 guarantees 0% connect chance per die — true, complete negation**, achievable by full investment, matching the confirmed "Soak can fully negate" design goal. A high-Damage attack (more dice) doesn't overwhelm Soak mathematically — it just means **more independent chances to connect**, so a single attack can now plausibly cost a defender **multiple** Health Levels at once if several dice connect, which the old "one hit, one Level, period" version couldn't do.

![Damage's per-die resolution](../docs/assets/diagrams/damage-per-die-resolution.svg)

### Potence — Confirmed 2026-08-09

Potence (Earth's other sub-stat: raw physical power/strength — carrying capacity, immovability, mass, forcing/breaking things) splits into two jobs, following the same combat-job-plus-general-gauge split already established for [Stamina](fate.md#staminas-job):

1. **Flat passive give (mundane use, no roll)** — Potence directly sets a **Carrying Capacity** (how much weight a character can lift/carry/drag under ordinary conditions) and a **Break Threshold** (the bar an object's resistance must sit under to be forced open/broken with no contest involved, e.g. a flimsy lock nobody's holding shut). Exact scaling formula for both numbers not yet set.
2. **Contested dice pool, reusing Damage's shape** — when forcing, breaking, or moving something that's actively resisting (a grapple, a door someone's holding shut, a struggling creature), **Potence sets how many d10 are rolled**, identical to [Damage's per-die resolution](#damage--per-die-resolution). Each die is compared individually against the target's relevant resistance: a grappled/restrained creature's own **Soak**, or — for inanimate resisting objects — a not-yet-defined **Hardness** stat (GM-set, same 0-10 scale, functioning as an object's Soak equivalent; see [design-log.md](../docs/design-log.md#open-questions)). Each connecting die represents one increment of success (one step of forced movement, one point toward breaking the object/hold).

Chosen over a single approach because it covers all four flavors in Potence's domain at once — mass/capacity get the flat give, immovability/forcing-under-resistance get the contested roll — while reusing an already-proven mechanical shape (Damage's dice pool) rather than inventing a new one from scratch.

### The Passive Wall Triad — Soak, Presence, Psyche

**Confirmed 2026-07-22**: Presence (Fire) and Psyche (Air) both mirror **Soak exactly** — the identical per-die mechanic, just resisting a different attack type. All three sub-stats are **passive gives**, the same way Health is: a flat number a character simply has, doing its job automatically with no roll or spend required.

- **Soak** — wall against **Physical** damage dice.
- **Presence** — wall against **Social** attack dice.
- **Psyche** — wall against **Mental** attack dice.

For all three: each attack die is resolved individually against the relevant wall stat. Die ≤ wall stat is fully absorbed; die > wall stat connects. A wall stat of 10 guarantees 0% connect chance per die — true, complete negation — unless the attacker spends Fate Tokens (1 per die) to add their own matching Attack sub-stat to that specific die, per the same [Fate Token Infusion](#fate-token-infusion) rule already defined for Soak/Damage. What a connecting Social or Mental die actually costs the defender (a Health Level, same as Physical? A different track?) is not yet decided — see [design-log.md](../docs/design-log.md#open-questions).

**Presence and Psyche are self-paired attacker/wall stats — confirmed 2026-08-09.** Physical splits the attacker/wall pair across two Attributes (Fire's Damage sets the dice, Earth's Soak is the wall). Social and Mental don't get their own separate Attribute the way Physical does, so **Presence and Psyche each do both jobs on their own stat**: a character's Presence sets how many d10 they roll when making a Social attack (intimidation, a cutting rebuke, a bald-faced lie under pressure), resolved die-by-die against the *target's* Presence acting as their wall — identical shape to [Damage vs. Soak](#damage--per-die-resolution), just both ends read off the same-named stat on two different characters. Psyche works identically for Mental attacks. This is the dice-pool mechanism only — it has no Powers/abilities hooked up to trigger it yet, and what a connecting die costs the defender is still the open question noted above; both are separate from putting the roll's shape in place.

### Weft — Confirmed 2026-07-22

Two passive functions, both "gives" like Health/Soak/Presence/Psyche — no roll, no spend:

1. **Ki Regeneration** — Weft sets how much Ki is restored whenever Ki's refill trigger fires (the trigger itself is still undecided — see [design-log.md](../docs/design-log.md#open-questions)).
2. **Lucky Number** — a character's lucky number equals their **Weft rating**. Whenever **any die** rolled for that character (the core roll, damage dice, Advantage/Disadvantage dice, the Initiative die, anything) shows a result **equal to their Weft rating**, they immediately gain **1 Fate Token** — automatic, no choice, no cost. Fitting, since it's their own innate luck occasionally handing them the literal currency of bending fate further.

### Fate Token Infusion

**Confirmed 2026-07-22**, replacing the earlier "+1 die per token" version: **the baseline damage die is a raw, unboosted d10 vs Soak — Soak 10 fully negates it, guaranteed (0% connect).** Before the roll, a player may spend **1 Fate Token per individual die** to add their full Damage rating to that specific die's result — "infusing the attack with their own essence." A boosted die is compared as `d10 + Damage rating` vs Soak, same threshold rule (result > Soak connects).

This makes full negation the honest default, not a permanent wall: an unboosted attack against Soak 10 can never get through, but a player willing to spend Fate Tokens (1 per die, each spend triggering the normal [Fatigue Check](fate.md#fatigue-check) and counting against [Stamina's per-encounter spend cap](fate.md#staminas-job)) can crack even a maxed-Soak target — verified: a boosted die with Damage rating 10 vs Soak 10 is a guaranteed connect, while Damage 2 only gives a 20% chance per boosted die. Soak is a real wall by default; Fate Tokens are the deliberate, resource-costed way through it.

### Ki Spend to Preserve a Health Level

A player may spend **1 point from Ki** (the pool — distinct from [Fate Tokens](fate.md), the resource players earn/spend) to **cancel the loss of one Health Level**, at a cost of 1 Ki per Level preserved. Multiple Ki can be spent to preserve multiple Levels.

Not yet decided: what happens once Health Levels run out (incapacitated? dying? does it mirror v1's stacking penalties as Levels are lost, or stay flat until 0?), and how lost Health Levels are recovered (tied to Earth's Healing sub-stat, presumably, but not detailed).

### Defense (Derived Stat)

**Locked in 2026-07-22**, renamed 2026-07-22 to fit the fated-heroes theme: Wyrd's combat sub-stat is named **Warp** (the fixed, load-bearing thread — the part of a character's fate that holds firm and doesn't move), but it doesn't appear on the character sheet directly for combat purposes — instead it feeds a separate, derived entry called **Defense**, the same way D&D's AC is a derived number rather than a raw stat.

**Defense = 10 − Warp.**

Defense is what an attacker's roll actually targets: **Defense becomes the attacker's Difficulty** when they attack this character (see the [Difficulty Chart](#difficulty-chart)). Since Difficulty runs 0 (hardest) to 10 (trivial), the subtraction inverts Warp correctly: Warp 0 → Defense 10 (trivial to hit), Warp 10 → Defense 0 (nearly impossible to hit) — more Warp genuinely makes a character harder to hit, i.e. harder to pull off their own thread.

### Sub-Stat Descriptors

Carried forward from v1's Attribute Descriptors (see [archive/v1/rules/core-mechanic.md](../archive/v1/rules/core-mechanic.md#descriptors--confirmed)), but rehomed one level down: **for every point a character allocates to a sub-stat, they gain one Descriptor** — a short player-chosen word or phrase capturing one specific flavor of that sub-stat for this character. E.g. 3 points in Soak might yield *Iron-skinned, Padded, Unyielding* — three distinct ways the character shrugs off harm, not three copies of the same idea.

Descriptors are **free at character creation** (no separate cost beyond the point that earns them) and **fixed once chosen**, same as v1. How a character later gains additional Descriptors without raising a sub-stat, if that path exists at all, is still open — see [design-log.md](../docs/design-log.md#open-questions).

Descriptors are the concrete hook a player points to when [arguing a Skill pairing](skills.md#skills-are-not-attribute-locked) — grounding "I'm using Fire here because I'm being *Ruthless*" in an established character fact instead of an improvised justification each time.

## Resolution

**Changed 2026-07-22**: switched from a flat 1d20 to a **bell curve**, inspired by BESM's Edge/Obstacle dice-pool approach.

**Target number** = Attribute + Difficulty.

**Difficulty** is a number from **0-10**, set by the GM per roll — **0 is nearly impossible, 10 is trivial** (inverted from the usual "higher = harder" convention). See [Difficulty Chart](#difficulty-chart) below for the full 11-step ladder.

Roll **2d10** and sum them. Success if the result is **equal to or lower than** the target number.

Target number range: **1** (Attribute 1 + Difficulty 0) to **20** (Attribute 10 + Difficulty 10) — close to the natural 2-20 range of 2d10 (a target of 1 is below the lowest possible roll, i.e. an automatic failure), weighted toward the middle (11) rather than flat.

### Difficulty Chart

An 11-step reference ladder for setting Difficulty, rather than picking a bare number cold:

| Difficulty | Label | Example task |
|---|---|---|
| 0 | Nearly Impossible | Catch an arrow out of the air mid-flight |
| 1 | Extremely Hard | Pick a masterwork lock with no tools, blindfolded |
| 2 | Very Hard | Scale a sheer, rain-slicked cliff face |
| 3 | Hard | Convince a hostile guard captain to stand down |
| 4 | Challenging | Track a careful quarry through a rainstorm |
| 5 | Moderate | A tense but ordinary skill check under pressure |
| 6 | Fairly Easy | Pick a simple lock with the right tools |
| 7 | Easy | Climb a sturdy rope with knots tied in it |
| 8 | Very Easy | Recall a well-known fact in your field |
| 9 | Nearly Trivial | Walk a straight line on level ground |
| 10 | Trivial | Tie your own shoes |

Per-Attribute example tasks (a Fire example vs. an Earth example at the same Difficulty) are intentionally deferred until the rest of the system is further along — see [design-log.md](../docs/design-log.md#open-questions).

**Critical results, regardless of target number:**

- **A roll of 2** (both dice show 1) — critical success.
- **A roll of 20** (both dice show 10) — critical failure.

### Advantage / Disadvantage

**Rewritten 2026-07-22**, replacing the "2d20 take lower/higher" version to fit the new 2d10 base roll, adapting BESM's Edge/Obstacle mechanic: **Advantage** rolls **3d10 and keeps the lowest two** (summed); **Disadvantage** rolls **3d10 and keeps the highest two** (summed) — roll-under, so lower is always better. Usable wherever a specific rule grants it — currently the [Expert/Master Skill Training Tiers](skills.md#training-tiers), but not restricted to that.

### Untrained Rolls

If a character has no applicable Skill for the task, they still roll — but **the Attribute does not apply**. Target number is **Difficulty alone** (0-10), not Attribute + Difficulty. Having an applicable Skill is what lets the Attribute apply at all; the exact mechanics of Skills are still being designed — see [skills.md](skills.md).

**This is intentional, not an oversight**: under the 2d10 curve, an untrained character faces genuinely poor odds at anything above Difficulty 5 or so, and Difficulty 0 (Nearly Impossible) is a flat impossibility untrained (target 0 is below 2d10's minimum roll of 2). Most skills require practice — without training, a character shouldn't reliably succeed at anything nontrivial. See [design-log.md](../docs/design-log.md#open-questions) for the confirming discussion.
