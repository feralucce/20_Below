# -*- coding: utf-8 -*-
"""Has anything a desktop app ships changed since that app was last released?

Each desktop app bundles a copy of files from this repo. A release freezes
that copy; every later edit to one of those files makes the shipped
installer quietly stale. Nothing warns about it, because bumping a version
and editing the rules are unrelated acts - which is how v0.10.2 shipped
without the Off Balance condition on 2026-09-05, hours before that
condition went live on the website.

This compares each app's newest release tag against HEAD and reports any
staged path that has moved since.

    python tools/check-desktop-drift.py

Exits 1 if any app is stale, so it can gate a release step. The staged
paths below must match each app's scripts/stage-frontend.ps1 - if you
change what an app bundles, change it here too.
"""
import re
import subprocess
import sys

APPS = [
    # name, tag pattern, the paths that app's staging script copies
    ("Character Creator", r"^v(\d+)\.(\d+)\.(\d+)$",
     ["app", "rules", "vendor"]),
    ("The Brewery", r"^brewery-v(\d+)\.(\d+)\.(\d+)$",
     ["brew", "vendor", "license.html"]),
    ("Battle Tracker", r"^combat-tracker-v(\d+)\.(\d+)\.(\d+)$",
     ["tracker/index.html", "app/state.js", "app/roller/core.js",
      "app/combat/model.js", "app/media.js"]),
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


def main():
    stale = False
    for name, pattern, paths in APPS:
        tag = newest_tag(pattern)
        if not tag:
            print("%-20s no release tag found" % name)
            continue
        changed = git("diff", "--name-only", "%s..HEAD" % tag, "--", *paths)
        files = [f for f in changed.split("\n") if f]
        if not files:
            print("%-20s %-24s current" % (name, tag))
            continue
        stale = True
        print("%-20s %-24s STALE - %d file(s) changed since:" % (name, tag, len(files)))
        for f in files:
            print("%-20s %-24s   %s" % ("", "", f))

    if stale:
        print("\nA stale app ships rules its users cannot see anywhere else.")
        print("Rebuild and release, or accept the drift deliberately.")
    return 1 if stale else 0


sys.exit(main())
