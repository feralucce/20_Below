# Combat Mechanics Survey

A research pass across other TTRPGs' combat systems, done 2026-07-22 while brainstorming 20 Below's own combat (target number = Attribute + something, roll under to succeed). Organized by the specific problem each mechanic solves. Not a decision log — nothing here is adopted until it's discussed and written into [combat.md](../rules/combat.md) or [core-mechanic.md](../rules/core-mechanic.md).

## Turn Order / Initiative

- **Card-based Initiative (Savage Worlds)** — shuffle a standard deck (with Jokers), deal one card per combatant each round; high card acts first, suit breaks ties. Re-dealt every round, so order is never fixed — genuinely unpredictable without adding a roll. A drawn Joker can grant a bonus that round. Already discussed as a candidate for 20 Below's Initiative.
- **Shot Clock (Feng Shui)** — each combatant has a "shot" value; actions cost shots; whoever has the highest remaining shot count acts next, then their shots drop by the action's cost. Turn order emerges from a shared countdown rather than a fixed sequence — fast actions let you act again sooner.
- **Tick-based Initiative (Exalted, and Feng Shui's underlying model)** — similar to shot clock: actions take a variable number of "ticks," and whoever's tick counter is lowest goes next. Feels fast-paced because slow, telegraphed actions and quick jabs are mechanically distinct, not just "everyone acts once per round."

## Action Economy

- **Three-Action Economy (Pathfinder 2e)** — every turn is just three generic actions, spent on anything (move, attack, cast, aid) — no separate "move + standard action" bucket. Praised for being simple to teach (one resource, not several) while still supporting deep tactical choice (e.g. two attacks + a move, or three attacks at increasing penalty).
- **Discrete Tradeoff Turns (Lancer)** — turns are a small set of choices with real opportunity cost; movement and actions interact fluidly, and positioning matters as much as the action picked. Praised for making every turn a meaningful decision rather than a checklist.
- **Escalation Die (13th Age)** — a shared d6 starts at 1 on round 2 and climbs by 1 each round (cap +6), adding its current value to everyone's (PCs') attack rolls. Makes fights get more dramatic and decisive the longer they run, discouraging combat from dragging, and some abilities only unlock at higher Escalation values. Frequently cited as the single most-borrowed mechanic from the game.

## Success/Failure Granularity (Degrees of Success)

- **Position & Effect (Blades in the Dark)** — before rolling, GM sets **Position** (Controlled/Risky/Desperate — how bad failure is) and **Effect** (Limited/Standard/Great — how much a success accomplishes), decoupling "can this go wrong" from "how much do I get." The roll itself (dice pool, keep highest) then lands on full success / partial success with a complication / failure, giving three outcome bands instead of two.
- **Ring/Skill Dice Pools with Kept Dice (Legend of the Five Rings, FFG edition)** — roll a pool of two colors of d6 (skill dice + ring/element dice), keep a number of dice equal to your ring rating, count successes among the kept dice. Explosive-success symbols let you roll more dice on top. Produces graduated success plus separate "complication" and "opportunity" symbols that add narrative texture without a second roll.
- **Margin of Success as Defense Target (Hero System)** — roll 3d6 low against (11 + your Offensive Combat Value); how much you make the roll by becomes the effective Defensive Combat Value you hit. A single roll produces both pass/fail and a graduated "how precisely" result, reused directly as a targeting number rather than a separate damage/effect roll.

## Wounds / Damage Escalation

- **Tiered Critical Tables (Warhammer Fantasy Roleplay)** — crits are looked up by severity tier and body location, producing specific ongoing effects (e.g. a Tier 2 crit causes bleeding, 1 wound/round until treated; limb hits can fracture with a set healing time). Praised for making crits feel like specific injuries with real consequences rather than "double damage."
- **d66 Wound Tables (Mörk Borg's Malediction's Handbook, and similar OSR-adjacent supplements)** — rolling on a wide, flavorful wound table (which limb, what kind of injury) turns a single bad hit into a specific, memorable story beat instead of an abstracted HP loss.

## Interrupts / Reactive Play

- **Reactive "Wimp Out" Cards (Lunch Money)** — a universal defense card, playable out of turn, as the single counter-play to any attack. Already discussed for 20 Below as a candidate for the interrupted-intent mechanic in [combat.md](../rules/combat.md#interrupted-intents).
- **Setting Position & Effect as a Pre-Roll Negotiation (Blades in the Dark, again)** — worth calling out separately: the GM and player explicitly negotiate stakes *before* dice are touched, which sidesteps a lot of "wait, what does failure even mean here" table friction that dice-first systems run into.

## What's Most Relevant to 20 Below Right Now

Given the pieces already in place (roll-under d20, an open Initiative question, an already-written interrupted-intent reactive roll, and a currently-being-designed dice-pool Difficulty mechanic):

- **Card-based Initiative** is the most directly pluggable — it's a drop-in replacement for "roll Initiative" that adds randomness without new subsystems.
- **The Escalation Die** is worth considering as a separate, later addition (a shared d6 that climbs each round) if fights ever feel like they drag — orthogonal to everything else being designed right now.
- **Position & Effect** is the strongest conceptual borrow if 20 Below ever wants to decouple "how risky is this" from "how much do I accomplish" — which is close to what the dice-pool Difficulty idea (GM's d6 pool vs. player's d6 pool) is already reaching for.

Sources:
- [A Beginner's Guide to PATHFINDER's 2e Action Economy - Nerdist](https://nerdist.com/article/pathfinder-2e-action-economy-guide-beginner/)
- [Lancer RPG Spotlight - Advanced RPGs](https://advancedrpgs.com/lancer-rpg-spotlight-tactical-mech-combat-licenses-and-mission-first-campaigns/)
- [Initiative Systems Are the Most Revealing Rules in a TTRPG](https://michaelghelfistudios.com/initiative-systems/)
- [Feng Shui (role-playing game) - Wikipedia](https://en.wikipedia.org/wiki/Feng_Shui_(role-playing_game))
- [Savage Worlds - Wikipedia](https://en.wikipedia.org/wiki/Savage_Worlds)
- [The Core System - Blades in the Dark RPG](https://bladesinthedark.com/core-system)
- [Setting Position & Effect - Blades in the Dark RPG](https://bladesinthedark.com/setting-position-effect)
- [Playing The Legend of the Five Rings RPG - Sprites and Dice](https://spritesanddice.com/posts/playing-legend-five-rings-rpg/)
- [Degrees of Success (or Failure) - HERO System Discussion](https://www.herogames.com/forums/topic/100719-degrees-of-success-or-failure/)
- [Critical Hits - Warhammer Fantasy Roleplay First Edition Wiki](https://wfrp1e.fandom.com/wiki/Critical_Hits)
- [Critical Hit Tables for Mothership - Failure Tolerated](https://www.failuretolerated.com/critical-hit-tables-for-mothership)
- [Transporting 13th Age's Escalation Die - SlyFlourish.com](https://slyflourish.com/escalation.html)
- [Inspiration Strikes!: Nuts & Bolts #20 - Escalation Die](http://inspstrikes.blogspot.com/2015/02/nuts-bolts-20-escalation-die.html)
