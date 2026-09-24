"""Refresh the project figures quoted in the PM case study.

Counts game work only: a commit that touches nothing but portfolio files
is left out, so building the portfolio never inflates the numbers it quotes.

Usage:  python tools/portfolio_stats.py            (rewrite the page)
        python tools/portfolio_stats.py --check    (print, change nothing)
"""
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGE = ROOT / "docs" / "case-study-ai-workflow.html"

PORTFOLIO = re.compile(
    r"^(docs/(id-portfolio|visual-portfolio|pm-portfolio|case-study-[a-z-]+|"
    r"tool-ecosystem-diagram|divider-specimen-sheet)\.html"
    r"|docs/assets/portfolio/.*"
    r"|tools/portfolio_stats\.py)$"
)


def git(*args):
    return subprocess.run(["git", "-C", str(ROOT), *args], capture_output=True,
                          text=True, encoding="utf-8", check=True).stdout


def game_commits():
    log = git("log", "--format=\x1e%H\x1f%ad\x1f%B\x1d", "--date=short", "--name-only", "HEAD")
    out = []
    for rec in log.split("\x1e")[1:]:
        head, _, files = rec.partition("\x1d")
        sha, date, body = head.split("\x1f", 2)
        paths = [f for f in files.split("\n") if f.strip()]
        if paths and all(PORTFOLIO.match(p) for p in paths):
            continue
        out.append((date, "co-authored-by: claude" in body.lower()))
    return out


def fmt_day(iso):
    d = datetime.strptime(iso, "%Y-%m-%d")
    return f"{d:%b} {d.day}"


def main():
    commits = game_commits()
    n = len(commits)
    dates = sorted(d for d, _ in commits)
    ai = round(100 * sum(a for _, a in commits) / n)
    tags = len(git("tag").split())
    year = dates[-1][:4]
    stats = {
        "commits": f"{n:,}",
        "range": f"{fmt_day(dates[0])} &ndash; {fmt_day(dates[-1])}, {year}",
        "ai": f"{ai}%",
        "tags": str(tags),
    }
    print(stats)
    if "--check" in sys.argv:
        return
    html = PAGE.read_text(encoding="utf-8")
    for key, val in stats.items():
        html, hits = re.subn(rf'(<span data-stat="{key}">)[^<]*(</span>)', rf"\g<1>{val}\g<2>", html)
        if not hits:
            sys.exit(f"no data-stat=\"{key}\" slot in {PAGE.name}")
    PAGE.write_text(html, encoding="utf-8", newline="\n")


if __name__ == "__main__":
    main()
