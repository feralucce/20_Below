# -*- coding: utf-8 -*-
"""Ink-splatter mask randomiser: make the edges of an illustration transparent by "splattering" ink over its body.

The ink is the mask. Wherever ink lands, the picture shows; everywhere else is transparent. Each seed throws a
different splatter, built from the same parts a real one has:

  - a solid core over the body of the picture, its edge chewed by noise so it never reads as an oval
  - splash arms thrown out from the core, tapering, each ending in a bead
  - large drops close around the edge, some stretched into tears
  - optional: small drops scattered out to the margin (--fine) and a fine spray of specks (--spray 1)
  - a few drips running down off the bottom of the core (off with --drips 0)

Nothing is drawn within --margin of the image edge, so the border is always clean.

    python tools/ink-mask.py IMAGE [--seed N] [--count N] [--out DIR] [--coverage 0.84] [--drips 2]
                             [--spray 0] [--fine] [--margin 0.03] [--bg "#0b1620"]

Writes, for each seed: <name>_ink<seed>.png (the picture, RGBA, transparent outside the ink),
<name>_ink<seed>_mask.png (the mask alone, white = ink) and <name>_ink<seed>_preview.jpg (on the page colour).
"""
import argparse
import math
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter


def value_noise(rng, w, h, cells, octaves=4):
    """Smooth fractal noise in about -1..1, `cells` grid cells across the short side at the first octave."""
    out = np.zeros((h, w), np.float32)
    amp, total = 1.0, 0.0
    for o in range(octaves):
        c = max(2, int(cells * 2 ** o))
        gw, gh = max(2, int(c * w / min(w, h))), max(2, int(c * h / min(w, h)))
        grid = rng.uniform(-1, 1, (gh, gw)).astype(np.float32)
        layer = np.asarray(Image.fromarray(grid, "F").resize((w, h), Image.BICUBIC))
        out += layer * amp
        total += amp
        amp *= 0.5
    return out / total


def drop(draw, x, y, r, angle=0.0, stretch=1.0):
    """A drop: a circle, or a tear stretched along `angle` with a tail behind it."""
    if stretch <= 1.05:
        draw.ellipse((x - r, y - r, x + r, y + r), fill=255)
        return
    ca, sa = math.cos(angle), math.sin(angle)
    tail = r * stretch * 1.6
    pts = []
    for k in range(24):
        t = 2 * math.pi * k / 24
        px, py = math.cos(t), math.sin(t)
        if px < 0:                      # the back half draws out into the tail
            px *= stretch * 1.6
            py *= 1 - min(0.85, -px / (stretch * 1.6))
        pts.append((x + (px * ca - py * sa) * r, y + (px * sa + py * ca) * r))
    draw.polygon(pts, fill=255)
    draw.ellipse((x - r, y - r, x + r, y + r), fill=255)
    _ = tail


def arm(draw, rng, cx, cy, angle, r0, length, width):
    """A splash arm: a tapering, wobbling stroke out from the core, ending in a bead."""
    steps = 18
    left, right = [], []
    wob = rng.uniform(-0.25, 0.25)
    for i in range(steps + 1):
        t = i / steps
        a = angle + wob * math.sin(t * math.pi) * 0.5
        d = r0 + length * t
        x, y = cx + math.cos(a) * d, cy + math.sin(a) * d
        w = width * (1 - t) ** 1.4 + width * 0.08
        nx, ny = -math.sin(a), math.cos(a)
        left.append((x + nx * w, y + ny * w))
        right.append((x - nx * w, y - ny * w))
    draw.polygon(left + right[::-1], fill=255)
    ex, ey = left[-1][0] / 2 + right[-1][0] / 2, left[-1][1] / 2 + right[-1][1] / 2
    br = width * rng.uniform(0.35, 0.7)
    draw.ellipse((ex - br, ey - br, ex + br, ey + br), fill=255)
    return ex, ey


def make_mask(w, h, seed, coverage=0.84, drips=2, spray=0.0, margin=0.03, fine=False):
    rng = np.random.default_rng(seed)
    s = min(w, h)
    m = int(s * margin)
    cx = w / 2 + rng.uniform(-0.04, 0.04) * w
    cy = h / 2 + rng.uniform(-0.04, 0.04) * h

    # 1. the core: a rounded-rectangle distance field, chewed at the edge by two scales of noise
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    rx, ry = (w / 2 - m) * coverage, (h / 2 - m) * coverage
    p = 4.0                                              # superellipse power: between oval and rectangle
    d = (np.abs((xx - cx) / rx) ** p + np.abs((yy - cy) / ry) ** p) ** (1 / p)
    big = value_noise(rng, w, h, 3, 2)
    mid = value_noise(rng, w, h, 7, 2)
    small = value_noise(rng, w, h, 22, 2)
    core = (d + big * 0.16 + mid * 0.08 + small * 0.035) < 1.0
    mask = Image.fromarray((core * 255).astype(np.uint8))
    draw = ImageDraw.Draw(mask)

    # where the core's edge sits along a direction, so arms and drops start from it
    def edge_at(a):
        r = 0.0
        while r < s:
            x, y = int(cx + math.cos(a) * r), int(cy + math.sin(a) * r)
            if not (0 <= x < w and 0 <= y < h) or not core[y, x]:
                return r
            r += 3
        return r

    def room(a, r):
        """How far out from radius r along a, before the clean margin."""
        best = 0.0
        while True:
            x, y = cx + math.cos(a) * (r + best), cy + math.sin(a) * (r + best)
            if x < m or y < m or x > w - m or y > h - m:
                return max(0.0, best - s * 0.01)
            best += 4

    # 1b. lobes: rounded bulges pushed out from the edge, the way a real splat bunches
    for _ in range(int(rng.integers(20, 36))):
        a = rng.uniform(0, 2 * math.pi)
        r0 = edge_at(a)
        lr = s * rng.uniform(0.012, 0.045)
        if room(a, r0) < lr * 0.8:
            continue
        x, y = cx + math.cos(a) * (r0 + lr * 0.1), cy + math.sin(a) * (r0 + lr * 0.1)
        draw.ellipse((x - lr, y - lr, x + lr, y + lr), fill=255)

    # 2. splash arms
    for _ in range(rng.integers(7, 13)):
        a = rng.uniform(0, 2 * math.pi)
        r0 = edge_at(a) - s * 0.02
        space = room(a, r0)
        if space < s * 0.04:
            continue
        arm(draw, rng, cx, cy, a, r0, space * rng.uniform(0.35, 0.95), s * rng.uniform(0.008, 0.022))

    # 3. satellite drops. By default only large ones close to the core; with fine=True the full spread of drops
    #    out to the margin, big near the core and small further out.
    if fine:
        n_drops = int(rng.integers(140, 230))
    else:
        n_drops = int(rng.integers(16, 30))
    for _ in range(n_drops):
        a = rng.uniform(0, 2 * math.pi)
        r0 = edge_at(a)
        space = room(a, r0)
        if fine:
            if space < s * 0.01:
                continue
            t = rng.beta(1.3, 2.6)                       # mostly close to the core
            dist = r0 + space * t
            r = s * 0.016 * (1 - t) ** 1.5 * rng.uniform(0.3, 1.0) + 1.2
        else:
            r = s * rng.uniform(0.007, 0.018)
            gap = s * rng.uniform(0.004, 0.035)          # a short hop off the edge, never out in the margin
            if space < gap + r * 2:
                continue
            dist = r0 + gap + r
        x, y = cx + math.cos(a) * dist, cy + math.sin(a) * dist
        stretch = rng.uniform(1.0, 2.6) if rng.random() < 0.35 else 1.0
        drop(draw, x, y, r, a + math.pi, stretch)

    # 4. fine spray in a few directions (off unless spray > 0)
    for _ in range(int(rng.integers(3, 7) * spray)):
        a0 = rng.uniform(0, 2 * math.pi)
        spread = rng.uniform(0.12, 0.35)
        for _ in range(int(rng.integers(200, 420))):
            a = a0 + rng.normal(0, spread)
            r0 = edge_at(a)
            space = room(a, r0)
            if space < 4:
                continue
            dist = r0 + space * rng.uniform(0.0, 1.0) ** 0.8
            r = rng.uniform(0.6, 2.4) * s / 1000
            x, y = cx + math.cos(a) * dist, cy + math.sin(a) * dist
            draw.ellipse((x - r, y - r, x + r, y + r), fill=255)

    # 5. drips off the bottom of the core
    for _ in range(int(drips)):
        x = cx + rng.uniform(-0.6, 0.6) * rx
        col = core[:, int(np.clip(x, 0, w - 1))]
        ys = np.where(col)[0]
        if not len(ys):
            continue
        y0 = ys.max() - s * 0.01
        y1 = min(h - m - s * 0.02, y0 + s * rng.uniform(0.05, 0.16))
        if y1 <= y0:
            continue
        wd = s * rng.uniform(0.004, 0.009)
        draw.polygon([(x - wd, y0), (x + wd, y0), (x + wd * 0.6, y1), (x - wd * 0.6, y1)], fill=255)
        draw.ellipse((x - wd * 1.6, y1 - wd * 1.6, x + wd * 1.6, y1 + wd * 1.6), fill=255)

    # ink has a crisp edge: soften by a pixel, threshold, then antialias lightly
    mask = mask.filter(ImageFilter.GaussianBlur(s / 900)).point(lambda v: 255 if v > 110 else 0)
    mask = mask.filter(ImageFilter.GaussianBlur(0.7))
    a = np.asarray(mask).copy()
    a[:m, :] = 0
    a[-m:, :] = 0
    a[:, :m] = 0
    a[:, -m:] = 0
    return Image.fromarray(a)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("image")
    ap.add_argument("--seed", type=int, default=1)
    ap.add_argument("--count", type=int, default=1, help="how many seeds, starting at --seed")
    ap.add_argument("--out", default=None)
    ap.add_argument("--coverage", type=float, default=0.84, help="core size, 0-1 of the inner area")
    ap.add_argument("--drips", type=int, default=2)
    ap.add_argument("--spray", type=float, default=0.0, help="fine spray amount; 0 (default) is none")
    ap.add_argument("--fine", action="store_true", help="also scatter small drops out to the margin")
    ap.add_argument("--margin", type=float, default=0.03, help="clean border, fraction of the short side")
    ap.add_argument("--bg", default="#0b1620", help="page colour for the preview")
    a = ap.parse_args()
    img = Image.open(a.image).convert("RGBA")
    out = a.out or os.path.join(os.path.dirname(os.path.abspath(a.image)), "ink")
    os.makedirs(out, exist_ok=True)
    name = os.path.splitext(os.path.basename(a.image))[0]
    for seed in range(a.seed, a.seed + a.count):
        m = make_mask(img.width, img.height, seed, a.coverage, a.drips, a.spray, a.margin, a.fine)
        cut = img.copy()
        cut.putalpha(m)
        base = os.path.join(out, "%s_ink%d" % (name, seed))
        cut.save(base + ".png")
        m.save(base + "_mask.png")
        bg = Image.new("RGBA", img.size, a.bg)
        bg.alpha_composite(cut)
        bg.convert("RGB").save(base + "_preview.jpg", quality=90)
        print(base + ".png")


if __name__ == "__main__":
    main()
