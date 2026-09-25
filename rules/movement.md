# Movement

How far you get, and what gets in the way: in a round, across bad ground, up a wall, through water, in a chase and on the road. Every rule here works two ways, **theater of the mind** and **tactical**, and they use the same numbers, so a table can switch between them mid-session.

The actions that go with movement - what each [Action Bracket](rules.md#action-brackets) lets you do - are at the end, under [Actions](#actions).

## Two Ways to Play

**Theater of the mind.** There is no map. The GM describes the scene, you say what you do, and the picture lives in everyone's head. It still runs on the sheet: everything that moves has a **Movement Rate** in meters, the GM keeps rough distances in meters ("about 30 meters, across the car park"), and the distance puts a target in a **Range Band**. The band follows from where you end up. The GM gives distances when they matter, and a player can always ask how far. Close enough is fine; nobody measures.

**Tactical.** The scene goes on a map. **One hex is one meter**, so Movement Rate is the number of hexes you move, and a map printed at 1 inch = 1 m keeps tokens to scale.

### Range Bands

| Band | Theater of the mind | Tactical | What it looks like |
|---|---|---|---|
| **Melee** | Contact, out to ~1m | The next hex | Arm's reach |
| **Close** | 1 to 10m | 2 to 10 hexes | The same room, across a bar, the width of an alley |
| **Near** | 10 to 50m | 11 to 50 hexes | Across a street, the length of a corridor, the far side of a car park |
| **Far** | Beyond 50m | 51 hexes or more | Rooftop to rooftop, the far end of a warehouse |

## Movement Rate

**Movement Rate = 5 + Air**, in meters (or hexes).

| Air | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| One move | 6m | 7m | 8m | 9m | 10m | 11m | 12m | 13m | 14m | 15m |
| Dash (2x) | 12m | 14m | 16m | 18m | 20m | 22m | 24m | 26m | 28m | 30m |
| Sprint (5x) | 30m | 35m | 40m | 45m | 50m | 55m | 60m | 65m | 70m | 75m |

[Exhausted](rules.md#exhausted) 3 halves it. [Grabbed](rules.md#grabbed) sets it to 0.

## Moving in a Round

| You declare | What you do | How far you move |
|---|---|---|
| **Fast** | One action: a move | 1x Movement Rate |
| **Fast** | One action: anything else | None |
| **Normal** | A move and one other action | 1x Movement Rate |
| **Normal** - [Dash](#combat-actions) | Two moves | 2x Movement Rate |
| **Normal** | Two actions, neither a move | None |
| **Slow** | One [empowered action](#empowered-actions) | A **1m step** (one hex), before or after the action |
| **Slow** - [Sprint](#special-actions) | Moving and nothing else | 5x Movement Rate |

**A move can be split around the other action** in a Normal round: move then attack, attack then move, or move, attack and move again, as long as the total stays within your Movement Rate. A Dash and a Sprint are all movement and don't split.

**A Sprint can be bumped** like any Slow action: **1 Ki** resolves it in the Normal band, **2 Ki** in the Fast band. It stays a Sprint - 5x Movement Rate, and nothing else.

## Leaving Melee

**You can always move away.** There is no free attack and no roll to break off. What leaving costs is time: anything that hasn't acted yet this round, and declared Normal (a move and an attack), follows and attacks if its move reaches where you end up.

- **Go early.** A Fast move resolves before the Normal and Slow bands. Something else that declared Fast with a higher Initiative still acts first.
- **Get far enough.** End your move further away than its Movement Rate reaches.
- **A Sprint goes last** unless bumped, so anything in Melee with you that acts Fast or Normal attacks before you run.

A [Grabbed](rules.md#grabbed) character has Movement Rate 0: escape first, then move.

**Disengaging** is choosing to leave Melee. A Gift or Flaw that says you can't disengage means you can't choose to move out of Melee.

### Moving Past People

- **Through an ally's space:** yes.
- **Through an enemy's space:** no. Go around.
- **Ending your move in an occupied space:** never, except with [Bulldoze](#empowered-actions).
- **Passing beside an enemy** costs nothing.

In theater of the mind, the GM rules whether a crowd or a doorway lets you through.

## Getting Low

- **Belly Down** - a free action, flat to the ground on purpose. Your **Melee attacks are at Disadvantage**, **Melee attacks against you gain Advantage**, and **ranged attacks against you are at Disadvantage** - you're a smaller target. Your own ranged attacks are unaffected.
- **Crawl** - move while Belly Down at **2m of movement per 1m**. Rough ground doesn't slow a Crawl; Wild Land costs its usual 3m per 1m, with no roll.
- **Stand up** - one action, from Belly Down.
- **[Prone](rules.md#prone)** is inflicted, never chosen: a failed footing roll, a blow, a fall. You can't attack, every attack against you gains Advantage, and you can't Crawl. **Recovering from Prone takes one action.**

## Cover

One rule for every action that gets you behind something. The GM calls the grade:

- **Full cover** - attacks that need to see or reach you can't.
- **Partial cover** (a corner, a car door, a low wall) - attacks against you are at **Disadvantage**.

Advantage and Disadvantage [count sources](rules.md#advantage--disadvantage). Belly Down behind partial cover is two sources against a ranged attack: no harder to hit than partial cover alone, but a shooter who Aims (+1) is still left at Disadvantage.

## Terrain and Footing

| Ground | Costs | Examples |
|---|---|---|
| **Clear** | 1m per 1m | A floor, a road, a lawn |
| **Rough** | 2m per 1m | Mud, deep snow, rubble, undergrowth, knee-deep water |
| **Wild Land** | 3m per 1m | Bog, a collapsed building, a thicket, drifts past your waist |

**Push through it.** Roll **Athletics, Difficulty 6**, once per turn, when your movement takes you onto bad ground. A success crosses Rough as if it were Clear, and Wild Land as if it were Rough - never better. A failure pays the full cost. Descriptors can argue a different Element for Athletics, as for any [Skill](skills.md). [Snowshoes](weapons.md) cancel the cost of deep snow.

**Footing** (ice, a slick deck, loose scree). A normal move across it needs no roll. A **Dash, Sprint or Bulldoze** across it needs **Athletics, Difficulty 6**; failure leaves you [Prone](rules.md#prone) where the footing gave out.

**Tight spaces** (a crawlspace, a vent, the gap between buildings). Squeezing through costs **2m per 1m**, **you can't attack**, and **attacks against you are at Disadvantage**. The GM decides what's too tight for a given body.

- *Theater of the mind:* the GM names the grade as you head onto it, and works out how far you get - all of your move, half, or a third.
- *Tactical:* mark the hexes. A Rough hex costs 2 and a Wild Land hex 3; after a success, count them as 1 and 2.

## Climbing, Jumping and Swimming

### Climbing

Climbing costs **2m per 1m**. Roll **Athletics once per turn** at the surface's Difficulty: **success** climbs at your full rate, **failure** at the double cost, and a **catastrophic failure** (a roll of 20) means you [fall](rules.md#common-hazards). A rope & climbing kit, grappling hook, grapple gloves or ice axe gives Advantage where its entry says. Rain, wind or darkness make a surface one or two steps harder.

| Difficulty | Surface |
|---|---|
| 10 | A stepladder, a waist-high wall |
| 9 | A ladder |
| 8 | A tree with low branches, a chain-link fence |
| 7 | A sturdy rope with knots tied in it |
| 6 | A rock face with good holds, a drainpipe |
| 5 | A plain rope, a brick wall with crumbling mortar |
| 4 | A rough stone wall, a rope while carrying someone |
| 3 | An overhang, a crumbling cliff |
| 2 | A sheer, rain-slicked cliff face |
| 1 | Smooth concrete, bare ice without tools |
| 0 | Vertical glass |

Nearly Impossible is not impossible: at this scale, the strongest can climb glass.

### Jumping

| Jump | Distance, no roll |
|---|---|
| **Running long jump** | Your Air, in meters |
| **Standing long jump** | Half your Air |
| **High jump** | Half your forward distance: half your Air running, a quarter standing |

The distance counts against your movement. **To go farther, roll Athletics:**

| Past your Air | +1m | +2m | +3m | +4m | +5m |
|---|---|---|---|---|---|
| Difficulty | 8 | 6 | 4 | 2 | 0 |

**Fall short and you land at your Air distance.** If that's over the gap, you go down it - unless you land next to an edge, in which case roll **Athletics, Difficulty 6** to catch yourself. A success leaves you hanging on; climbing up is a climb.

### Swimming

**Swimming can't be used untrained.** A character without the [Swimming](skills.md) Skill who ends up in deep water starts the [No-air](rules.md#common-hazards) clock at once, unless they're holding something that floats.

A swimmer moves at their **Movement Rate** - water doesn't cost double. Staying up uses the [endurance rule](fate.md#staminas-job):

| Water | Free time | Then roll Water + Difficulty, once per | Starting Difficulty |
|---|---|---|---|
| **Calm** | Stamina **Hours** | Hour | **8** |
| **Rough** (a current, waves, carrying weight) | Stamina **Minutes** | Minute | **6** |

The Difficulty **drops by 1 each roll**, and each failure costs a level of [Exhausted](rules.md#exhausted). **Exhausted 5 means you go under**, and the No-air rule takes over. [Immersed in cold water](rules.md#common-hazards) adds its own levels on top.

### Creatures That Move Differently

**A listed mode is a creature's rate in that medium, with no extra cost and no roll** - "14m swimming" swims 14m the way a character walks 14m. Flight, swimming, climbing and burrowing move at the listed rate; **glide** can only descend or hold height; **drift** ignores ground costs. A creature with no mode for a medium uses the rules above.

**Unless the characters changed the ground.** Rubble the party brought down, a room they flooded, caltrops they threw: the creature pays the cost and makes the roll like anyone else.

## Chases

A chase is ordinary movement, round after round, with a roll for the route.

1. **Declare movement** as usual - a move, a Dash, or a Sprint (which can be bumped).
2. **Everyone makes a Chase roll, Difficulty 6**, with the Skill for how they're moving: **Athletics** on foot, **Driving**, or **Piloting**. The GM makes it one or two steps harder where the route calls for it. Gear that helps counts ([Motorcycle](weapons.md), Off-road SUV). Being faster gives no Advantage - the meters already reward speed.
3. **Resolve.** One side succeeds and the other fails: the side that failed moves at **half** this round. Both succeed or both fail: full moves. A **critical success** moves **1.5x**.
4. **Check the gap.** **1m or less:** caught - Melee. **Out of sight:** broken away, for now.

**Out of sight isn't gone.** The GM sets where sight breaks as the chase goes. The quarry then rolls **Stealth** against the pursuer's Perception (a creature's card: "Perception 7 vs. Stealth"). Success, and they've lost it. Failure, and it's back on their trail at the edge of sight. When the characters give chase, they roll Perception or Tracking against the quarry's Stealth.

**Running is exhausting.** A Sprint is running flat out: Stamina Rounds free, then **Water + Difficulty** each Round, **starting at 6** and dropping by 1, with a level of [Exhausted](rules.md#exhausted) per failure. Exhausted 1 puts Chase rolls at Disadvantage.

- *Theater of the mind:* the GM keeps the gap in meters and calls where sight breaks.
- *Tactical:* track it on the map while it fits; line of sight comes off the map. Past the edge, keep the gap on paper.

## Travel

| | Rule |
|---|---|
| **Pace** | **3 + Air/5 km per hour** on clear ground |
| **Travel day** | **4 + Stamina hours** of walking |
| **A group** | Moves at its slowest member's pace, and stops when its shortest travel day runs out |
| **Bad ground** | Rough halves the distance, Wild Land cuts it to a third. No roll |
| **Forced march** | Past your travel day, **Water + Difficulty** each extra Hour, **starting at 7** and dropping by 1; a level of Exhausted per failure. A Full Night's Rest clears it |
| **Getting lost** | Only when the GM calls for it: roll Navigation. A compass and a map mean no roll |

| Character | Air | Stamina | Pace | Travel day | Distance |
|---|---|---|---|---|---|
| Air 1, Stamina 1 | 1 | 1 | 3.2 km/h | 5 hours | 16 km |
| Air 3, Stamina 2 | 3 | 2 | 3.6 km/h | 6 hours | 22 km |
| Air 5, Stamina 3 | 5 | 3 | 4.0 km/h | 7 hours | 28 km |
| Air 7, Stamina 3 | 7 | 3 | 4.4 km/h | 7 hours | 31 km |
| Air 10, Stamina 5 | 10 | 5 | 5.0 km/h | 9 hours | 45 km |

Travel happens off the map; a map comes out when the journey turns into a scene.

## Actions

What each [Action Bracket](rules.md#action-brackets) lets you do. A Gift or weapon that states its own action cost always overrides these.

### Empowered Actions

A Slow round is **one empowered action**, plus a 1m step before or after it. A bump with Ki carries the empowerment along. [Distracted](rules.md#distracted) drops the action to a Normal one, and it loses what its empowerment gave.

| Action | What it gives |
|---|---|
| **Aim** | **Advantage** on the attack |
| **Called Shot** | You hit something specific - a hand, a strap, a weapon, a Zone. **No Advantage** |
| **Study a Target** | No roll - the round is the cost. Your **next attack against it, next round, has Advantage**, a Called Shot included |
| **Careful Work** | **Advantage** on a Skill roll made with full concentration. It **persists** on the same task, round to round, until you're interrupted |
| **Brace** | Until your next turn, you **can't be Bulldozed, shoved or knocked Prone** |
| **Bulldoze** | Charge a target to force it out of its space. Move **at least 5m and at most 2x your Movement Rate** to reach it, then roll your **Potence in d10s against its Soak** ([the contested pool](rules.md#potence)). Each die over pushes it back **1m**, and you step into the space it left. If nothing connects, you stop beside it |
| **Spellcasting** | Always Slow, once magic exists |

**One per round.** Aim and a Called Shot can't be combined in one round - but Study a Target this round makes next round's Called Shot roll with Advantage.

### Special Actions

| Action | Band | What it does |
|---|---|---|
| **Attack on the Run** | Fast only | A full move **and** an attack, ranged or melee, at **Disadvantage**. The attack can come anywhere in the move |
| **Snap to Cover** | Fast only | A 1m step into adjacent [cover](#cover), staying on your feet |
| **Dive for Cover** | Fast or Normal | **Fast:** move up to your Movement Rate at once and land **Belly Down**. **Normal:** a full move, then the dive. [Cover](#cover) applies |
| **Sprint** | Slow only | 5x Movement Rate and nothing else. Can be bumped |

### Combat Actions

- **Dash** (Normal) - both actions on movement, 2x Movement Rate.
- **Reckless** (no action cost) - Advantage on all your attack rolls this round; attacks against you gain Advantage this round too.
- **Full Defense** (Normal) - you can't attack; **attacks against you are at Disadvantage** and your **Defense drops by 4** (to a minimum of 0 - lower is better, since attackers add it). Your other action can still be a move.
- **Reload** - by the weapon: one action for a magazine, speed-loader or crossbow crank; a full Slow action for a tube-fed shotgun; free for a bow from a quiver. See each weapon's Reload column in [weapons.md](weapons.md).
- **Grab** (one action, from Melee) - an attack roll, then your **Potence in d10s against its Soak**. Any die over, and it's [Grabbed](rules.md#grabbed).
- **Disarm** - a **Called Shot** at a held weapon or item; on a hit, **Potence against Potence** to knock it loose. [Gauntlets](weapons.md) give the defender Advantage.
- **Help** (one action) - an ally's next roll has **Advantage**. You must be able to reach them, or the thing they're doing.
- **Ready** (one action) - hold it for a trigger you name ("when it comes through the door"); it resolves when the trigger happens.
- **Small actions** - drawing, swapping or stowing a weapon, or using a simple item, takes **one action**.
- **Escape a hold** - see [Grabbed](rules.md#grabbed).
- **Belly Down** (free), **Stand up** (one action), **Recover from Prone** (one action) - see [Getting Low](#getting-low).
