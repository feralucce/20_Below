# Core Mechanic

## Attributes

Five attributes, each linked to a classical element. Each pairs a felt **domain** (what it represents narratively) with a **mechanical role** (what it drives in the rules) — the derived formulas for each role are still open, tracked in [design-log.md](../docs/design-log.md#open-questions).

| Attribute | Domain | Mechanical Role |
|---|---|---|
| **Earth** | Physical power/endurance | Health / Soak |
| **Air** | Agility/adaptability | Defense / Initiative |
| **Fire** | Drive/aggression | Damage / Presence |
| **Water** | Perception/empathy | Healing/stamina |
| **Ki** | Spirit/supernatural/willpower | Luck / Recovery |

Attributes are scored **1-10** (1 = lowest, 10 = highest).

### Sub-Category Allocation

Every Attribute's Mechanical Role is actually **two sub-stats** (e.g. Earth = Health / Soak). The Attribute's own score is **always the number used to roll** (see [Resolution](#resolution)) — it is never reduced or consumed by the split below.

Separately, that same score also generates a **pool of points equal to the Attribute's rating**, which the player allocates across its two sub-stats — a player choice, not an even split. An Attribute of 10 both rolls as 10 *and* grants 10 points to divide, e.g. 7 Health / 3 Soak, or 5/5, or any other division. What each allocated point actually *buys* in each sub-stat (the formula/scale) is still TBD — see [design-log.md](../docs/design-log.md#open-questions).

**Sub-stats never affect whether a roll succeeds** — only the Attribute + Difficulty roll (below) determines pass/fail. Sub-stats instead **add to the effect of a success** (e.g. more points in Damage means a landed hit does more; more points in Healing means a successful recovery restores more). This keeps success/failure entirely on one roll, with sub-stats purely shaping the magnitude of what happens once you've already succeeded.

### Sub-Stat Descriptors

Carried forward from v1's Attribute Descriptors (see [archive/v1/rules/core-mechanic.md](../archive/v1/rules/core-mechanic.md#descriptors--confirmed)), but rehomed one level down: **for every point a character allocates to a sub-stat, they gain one Descriptor** — a short player-chosen word or phrase capturing one specific flavor of that sub-stat for this character. E.g. 3 points in Soak might yield *Iron-skinned, Padded, Unyielding* — three distinct ways the character shrugs off harm, not three copies of the same idea.

Descriptors are **free at character creation** (no separate cost beyond the point that earns them) and **fixed once chosen**, same as v1. How a character later gains additional Descriptors without raising a sub-stat, if that path exists at all, is still open — see [design-log.md](../docs/design-log.md#open-questions).

Descriptors are the concrete hook a player points to when [arguing a Skill pairing](skills.md#skills-are-not-attribute-locked) — grounding "I'm using Fire here because I'm being *Ruthless*" in an established character fact instead of an improvised justification each time.

## Resolution

**Changed 2026-07-22**: switched from a flat 1d20 to a **bell curve**, inspired by BESM's Edge/Obstacle dice-pool approach.

**Target number** = Attribute + Difficulty.

**Difficulty** is a number from **1-10**, set by the GM per roll — **1 is most difficult, 10 is trivially easy** (inverted from the usual "higher = harder" convention).

Roll **2d10** and sum them. Success if the result is **equal to or lower than** the target number.

Target number range: **2** (Attribute 1 + Difficulty 1) to **20** (Attribute 10 + Difficulty 10) — matching the natural 2-20 range of 2d10, but weighted toward the middle (11) rather than flat.

**Critical results, regardless of target number:**

- **A roll of 2** (both dice show 1) — critical success.
- **A roll of 20** (both dice show 10) — critical failure.

### Advantage / Disadvantage

**Rewritten 2026-07-22**, replacing the "2d20 take lower/higher" version to fit the new 2d10 base roll, adapting BESM's Edge/Obstacle mechanic: **Advantage** rolls **3d10 and keeps the lowest two** (summed); **Disadvantage** rolls **3d10 and keeps the highest two** (summed) — roll-under, so lower is always better. Usable wherever a specific rule grants it — currently the [Expert/Master Skill Training Tiers](skills.md#training-tiers), but not restricted to that.

### Untrained Rolls

If a character has no applicable Skill for the task, they still roll — but **the Attribute does not apply**. Target number is **Difficulty alone** (1-10), not Attribute + Difficulty. Having an applicable Skill is what lets the Attribute apply at all; the exact mechanics of Skills are still being designed — see [skills.md](skills.md).

**Note**: this rule was written for a flat 1d20 (where a target of 10 or less was roughly a coin flip). Under the new 2d10 bell curve, results cluster around 11, so a Difficulty-only target (max 10) is now a *worse* than coin-flip proposition even at the easiest untrained Difficulty — the odds haven't been re-checked against the new curve. See [design-log.md](../docs/design-log.md#open-questions).
