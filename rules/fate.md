# Fate Tokens

A parallel resource layered on top of the [core roll](rules.md#core-mechanic) - playing into vulnerability, flaws, and bad luck funds a currency spent later.

## Nature

Every character has a **Nature** - a short archetype capturing a core drive or way of engaging with the world, written on the character sheet. Playing to your Nature at a dramatically appropriate moment grants a Fate Token.

The list of starter Natures, and the guide to writing your own, are in [Creating a Character](character-creation.md#3-nature), because that is where you pick one.

## Fate Gain

- **Nature** - playing to your Nature at a fitting moment (see above).
- **Voluntary Disadvantage** - a player may choose to take [Disadvantage](rules.md#advantage--disadvantage) on a roll in exchange for a Fate Token.
- **Flaws** - every character has Flaws. When the GM *or* the player invokes a Flaw in a scene, the invoking side's choice grants the player a Fate Token.
- **Daily Regeneration** - characters regain **1 Fate Token** at sunrise, every day.
- **Milestone Award** - when the party overcomes a significant challenge (a session's climactic fight, defeating a notable threat, a decisive turning point in the story), the GM awards **1 Fate Token to every PC**, roughly once per session - rarer than that and it stops feeling like a beat worth marking; more often and it stops feeling like a milestone.
- **GM Discretion** - the GM can directly award a Fate Token for good roleplay or a clever idea, independent of the other triggers above.

**No double-dipping**: a single scene beat pays out **at most one Fate Token**, even if it could honestly be described as both playing to your Nature and invoking a Flaw (or any other two triggers above) at once - e.g. a Soft-Hearted character with a Caregiver Nature stopping to help someone vulnerable. Pick whichever source fits best and pay out once.

### Holding Fate Tokens

A character can hold at most **[Stamina score] × 3** Fate Tokens at once. A Token earned
while already at that cap is lost rather than banked - including the daily regeneration and
Milestone awards.

Both Fate Token limits come from [Stamina](#staminas-job), and they are deliberately the same
stat at two scales: **Stamina × 3 is how many you can hold; Stamina is how many you can spend
in a single Scene.** So whatever a character's Stamina, they are carrying about three Scenes'
worth of Fate Tokens and no more. Banking across a quiet stretch of play is possible, but it
tops out quickly, and it tops out sooner for the character who could least afford to spend
them anyway.

A character with **Stamina 0 holds no Fate Tokens at all**, and cannot spend any either, since
the per-Scene cap is the same score. Fate Tokens are simply not a resource that character has.
That is the same shape as every other dumped sub-stat in the game - the floor is a wall, not a
gentle slope.

## Fate Triggers

Fate Tokens are spent on [Kotodama](#kotodama), or on any of the following, each a flat **1 Fate Token**:

- **Overcome a Flaw** - one of your Flaws doesn't apply for the rest of the current scene.
- **Automatic Success** - a single roll succeeds outright, no dice involved. Fate Tokens are rare enough that this stays a flat cost regardless of the Difficulty being bypassed.
- **Shrug Off an Effect** - ignore a negative status or condition ([Off Balance](rules.md#off-balance), Distracted, Surprised, Flustered, Overwhelmed, Exhausted, or similar) for a moment.
- **Refill Ki** - your Ki pool refills completely, right there in the moment, no need to wait for a rest.

Characters with [Iron Will](boons.md) may also spend 1 Fate Token to **Assert Your Will** - declare "my will is my own" and flatly negate an attempt to intimidate or dominate you, no roll. A micro-Kotodama: same shape as the main mechanic, but flat-costed and scoped narrowly to defending your own mind.

## Ki (the pool)

**Fate Tokens are the resource players earn and spend; Ki is the pool that powers everything superhuman a character does.** Ki is deliberately common: **Ki = your strongest Element + 8**, which puts every character between **13 and 18** regardless of how they built the rest of the sheet. Whatever a character is *most* is what channels their Ki - the frail specialist draws on as much as the bruiser.

Ki has three jobs, all of them direct spends - no roll, no check, and none of them interact with [Stamina's per-Scene Fate Token cap](#staminas-job):

1. 1 point from Ki preserves one [Vital Level](rules.md#ki-spend-to-preserve-a-level) - Health, Poise or Sanity - that would otherwise be lost to a die that got through the wall. At or below 0, 1 Ki instead restores [Poise](rules.md#poise) or [Sanity](rules.md#sanity) to **1**, without waiting for a rest.
2. 1 Ki per step to move up one [Action Bracket](rules.md#action-brackets) (Slow → Normal, or Normal → Fast; 2 Ki moves two steps at once).
3. 1 Ki per die to boost an attack die - see [Ki Infusion](rules.md#ki-infusion), covering all three attack types (Physical/Ferocity, Social/Presence, Mental/Psyche).

Most [Gifts](gifts.md) also cost Ki to use, called out per Gift and per Level, and some of them additionally call for a [Gift Check](gifts.md#resolution) rolled against current Ki.

**Raising it**: XP can buy Ki directly, a point at a time, each costing **whatever the pool stands at when you buy it** - so the tenth point costs more than the first, and a character who already channels a lot pays more to channel more. **The ceiling is twice your figured Ki**, the value your strongest Element gives you before any XP. Raising that Element lifts both the pool and the ceiling together. See [costs.md](costs.md#advancement-xp-rates) for the rate.

**Refill**: a Short Rest restores **Klotho** Ki (minimum 1); a Full Night's Rest restores Ki fully. These are the big damn heroes, after all - Ki isn't meant to be a slow trickle back.

### Stamina's Job

Action Brackets themselves (Fast/Normal/Slow) cost nothing to declare - that's just normal combat flow, not something Stamina governs. Instead, Stamina does three things:

1. **Hard cap on how many Fate Tokens a character can hold.** At most **[Stamina score] × 3** at once - see [Holding Fate Tokens](#holding-fate-tokens).
2. **Hard cap on Fate Token spends per Scene.** A character can spend Fate Tokens **at most [Stamina score] times per Scene** - the [Time Band](rules.md#time-bands) a combat encounter is contained within - regardless of how many Fate Tokens they actually have banked.
3. **General endurance/exhaustion-resistance gauge.** Stamina sets a free baseline duration for any single sustained exertion (holding breath, forced marching, sustained labor, running flat-out) - Stamina Rounds, Minutes, Hours, or whatever [Time Band](rules.md#time-bands) unit fits the activity, GM's call. Past that baseline, roll **Water + Difficulty** once per additional unit of time, with Difficulty dropping by 1 each successive check. Failure imposes one level of **Exhausted**.

**Exhausted** is cumulative, each level stacking on top of the last:

| Level | Effect |
|---|---|
| 1 | Disadvantage on Physical rolls |
| 2 | Disadvantage on **all** rolls |
| 3 | Movement Rate halved; **no Fast actions** |
| 4 | Every Ki spend costs **+1** |
| 5 | Unconscious, until warmed, cooled, or rested |

A Short Rest drops one level of Exhausted; a Full Night's Rest clears it entirely, mirroring [Health Level Recovery](rules.md#health-level-recovery)'s own split. Exertion is one source; [cold and heat](rules.md#common-hazards) are the other, and a level taken from an environment cannot be cleared while the character is still in it. [Exhausted](rules.md#exhausted) holds the full entry.

## Kotodama

*言霊* (kotodama, "word spirit") - spending Fate Tokens to assert a fact into the fiction directly, rather than touching a die roll. A player states a fact about the world, spends Fate Tokens to back the claim, and the fiction bends to make it true.

A claim's total Fate Token cost is the **sum of independent components**, not one flat lookup on a single scale. Multiple players may **pool** their Fate Tokens together for a total no single character could afford alone.

**Four components**: **Magnitude**, **Range**, **Plausibility**, and an optional **Duration** surcharge.

#### Magnitude - solo range (1-4 tokens)

Four tiers, one person acting alone, each step more exhausting than the last.

| Tokens | Tier | Examples |
|---|---|---|
| 1 | Minor coincidence | The flashlight was already in your pack; there's just enough battery left to get the engine started; the key is under the mat; the door didn't latch; your phone happens to have signal here |
| 2 | Meaningful, deliberate change | A hidden door that might not have been there before; the stolen motorcycle is just around the corner; the perfect tool was left by the side of the road; the security camera was already pointed the other way; a witness remembers seeing something useful |
| 3 | Decisive, unmistakable feat | A structure collapses or appears exactly where it's needed; a patrol's morale breaks all at once; a faction's loyalty visibly flips in the moment; the crowd's fear turns to anger, aimed at exactly the right target; the bridge holds together just long enough |
| 4 | Solo ceiling | An NPC's true nature or history is revealed to everyone present at once; a building that should be collapsing suddenly isn't; a faction's allegiance flips for good, not just the moment; a locked-down facility's systems glitch out all at once; an entire crowd's memory of what just happened is uncertain afterward |

**Pooled magnitude (5+ tokens), not yet detailed**: since 1-4 is explicitly what one person can do alone, nothing solo ever reaches 5 - pooling is just what happens once a group's combined total exceeds any single member's ceiling. **Tier 5** is its own step; **Tier 6+** is a flat ceiling where the exact token count stops mattering mechanically. Examples for both still TBD.

#### Range - personal scale (1-4 tokens)

A second, independent component for how far a Kotodama reaches. Only the "personal" end (bound to the character's own body/location) is defined so far - scene/district/city/setting-scale range isn't worked out yet.

| Tier | Range | Example |
|---|---|---|
| 1 | Self / on your person | The flashlight in *your* pack |
| 2 | Touch / arm's reach | The door didn't latch; the key's under the mat |
| 3 | Immediate vicinity / line of sight | The stolen motorcycle just around the corner; a hidden door across the room |
| 4 | The space you're in | The whole room, vehicle, or block you're standing in - still bound to your own location |

#### Plausibility

A third component: how deniable the claim is, independent of how big it is. **Three tiers, token costs not yet assigned**:

| Tier | Description | Example |
|---|---|---|
| Whisper | Entirely within the range of normal luck - a witness wouldn't think twice | The door happened to not latch |
| Murmur | Technically still possible, a notable stroke of luck a skeptic would talk themselves out of suspecting | Every camera on this block happened to be pointed the wrong way |
| Shout | Flatly breaks what anyone present believes is possible - no rationalizing it away, and it's remembered | A locked vault door swings open with no one touching it |

#### Duration (optional surcharge)

Permanent is the free default - a spoken truth just sticks, no extra cost. Paying more buys a **controlled, non-permanent shape** instead:

| Shape | Surcharge | Description |
|---|---|---|
| Transient | +1 token | Happens once, then unhappens - the door unlocks now, but it's an ordinary door again after |
| Intermittent | +2 tokens | Comes and goes, unpredictable - the lights flicker whenever it matters, not on any schedule |
| Cyclic | +2 tokens | Repeats on a dependable pattern - the gate opens every night at midnight, reliably |

## Thin Places

Reality is not equally solid everywhere. A stretch of consensus that has been overwritten enough times stops holding its shape - and corrupted things are easy to change.

**Kotodama costs less in a thin place.** How much less is the GM's call, with no table behind it: how worn a place is isn't a number, it's a fact about the story. A player who thinks they are standing somewhere the world has already been argued with should say so and find out what it is worth.

Two things hold whenever one is used. **A thin place is cheap for everyone**, not just the party - whatever else leans on that spot finds it easy too. And **it got thin because somebody did this before**: somewhere cheap to rewrite is somewhere that has already been rewritten.

The GM's [Hardening](#the-gms-own-pool) is the opposite number to this.
## The GM's Own Pool

Rather than Fate Tokens just draining from players into nothing, **when a player spends a Fate Token, the GM gains one** in a separate GM-side pool - spending isn't just depletion, it's a transfer of leverage from the players' side of the table to the GM's.

The pool buys three things, and every one of them is the world acting rather than a bonus bolted onto somebody's die roll.

- **A Twist** - **1, 3, or 5+ Tokens.** Escalate what is already in motion. One Token is a small complication; three is a real turn in the scene; five or more reshapes the arc.
- **A Claim** - the GM asserts a fact into the fiction, paying the same [Magnitude, Range and Plausibility](#kotodama) a player would, off the same tables.
- **Hardening** - **1 Token per point.** Each Token raises the cost of the players' next Kotodama in this Scene by 1. The opposite number to a [thin place](#thin-places).

**The rule that outranks all three: the pool never undoes a claim that was paid for.** A fact the players bought is true and stays true. The GM's Tokens buy what happens next, never a reversal.

**Since the GM gains a Fate Token for every one a player spends, a bigger Kotodama spend automatically hands the GM proportionally more leverage** - no separate consequence math needed. Small edits barely move the GM's pool; massive pooled edits load it up considerably.
