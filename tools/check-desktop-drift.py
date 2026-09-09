# -*- coding: utf-8 -*-
"""Does any desktop app actually need a new release?

Each desktop app bundles a copy of files from this repo, and a release
freezes that copy. But not every bundled file goes stale, because the
Character Creator fetches rules/*.md live from raw.githubusercontent on
every load (app/parse/markdown.js) and only falls back to the bundled
snapshot when that fetch fails. An online user of an old Creator build is
already reading today's rules.

So the question "do we need a new version" splits in two:

  code   - shipped and never re-fetched. Changing it means a release, or
           users keep running the old behaviour.
  live   - fetched at runtime. Changing it reaches users immediately;
           the bundled copy is only the offline fallback.

Reporting those as one number is what made this tool cry wolf: it flagged
the Creator every time a rules file moved, which is most days, and a
check that is permanently red is a check nobody reads. That is the same
failure it was written to catch - v0.10.2 shipped without the Off Balance
condition because nothing said so out loud.

    python tools/check-desktop-drift.py

Exits 1 only if code changed, so it can gate a release step. The paths
below must match each app's scripts/stage-frontend.ps1.
"""
import re
import subprocess
import sys

# Files living under a code path that the app never loads - developer
# tooling run from the command line, imported by nothing and referenced by
# neither index.html nor the Tauri staging script. Changing one cannot
# reach a user, so it must not ask for an installer.
DEV_ONLY = {
    "app/verify-parsers.mjs",
}

# Paths that sit inside one app's code tree without belonging to it.
# app/combat/ is shared combat code - the Tracker's round engine and the
# Encounter Difficulty Calculator's maths - kept under app/ so several pages can share
# one copy. The Creator imports none of it and only carries it as dead
# weight in the installer, so changing it must not ask Creator users to
# reinstall.
NOT_OURS = {
    "Character Creator": ("app/combat/",),
}

# name, tag pattern, code paths (need a release), live paths (fetched at runtime)
APPS = [
    ("Character Creator", r"^v(\d+)\.(\d+)\.(\d+)$",
     ["app", "vendor"],
     # rules/*.md are pulled live by app/parse/markdown.js - the staged copy
     # is the offline fallback only.
     ["rules"]),

    ("The Brewery", r"^brewery-v(\d+)\.(\d+)\.(\d+)$",
     ["brew", "vendor", "license.html"],
     []),

    ("Encounter Difficulty Calculator", r"^prep-v(\d+)\.(\d+)\.(\d+)$",
     # Only what stage-frontend.ps1 actually copies - the rest of app/ is
     # the character creator and never reaches this installer.
     ["prep", "app/state.js", "app/combat/encounter.js"],
     []),

    ("Battle Tracker", r"^combat-tracker-v(\d+)\.(\d+)\.(\d+)$",
     ["tracker/index.html", "app/state.js", "app/roller/core.js",
      "app/combat/model.js", "app/media.js"],
     []),
]


def git(*args):
    return subprocess.run(["git"] + list(args), capture_output=True,
                          text=True, encoding="utf-8").stdout.strip()


def newest_tag(pattern):
    """The highest-numbered tag matching this app's own tag shape."""
    best, best_key = None, None
    for tag in git("tag").split("\n"):
        m = re.match(pattern, tag.strip())
        if not m:
            continue
        key = tuple(int(g) for g in m.groups())
        if best_key is None or key > best_key:
            best, best_key = tag.strip(), key
    return best


def changed(tag, paths, not_ours=()):
    if not paths:
        return []
    # One ref, not a range: compares the tag against the WORKING TREE, so a
    # change still sitting uncommitted counts. Comparing tag..HEAD instead
    # answers only for committed work, which is never the question being
    # asked - you run this to decide whether what you have needs a release.
    out = git("diff", "--name-only", tag, "--", *paths)
    # diff never reports untracked files; a brand-new app file is code too.
    untracked = git("ls-files", "--others", "--exclude-standard", "--", *paths)
    if untracked:
        out = out + chr(10) + untracked if out else untracked
    # A file can arrive from both the diff and the untracked list.
    seen = dict.fromkeys(out.split("\n"))
    return [f for f in seen
            if f and f not in DEV_ONLY
            and not any(f.startswith(prefix) for prefix in not_ours)]


def main():
    needs_release = False
    for name, pattern, code_paths, live_paths in APPS:
        tag = newest_tag(pattern)
        if not tag:
            print("%-20s no release tag found" % name)
            continue

        code = changed(tag, code_paths, NOT_OURS.get(name, ()))
        live = changed(tag, live_paths)

        if code:
            needs_release = True
            print("%-20s %-24s NEEDS A RELEASE - %d code file(s):"
                  % (name, tag, len(code)))
            for f in code:
                print("%-46s %s" % ("", f))
        else:
            print("%-20s %-24s current" % (name, tag))

        if live:
            print("%-46s (%d rules file(s) changed - fetched live, no release"
                  " needed)" % ("", len(live)))

    if needs_release:
        print("\nCode changes only reach users through a new installer.")
    else:
        print("\nNothing needs a release.")
    return 1 if needs_release else 0


sys.exit(main())
