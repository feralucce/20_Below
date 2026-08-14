// RTF export, built the same way toMarkdown.js is - walked directly off
// state/data, no DOM involved - so it can't drift from what the app
// actually computed. Opens natively in Word, LibreOffice, Google Docs
// (via import), etc.

import { computeFiguredCharacteristics, startingFateTokens, skillTierName, xpSpent, xpRemaining } from '../state.js';

const PAGE_WIDTH_TWIPS = 12240; // US Letter, 8.5in
const MARGIN_TWIPS = 1440; // 1in
const CONTENT_WIDTH_TWIPS = PAGE_WIDTH_TWIPS - MARGIN_TWIPS * 2;
const BULLET_CODE = 8226; // U+2022, avoids putting a literal high-codepoint char in source

function escapeRtf(text) {
  let out = '';
  for (const ch of String(text ?? '')) {
    const code = ch.codePointAt(0);
    if (ch === '\\') out += '\\\\';
    else if (ch === '{') out += '\\{';
    else if (ch === '}') out += '\\}';
    else if (code > 127) out += `\\u${code}?`;
    else out += ch;
  }
  return out;
}

// Converts the subset of Markdown the rules files actually use (bold,
// italic, [text](link)) into RTF control words. Links drop their target -
// they point at .md files that don't mean anything inside a Word doc.
function inlineToRtf(md) {
  const stripped = String(md ?? '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  const tokens = stripped.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return tokens
    .map((tok) => {
      if (/^\*\*[^*]+\*\*$/.test(tok)) return `{\\b ${escapeRtf(tok.slice(2, -2))}}`;
      if (/^\*[^*]+\*$/.test(tok)) return `{\\i ${escapeRtf(tok.slice(1, -1))}}`;
      return escapeRtf(tok);
    })
    .join('');
}

function rtfTable(rows, colWidthsTwips) {
  let cum = 0;
  const cellDefs = colWidthsTwips
    .map((w) => {
      cum += w;
      return `\\cellx${cum}`;
    })
    .join('');
  return rows
    .map((cols) => {
      const cells = cols.map((c) => `\\intbl ${inlineToRtf(c)}\\cell`).join('');
      return `\\trowd\\trgaph108\\trleft0${cellDefs}${cells}\\row`;
    })
    .join('\n');
}

export function buildRtf(state, data) {
  const parts = [];
  const push = (s) => parts.push(s);

  const h1 = (text) => push(`{\\b\\fs36 ${inlineToRtf(text)}\\par}\\par`);
  const h2 = (text) => push(`{\\b\\fs28 ${inlineToRtf(text)}\\par}\\par`);
  const para = (text) => push(`{\\fs22 ${inlineToRtf(text)}\\par}`);
  const bullet = (text) => push(`{\\fs22\\u${BULLET_CODE}?\\tab ${inlineToRtf(text)}\\par}`);
  const spacer = () => push('\\par');
  const table = (rows, widths) => push(rtfTable(rows, widths));

  h1(state.name || 'Unnamed Character');
  if (state.concept) para(`*${state.concept}*`);
  const nature = state.nature.picked ?? state.nature.custom?.label ?? '(none chosen)';
  para(`**Nature**: ${nature}`);
  spacer();

  h2('Attributes');
  table(
    [['**Attribute**', '**Rating**'], ...data.attributes.map((a) => [a.name, String(state.attributes[a.name])])],
    [CONTENT_WIDTH_TWIPS / 2, CONTENT_WIDTH_TWIPS],
  );
  spacer();

  h2('Sub-Stats & Descriptors');
  table(
    [
      ['**Sub-Stat**', '**Rating**', '**Descriptors**'],
      ...data.subStats.map((s) => [
        s.name,
        String(state.subStats[s.name]),
        state.descriptors[s.name].filter(Boolean).join(', '),
      ]),
    ],
    [CONTENT_WIDTH_TWIPS * 0.3, CONTENT_WIDTH_TWIPS * 0.5, CONTENT_WIDTH_TWIPS],
  );
  spacer();

  h2('Skills');
  const trained = data.skillCatalog.filter((s) => state.skills[s.name] > 0);
  if (trained.length) {
    table(
      [['**Skill**', '**Tier**'], ...trained.map((s) => [s.name, skillTierName(data, state.skills[s.name])])],
      [CONTENT_WIDTH_TWIPS / 2, CONTENT_WIDTH_TWIPS],
    );
    spacer();
  }
  table(
    [['**Tier**', '**Roll**'], ...data.skillTiers.map((t) => [t.name, t.roll])],
    [CONTENT_WIDTH_TWIPS / 3, CONTENT_WIDTH_TWIPS],
  );
  spacer();

  h2('Boons');
  if (state.boons.length === 0) para('None.');
  state.boons.forEach((b) => {
    const boonData = data.boons.find((d) => d.name === b.name);
    const effect = boonData ? boonData.effect : '';
    bullet(`**${b.name}** (${b.tier ?? `${b.points} pts`}): ${effect}`);
  });
  spacer();

  h2('Resources');
  data.resources
    .filter((r) => state.resources[r.name] > 0)
    .forEach((r) => {
      const level = state.resources[r.name];
      bullet(`**${r.name}**: Level ${level}`);
      para(r.levels[level] ?? '');
    });
  spacer();

  h2('Gifts');
  state.gifts
    .filter((g) => g.level > 0)
    .forEach((g) => {
      bullet(`**${g.name}** (Level ${g.level}):`);
      const giftData = data.gifts.find((d) => d.name === g.name);
      if (giftData?.levels) {
        giftData.levels
          .filter((l) => l.level <= g.level)
          .forEach((l) => para(`${l.level}. ${l.effect}`));
      } else if (giftData) {
        para("(see gifts.md for this Gift's full effect - no standard Level table to summarize here)");
      }
      const adderTexts = (giftData?.adders ?? []).filter((a) => g.adders.includes(a.name));
      const limiterTexts = (giftData?.limiters ?? []).filter((l) => g.limiters.includes(l.name));
      if (adderTexts.length) {
        para('Adders:');
        adderTexts.forEach((a) => bullet(`**${a.name}** (${a.tier}): ${a.text}`));
      }
      if (limiterTexts.length) {
        para('Limiters:');
        limiterTexts.forEach((l) => bullet(`**${l.name}**: ${l.text}`));
      }
    });
  para(data.giftCheckText);
  spacer();

  h2('Flaws');
  state.flaws
    .filter((f) => f.level > 0)
    .forEach((f) => {
      const flawData = data.flaws.find((d) => d.name === f.name);
      const thisLevel = flawData?.levels?.find((l) => l.level === f.level);
      const effect = thisLevel
        ? thisLevel.effect
        : flawData
          ? "(see flaws.md for this Flaw's full effect - no standard Level table to summarize here)"
          : '';
      bullet(`**${f.name}** (Level ${f.level}): ${effect}`);
    });
  spacer();

  h2('Scars');
  const physicalScars = state.scars.filter((s) => s.physical);
  const mentalScars = state.scars.filter((s) => !s.physical);
  para('**Physical**');
  if (physicalScars.length === 0) para('None.');
  physicalScars.forEach((s) => bullet(`**${s.title || '(untitled)'}**${s.description ? `: ${s.description}` : ''}`));
  para('**Mental**');
  if (mentalScars.length === 0) para('None.');
  mentalScars.forEach((s) => bullet(`**${s.title || '(untitled)'}**${s.description ? `: ${s.description}` : ''}`));
  spacer();

  h2('Advancement');
  bullet(`XP Earned: ${state.xpEarned}. Spent: ${xpSpent(state, data)}. Remaining: ${xpRemaining(state, data)}.`);
  spacer();

  h2('Figured Characteristics');
  const figured = computeFiguredCharacteristics(state);
  table(
    [['**Characteristic**', '**Value**'], ...Object.entries(figured).map(([name, value]) => [name, String(value)])],
    [CONTENT_WIDTH_TWIPS / 2, CONTENT_WIDTH_TWIPS],
  );
  spacer();

  bullet(`Starting Fate Tokens: ${startingFateTokens(state, data)}`);
  if (state.finishingNotes) {
    spacer();
    para(state.finishingNotes);
  }

  return `{\\rtf1\\ansi\\ansicpg1252\\deff0\n{\\fonttbl{\\f0\\fswiss Segoe UI;}}\n\\f0\\fs22\n\\margl${MARGIN_TWIPS}\\margr${MARGIN_TWIPS}\\margt${MARGIN_TWIPS}\\margb${MARGIN_TWIPS}\n${parts.join('\n')}\n}`;
}

export function downloadRtf(state, data) {
  const rtf = buildRtf(state, data);
  const blob = new Blob([rtf], { type: 'application/rtf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(state.name || 'character').replace(/[^a-z0-9-_]+/gi, '_')}.rtf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
