# Encounters

Reference for weighing and building adversaries. The reasoning behind these numbers is the Bestiary's *Running Adversaries* and *Building Your Own*; this page is the arithmetic on its own.

## Soak

Soak is a per-die threshold, not a subtraction - see [rules.md](rules.md#physical-attacks---weapon-damage--per-die-resolution). `10 − Soak` is the share of damage dice that connect, out of ten.

| Soak | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Dice that connect | 100% | 90% | 80% | 70% | 60% | 50% | 40% | 30% | 20% | 10% | 0% |

## Threat and Budget

```
Creature Threat = damage dice × Health Levels ÷ (10 − Soak)
n of them       = n² × Threat
Party Budget    = 0.7 × party damage dice × party Health Levels ÷ (10 − average party Soak)
```

`Threat ÷ Budget` gives the band. The `n²` is not a fudge: more creatures deal more damage **and** survive longer to keep dealing it, so both terms scale with the count.

`0.7` is the party's average chance to connect, the one term not read off a sheet.

| Threat ÷ Budget | Band | Outcome |
|---|---|---|
| under 0.35 | Trivial | nobody goes down |
| 0.35 - 0.75 | Standard | about one character drops |
| 0.75 - 1.4 | Hard | two or three drop |
| 1.4 - 3.0 | Deadly | most of the party is on the floor |
| over 3.0 | Overwhelming | all of them |

**Bands count characters reduced to 0 Health Levels, not deaths.** Death requires deliberate further attacks on a downed character past `−(Health Levels)` - see [Going Down](rules.md#health-levels).

A creature with **Soak 10** has no finite Threat against ordinary weapons: no damage die can connect. It is not a band, it is a wall.

## Building a Creature

Bounds and meanings, in the order that avoids trouble.

| Stat | Range | What it decides |
|---|---|---|
| **Soak** | 0-2 flesh, 3-6 armor or hide, 7+ most weapons fail | whether the fight is possible at all |
| **Damage dice** | compare to the lowest party Health Levels | whether it drops a character in one turn |
| **Health Levels** | 5 short, 10 a few rounds, 15 a set piece | how long the fight runs |
| **Defense** | `0` nearly impossible to reach, `10` trivial | reach only - follows size and speed, never toughness |
| **Attack** | 1-10, predators 6-7, clumsy 2-3 | how reliably it connects |

**Caps.** Attack, Soak and natural weapon Damage never exceed 10; Defense never exceeds 10. Health Levels have no cap.

**Traits** are written in terms of existing rules - Advantage, Disadvantage, Ki, Range Bands, conditions - never a new subsystem.

Check any new creature by computing its Threat and comparing it against a creature already in the index.

## Variant Templates

Applied to a creature's own printed base stats, never to another variant. Full rules and the pre-built examples are in [adversary-index.md](adversary-index.md#beast-variants-dire--giant--mutated).

| | Soak | Attack | Defense | Health Levels | Movement | Damage |
|---|---|---|---|---|---|---|
| **Dire** | +1 | +1 | +1 | +3 | +2m | +2 |
| **Giant** | +2 | +1 | +2 | +6 | +3m | +5 |
| **Mutated** | +1 | +1 | +0 | +2 | +0 | unchanged, plus one Mutation Trait |

**Movement floor.** A creature whose printed Movement Rate is 5m or less does not get faster under any template.
