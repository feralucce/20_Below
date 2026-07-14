# Character Creation & Advancement — Overview

## Philosophy

Point-based build, no classes or levels. Players build exactly what they want at creation, and advance exactly how they want afterward — there's no fixed progression track.

- **Creation**: characters are built in a fixed order, across five separate currencies — see [Creation Order](#creation-order--confirmed) below.
- **Advancement**: after creation, characters improve by spending **XP directly** — XP is not banked into levels or tied to a class chart, it's spent one purchase at a time on whatever the player wants to improve (raise a Skill, buy a specialty, raise an Attribute, pick up a Perk or Gift), subject to GM approval and any in-fiction justification the system ends up requiring.

This is the same paradigm both at creation and during play — the only difference is the currency (build points up front, XP afterward) and that advancement purchases may need narrative justification (training, practice, a relevant experience in-fiction) at the GM's discretion.

## Creation Order — confirmed

**Resolved 2026-07-14**: character creation proceeds through a fixed sequence, in this order:

1. **Attributes** — spent from a dedicated Attribute point pool. Each point invested also grants an [Attribute Descriptor](../rules/core-mechanic.md#descriptors--confirmed) (a player-chosen flavor word/phrase — see that section).
2. **Skills** — spent from a dedicated Skill point pool.
3. **Perks** — spent from a dedicated Perk point pool.
4. **Gifts** — spent from a dedicated Gift point pool.
5. **Flaws** — chosen last among the "acquiring" steps. Taking a Flaw doesn't cost anything; it **grants Freebie Points** instead (see [flaws.md](../rules/flaws.md)).
6. **Spend Freebies** — the Freebie Points earned from step 5 are spent last, as a final flexible top-up pass.

**The four dedicated pools (Attributes/Skills/Perks/Gifts) are siloed**: points from the Attribute pool can only buy Attributes, Skill pool points can only buy Skills, and so on — nothing carries over or converts between them. **Freebie Points are the exception** — the flexible currency, spent last, presumably usable across any of the four categories to round out the build (mirroring how OWoD's own Freebie Points work) — flagged below as inferred, not yet explicitly confirmed.

## Resolves

- **Specialty purchases** ([skills.md](../rules/skills.md)): extra specialties beyond the automatic ones (rank 6/8/10) are bought with XP directly, same as any other advancement purchase. Exact XP cost TBD.
- **Point cost per rank for the four dedicated pools, confirmed flat** (2026-07-14): **1 pool point = 1 rank**, for Attributes, Skills, Perks, and Gifts alike. No scaling curve within a pool (a Body 1→2 purchase costs the same 1 point as a Body 9→10 purchase). This still leaves **pool size** itself open — see below.

## Calibration

**Step 1 (2026-07-14): what raw target number represents "average human, average task"?** Needed before pool sizes can be set, since pool size is meaningless without knowing what a point actually buys in success-rate terms. Both D&D and Hero System peg **10 as the average human stat**, so that's the anchor — the question is what a target number on *our* d20-roll-under scale (where target/20 = success%, since the die and the scale are both 1-20) needs to be to represent the same baseline.

Three reference conversions:

| Source | Convention | Average-human success rate | Equivalent raw target (× 20) |
|---|---|---|---|
| **D&D, classic ability check** (0e/1e/B-X: roll d20, succeed if ≤ ability score) | Structurally **identical** to our own roll-under-d20 mechanic — no conversion needed | Ability score 10 → 10/20 | **10** |
| **D&D 5e, DC-based** | d20 + modifier (+0 at score 10) vs. DC 10 ("Easy," the DMG's guideline for a task an average person handles) | Need to roll 10+ → 11/20 | **55%** → **11** |
| **Hero System** | 3d6 roll-under `9 + (Characteristic ÷ 5)`; Characteristic 10 → target 11- | P(3d6 ≤ 11) = 135/216 | **62.5%** → **12.5**, round to **~13** |

**Recommendation: target number 10** as the working "average human, average task" baseline. It's the low end of the 10-13 range the three conventions produce, but it's the cleanest and most structurally honest comparison — the classic D&D ability check uses the *exact same mechanic* we do (roll-under d20 against a 1-20ish human stat), so it converts with zero interpretation needed, unlike the DC-based or 3d6 conversions which both require translating across a different die/comparison shape first. It also has a pleasing property for this system specifically: an average stat of 10 producing a target of 10 means **the human baseline carries over numerically unchanged** — easy to sanity-check at the table.

**Step 2 (2026-07-14): Attribute pool size, confirmed.** **10 points**, with Body/Mind/Soul each **starting at 1** (free floor, not paid from the pool) — a maximum distributable total of **13** across the three Attributes (10 pool + 3 free floor).

This lands deliberately **short of "all three average"**: if Average = 5 (the midpoint this system's 1-10 scale, and the value that reproduces the raw-target-10 baseline from Step 1 when paired with an average Skill — 5 + 5 = 10), then 5+5+5 = 15, which **exceeds** the 13-point maximum. A flat, all-average build is arithmetically impossible under this pool — a character must run above average in at least one Attribute and below in at least one other (or some other uneven split) to spend the full pool. This directly reproduces the "one above, one average, one below — or two above, one abysmal" shape from the original goal, without needing separate hardcoded tiers: the budget itself forces the tradeoff.

**No separate starting-creation cap on individual Attributes** (2026-07-14): unlike WoD's explicit "max 3 dots at creation" rule (the reference point that originally prompted this whole calibration pass), this system deliberately does **not** impose a second ceiling below the Attribute's normal 1-10 range. The only bounds are the universal **min 1, max 10** scale itself, plus whatever the 10-point pool can actually afford — a player could dump 9 of their 10 points into a single Attribute (1→10, maxed) and split the last point elsewhere, if that's the build they want. The pool size is the real constraint; it doesn't need a redundant cap on top of it.

**Attribute pool size is resolved.** Skill/Perk/Gift pool sizes are still open.

**Step 3 (2026-07-14): Skill pool size, confirmed.** **35 points.** Derived by surveying the same source list used for [premade-skills.md](../rules/premade-skills.md) for two comparable data points despite their very different skill economies (dots vs. percentiles vs. skill points):

| Source | Starting skill investment |
|---|---|
| OWoD | 27 dots total (13/9/5 priority split), capped at 3 of a max-5 scale (60%) at creation |
| Call of Cthulhu 7e | Occupation points (≈ EDU×20) spread across ~8 occupation skills, typically reaching 40-70% |
| Pathfinder 1e | 2-8 points/level, landing ranks in ~6-8 skills at low levels |
| Hero System | A deliberate minority of build points, typically 5-10 selected skills |
| Exalted | Ability dots spread across ~8-12 abilities with real investment |

Two consistent patterns: a starting/competent character has real investment in roughly **8-10 skills**, and their "good" skills sit around **60-67% of that system's starting cap** (not the absolute ceiling — that's earned later). Applied to this system's **6-point creation cap** (not the system-wide max of 10, per [skills.md](../rules/skills.md#scoring--confirmed)): a "slightly above average" character invests in **9 skills** at an average rank of **4** (67% of 6) → **9 × 4 = 36**, cross-checked against OWoD's 27 dots scaled by the ratio of creation caps (6 ÷ 5 = 1.2) → **27 × 1.2 = 32**. Both land in the low-to-mid 30s; **35** was chosen as the final number to keep the system's existing **1/3/5/10 numeric convention** (flat modifiers ±1-5, Gift levels 1-5, Power Level/Attributes 1-10) rather than landing on an arbitrary in-between value.

**Skill pool size is resolved.** Perk/Gift pool sizes are still open.

## Open Questions

- Size of the Perk/Gift pools (Attribute pool resolved at 10, Skill pool resolved at 35 — see [Calibration](#calibration) above).
- **Whether Freebie Points can be spent on all four categories, or only some** — assumed all four (OWoD-style) but not explicitly confirmed.
- **Freebie Point conversion rate** — how many Freebies buy one rank of Attribute vs. Skill vs. Perk vs. Gift (OWoD itself uses a different rate per category, e.g. an Attribute dot costs more Freebies than a Skill dot).
- XP cost per rank for the same, during advancement (flat cost, or scaling with current rank/cost curve?).
- How XP is earned (per session, per milestone, GM discretion?).
- Does advancement require in-fiction justification (training montage, mentor, relevant use in play) or is it free-form?
- Exact XP cost for purchasing an extra specialty.
- Whether a new Attribute Descriptor is chosen only when the point is first bought, or can be reassigned/added later without a fresh Attribute purchase.
