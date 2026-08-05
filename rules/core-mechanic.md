# Core Mechanic

## Attributes

Five attributes, each linked to a classical element. Each pairs a felt **domain** (what it represents narratively) with a **mechanical role** (what it drives in the rules) — the derived formulas for each role are still open, tracked in [design-log.md](../docs/design-log.md#open-questions).

| Attribute | Domain | Mechanical Role |
|---|---|---|
| **Earth** | Physical power/endurance | Soak / Health |
| **Air** | Agility/adaptability | Initiative / Luck |
| **Fire** | Drive/aggression | Damage / Presence |
| **Water** | Perception/empathy | Stamina / Healing |
| **Ki** | Spirit/supernatural/willpower | Defense / Recovery |

Attributes are scored **1-10** (1 = lowest, 10 = highest).

### Sub-Category Allocation

Every Attribute's Mechanical Role is actually **two sub-stats** (e.g. Earth = Soak / Health). The Attribute's own score is **always the number used to roll** (see [Resolution](#resolution)) — it is never reduced or consumed by the split below.

Separately, that same score also generates a **pool of points equal to the Attribute's rating**, which the player allocates across its two sub-stats — a player choice, not an even split. An Attribute of 10 both rolls as 10 *and* grants 10 points to divide, e.g. 7 Soak / 3 Health, or 5/5, or any other division. What each allocated point actually *buys* in each sub-stat (the formula/scale) is still TBD — see [design-log.md](../docs/design-log.md#open-questions).

**Sub-stats never affect whether a roll succeeds** — only the Attribute + Difficulty roll (below) determines pass/fail. Sub-stats instead **add to the effect of a success** (e.g. more points in Damage means a landed hit does more; more points in Healing means a successful recovery restores more). This keeps success/failure entirely on one roll, with sub-stats purely shaping the magnitude of what happens once you've already succeeded.

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
