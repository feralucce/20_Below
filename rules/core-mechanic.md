# Core Mechanic

## Attributes

Five attributes, each linked to a classical element. Each pairs a felt **domain** (what it represents narratively) with a **mechanical role** (what it drives in the rules) — the derived formulas for each role are still open, tracked in [design-log.md](../docs/design-log.md#open-questions).

| Attribute | Domain | Mechanical Role |
|---|---|---|
| **Earth** | Physical power/endurance | Health / Soak |
| **Air** | Agility/adaptability | Defense / Initiative |
| **Fire** | Drive/aggression | Damage/offense |
| **Water** | Perception/empathy | Healing/stamina |
| **Ki** | Spirit/supernatural/willpower | Resource pool / Recovery |

Attributes are scored **1-10** (1 = lowest, 10 = highest).

### Sub-Category Allocation

Every Attribute's Mechanical Role is actually **two sub-stats** (e.g. Earth = Health / Soak). The Attribute's own score is **always the number used to roll** (see [Resolution](#resolution)) — it is never reduced or consumed by the split below.

Separately, that same score also generates a **pool of points equal to the Attribute's rating**, which the player allocates across its two sub-stats — a player choice, not an even split. An Attribute of 10 both rolls as 10 *and* grants 10 points to divide, e.g. 7 Health / 3 Soak, or 5/5, or any other division. What each allocated point actually *buys* in each sub-stat (the formula/scale) is still TBD — see [design-log.md](../docs/design-log.md#open-questions).

## Resolution

**Target number** = Attribute + Difficulty.

**Difficulty** is a number from **1-10**, set by the GM per roll — **1 is most difficult, 10 is trivially easy** (inverted from the usual "higher = harder" convention).

Roll **1d20**. Success if the result is **equal to or lower than** the target number.

Target number range: **2** (Attribute 1 + Difficulty 1) to **20** (Attribute 10 + Difficulty 10).
