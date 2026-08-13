import { findSection, splitByHeading, extractTableAfter } from './markdown.js';

const ADDER_ITEM = /^- \*\*(.+?)\*\* \((Lesser|Greater), (\d+) ?pts?\):?\s*(.*)$/;
const LIMITER_ITEM = /^- \*\*(.+?)\*\*:?\s*(.*)$/;

function extractBulletsBetween(body, startLabel, endLabel) {
  const startIdx = body.indexOf(startLabel);
  if (startIdx === -1) return { items: [], found: false };
  const from = startIdx + startLabel.length;
  const to = endLabel ? body.indexOf(endLabel, from) : body.length;
  const chunk = body.slice(from, to === -1 ? body.length : to);
  const items = chunk
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '));
  return { items, found: true };
}

// Gifts don't share a uniform level-table shape (each is a hand-built
// power), so this only structures what's needed for point-tracking
// (Adders/Limiters and their costs) and leaves the rest of each Gift's
// block as raw markdown for the picker's detail view to render as-is.
export function parseGifts(giftsMd) {
  const listSection = findSection(giftsMd, 'Gift List', '##');
  const blocks = splitByHeading(listSection, '###');

  return blocks.map(({ title, body }) => {
    const flagged = /\[FLAGGED/.test(body);

    const { items: adderLines, found: hasAdders } = extractBulletsBetween(
      body,
      '**Adders**:',
      '**Limiters**:',
    );
    if (!hasAdders) {
      console.warn(`Gift "${title}": no "**Adders**:" section found, skipping cost extraction`);
    }
    const adders = adderLines
      .map((line) => {
        const m = line.match(ADDER_ITEM);
        if (!m) {
          console.warn(`Gift "${title}": Adder line didn't match expected pattern: "${line}"`);
          return null;
        }
        return { name: m[1], tier: m[2], points: Number(m[3]), text: m[4] };
      })
      .filter(Boolean);

    const { items: limiterLines, found: hasLimiters } = extractBulletsBetween(
      body,
      '**Limiters**:',
      null,
    );
    if (!hasLimiters) {
      console.warn(`Gift "${title}": no "**Limiters**:" section found, skipping cost extraction`);
    }
    const limiters = limiterLines
      .map((line) => {
        const m = line.match(LIMITER_ITEM);
        if (!m) {
          console.warn(`Gift "${title}": Limiter line didn't match expected pattern: "${line}"`);
          return null;
        }
        return { name: m[1], text: m[2] };
      })
      .filter(Boolean);

    // 40 of 41 Gifts have a standard "| Level | Effect |" table right after
    // the intro prose. The one exception (Alternate Form) uses a custom
    // Pool/Build-menu structure instead - `levels` is null for it, and
    // callers fall back to the raw markdown for that case.
    let levels = null;
    try {
      const table = extractTableAfter(body, '| Level | Effect |');
      levels = table.rows.map((row) => ({ level: Number(row.Level), effect: row.Effect }));
    } catch {
      // no standard Level table for this Gift - leave levels null
    }

    return { name: title, flagged, adders, limiters, levels, markdown: body };
  });
}

// Pulls the "The Gift Check" bullet out of gifts.md's Resolution section, so
// the app can display the live rule text (e.g. its target number) rather
// than a hardcoded copy that could drift from the actual rules file.
export function parseGiftCheckText(giftsMd) {
  const section = findSection(giftsMd, 'Resolution', '##');
  const line = section.split('\n').find((l) => l.trim().startsWith('- **The Gift Check**'));
  if (!line) {
    console.warn('Gift Check bullet not found in gifts.md Resolution section');
    return '';
  }
  return line.trim().replace(/^- /, '');
}
