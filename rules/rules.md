# Rules

## Core Mechanic

**Target number** = Attribute + Difficulty.

**Difficulty** is a number from **0-10**, set by the GM per roll - **0 is nearly impossible, 10 is trivially easy** (inverted from the usual "higher = harder" convention). See [Difficulty Chart](#difficulty-chart) below for the full 11-step ladder.

Roll **2d10** and sum them. Success if the result is **equal to or lower than** the target number.

Target number range: **1** (Attribute 1 + Difficulty 0) to **20** (Attribute 10 + Difficulty 10) - a target of 1 is below the lowest possible roll, i.e. an automatic failure, weighted toward the middle (11) rather than flat.

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

Per-Attribute example tasks (a Fire example vs. an Earth example at the same Difficulty) are deferred until the rest of the system is further along.

**Critical results, regardless of target number:**

- **A roll of 2** (both dice show 1) - critical success.
- **A roll of 20** (both dice show 10) - critical failure.

### Advantage / Disadvantage

**Advantage** rolls **3d10 and keeps the lowest two** (summed); **Disadvantage** rolls **3d10 and keeps the highest two** (summed) - roll-under, so lower is always better. Usable wherever a specific rule grants it - currently the [Expert/Master Skill Training Tiers](skills.md#training-tiers), a character's off-hand (below), but not restricted to those.

**Off-hand**: performing a task that requires manual dexterity or precision (attacking, fine manipulation, etc.) with your off-hand imposes Disadvantage on the roll. [Ambidextrous](boons.md#trivial) removes this penalty.

### Untrained Rolls

If a character has no applicable Skill for the task, they still roll - but **the Attribute does not apply**. Target number is **Difficulty alone** (0-10), not Attribute + Difficulty. Having an applicable Skill is what lets the Attribute apply at all.

### Time Bands

A standard ladder of duration used wherever a rule needs to name "how long": **Round → Minute (≈10 rounds) → Scene → Day → Month → Year**. The **Round** is the base unit - any duration described elsewhere in the rules is stated in Rounds unless a longer band is explicitly named.

This is intentional: under the 2d10 curve, an untrained character faces poor odds at anything above Difficulty 5 or so, and Difficulty 0 (Nearly Impossible) is a flat impossibility untrained (target 0 is below 2d10's minimum roll of 2).

## Attributes & Traits

### Attributes

Five attributes, each linked to a classical element. Each pairs a **domain** (narrative flavor) with a **mechanical role** (two sub-stats).

| Attribute | Domain | Mechanical Role |
|---|---|---|
| **Earth** | Physical power/endurance | Soak / Potence |
| **Air** | Agility/adaptability, mind/intellect | Initiative / Psyche |
| **Fire** | Drive/aggression | Ferocity / Presence |
| **Water** | Perception/empathy | Stamina / Health |
| **Moira** | Fate/destiny/the supernatural | Atropos / Klotho |

Attributes are scored **1-10** (1 = lowest, 10 = highest).

#### Sub-Category Allocation

Every Attribute's Mechanical Role is **two sub-stats**. The Attribute's own score is **always the number used to roll** (see [Core Mechanic](#core-mechanic)) - it is never reduced or consumed by the split below.

Separately, that same score generates a **pool of points equal to the Attribute's rating**, which the player allocates across its two sub-stats - a player choice, not an even split. An Attribute of 10 both rolls as 10 *and* grants 10 points to divide, e.g. 7 Soak / 3 Potence, or 5/5, or any other division. What each allocated point actually *buys* in each sub-stat is defined case by case, sub-stat by sub-stat.

**This allocation is permanent.** Once a point is spent into a sub-stat, it's spent - there's no reallocating a pair's split later, same as Descriptors being fixed once chosen.

#### Health Levels

**Health Levels are a count of discrete hit-boxes**, not a numeric HP pool. Each Health Level can absorb damage **once** - a binary hit-box, not a container with its own capacity.

Every character starts with **5 Health Levels**, flat, before anything else is added.

- **`PC Health Levels = 5 + Health (sub-stat)`** - the flat baseline, plus whatever a PC invests in Water's Health sub-stat.
- **NPCs will most often just be the flat 5**, with no Health sub-stat added - minor/"weenie" NPCs go down in a single connecting hit, while PCs are built tougher by default.

At **0 Health Levels**, a character falls unconscious and can't act. Health Levels can still be tracked into negative territory from further damage - at **Health Levels ≤ −(Health sub-stat)**, the character dies. Ordinarily this negative range plays out off-screen, since an unconscious character can't act or be aware of it; [Unstoppable](boons.md#major) is the exception that lets a character stay conscious and act throughout that same negative range instead of blacking out at 0.

**Crossing zero**: a single attack can never carry a character straight past 0 into negative territory. If enough connecting dice from one attack would carry a character's Health Levels below 0, the excess is simply discarded - they land exactly at 0, no further, no matter how many dice connected. **Once a character is already at 0 Health Levels** - unconscious under the rule above, or still conscious via Unstoppable - **any further attack can only remove 1 Health Level, total, regardless of how many dice connect.**

#### Physical Attacks - Weapon Damage & Per-Die Resolution

On a successful hit, the **weapon in use sets how many d10 are rolled** - see [weapons.md](weapons.md) for the base list. **Each die is resolved individually against the defender's Soak**, not summed together:

- **Die result > Soak** - that die connects, and costs the defender **one Health Level**.
- **Die result ≤ Soak** - that die is fully absorbed, no effect.

**Soak 10 guarantees 0% connect chance per die - true, complete negation.** A heavier weapon (more dice) doesn't overwhelm Soak mathematically - it just means **more independent chances to connect**, so a single attack can plausibly cost a defender **multiple** Health Levels at once if several dice connect (subject to the [crossing-zero throttle](#health-levels) once the defender is already at 0).

![Damage's per-die resolution](../docs/assets/diagrams/damage-per-die-resolution.svg)

#### Potence

Potence (Earth's other sub-stat: raw physical power/strength - carrying capacity, immovability, mass, forcing/breaking things) splits into two jobs:

1. **Flat passive give (mundane use, no roll)** - Potence directly sets a **Carrying Capacity** and a **Break Threshold**.
   - **Carrying Capacity** (how much weight a character can lift/carry/drag under ordinary conditions): `Potence² × 10`, in kg.

     | Potence | Carrying Capacity |
     |---|---|
     | 1 | 10 kg (~22 lbs) |
     | 2 | 40 kg (~88 lbs) |
     | 3 | 90 kg (~198 lbs) |
     | 4 | 160 kg (~353 lbs) |
     | 5 | 250 kg (~551 lbs) |
     | 6 | 360 kg (~794 lbs) |
     | 7 | 490 kg (~1,080 lbs) |
     | 8 | 640 kg (~1,411 lbs) |
     | 9 | 810 kg (~1,786 lbs) |
     | 10 | 1,000 kg (~2,205 lbs) |
   - **Break Threshold** (the bar an object's resistance must sit under to be forced open/broken with no contest involved): no separate number, just a direct comparison. If a character's **Potence is equal to or greater than the target object's Soak**, it breaks or forces open automatically, no roll. If Potence is lower, it isn't a no-contest job anymore; that's what the contested dice pool below is for.
2. **Contested dice pool** - when forcing, breaking, or moving something that's actively resisting (a grapple, a door someone's holding shut, a struggling creature), **Potence itself sets how many d10 are rolled**. Each die is compared individually against the target's relevant resistance: a grappled/restrained creature's own **Soak**, or - for inanimate resisting objects - the object's own **Soak** (GM-set, same 0-10 scale and mechanic as a character's Soak, just held by the object instead). Each connecting die represents one increment of success, costing the object one of its **Health Levels** - same binary hit-box shape as a character's, just scaled to the object's durability instead of a body.

**Object Soak and Health Level reference chart**, low to high, for GM calibration:

| Object | Soak | Health Levels |
|---|---|---|
| Sheet of paper / cardboard | 0 | 1 |
| Glass pane / window | 1 | 1 |
| Rope / zip ties | 2 | 1 |
| Drywall interior wall | 2 | 2 |
| Wooden chair | 2 | 2 |
| Padlock (cheap) | 3 | 1 |
| Chain-link fence | 3 | 2 |
| Interior wooden door | 3 | 2 |
| Handcuffs (standard) | 4 | 1 |
| Car door | 5 | 3 |
| Exterior wooden door (reinforced) | 5 | 3 |
| Brick wall (residential) | 6 | 4 |
| Boulder / natural stone | 7 | 5 |
| Steel security door | 7 | 4 |
| Reinforced concrete wall | 8 | 5 |
| Bank vault door | 9 | 6 |
| Castle gate / fortress wall | 9 | 8 |
| High-security modern vault | 10 | 8 |

#### The Passive Wall Triad - Soak, Presence, Psyche

Presence (Fire) and Psyche (Air) both mirror **Soak exactly** - the identical per-die mechanic, just resisting a different attack type. All three sub-stats are **passive gives**, the same way Health is: a flat number a character simply has, doing its job automatically with no roll or spend required.

- **Soak** - wall against **Physical** damage dice.
- **Presence** - wall against **Social** attack dice.
- **Psyche** - wall against **Mental** attack dice.

For all three: each attack die is resolved individually against the relevant wall stat. Die ≤ wall stat is fully absorbed; die > wall stat connects. A wall stat of 10 guarantees 0% connect chance per die - true, complete negation - unless the attacker spends **Ki** (1 per die) to add their own matching Attack sub-stat to that specific die, per [Ki Infusion](#ki-infusion). What a connecting Social or Mental die actually costs the defender is not yet decided.

**Presence and Psyche are self-paired attacker/wall stats.** Physical splits the attacker/wall pair across two Attributes (a weapon sets the dice, Earth's Soak is the wall). Social and Mental don't get their own separate Attribute the way Physical does, and there's no "weapon" equivalent for words or force of personality, so **Presence and Psyche each do both jobs on their own stat**: a character's Presence sets how many d10 they roll when making a Social attack, resolved die-by-die against the *target's* Presence acting as their wall. Psyche works identically for Mental attacks. All three attack types boost a die via [Ki Infusion](#ki-infusion), 1 Ki per die.

#### Klotho

Two passive functions, both "gives" like Health/Soak/Presence/Psyche - no roll, no spend:

1. **Ki Regeneration** - a Short Rest restores `Klotho ÷ 2` Ki (round up); a Full Night's Rest restores Ki fully. See [Ki's refill](fate.md#fatigue-check).
2. **Lucky Number** - a character's lucky number equals their **Klotho rating**. Whenever **any die** rolled for that character shows a result **equal to their Klotho rating**, they immediately gain **1 Fate Token** - automatic, no choice, no cost.

#### Ki Infusion

Covers **all three attack types** - Physical, Social, and Mental - with the same shape and the same currency. The baseline attack die is raw and unboosted - `d10` vs. the defender's wall (Soak/Presence/Psyche as appropriate), so a wall of 10 fully negates it, guaranteed (0% connect). Before the roll, a player may spend **1 Ki per individual die** to add their own matching sub-stat (**Ferocity** for Physical, **Presence** for Social, **Psyche** for Mental) to that specific die's result - "pushing" the attack. A boosted die is compared as `d10 + [matching sub-stat]` vs. the wall, same threshold rule (result > wall connects).

This is a **direct Ki spend**, the same category as [spending Ki to preserve a Health Level](#ki-spend-to-preserve-a-health-level) and [Bump Action Bracket](fate.md#ki-the-pool-formerly-risk-pool) - **not** a Fate Token spend, so it does **not** trigger the [Fatigue Check](fate.md#fatigue-check) and does **not** count against [Stamina's per-encounter spend cap](fate.md#staminas-job).

Full negation is still the honest baseline: an unboosted attack against a maxed wall can never get through, but a player willing to spend Ki can crack even a Soak/Presence/Psyche of 10 - a boosted die with a matching sub-stat of 10 is a guaranteed connect, while a rating of 2 only gives a 20% chance per boosted die.

#### Ki Spend to Preserve a Health Level

A player may spend **1 point from Ki** (the pool - distinct from [Fate Tokens](fate.md), the resource players earn/spend) to **cancel the loss of one Health Level**, at a cost of 1 Ki per Level preserved. Multiple Ki can be spent to preserve multiple Levels.

#### Health Level Recovery

- **Short Rest**: heal Health Levels equal to your Health sub-stat divided by 2, round up.
- **Full Night's Rest**: heal all lost Health Levels, back to full.
- **Reduced below 0 Health Levels**: instead of the rates above, recover 1 Health Level per day of rest until back to 0.

#### Battle Scars

Dropping to 0 Health Levels leaves a permanent mark - a scar, a limp, a changed voice, whatever fits the wound. **Purely cosmetic, no mechanical effect.** The [Healing](gifts.md#healing) and [Regeneration](gifts.md#regeneration) Gifts both grant immunity to it, for the target they're used on.

Dropping below 0 Health Levels can instead impose a genuine [Flaw](flaws.md), lasting until the character is fully healed back to 0. GM's call, in consultation with the player, on which Flaw fits the harm taken.

#### Poise

Poise mirrors [Health Levels](#health-levels), tracking composure under Social attack instead of Physical.

- **`PC Poise = 5 + Presence`.** NPCs default to a flat 5. Each Level is a binary hit-box, same shape as Health.
- **Poise cannot drop below 0.** Once at 0, further connecting Social dice have no additional effect - you're already as Flustered as you get.
- **At 0 Poise**, a character becomes [Flustered](#flustered).

**Recovery**: Short Rest heals `Presence ÷ 2` (round up); Full Night's Rest heals fully.

**Ki cannot prevent a Poise loss.** Once Poise reaches 0, spending **1 Ki refills it back to full**, reflecting how quickly social standing can turn around in the moment.

**Poise scars**: dropping to 0 leaves a purely cosmetic social tell (a nervous habit, a reputation quirk), no mechanical effect. No Gift currently grants immunity to this - intentional.

#### Sanity

Sanity mirrors Health Levels too, tracking a character's grip on their own mind against Mental attack.

- **`PC Sanity = 5 + Psyche`.** NPCs default to a flat 5. Each Level is a binary hit-box.
- **Crossing zero** works identically to Health Levels.
- **General recovery** matches Health/Poise: Short Rest heals `Psyche ÷ 2` (round up); Full Night's Rest heals fully.

**At 0 Sanity, a character is Overwhelmed**: they gain a temporary negative mental trait (a Flaw - exact mechanic to be defined later) and are at Disadvantage on rolls. They can still act on their own. Overwhelmed clears when the character is removed from the stimulus that caused it and given a chance to rest, or by spending 1 Ki, which also refills Sanity to full.

**Below 0, a character is Shattered**: panicky, babbling, unable to act on their own - they have to be led or dragged. Shattered clears when 1 Ki is spent or a Full Night's Rest passes, either of which restores Sanity only to 1, not fully - normal recovery resumes from there on the next rest. **Dropping below 0 always leaves a permanent mental scar**, regardless of how the character recovers afterward, even a Ki-funded refill doesn't erase it. The scar mechanic itself is not yet defined - flagged for a later, deeper pass.

#### Defense (Derived Stat)

Moira's combat sub-stat is named **Atropos**, after the Fate who cuts the thread of life and cannot be turned aside - the fixed, unmovable point in a character's own destiny. It doesn't appear on the character sheet directly for combat purposes - instead it feeds a separate, derived entry called **Defense**, the same way D&D's AC is a derived number rather than a raw stat.

**Defense = 10 − Atropos.**

Defense is what an attacker's roll actually targets: **Defense becomes the attacker's Difficulty** when they attack this character (see the [Difficulty Chart](#difficulty-chart)). Since Difficulty runs 0 (hardest) to 10 (trivial), the subtraction inverts Atropos correctly: Atropos 0 → Defense 10 (trivial to hit), Atropos 10 → Defense 0 (nearly impossible to hit).

#### Sub-Stat Descriptors

For every point a character allocates to a sub-stat, they gain one Descriptor - a short player-chosen word or phrase capturing one specific flavor of that sub-stat for this character. E.g. 3 points in Soak might yield *Iron-skinned, Padded, Unyielding* - three distinct ways the character shrugs off harm, not three copies of the same idea.

Descriptors are **free at character creation** (no separate cost beyond the point that earns them) and **fixed once chosen**. A character can also buy an extra Descriptor on a sub-stat without raising it: at creation, this costs a flat **1 Discretionary point** per extra Descriptor, no scaling. Buying one after creation instead costs XP, priced alongside the other Skill Training Tier XP costs (still undecided).

Descriptors are the concrete hook a player points to when [arguing a Skill pairing](skills.md#skills-are-not-attribute-locked) - grounding "I'm using Fire here because I'm being *Ruthless*" in an established character fact instead of an improvised justification each time.

## Combat

### Combat Order

1. **Initiative** - rolled **once at the start of combat**, not re-rolled each round: **1d10 + Initiative** (sub-stat). Higher total acts first. This base order holds for the whole fight.
2. **Declare Action Bracket** - each character declares which of the three bands they're acting in this round: **Fast**, **Normal**, or **Slow** (see below).
3. **Resolve band by band** - all **Fast**-band characters act first, then all **Normal**-band characters, then all **Slow**-band characters. Within each band, characters act in Initiative order.

#### Action Brackets

| Band | Also called | Actions | Notes |
|---|---|---|---|
| **Fast** | Reactive | One action | A snap shot, a move, a single Skill use. Acts first, but only gets the one action. |
| **Normal** | Active | Two actions | E.g. a move and an attack. Acts second. |
| **Slow** | Measured | One action, with concentration | Acts last, but the single action is empowered: allows called shots, grants **Advantage** on the attack, and (once magic exists) all spellcasting is always a Slow action. |

The tradeoff across all three: **Fast trades action count for going first**, **Normal is the balanced middle (two actions, middling position)**, **Slow trades speed for a single, more powerful, concentrated action**.

A player can spend **1 Ki per step** to bump their declared band up (Slow → Normal, or Normal → Fast) - buying back speed at the cost of the resource. Spending 2 Ki moves two steps at once (Slow → Fast).

#### Movement & Range

**Range Bands**: four abstract bands - **Melee, Close, Near, Far** - used for weapon reach, targeting, and spotting. The GM assigns them loosely per scene rather than measuring a map; no grid.

**Movement Rate**: `5 + Air`, in **meters** - the same flat-floor-plus-Attribute shape as [Health Levels](#health-levels). A character can move up to their Movement Rate as part of a Fast action's one action or a Normal action's move component. As a rough conversion (not a strict count), **spending a full Movement Rate shifts one Range Band**; the GM can also just narrate a shift directly when the fiction obviously calls for it, without making players do the math.

#### Distracted

A character who loses a Health Level or is the target of a Kotodama effect while resolving a **Slow** Action Bracket action becomes **Distracted**, and must roll **Atropos + Difficulty** to hold focus.

- **Success** - the action resolves as declared.
- **Failure** - the action downgrades to a **Normal** action (loses the called-shot/Advantage benefit).

**Other sources can impose Distracted too** - a Gift, an environmental hazard (a collapsing building, a deafening explosion), or GM fiat, whether or not a Slow action is involved. The same **Atropos + Difficulty** roll applies; outside a Slow action, failure instead imposes **Disadvantage** on the triggering roll. [Concentration](boons.md) grants immunity to being Distracted regardless of source.

#### Surprise

A character who hasn't noticed a threat before combat begins is **Surprised** - typically because an opposing Stealth roll succeeded against their Perception, or the GM judges the fiction warrants it.

**A Surprised character rolls at Disadvantage on everything** - attacks, and any other roll where the defender's readiness matters - for the remainder of the round they're caught in. Ends automatically once that round ends. [Alertness](boons.md) grants immunity to being Surprised while conscious.

#### Flustered

A character whose [Poise](#poise) reaches 0 becomes **Flustered**.

**A Flustered character rolls at Disadvantage on all Social rolls**, and on any other roll where composure matters (GM's call, same standard as Surprise), for the rest of the Scene.

A Flustered character may spend an action to roll **Presence + Difficulty** to shake it off early, ending the condition immediately on success.
