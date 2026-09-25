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
Party Budget    = 0.7 × party damage dice × party Health Levels ÷ min(10, 10 + Ferocity − average party Soak)
```

`Threat ÷ Budget` gives the band. The `n²` is not a fudge: more creatures deal more damage **and** survive longer to keep dealing it, so both terms scale with the count.

`0.7` is the party's average chance to connect, the one term not read off a sheet. `10 + Ferocity` is there because a creature's natural weapons are **boosted**: each die adds the creature's Ferocity against Soak (see [Attack by Role](#attack-by-role)). Most creatures have Ferocity 2.

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
| **Attack** | set by role - see [Attack by Role](#attack-by-role) | how reliably it connects |
| **Ferocity** | set by role - see [Attack by Role](#attack-by-role) | what each natural-weapon die adds against Soak |
| **Potence** | √(body mass in kg ÷ 10), so it can drag about its own weight | grabs, shoves, breaking things |
| **Initiative** | (Movement Rate − 5) × 0.7, +3 for an ambush hunter | when it acts: 1d10 + Initiative |
| **Psyche** | Apex 4, Predator and Fighter 3, Cornered 2, Nuisance 1; +2 supernatural | its Mental wall, and its Social Defense (10 − Psyche) |
| **Presence** | only if it has a Social or Mental attack, or a mind to read; as Psyche, but Fighter 2 | its Social wall. None means immune to Social attacks |
| **Mental Defense** | 10 − Presence; with no Presence, by temperament: `9` a guard dog, `5` a wolf, `2` a wolverine | how hard its mind is to reach |
| **Stamina** | burst hunter 2, generalist 4, endurance runner 6, never tires 10 | free Rounds in a chase |
| **Athletics TN** | `10` a cat, `8` a dog, `5` a snake | climbing, jumping, swimming, the Chase roll |

**Caps.** Attack, Soak and natural weapon Damage never exceed 10; Defense never exceeds 10. Health Levels have no cap.

## Attack by Role

A creature's Attack comes from what it does when it fights, not from its size or how dangerous it looks. Pick the role, then use its number; a Dire, Giant or Mutated version adds +1 as usual.

| Role | What it means | Attack | Ferocity | Hits a Defense-7 character |
|---|---|---|---|---|
| **Apex** | Built to kill large prey, including people | 8 | 3 | 85% |
| **Predator** | Hunts by attacking: dogs, cats, raptors, striking snakes | 7 | 2 | 79% |
| **Fighter** | Doesn't hunt you, but commits hard once it fights | 6 | 2 | 72% |
| **Cornered** | Fights back when trapped, grabbed or stepped on | 5 | 2 | 64% |
| **Nuisance** | More noise and trouble than danger, or doesn't really fight | 3 | 1 | 45% |

**Natural weapons are boosted.** A creature's bite, claws, gore, sting and the like add its **Ferocity** to each die against Soak, the way a character's Ki Infusion does, so even Soak 10 is not a wall against an animal. Social lines are not boosted, and neither are weapons a creature or person carries.

**Traits** are written in terms of existing rules - Advantage, Disadvantage, Ki, Range Bands, conditions - never a new subsystem.

Check any new creature by computing its Threat and comparing it against a creature already in the index.

## Variant Templates

Applied to a creature's own printed base stats, never to another variant. Full rules and the pre-built examples are in [adversary-index.md](adversary-index.md#beast-variants-dire--giant--mutated).

| | Soak | Attack | Defense | Health Levels | Movement | Damage | Ferocity | Potence |
|---|---|---|---|---|---|---|---|---|
| **Dire** | +1 | +1 | +1 | +3 | +2m | +2 | +1 | ×1.7 |
| **Giant** | +2 | +1 | +2 | +6 | +3m | +5 | +1 | ×3 |
| **Mutated** | +1 | +1 | +0 | +2 | +0 | unchanged, plus one Mutation Trait | +1 | unchanged |

**Movement floor.** A creature whose printed Movement Rate is 5m or less does not get faster under any template.

**Round Potence** to the nearest whole number, to a maximum of 10. Initiative, Psyche, Presence, Mental Defense, Stamina and Athletics TN don't change.
