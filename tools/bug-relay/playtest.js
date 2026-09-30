// Playtest feedback: POST /playtest, from the unlisted playtest.html.
//
// Same idea as bug reports (worker.js): the page sends a short form, the
// Worker checks it, numbers it P#1, P#2 ... and posts it to the private
// #playtest-feedback forum on Discord, where each post is one ticket and
// its tags are its kind and status. The same cleaning applies: no
// invisible characters, no clickable links, no pings.
//
// Bindings (wrangler.toml, README.md "Playtest feedback"):
//   PLAYTEST_WEBHOOK  secret  webhook URL of the #playtest-feedback forum
//   PLAYTEST_TAGS     var     JSON: tag name -> forum tag id, e.g.
//                             {"New":"123","Balance":"456"}. Names missing
//                             from it are simply not applied.

import { text, plain, defang } from './worker.js';

export const KINDS = ['Unclear rule', 'Too slow', 'Balance', 'Not fun', 'Tool issue', 'Session report'];
export const ROLES = ['GM', 'Player'];

export const PT_LIMITS = {
  summary: 100,
  area: 80,
  happened: 2000,
  better: 1000,
  well: 1500,
  dragged: 1500,
  other: 1000,
  played: 40,
  players: 20,
  contact: 200,
};

export function cleanFeedback(body) {
  const b = body && typeof body === 'object' ? body : {};
  const f = {};
  for (const [k, max] of Object.entries(PT_LIMITS)) f[k] = text(b[k], max);
  f.area = f.area.replace(/\s+/g, ' ');
  f.kind = KINDS.includes(b.kind) ? b.kind : '';
  f.role = ROLES.includes(b.role) ? b.role : '';
  if (!f.kind) return { error: 'Please choose what kind of feedback this is.' };
  if (!f.summary) return { error: 'Please add a one-line summary.' };
  if (f.kind === 'Session report') {
    if (!f.well && !f.dragged && !f.other) return { error: 'Please tell us something about the session.' };
  } else if (!f.happened) {
    return { error: 'Please describe what happened at the table.' };
  }
  return f;
}

export function tagIds(kind, tagsJson) {
  let map = {};
  try {
    map = JSON.parse(tagsJson || '{}') || {};
  } catch {
    map = {};
  }
  return ['New', kind].map((name) => map[name]).filter((id) => /^\d{5,25}$/.test(String(id || ''))).map(String);
}

export function feedbackPost(number, f, tagsJson) {
  const lines = [`**Kind:** ${plain(f.kind)}`];
  if (f.area) lines.push(`**Rule or tool:** ${plain(f.area)}`);
  const session = [f.played && `played ${plain(f.played)}`, f.players && `${plain(f.players)} players`, f.role && `as ${f.role}`].filter(Boolean);
  if (session.length) lines.push(`**Session:** ${session.join(', ')}`);
  const section = (title, value) => { if (value) lines.push('', `**${title}**`, plain(value)); };
  if (f.kind === 'Session report') {
    section('What went well', f.well);
    section('What dragged or confused', f.dragged);
    section('Anything else', f.other);
  } else {
    section('What happened at the table', f.happened);
    section('What would have worked better', f.better);
  }
  if (f.contact) lines.push('', `**From:** ${plain(f.contact)}`);
  let content = lines.join('\n');
  if (content.length > 1990) content = content.slice(0, 1985) + '\n...';
  const post = {
    thread_name: [`P#${number}`, f.kind, defang(f.summary)].join(' · ').slice(0, 100),
    content,
    username: '20 Below Playtest Feedback',
    allowed_mentions: { parse: [] },
  };
  const tags = tagIds(f.kind, tagsJson);
  if (tags.length) post.applied_tags = tags;
  return post;
}
