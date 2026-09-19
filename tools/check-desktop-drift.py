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
    python tools/check-desktop-drift.py --versions   # just the version check

It also checks that each app agrees with itself about its own version.
tauri.conf.json and Cargo.toml both carry one and nothing makes them
match, so bumping only the config is easy and silent. Six releases went
out that way - the Creator's v0.10.18 through v0.11.0 with a crate stuck
at 0.10.17, and brewery-v0.4.3 - before anyone looked.

Nothing user-facing was wrong in those, because tauri-codegen takes
PackageInfo's version from the config when it is set and falls back to
CARGO_PKG_VERSION only when it is absent, and tauri-build writes the
Windows FILEVERSION from the config too. The crate version reaches the
build log and nothing else. It is checked anyway: a number that is wrong
and harmless today is a number nobody trusts tomorrow, and the drift only
grows - the Creator's reached four versions behind before it was noticed.

A file an app stages from outside its own tree is judged by what the app
imports out of it, not by whether it moved. app/state.js is staged into
four installers and is almost entirely character creator: 181 lines of it
changed between prep-v0.2.4 and today without touching one function the
Encounter Difficulty Calculator or the Battle Tracker can run. Those are
reported as carried rather than as a release. tools/jsreach.py does the
walk, and anything it cannot follow counts as reachable.

Exits 1 if code changed or a version disagrees, so it can gate a release
step. The paths below must match each app's scripts/stage-frontend.ps1.
"""
import io
import os
import re
import subprocess
import sys

import jsreach

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

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

# Each app's own tree. Anything it stages from outside this is a shared
# module, and a shared module is judged by which of its exports the app
# can actually reach rather than by whether the file moved - app/state.js
# is 1300 lines of mostly character creator, and the Battle Tracker
# imports five functions out of it. See tools/jsreach.py.
OWN_PREFIXES = {
    "Character Creator": ("app", "vendor"),
    "The Brewery": ("brew", "vendor", "license.html"),
    "Encounter Difficulty Calculator": ("prep",),
    "Battle Tracker": ("tracker",),
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


# Each app's Tauri crate, for the version check. Not folded into APPS
# above because that list is about what a release SHIPS and this is about
# what a release CALLS ITSELF - two questions that happen to share a tool.
TAURI_DIRS = {
    "Character Creator": "desktop",
    "The Brewery": "brewer-desktop",
    "Encounter Difficulty Calculator": "prep-desktop",
    "Battle Tracker": "combat-tracker-desktop",
}

CONF_VERSION = re.compile(r'"version"\s*:\s*"([^"]+)"')
CARGO_NAME = re.compile(r'^name\s*=\s*"([^"]+)"', re.M)
CARGO_VERSION = re.compile(r'^version\s*=\s*"([^"]+)"', re.M)


def read(*parts):
    path = os.path.join(ROOT, *parts)
    if not os.path.exists(path):
        return None
    return io.open(path, encoding="utf-8").read()


def lock_version(lock, crate):
    """The version Cargo.lock records for the app's own crate.

    Left stale it is only noise in a diff, but it is noise that shows up
    in every unrelated commit until somebody bumps it.
    """
    if not lock:
        return None
    m = re.search(r'^name = "%s"\nversion = "([^"]+)"'
                  % re.escape(crate), lock, re.M)
    return m.group(1) if m else None


def check_versions():
    """Does each app agree with itself about which version it is?"""
    bad = 0
    for name, folder in sorted(TAURI_DIRS.items()):
        conf = read(folder, "src-tauri", "tauri.conf.json")
        cargo = read(folder, "src-tauri", "Cargo.toml")
        if conf is None or cargo is None:
            print("%-32s no Tauri crate at %s" % (name, folder))
            continue

        m_conf = CONF_VERSION.search(conf)
        m_name = CARGO_NAME.search(cargo)
        m_cargo = CARGO_VERSION.search(cargo)
        if not (m_conf and m_name and m_cargo):
            print("%-32s cannot read a version out of %s" % (name, folder))
            bad += 1
            continue

        want = m_conf.group(1)
        crate = m_name.group(1)
        got = m_cargo.group(1)
        locked = lock_version(read(folder, "src-tauri", "Cargo.lock"), crate)

        wrong = [w for w in (("Cargo.toml", got),
                             ("Cargo.lock", locked))
                 if w[1] is not None and w[1] != want]
        if wrong:
            bad += 1
            print("%-32s tauri.conf.json says %s, but:" % (name, want))
            for where, value in wrong:
                print("%-32s   %-14s says %s" % ("", where, value))
        else:
            print("%-32s %s" % (name, want))

    if bad:
        print("\n%d app(s) disagree with themselves about their own version."
              % bad)
        print("tauri.conf.json is the one that ships - bring the others to it.")
    return bad


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


def show(rev, path):
    """A file's bytes at a revision, unstripped - or None if it wasn't there."""
    r = subprocess.run(["git", "show", "%s:%s" % (rev, path)],
                       capture_output=True, text=True, encoding="utf-8")
    return r.stdout if r.returncode == 0 else None


def on_disk(path):
    full = os.path.join(ROOT, path)
    if not os.path.isfile(full):
        return None
    return io.open(full, encoding="utf-8", errors="replace").read()


def own_files(name):
    """The app's own modules - the roots the import walk starts from."""
    roots = []
    for prefix in OWN_PREFIXES.get(name, ()):
        full = os.path.join(ROOT, prefix)
        if os.path.isfile(full):
            roots.append(prefix)
            continue
        for dirpath, _, files in os.walk(full):
            for f in files:
                if f.endswith((".js", ".mjs", ".html")):
                    rel = os.path.relpath(os.path.join(dirpath, f), ROOT)
                    roots.append(rel.replace(os.sep, "/"))
    return roots


def split_by_reach(name, tag, files):
    """Which changed files this app can actually run, and which it merely carries.

    Anything uncertain lands in the first list. A check that stays quiet
    because it could not follow an import is worse than one that asks for
    a release it did not need.
    """
    prefixes = OWN_PREFIXES.get(name)
    if not prefixes:
        return files, []

    def is_own(f):
        return any(f == p or f.startswith(p.rstrip("/") + "/")
                   for p in prefixes)

    shared = [f for f in files if not is_own(f)]
    if not shared:
        return files, []

    needs = [f for f in files if is_own(f) or not f.endswith(".js")]
    reach = jsreach.reachable(own_files(name), on_disk)
    if jsreach.UNRESOLVED in reach:
        return files, []

    carried = []
    for f in [f for f in shared if f.endswith(".js")]:
        names = reach.get(f)
        old, new = show(tag, f), on_disk(f)
        if names is None or old is None or new is None:
            needs.append(f)
            continue
        hit = jsreach.changed_names(old, new) & (names | {""})
        if hit:
            needs.append("%s  (%s)" % (f, ", ".join(
                sorted(n or "module-level code" for n in hit))))
        else:
            carried.append(f)
    return needs, carried


def main():
    if "--versions" in sys.argv:
        return 1 if check_versions() else 0

    needs_release = False
    for name, pattern, code_paths, live_paths in APPS:
        tag = newest_tag(pattern)
        if not tag:
            print("%-20s no release tag found" % name)
            continue

        code = changed(tag, code_paths, NOT_OURS.get(name, ()))
        live = changed(tag, live_paths)
        code, carried = split_by_reach(name, tag, code)

        if code:
            needs_release = True
            print("%-20s %-24s NEEDS A RELEASE - %d code file(s):"
                  % (name, tag, len(code)))
            for f in code:
                print("%-46s %s" % ("", f))
        else:
            print("%-20s %-24s current" % (name, tag))

        if carried:
            print("%-46s (%d shared file(s) changed in parts this app does"
                  " not import)" % ("", len(carried)))
            for f in carried:
                print("%-48s %s" % ("", f))

        if live:
            print("%-46s (%d rules file(s) changed - fetched live, no release"
                  " needed)" % ("", len(live)))

    if needs_release:
        print("\nCode changes only reach users through a new installer.")
    else:
        print("\nNothing needs a release.")

    print()
    mismatched = check_versions()
    return 1 if (needs_release or mismatched) else 0


sys.exit(main())
