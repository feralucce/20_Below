# Fate Tokens

**Named 2026-07-22**: the resource previously called "Tokens (name TBD)" is now **Fate Tokens** — fitting directly into the fated-heroes theme (see [design-log.md](../docs/design-log.md)) as the literal currency of pulling on the threads of destiny.

A parallel resource layered on top of the [core roll](core-mechanic.md#resolution), inspired by [Dream Askew's Weak/Strong/Regular move economy](../docs/design-log.md) — playing into vulnerability, flaws, and bad luck funds a currency spent later.

## Nature

Carried over from White Wolf-style design (e.g. Vampire/Werewolf's Nature & Demeanor): every character has a **Nature** — a short archetype capturing a core drive or way of engaging with the world, written on the character sheet. Playing to your Nature at a dramatically appropriate moment grants a Fate Token. Exact list of Natures (fixed catalog vs. freeform) and what counts as "dramatically appropriate" are not yet defined.

## Fate Gain

- **Nature** — playing to your Nature at a fitting moment (see above).
- **Voluntary Disadvantage** — a player may choose to take [Disadvantage](core-mechanic.md#advantage--disadvantage) on a roll in exchange for a Fate Token. A deliberate trade: worse odds now, currency later.
- **Flaws** — every character has Flaws (carried forward conceptually from v1's Flaws, mirror of Perks). When the GM *or* the player invokes a Flaw in a scene, the invoking side's choice grants the player a Fate Token.
- **Daily Regeneration** — characters regain a set number of Fate Tokens once per day, at either sunset or sunrise (not yet decided). The exact number regained is also not yet decided.
- **Milestone Award** — when the party overcomes a significant challenge, the GM awards Fate Tokens (presumably party-wide, exact amount/scope not yet decided).
- **GM Discretion (D&D 5e Inspiration's methodology)** — the GM can directly award a Fate Token for good roleplay or a clever idea, independent of the other triggers above. Unlike the other sources, this one isn't tied to a specific mechanical event — it's a GM judgment call in the moment.

## Fate Spend

Six spend options:

- **Extra Action** *(from D&D 4e Action Points)* — spend a Fate Token to take an additional action on your turn.
- **Reroll / Soak Damage / Push the Fiction** *(from Savage Worlds Bennies)* — spend a Fate Token to reroll a roll, reduce incoming damage, or nudge a scene detail in your favor.
- **Automatic Success / Resist a Mind-Affecting Effect** *(from World of Darkness Willpower)* — spend a Fate Token to guarantee a success on a roll outright (not just a bonus), or to resist an effect that targets the mind/will.
- **Boost a Check / Shrug Off an Effect** *(from Mutants & Masterminds Hero Points)* — spend a Fate Token to add a flat bonus to a check, or to negate a condition/effect entirely.
- **Bump Action Band** — spend **1 Fate Token per step** to move up one [Action Band](combat.md#action-bands): Slow → Normal, or Normal → Fast. Spending 2 Fate Tokens moves two steps (Slow → Fast) — confirmed one-token-per-step, no separate flat cost for a double bump.
- **Move Up Initiative Step** — spend a Fate Token, at any point during combat, to move your character up one step in the [Initiative](combat.md#combat-order) order **for that turn only**. Next turn, they settle back to their originally rolled position — a temporary, one-turn positional swap, not a permanent change or a numeric bonus.

These five options overlap in places (multiple sources offer some form of reroll or bonus) — deliberately left as-is for now rather than pre-merged, since the exact final menu of spends is still being shaped.

## Fatigue Check

**Revised 2026-07-22**: every time a player spends a Fate Token, they immediately make a **Fatigue Check** — roll 2d10 against **Ki** (see below), same roll-under shape as the [core roll](core-mechanic.md#resolution), with Ki's current total standing in for a target number instead of a GM-set Difficulty.

- **Success** — no effect, the Fate Token spend goes through with no cost beyond the token itself.
- **Failure** — lose **1 point from Ki**, until it's refilled (refill trigger TBD).

This is deliberately a **spiral**: since Ki is its own target number, losing a point makes the *next* Fatigue Check harder too — the more a character leans on Fate Tokens, the more the risk compounds. Explicitly chosen over a flat per-spend cost because it keeps Fate Token spends cheap most of the time (failure isn't guaranteed) while still building real pressure the more a character pushes, and because more dice rolling is a feature here, not a cost to minimize.

**No longer touches Wyrd or Stamina directly.** The original version targeted the Wyrd Attribute + Stamina, but that made Wyrd's raw Attribute score double as both a normal Attribute *and* the universal gatekeeper behind every single Fate Token spend regardless of theme — disproportionate influence for one Attribute. See Ki below for the fix.

### Ki (the pool, formerly "Risk Pool")

**Named 2026-07-22, and distinct from Fate Tokens**: **Fate Tokens are the resource players earn and spend; Ki is the pool that gets risked when they do.** Ki is the wellspring of a character's superhuman capability, appropriated from what used to be the Ki *Attribute's* name once that Attribute was renamed **Wyrd** (fate/destiny/the supernatural) as part of the fated-heroes theme. **Ki = the average of all five combat sub-stats (Soak, Initiative, Damage, Stamina, Warp), doubled** to land in the 2-20 range. Built from all five equally so no single Attribute dominates the mechanic. Refill trigger (rest? something else?) not yet decided.

**Second job, proposed 2026-07-22**: Ki can also be **directly spent** (not just risked via the Fatigue Check) — a player may spend **1 point from Ki to preserve one [Health Level](core-mechanic.md#health-levels)** that would otherwise be lost to an unsoaked hit. This is a straight point-spend, distinct from the Fatigue Check's roll-and-risk shape.

### Stamina's Job

**Confirmed 2026-07-22**: Action Bands themselves (Fast/Normal/Slow) cost nothing to declare — that's just normal combat flow, not something Stamina governs. Instead, Stamina does two things:

1. **Hard cap on Fate Token spends per encounter.** A character can spend Fate Tokens **at most [Stamina score] times per single encounter**, regardless of how many Fate Tokens they actually have banked. This is a ceiling separate from and in addition to the Fatigue Check's risk — even a character sitting on a full bank of Fate Tokens is locked out once they hit their Stamina-based spend limit for the fight.
2. **General endurance/exhaustion-resistance gauge.** Outside the Fate Token spend cap, Stamina is also the broader measure of how long a character can sustain physically demanding activity and how well they resist exhaustion generally (forced marches, holding your breath, etc.) — the original framing, still standing alongside the new numeric cap. The exact mechanic for this second, non-combat role isn't detailed yet.

## Narrative Control

A fifth spend category, adapted from Fabula Ultima's "Alter the Story": spending Fate Tokens to assert a fact into the fiction directly, rather than touching a die roll. **Liked and being scoped** — cost scales with how big the change is, and multiple players may **pool** their Fate Tokens together for something no single character could afford alone.

| Fate Tokens spent | Scale | Example | Ripple |
|---|---|---|---|
| 1 | Minor detail | A loose torch sconce is right where you need it; a guard happens to be looking away | Negligible — the GM incorporates it with no real consequence |
| 2-3 | Moderate change | An ally arrives in the nick of time; a weapon was already sabotaged | A proportional complication may surface later, at the GM's discretion |
| 4+ (or pooled) | Major change | A faction's loyalty flips; an NPC's true nature is revealed | Real, GM-authored consequences down the line, scaled to match |
| Pooled, many Fate Tokens | Massive/world-altering change | Something structural about the plot or world itself shifts | Guaranteed major repercussions, scaled to match |

**The butterfly effect is real, and it's already built into the existing mechanic**: since [the GM gains a Fate Token for every one a player spends](#the-gms-own-pool), a bigger Narrative Control spend automatically hands the GM proportionally more leverage — no separate consequence math needed. Small edits barely move the GM's pool; massive pooled edits load it up considerably, which is exactly where the "big changes have big repercussions" feel comes from.

## The GM's Own Pool

**Liked and adopted, from Star Wars FFG/Genesys' Destiny Points**: rather than Fate Tokens just draining from players into nothing, **when a player spends a Fate Token, the GM gains one** in a separate GM-side pool. Mirrors Destiny Points' light/dark flip — spending isn't just depletion, it's a transfer of leverage from the players' side of the table to the GM's.

**Scoped 2026-07-22: narrative-only.** The GM's pool does **not** mirror the player [Fate Spend](#fate-spend) menu — no Extra Actions, no Automatic Success, no mechanical crunch bonuses for NPCs. The GM already holds narrative authority over the world; stacking mechanical bonuses on top of that would just be power creep on the side that's already advantaged. Instead, the GM spends their pool the same way Narrative Control's ripples work for players — **complications, twists, and consequences woven into the fiction**. The GM is explicitly encouraged to get inventive with these: a spent GM point isn't a flat "the NPC gets +2," it's "the ambush was a distraction," "the ally you saved owed someone else a debt first," or any other fictional escalation that makes the pool feel like a narrative lever, not a stat bonus.

## Open Questions

See [design-log.md](../docs/design-log.md#open-questions) for the full list, including: how to reconcile/trim the overlapping player spend options above, Nature's fixed-list-vs-freeform question, sunset vs. sunrise for daily regen, the daily regen amount, and the Milestone award amount/scope.
