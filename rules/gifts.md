# Gifts

## What a Gift Is

Gifts represent truly exceptional capability — magic, psionics, superpowers, divine blessings, mutation, whatever fits the campaign's genre. Unlike Skills, which default to **broad** categories narrowed by specialties, each Gift is **unique and narrow in scope** — a specific named capability (e.g. *Pyrokinesis*, *Precognition*, *Divine Healing*), not a broad umbrella like "Magic."

## Five Levels, World of Darkness-Style

Every Gift has exactly **5 levels**. This replaces the general 1-10 scale used for Attributes and Skills — Gifts are rated 1-5.

- Levels are **cumulative and sequential** — a character must hold the previous level before gaining the next. No skipping.
- Each level **explicitly defines what the character can now do**, building on the previous level's capability — this mirrors how World of Darkness Disciplines work (e.g. Celerity, Obfuscate, Potence), where each dot unlocks a specific, named power rather than just a bigger number.
- When a Gift is created (see below), **all 5 levels must be defined up front** — what level 1 lets you do, what level 2 adds, and so on through level 5.

## Resolution

**Correction — not Attribute + Gift Level.** Gifts don't plug their own level directly into the roll. Instead, there's a new statistic — tentatively named **Power Level** (placeholder; not yet finalized) — inspired by Mage: The Ascension's **Arete**: a single stat measuring raw magical/exceptional potency, separate from the Spheres/Gifts that define *what* you can actually affect.

- **Gifts govern WHAT can be done** — the specific effects unlocked at each of a Gift's 5 levels.
- **Power Level governs HOW POWERFUL** a character is at using Gifts in general — one stat, not tracked per-Gift.
- To use a Gift, roll **Power Level + Body/Mind/Soul** (whichever Attribute best fits the specific use, negotiated the same way Skill+Attribute pairings are — see [skills.md](skills.md)) against the standard roll-under d20.

**When a Gift's effect is imposed on an unwilling target, it mostly resolves against the target's [Resolve](core-mechanic.md#calculated-defensive-traits) (Soul ÷ 2, round up)** rather than a Resisted Roll: the Gift-user rolls Power Level + Attribute as normal, and if their DoS exceeds the target's Resolve, the effect takes hold — one roll, not two. This is the default for one-sided Gift impositions (fear, domination, charm, and similar Soul-targeted effects), same reasoning as [Defense](core-mechanic.md#calculated-defensive-traits) replacing Resisted Rolls for ordinary attacks.

This is **"mostly," not an absolute rule** — some Gifts genuinely call for a full [Resisted Roll](core-mechanic.md#resisted-rolls) instead (the target actively straining against the effect, not just passively resisting), decided **case by case** per Gift rather than as a blanket default. When a Gift does use a Resisted Roll, it works as normal: both sides roll, Degree of Success/Failure is compared, aggressor wins ties.

**Power Level is scored 1-10**, same scale as Body/Mind/Soul, and is its **own independently-assigned statistic** — not a figured/derived characteristic calculated from Body, Mind, Soul, or any combination of them (see [core-mechanic.md](core-mechanic.md#power-level)). It's bought and advanced on its own, the same way an Attribute is.

**A Gift's own Level (1-5) governs scope, not magnitude.** It's a pure gate on *what a character can attempt* — which named effects exist and are available to them — with no numeric weight in the roll itself. How well/powerfully an attempted effect comes off is entirely down to the Power Level + Attribute roll (and its Degree of Success), not the Gift's Level. In short: **Gift Level = what you can do, Power Level = how good you are at doing it.**

## Uniqueness of Scope

Gifts are deliberately narrow and non-overlapping. Two Gifts shouldn't cover substantially the same ground — if a player wants to do something a bit differently than an existing Gift already covers, that's more likely a case for advancing that Gift's levels or negotiating scope on an existing one than for creating a whole new one from scratch.

## Creating New Gifts

Players can create new Gifts, but it's an **intensive discussion with the GM** — deliberately heavier scrutiny than creating a new Skill, since Gifts are exceptional and often setting-defining rather than mundane. At minimum, that discussion should nail down:

- The Gift's unique scope (what it does and, just as importantly, what it doesn't).
- All 5 levels of effects, defined up front.
- Thematic and setting fit.
- Any resource cost, cooldown, or drawback attached to using it.

## Example Gifts

Compiled from eleven systems (Werewolf, Mage, Changeling, Wraith, Hunter, Exalted, Adventure!, Pendragon, Scion, In Nomine, Hero System, Heroes Unlimited) plus D&D 5e classes (Druid, Ranger, Rogue, Barbarian, Monk) and general comic book/anime/fantasy/sci-fi convention — see [premade-gifts.md](premade-gifts.md) for the full source cross-reference and a complete catalog of **76 Gifts, every one with all 5 levels fully defined**: 66 across 13 themed categories (Physical Enhancement, Elemental & Energy, Mental/Psychic, Biological/Shapeshifting, Social/Charisma, Movement & Spatial, Temporal, Fate/Luck, Light/Darkness/Illusion, Sound & Vibration, Life/Death/Spirit, Technology/Bio-Tech, Cosmic/Divine), plus 10 Class-Inspired Gifts (2 per class). Ready to hand a player at the table as-is.

## Open Questions

- Does new Gift creation happen only **between sessions** (like new Skills), or can it also happen at character creation?
- Do Gifts require an in-fiction source or origin (bloodline, pact, training, mutation) to justify taking them, or is that left purely to player narrative flavor?
- **Exact Resonance cost to activate a Gift** — partially resolved 2026-07-14: every Gift costs [Resonance](core-mechanic.md#resonance--confirmed) to use, a universal system rather than per-Gift, but the exact amount isn't set. One direction floated: scale with the Gift's own Level.
- **TODO: Cybernetics needs fuller treatment.** Currently only lightly represented by one catalog entry ("Grafted Steel" in [premade-gifts.md](premade-gifts.md)). Needs: more concepts (sensory augments, subdermal armor, combat-adjacent implants, neural interfaces, etc.) and a decision on whether cybernetics should follow the standard Gift creation process as-is, or needs its own acquisition rules (surgery, monetary cost, installation time/risk, rejection/compatibility) given it's typically bought and installed rather than trained or awakened into.
- **TODO: Detail pass pending combat.** The whole catalog (e.g. *Fleet-Footed Fury*) is written at a soft narrative level of detail. Once [combat.md](combat.md) is designed, every Gift needs a pass applying that logic concretely — specific ranges, durations, action costs — instead of the current phrasing.
- **TODO: Resisted-Roll-vs-Resolve triage.** Now that Resolve-vs-DoS is the default for one-sided Gift impositions, every existing Gift with an unwilling-target use case needs a pass to decide, case by case, whether it fits the default or genuinely needs a full Resisted Roll instead. Not started.

## Resolved

- **Gift level cost at character creation, confirmed 2026-07-14**: **flat 1:1** from the Gift pool — 1 pool point buys 1 Gift level, same convention as Attributes/Skills/Perks. This confirms the specialization/generalization math worked out for the [8-point Gift pool](character-creation/overview.md#calibration) (one maxed Gift + a secondary, or several Gifts at lower levels) rather than that math being contingent on an unresolved assumption.
- **XP costs during Advancement, confirmed 2026-07-14**: acquiring a **brand-new Gift** (0→level 1) costs a **flat 7 XP**. Raising an **existing Gift's level** costs `current level × 5` — a direct import of WoD's in-clan Discipline cost. Climbing a Gift from level 1 to 5 costs `5 × (1+2+3+4)` = **50 XP** on top of the initial 7, for **57 XP total** to fully max one Gift from scratch.
