# Drafts

Generated copies of manuscript chapters that are **not finished and not
published**. Jekyll excludes any directory whose name starts with an
underscore, so nothing here reaches the site.

This exists for one reason: the manuscript is a Scrivener project living
outside this repo, so a chapter that isn't in `webbook/` yet has no version
control at all. A chapter in progress can represent a day's writing that
exists only in one `.scriv` file. Dropping the generated markdown here after
each writing session gives it a history.

Chapter 13 lived here from 2026-09-05 until it was finished the same
day and published to `webbook/`. Nothing is in here right now.

Regenerate with:

```
python tools/scriv2brew.py "Chapter 13"
cp build/chapter-13-running-the-game.unpaged.md _drafts/running-the-game.md
```

The manuscript stays the source of truth. These are recoverable copies, not
an editing target - anything changed here is lost on the next regeneration.
