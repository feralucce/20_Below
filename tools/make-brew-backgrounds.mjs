/* Write the pregenerated page grounds that ship in brew/backgrounds/.
 *
 *     node tools/make-brew-backgrounds.mjs             # a fresh random draw
 *     node tools/make-brew-backgrounds.mjs 4815162342  # redraw a known one
 *
 * These are what `\page bg=hex` uses when a document names no seed. A
 * document that does name one has its grounds drawn in the browser
 * instead, by this same module - which is the point of running the build
 * through it rather than keeping a second copy of the drawing here. Two
 * implementations would drift apart, and the file on disk would slowly
 * stop looking like what the app draws.
 *
 * The seed is printed and written into each file. The randomness is spent
 * once, here, and then frozen: a pregenerated ground that changed on
 * every reload would hand you a different book each time you exported
 * one. To keep a draw you like, note its seed. To get another, run it
 * again.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, '..', 'brew', 'backgrounds');

const { NAMES, draw } = await import(
  'file://' + join(HERE, '..', 'brew', 'hexart.js').replace(/\\/g, '/'));

const seed = process.argv[2] ? Number(process.argv[2])
  : Math.floor(Math.random() * 1e10);

if (!Number.isFinite(seed)) {
  console.error('That is not a seed: ' + process.argv[2]);
  process.exit(1);
}

console.log('seed ' + seed);
console.log();

mkdirSync(OUT, { recursive: true });

for (const [i, name] of NAMES.entries()) {
  // One seed per ground, derived from the run's, so a single number
  // reproduces the whole set and no two are the same drawing.
  const own = seed + i * 7919;
  const svg = draw(name, own);
  writeFileSync(join(OUT, name + '.svg'), svg, 'utf8');
  console.log(name.padEnd(10) + (svg.length / 1024).toFixed(1).padStart(6) + ' KB');
}
