# Costs

The single source of truth for every tunable number in the system - pool sizes, per-point rates, and Advancement XP costs. **The app reads this file directly**; the same numbers are also written into character-creation.md, gifts.md, boons.md, and docs/advancement-reference.html as human-readable prose for players, but those copies don't drive anything - if you change a number here, update the matching prose there too so they don't drift.

## Creation Pools

| Pool | Total Points |
|---|---|
| Attributes | 20 |
| Skills | 15 |
| Boons | 10 |
| Resources | 6 |
| Gifts | 21 |

## Creation Rates

| Item | Value |
|---|---|
| Attribute Floor (starting free rating) | 1 |
| Attribute Cap (creation-time max) | 10 |
| Skill Tier Point Cost (per tier) | 1 |
| Resource Level Cost | 1 |
| Gift Level Cost | 3 |
| Gift Limiter Discount (per Limiter, per Level) | 1 |
| Gift Limiter Floor (minimum points/Level) | 1 |
| Gift Adder Cost - Lesser | 3 |
| Gift Adder Cost - Greater | 6 |
| Gifts Pool Leftover Rate (Discretionary per unspent point) | 2 |
| Boon Cost - Trivial | 1 |
| Boon Cost - Lesser | 3 |
| Boon Cost - Greater | 5 |
| Boon Cost - Legendary | 7 |
| Starting Fate Tokens | 1 |

## Discretionary Rates

| Target | Discretionary points per point |
|---|---|
| Resources | 1 |
| Skills | 1 |
| Fate Tokens | 1 |
| Boons | 2 |
| Gifts | 4 |
| Attributes | 8 |

## Advancement (XP) Rates

| Item | Value |
|---|---|
| XP per Session (max) | 5 |
| Resources - XP per level | 3 |
| Skill Training Tier - XP multiplier (current tier × N) | 2 |
| Attribute - XP multiplier (current rating × N) | 9 |
| Boon - XP multiplier (× creation cost) | 2 |
| New Gift - base XP (before Limiter discount) | 7 |
| Gift Level raise - XP multiplier (current level × N) | 5 |
| Gift Limiter Discount, Advancement (per Limiter) | 1 |
| Gift Limiter Floor, Advancement (minimum XP) | 1 |
| Gift Adder XP - Lesser | 6 |
| Gift Adder XP - Greater | 12 |
| Gift Limiter Buy-off - XP multiplier (current Gift Level × N) | 3 |
