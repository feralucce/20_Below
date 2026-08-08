# Stat Chart (Reference Snapshot)

A quick-reference summary of the current Attribute/sub-stat state. **This is a snapshot, not the source of truth** — if it ever conflicts with [rules/core-mechanic.md](../rules/core-mechanic.md) or [rules/fate.md](../rules/fate.md), those win. Update this file whenever the underlying mechanics change.

| Attribute (Element) | Domain | Combat Sub-Stat | Mechanic | Other Sub-Stat | Mechanic |
|---|---|---|---|---|---|
| **Earth** | Physical power/endurance | **Soak** | Passive wall — each incoming damage die compared individually; die ≤ Soak is fully absorbed, die > Soak connects. Soak 10 = guaranteed 0% connect (true full negation, unless the attacker spends Fate Tokens to boost individual dice). | **Potence** | **Named 2026-07-22** — Healing scrapped for good (dead end), replaced with Potence: raw physical power/strength (carrying capacity, immovability, mass, forcing/breaking things). Mechanic still undefined. |
| **Air** | Agility/adaptability, mind/intellect | **Initiative** | Rolled once at the start of combat (1d10 + Initiative), fixed for the whole fight. Higher acts first. | **Psyche** | **Committed 2026-07-22**: mirrors Soak exactly, a passive wall against Mental attack dice. |
| **Fire** | Drive/aggression | **Damage** | Sets how many d10 are rolled on a hit — one die per point. Each die compared individually against the defender's Soak. | **Presence** | **Committed 2026-07-22**: mirrors Soak exactly, a passive wall against Social attack dice. |
| **Water** | Perception/empathy | **Stamina** | Two jobs: (1) hard cap on Fate Token spends per encounter, (2) general endurance/exhaustion gauge outside combat (mechanic TBD). Also the trigger for the Fatigue Check on every Fate Token spend, resolved against Ki. | **Health** | Flat baseline of 5 Health Levels for every character; PCs add `+ Health sub-stat` on top. Each Level is a binary hit-box — connects once, then it's gone. |
| **Wyrd** | Fate/destiny/the supernatural | **Warp** | Derived stat: `Defense = 10 − Warp`. Defense becomes the attacker's Difficulty when targeting this character. | **Weft** | **Confirmed 2026-07-22**: two passive gives. (1) Ki Regeneration — sets how much Ki is restored at the refill trigger (trigger TBD). (2) Lucky Number — any die rolled for the character landing on a result equal to their Weft rating automatically grants 1 Fate Token. |

## Separate Pools/Resources (not sub-stats)

- **Ki** — average of all five combat sub-stats (Soak, Initiative, Damage, Stamina, Warp), doubled. Target number for the Fatigue Check; depletes on failure (refill trigger TBD); can also be spent directly, 1 Ki = preserve 1 Health Level.
- **Fate Tokens** — the earn/spend currency. Gained via Nature, voluntary Disadvantage, Flaws, daily regen, Milestones, GM discretion. Spent on Push the Fiction, Bump Action Band, Fate Token Infusion, Narrative Control, plus two flagged/under-review options (Automatic Success, Boost a Check).

## Still Undefined

Potence's mechanic, what a connecting Social/Mental die costs the defender, Stamina's non-combat mechanic, what happens at 0 Health Levels, Health Level recovery, Ki's refill trigger, and the rest of the open-questions TODO list in [design-log.md](design-log.md#open-questions).
