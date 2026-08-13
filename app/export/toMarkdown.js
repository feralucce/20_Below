import { computeFiguredCharacteristics, startingFateTokens } from '../state.js';

export function buildMarkdown(state, data) {
  const lines = [];
  const push = (s = '') => lines.push(s);

  push(`# ${state.name || 'Unnamed Character'}`);
  push();
  if (state.concept) {
    push(`*${state.concept}*`);
    push();
  }
  const nature = state.nature.picked ?? state.nature.custom?.label ?? '(none chosen)';
  push(`**Nature**: ${nature}`);
  push();

  push('## Attributes');
  push();
  push('| Attribute | Rating |');
  push('|---|---|');
  data.attributes.forEach((a) => push(`| ${a.name} | ${state.attributes[a.name]} |`));
  push();

  push('## Sub-Stats & Descriptors');
  push();
  push('| Sub-Stat | Rating | Descriptors |');
  push('|---|---|---|');
  data.subStats.forEach((s) => {
    const descriptors = state.descriptors[s.name].filter(Boolean).join(', ');
    push(`| ${s.name} | ${state.subStats[s.name]} | ${descriptors} |`);
  });
  push();

  push('## Skills');
  push();
  const trained = data.skillCatalog.filter((s) => state.skills[s.name] > 0);
  push('| Skill | Tier |');
  push('|---|---|');
  trained.forEach((s) => push(`| ${s.name} | ${state.skills[s.name]} |`));
  push();

  push('## Boons');
  push();
  if (state.boons.length === 0) push('None.');
  state.boons.forEach((b) => push(`- ${b.name} (${b.tier ?? ''} ${b.points} pts)`));
  push();

  push('## Resources');
  push();
  data.resources
    .filter((r) => state.resources[r.name] > 0)
    .forEach((r) => push(`- ${r.name}: Level ${state.resources[r.name]}`));
  push();

  push('## Gifts');
  push();
  state.gifts
    .filter((g) => g.level > 0)
    .forEach((g) => {
      push(`- **${g.name}** (Level ${g.level})`);
      if (g.adders.length) push(`  - Adders: ${g.adders.join(', ')}`);
      if (g.limiters.length) push(`  - Limiters: ${g.limiters.join(', ')}`);
    });
  push();

  push('## Flaws');
  push();
  state.flaws
    .filter((f) => f.level > 0)
    .forEach((f) => push(`- ${f.name} (Level ${f.level})`));
  push();

  push('## Figured Characteristics');
  push();
  const figured = computeFiguredCharacteristics(state);
  push('| Characteristic | Value |');
  push('|---|---|');
  Object.entries(figured).forEach(([name, value]) => push(`| ${name} | ${value} |`));
  push();

  push('## Finishing Touches');
  push();
  push(`- Starting Fate Tokens: ${startingFateTokens(state, data)}`);
  if (state.finishingNotes) {
    push();
    push(state.finishingNotes);
  }

  return lines.join('\n');
}

export function downloadMarkdown(state, data) {
  const md = buildMarkdown(state, data);
  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(state.name || 'character').replace(/[^a-z0-9-_]+/gi, '_')}.md`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
