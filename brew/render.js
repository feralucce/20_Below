/* markdown -> pages.
 *
 * Pagination is manual and always will be: browsers do not reflow
 * content into fixed-size pages, so the author says where a page
 * ends. A page marker is a line starting with \page, optionally
 * carrying options:
 *
 *   \page
 *   \page cols=2
 *   \page bg=parchment cols=1
 *
 * Options apply to the page the marker STARTS. Unknown keys are
 * ignored, so adding new ones later cannot break old documents.
 */

import { applyBlocks } from './blocks.js';

const PAGE_MARKER = /^\\page[ \t]*(.*)$/;

function parseOptions(str) {
  const opts = {};
  for (const m of String(str || '').matchAll(/([a-zA-Z][\w-]*)\s*=\s*("[^"]*"|\S+)/g)) {
    opts[m[1].toLowerCase()] = m[2].replace(/^"|"$/g, '');
  }
  return opts;
}

/** Split source into [{ options, markdown }] - one entry per printed page.
 *  Markers inside fenced code blocks are left alone, so a document can
 *  document its own syntax without splitting itself. */
export function paginate(src) {
  const pages = [{ options: {}, lines: [] }];
  let fence = null;
  for (const line of src.split(/\r?\n/)) {
    const f = line.match(/^\s*(```+|~~~+)/);
    if (f) {
      if (!fence) fence = f[1][0];
      else if (f[1][0] === fence) fence = null;
    }
    const m = !fence && line.match(PAGE_MARKER);
    if (m) pages.push({ options: parseOptions(m[1]), lines: [] });
    else pages[pages.length - 1].lines.push(line);
  }
  return pages.map((p) => ({ options: p.options, markdown: p.lines.join('\n').trim() }));
}

/** Render source into the container as a series of .page elements. */
export function render(src, container, defaults = {}) {
  const pages = paginate(src);
  container.innerHTML = pages
    .map(({ options, markdown }) => {
      const cols = options.cols || defaults.cols || '1';
      const bg = options.bg || defaults.bg || '';
      const attrs = [`data-cols="${cols}"`];
      if (bg) attrs.push(`data-bg="${bg}"`);
      const html = window.marked.parse(applyBlocks(markdown));
      return `<div class="page" ${attrs.join(' ')}><div class="flow">${html}</div></div>`;
    })
    .join('');
  return pages.length;
}
