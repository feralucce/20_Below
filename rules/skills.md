# Skills

## Scoring — confirmed

Skills are scored **0-10** system-wide (see [core-mechanic.md](core-mechanic.md#character-capabilities)). **0 means untrained and unusable** — a character needs at least **1** in a Skill to roll it at all; there's no "roll on the raw Attribute" fallback for a Skill you've never learned. This is a deliberate floor of 0, unlike Attributes' floor of 1 — everyone has *some* baseline physical/mental/spiritual capability, but not everyone has learned every Skill.

**Character-creation cap, confirmed 2026-07-14**: a Skill may not exceed **6** at character creation, even though the system-wide ceiling is 10 — a starting character cannot begin the game with a maxed-out Skill. Reaching 7-10 is advancement-only, spent with XP after creation like any other improvement.

**XP costs during Advancement, confirmed 2026-07-14**: raising an existing Skill costs `current rating × 2` (a direct import of WoD's Ability cost — see [core-mechanic.md](core-mechanic.md) for the Attribute/Power Level/Gift equivalents). Learning a **brand-new Skill** (0→1) costs a **flat 3 XP**, reusing WoD's own "new Ability" override for the same reason WoD needed one: the ×2 formula breaks down at a starting rating of 0.

## Skills Are Not Attribute-Locked

Skills are not tied to a fixed attribute. Any skill can be paired with any attribute, provided the player can argue the pairing to the GM's satisfaction. The GM has final say on whether a proposed pairing is reasonable for the situation. In practice, that argument is usually grounded in one of the character's own [Attribute Descriptors](core-mechanic.md#descriptors--confirmed) — a specific chosen flavor of the Attribute (e.g. *Agile* under Body) rather than an improvised justification from scratch.

**Example:** Dave wants to intimidate an NPC who is built like a sasquatch. Normally he'd roll Intimidation + Body. But he's not going to out-muscle this NPC, so he argues for an alternative:

- **Intimidation + Soul** — Dave radiates cold, unshakable presence, intimidating the NPC through sheer force of personality rather than physical threat.
- **Intimidation + Mind** — Dave calmly, precisely describes exactly what he's capable of doing to the NPC, making himself seem calculating and dangerous.

The GM decides whether the argument holds up in the moment; a good argument earns the pairing, a weak one doesn't. **Pairings are re-argued every time, not banked as precedent** — a pairing that worked in one situation may not hold up in another, since the justification is about the specific circumstance, not a permanent fact about the character.

## No Fixed Skill List

There is no master list of skills. Skills in the real world number in the millions, and no fixed list could cover them all. Instead:

- A set of **premade skills** will be provided as examples and defaults to speed up character creation.
- Players are encouraged to invent new skills to fit their character.
- **New skills cannot be created mid-session.** Skill creation happens **between sessions**, purchased with XP like any other advancement (see [character-creation/overview.md](../character-creation/overview.md)).
- Every new skill's existence, scope, and cost is **subject to discussion with and approval by the GM** — there's no separate formal scoping process beyond that conversation.

## Skill Breadth: Broad, Not Narrow

Skills default to being **broad** (e.g. one "Science" skill, one "Craft" skill, one "Piloting" skill) rather than split into many narrow sub-skills (e.g. separate "Chemistry," "Physics," "Biology" skills). Specialties are what narrow a broad skill down to a specific application, so the breadth doesn't come at the cost of precision — and it's reinforced by the fact that specialties can also be bought outright (see Specialties below), not just earned automatically at high rank.

## Specialties

When a character becomes particularly adept at a skill, they gain **specialties** — a one- or two-word descriptor narrowing the skill to a specific application (e.g. *Computer Programming: Python*).

- If a roll would meaningfully use a specialty, the player gets **Advantage** on that roll (2d20, take lower — see [core-mechanic.md](core-mechanic.md)).
- Specialties are earned automatically as a skill increases in rank:

| Skill Rank | Specialties Gained |
|---|---|
| 6 | 1st specialty |
| 8 | 2nd specialty |
| 10 | 3rd specialty |

- Specialty choice belongs to the player, subject to GM approval for fit.
- Advantage from a specialty does not stack with other sources of Advantage (per the core Advantage/Disadvantage rule) — having two applicable specialties on one roll still just grants Advantage once.
- **Advantage is the entire mechanical effect of a specialty** — no flat bonus, no auto-success, nothing beyond Advantage on an applicable roll.
- Specialties beyond the automatic ones can also be **purchased separately** with XP between sessions, same as any other advancement purchase, subject to GM approval (see [character-creation/overview.md](../character-creation/overview.md)). This means a character isn't limited to 3 specialties per skill capped by rank; extra ones are available as long as the player is willing to spend the XP. **Cost, confirmed 2026-07-14**: `current number of specialties on that skill × 1` XP — cheap and gently scaling, same treatment as an extra Attribute Descriptor.

## Open Questions

None remaining specific to this doc — see [docs/TODO.md](../docs/TODO.md#advancement-xp-economy--character-progression-post-creation) for the still-open Advancement questions that apply system-wide (how much XP is earned, justification requirements).

## Resolved

- **Genre-flagged skills ship as defaults, GM discretion to drop** (2026-07-13): Occult, Mythos, and Alchemy (see [premade-skills.md](premade-skills.md)) are included by default rather than opt-in modules, but the GM can drop any that don't fit the campaign's premise.
- **XP costs, confirmed 2026-07-14**: raising a Skill costs `current rating × 2`; a brand-new Skill costs a flat 3 XP; an extra Specialty costs `current specialty count × 1` XP. See Scoring and Specialties sections above.
