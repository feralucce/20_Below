# -*- coding: utf-8 -*-
"""Point the hand-written download links at the current releases.

    python tools/sync-download-links.py           # rewrite them
    python tools/sync-download-links.py --check   # fail if any are stale

The pages carry a real href and a real version in their markup, and
docs/assets/js/latest-release.js moves them forward from the GitHub
releases feed when the page loads. That script is the belt; this is the
braces, and the braces had rotted: the Brewery's link sat at v0.3.7 while
v0.3.19 was out, the Creator at v0.10.9 against v0.10.14, and every other
product was behind too.

It only shows when the script cannot finish - an unauthenticated GitHub
API allows sixty calls an hour per address, so a few reloads is all it
takes, and a blocker or a dropped connection does it too. Then the reader
gets whatever the markup says, silently, and downloads a year-old
installer believing it is current.

The script itself is sound: simulated against the live feed it picks the
right version for all four products. The markup was the part nobody was
watching, because nothing ever read it.

Run this after publishing a release, or run --check and let it complain.
"""
import io
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES = ["downloads.html", "rules-hub.html"]

# product -> how its tag is written. The Creator's is a bare vN.N.N, so it
# is matched last: every other tag would also satisfy it.
PRODUCTS = [
    ("brewery", re.compile(r"^brewery-v(\d+\.\d+\.\d+)$")),
    ("tracker", re.compile(r"^combat-tracker-v(\d+\.\d+\.\d+)$")),
    ("prep",    re.compile(r"^prep-v(\d+\.\d+\.\d+)$")),
    ("creator", re.compile(r"^v(\d+\.\d+\.\d+)$")),
]


def releases():
    """Through the API rather than `gh release list`, which cannot report
    assets - and the asset filename is half of what a link needs."""
    out = subprocess.run(
        ["gh", "api", "repos/feralucce/20_Below/releases?per_page=100",
         "--paginate"],
        capture_output=True, text=True, cwd=ROOT)
    if out.returncode:
        raise SystemExit("gh api releases failed:\n" + out.stderr)
    return [{"tagName": r["tag_name"], "assets": r["assets"],
             "published": r.get("published_at") or ""}
            for r in json.loads(out.stdout)
            if not r["draft"] and not r["prerelease"]]


def newest():
    """product -> (tag, version, asset name, release date), by version rather
    than by the order the feed happens to arrive in. That ordering is not
    reliable: the live feed puts brewery-v0.3.9 between v0.3.16 and v0.3.15."""
    found = {}
    for rel in releases():
        for name, pattern in PRODUCTS:
            m = pattern.match(rel["tagName"])
            if not m:
                continue
            asset = next((a["name"] for a in rel.get("assets") or []
                          if a["name"].endswith(".exe")), None)
            if not asset:
                break
            version = [int(p) for p in m.group(1).split(".")]
            if name not in found or version > found[name][0]:
                found[name] = (version, rel["tagName"], m.group(1), asset,
                               rel["published"][:10])
            break
    return {k: v[1:] for k, v in found.items()}


LINK = re.compile(
    r'(data-latest="(?P<product>[a-z]+)"[^>]*href="https://github\.com/'
    r'feralucce/20_Below/releases/download/)(?P<tag>[^/]+)/(?P<asset>[^"]+)"')

# The rules-hub call-to-action carries its version in a sibling line instead
# of a pill, named by a selector: data-latest-meta="#cta-meta". Nothing here
# rewrote it, so the one page whose link had no pill kept a version in its
# markup that nobody moved - v0.11.0 was still sitting there at v0.12.9, over
# a button that downloaded the right installer. Exactly the failure this
# script exists to stop, one element to the left.
META = re.compile(
    r'data-latest="(?P<product>[a-z]+)"[^>]*data-latest-meta="#(?P<id>[\w-]+)"')

# latest-release.js writes the release's publish time in the reader's own
# timezone; a file on disk has no reader, so the fallback carries the date
# alone, which is what the markup already said. Same shape, one day of
# precision rather than a minute of somebody else's clock.
def meta_line(version, date):
    return "v%s &middot; Last updated %s" % (version, date)


def main():
    check = "--check" in sys.argv
    latest = newest()
    stale = []
    touched = []

    for page in PAGES:
        path = os.path.join(ROOT, page)
        if not os.path.exists(path):
            continue
        text = io.open(path, encoding="utf-8").read()
        original = text

        def swap(m):
            want = latest.get(m.group("product"))
            if not want:
                return m.group(0)
            tag, version, asset, date = want
            if m.group("tag") != tag:
                stale.append("%s: %s is on %s, current is %s"
                             % (page, m.group("product"), m.group("tag"), tag))
            return '%s%s/%s"' % (m.group(1), tag, asset)

        text = LINK.sub(swap, text)

        # The pill beside the name carries the version in words.
        for product, (tag, version, asset, date) in latest.items():
            text = re.sub(
                r'(data-latest="%s".*?data-latest-pill>Windows &middot; v)[\d.]+'
                % product, r"\g<1>" + version, text, flags=re.S)

        # And so does the sibling line, where a link has one instead.
        for m in META.finditer(text):
            want = latest.get(m.group("product"))
            if not want:
                continue
            tag, version, asset, date = want
            wanted = meta_line(version, date)
            body = re.compile(r'(<[^>]*\bid="%s"[^>]*>)(.*?)(</)'
                              % re.escape(m.group("id")), re.S)
            hit = body.search(text)
            if not hit:
                continue
            if hit.group(2).strip() != wanted:
                stale.append("%s: %s meta line reads %r, current is %r"
                             % (page, m.group("product"),
                                hit.group(2).strip(), wanted))
            text = body.sub(lambda h: h.group(1) + wanted + h.group(3), text)

        if text != original:
            touched.append(page)
            if not check:
                io.open(path, "w", encoding="utf-8", newline="").write(text)

    for name, (tag, version, asset, date) in sorted(latest.items()):
        print("%-9s %-24s %s" % (name, tag, date))
    print()

    if not stale and not touched:
        print("download links are current")
        return 0
    for s in stale:
        print("  STALE  " + s)
    if check:
        print()
        print("run: python tools/sync-download-links.py")
        return 1
    print()
    print("updated: " + ", ".join(touched))
    return 0


if __name__ == "__main__":
    sys.exit(main())
