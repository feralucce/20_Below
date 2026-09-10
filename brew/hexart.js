/* The hex grounds, drawn.
 *
 * One implementation, used twice. The Brewery calls it at render time
 * when a document names a seed, and tools/make-brew-backgrounds.mjs
 * calls it under Node to write the pregenerated files that ship in
 * backgrounds/. Two copies of this drawing would drift apart, and the
 * pregenerated file would slowly stop looking like the live one.
 *
 * Nothing here touches the DOM, and it imports nothing, which is what
 * lets Node run it.
 *
 * Everything is drawn white. These are used as MASKS: only the alpha
 * survives, and brew.css supplies the ink, so a ground takes the current
 * theme's colour and goes grey with the greyscale proof rather than
 * sitting there in one fixed hue while the page changes around it.
 *
 * Portrait, because pages are portrait and the CSS covers rather than
 * tiles - a landscape drawing would be cropped to its middle third.
 */

export const W = 1200;
export const H = 1600;

export const NAMES = ['hex', 'hexdrift', 'swarm'];

/* How far in from each edge the art has faded to nothing, as a fraction
   of the sheet. Wide enough to clear the margin at every trim size. */
const FADE = 0.16;

const SQ3 = Math.sqrt(3);

/* mulberry32. Small, fast, and identical everywhere - the same seed has
   to give the same drawing in the browser and under Node, or the
   pregenerated files would stop matching what the app draws. */
function rng(seed) {
  let a = (seed >>> 0) || 1;
  return function next() {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const between = (r, lo, hi) => lo + r() * (hi - lo);
const pick = (r, list) => list[Math.floor(r() * list.length) % list.length];
const n1 = (v) => Math.round(v * 10) / 10;
const n3 = (v) => Math.round(v * 1000) / 1000;

/* Pointy-top hexagons: vertical left and right sides, a vertex top and
   bottom. That is what reads as "hex" rather than as a bathroom floor. */
function hexagon(cx, cy, r) {
  const pts = [];
  for (let k = 0; k < 6; k++) {
    const a = ((90 + 60 * k) * Math.PI) / 180;
    pts.push(n1(cx + r * Math.cos(a)) + ',' + n1(cy - r * Math.sin(a)));
  }
  return pts.join(' ');
}

const fill = (cx, cy, r, alpha) =>
  `<polygon points="${hexagon(cx, cy, r)}" fill="#fff" fill-opacity="${n3(alpha)}"/>`;

const outline = (cx, cy, r, alpha, width = 1.6) =>
  `<polygon points="${hexagon(cx, cy, r)}" fill="none" stroke="#fff" `
  + `stroke-width="${width}" stroke-opacity="${n3(alpha)}"/>`;

function smoothstep(t) {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

/* 1 in the body of the sheet, easing to 0 before every edge. Every alpha
   is multiplied by this, so nothing the drawing does can put ink against
   the trim or crowd the folio. */
function edge(x, y) {
  return Math.min(
    smoothstep(x / (W * FADE)), smoothstep((W - x) / (W * FADE)),
    smoothstep(y / (H * FADE)), smoothstep((H - y) / (H * FADE)),
  );
}

/** Honeycomb centres covering the sheet. */
function* grid(r, pad = 1) {
  const dx = SQ3 * r;
  const dy = 1.5 * r;
  for (let row = -pad; row <= H / dy + pad; row++) {
    for (let col = -pad; col <= W / dx + pad; col++) {
      yield [col * dx + (row % 2 ? dx / 2 : 0), row * dy];
    }
  }
}

/* How likely a cell is here: near a clump, likely; between them, the
   floor, so the field never goes completely empty. */
function density(x, y, clumps, floor) {
  let best = 0;
  for (const [cx, cy, radius] of clumps) {
    const d = Math.hypot(x - cx, y - cy) / radius;
    best = Math.max(best, Math.max(0, 1 - d * d));
  }
  return floor + (1 - floor) * best;
}

/* The six neighbours of a pointy-top cell all sit the same distance away,
   at 0, 60, 120, 180, 240 and 300 degrees. That is what lets a circuit
   walk step from cell to cell and stay on the lattice, so its runs lie
   along the hexes rather than across them. */
const STEPS = [0, 60, 120, 180, 240, 300];

function stepFrom(x, y, dir, span) {
  const a = (STEPS[((dir % 6) + 6) % 6] * Math.PI) / 180;
  return [x + span * Math.cos(a), y + span * Math.sin(a)];
}

/* Circuitry. A path of two to five runs along the lattice, turning one
   notch either way at each corner, with a node dropped at both ends.
   Isolated straight segments read as scratches; a path that travels and
   turns is what makes the field look built rather than sprinkled.
   Some of them are dashed, which is a detail the reference leans on
   more heavily than it first appears. */
function circuit(r, out, count, span, strength) {
  for (let i = 0; i < count; i++) {
    let x = between(r, 0, W);
    let y = between(r, 0, H);
    let dir = Math.floor(r() * 6);
    const pts = [[x, y]];
    const legs = 2 + Math.floor(r() * 4);
    for (let leg = 0; leg < legs; leg++) {
      const run = span * between(r, 0.8, 2.2);
      [x, y] = stepFrom(x, y, dir, run);
      pts.push([x, y]);
      dir += r() < 0.5 ? 1 : -1;
    }
    // Faded by its dimmest end, so a path never brightens as it runs off
    // the edge of the sheet.
    const e = Math.min(...pts.map(([px, py]) => edge(px, py)));
    const alpha = between(r, 0.45, 0.75) * strength * e;
    if (alpha < 0.03) continue;
    const dashed = r() < 0.35;
    out.push(`<polyline points="${pts.map(([px, py]) => n1(px) + ',' + n1(py)).join(' ')}" `
      + `fill="none" stroke="#fff" stroke-width="${dashed ? 1.3 : 1.7}" `
      + (dashed ? 'stroke-dasharray="7 7" ' : '')
      + `stroke-opacity="${n3(dashed ? alpha * 0.7 : alpha)}"/>`);
    for (const end of [pts[0], pts[pts.length - 1]]) {
      out.push(`<circle cx="${n1(end[0])}" cy="${n1(end[1])}" r="${n1(between(r, 3.5, 5.5))}" `
        + `fill="#fff" fill-opacity="${n3(alpha)}"/>`);
    }
  }
}

/* A cell holding smaller ones inside it, two or three deep. Straight off
   the reference, where these are what the eye catches first. */
function nest(r, out, x, y, cell, strength, e) {
  out.push(fill(x, y, cell * 0.94, between(r, 0.06, 0.14) * strength * e));
  out.push(outline(x, y, cell * 0.72, between(r, 0.20, 0.40) * strength * e, 1.3));
  if (r() < 0.6) {
    out.push(outline(x, y, cell * 0.44, between(r, 0.25, 0.50) * strength * e, 1.3));
  }
}

/* The shared drawing, in layers.
 *
 * The reference is not one grid. It is a coarse field of large cells with
 * a finer one interleaved, a few solid accents well above the rest in
 * weight, nested outlines, oversized outlines laid across the lot, and a
 * circuit network threaded through. Drawn in that order, back to front,
 * because the dark strokes have to sit over the pale fills rather than
 * under them. */
function field(r, cell, clumps, floor, strength, big, runs) {
  const out = [];

  // --- big soft shapes, at twice the cell. Barely there on their own,
  // but they are what stops the field reading as one uniform grain.
  for (const [x, y] of grid(cell * 2)) {
    const e = edge(x, y);
    if (e < 0.02) continue;
    if (r() > density(x, y, clumps, floor) * e * 0.35) continue;
    out.push(fill(x, y, cell * 2 * 0.95, between(r, 0.04, 0.10) * strength * e));
  }

  // --- the fine lattice, sparse and very faint. It fills the gaps the
  // coarse one leaves without ever being the thing you look at.
  for (const [x, y] of grid(cell / 2)) {
    const e = edge(x, y);
    if (e < 0.02) continue;
    if (r() > density(x, y, clumps, floor) * e * 0.22) continue;
    out.push(fill(x, y, (cell / 2) * 0.9, between(r, 0.04, 0.10) * strength * e));
  }

  // --- the coarse lattice, which carries the composition
  for (const [x, y] of grid(cell)) {
    const e = edge(x, y);
    if (e < 0.02) continue;
    if (r() > density(x, y, clumps, floor) * e) continue;
    const roll = r();
    if (roll < 0.42) {
      out.push(fill(x, y, cell * 0.94, between(r, 0.07, 0.20) * strength * e));
    } else if (roll < 0.49) {
      // Solid accents. Rare, and heavy enough to read as deliberate
      // rather than as more grain - the reference has a handful in the
      // whole frame, not a scattering in every corner.
      out.push(fill(x, y, cell * 0.94, between(r, 0.34, 0.52) * strength * e));
    } else if (roll < 0.80) {
      out.push(outline(x, y, cell * 0.94, between(r, 0.16, 0.34) * strength * e, 1.3));
    } else {
      nest(r, out, x, y, cell, strength, e);
    }
  }

  // --- oversized outlines, off the lattice and darker than anything
  // under them
  for (let i = 0; i < big; i++) {
    const x = between(r, 0, W);
    const y = between(r, 0, H);
    const e = edge(x, y);
    if (e < 0.25) continue;
    const size = between(r, cell * 1.6, cell * 3.6);
    out.push(outline(x, y, size, between(r, 0.45, 0.75) * strength * e, 1.9));
    // Every so often, a second outline just inside the first.
    if (r() < 0.35) {
      out.push(outline(x, y, size * 0.62, between(r, 0.3, 0.55) * strength * e, 1.5));
    }
  }

  circuit(r, out, runs, cell * SQ3, strength);
  return out;
}

/* `drift` is where this page sits in the run of pages using this ground,
   from 0 to 1. It slides the field across the sheet, so a set drawn from
   one document seed progresses rather than merely differing: page 40 is
   recognisably the same material as page 4 and visibly not the same
   drawing. A lone page sits at 0 and nothing moves. */

function hexMesh(r, drift) {
  const clumps = [];
  for (let i = 0; i < 7; i++) {
    clumps.push([
      (between(r, 0, W) + drift * W * 0.9) % W,
      (between(r, 0, H) + drift * H * 0.6) % H,
      between(r, W * 0.30, W * 0.55),
    ]);
  }
  return field(r, 52, clumps, 0.42, 1.0, 9, 11);
}

function hexDrift(r, drift) {
  const clumps = [];
  for (let i = 0; i < 6; i++) {
    clumps.push([
      W * between(r, -0.05, 0.25) + drift * W * 0.55,
      (between(r, 0, H) + drift * H * 0.5) % H,
      between(r, W * 0.35, W * 0.65),
    ]);
  }
  return field(r, 50, clumps, 0.05, 1.0, 9, 10);
}

/* Solid cells of mixed size drifting in a band, thinning to nothing on
   both sides of it. Heavier than the other two - a chapter opener or a
   title page, not a page carrying body copy.
 *
 * Cells are drawn inside their grid cell rather than filling it, so the
 * ground shows between them. That gap is most of what makes this read as
 * a swarm rather than as a honeycomb floor. */
function hexSwarm(r, drift) {
  const out = [];
  const cell = 40;
  const phase = between(r, 0, Math.PI * 2) + drift * Math.PI * 2;
  const wander = between(r, 0.18, 0.30);
  const lean = (drift - 0.5) * W * 0.3;
  for (const [x, y] of grid(cell)) {
    const e = edge(x, y);
    if (e < 0.02) continue;
    const centre = W * 0.5 + lean + Math.sin(y / 300 + phase) * W * wander;
    const d = Math.abs(x - centre) / (W * 0.40);
    const p = Math.max(0, 1 - d * d);
    if (r() > p * 0.92 * e) continue;
    const size = cell * (0.22 + 0.68 * p) * between(r, 0.82, 1.04);
    out.push(fill(x, y, size, Math.min(0.95, 0.4 + 0.55 * p) * e));
  }
  return out;
}

const DRAW = { hex: hexMesh, hexdrift: hexDrift, swarm: hexSwarm };

/** The SVG source for one ground. `drift` is 0 to 1; see above. */
export function draw(name, seed, drift = 0) {
  const make = DRAW[name];
  if (!make) return null;
  const body = make(rng(seed), drift).join('');
  return '<svg xmlns="http://www.w3.org/2000/svg" '
    + `viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">`
    + `<!-- ${name} seed ${seed} -->${body}</svg>`;
}

/** The same, as a url() ready for mask-image.
 *
 *  Encoded rather than base64'd: it stays readable in devtools, and the
 *  hash and percent characters are the only ones that would end the
 *  value early. */
export function maskUrl(name, seed, drift = 0) {
  const svg = draw(name, seed, drift);
  if (!svg) return null;
  return 'url("data:image/svg+xml,'
    + svg.replace(/%/g, '%25').replace(/#/g, '%23').replace(/"/g, "'")
    + '")';
}
