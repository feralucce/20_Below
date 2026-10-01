// Playtester applications: POST /apply, from the unlisted apply.html.
//
// Same idea as playtest feedback (playtest.js): the page sends a short
// form, the Worker checks it, numbers it A#1, A#2 ... and posts it to a
// private #playtest-applications forum on Discord, where the team
// approves or declines it by tag and gives approved playtesters the
// playtester channel. The application holds what the team needs to
// credit them: the name to credit and a Discord handle.
//
// Bindings (wrangler.toml, README.md "Playtester applications"):
//   APPLY_WEBHOOK  secret  webhook URL of the #playtest-applications forum
//   APPLY_TAGS     var     JSON: tag name -> forum tag id, e.g.
//                          {"New":"123"}. Only New is applied here.

import { text, plain, defang } from './worker.js';
import { tagIds } from './playtest.js';

export const ROLES_APPLY = ['GM', 'Player', 'Both'];
export const WHERE = ['In person', 'Online', 'Both'];
export const EXPERIENCE = ['New to tabletop RPGs', 'Played a few', 'Played for years'];

export const APPLY_LIMITS = {
  credit: 80,
  discord: 40,
  group: 40,
  why: 1000,
};

// Discord usernames: 2-32 letters, digits, dots and underscores. Older
// handles kept a #1234 tag, so that is allowed too. A leading @ is fine.
export function cleanHandle(value) {
  const h = text(value, APPLY_LIMITS.discord).replace(/^@/, '');
  return /^[A-Za-z0-9_.]{2,32}(#\d{4})?$/.test(h) ? h : '';
}

export function cleanApplication(body) {
  const b = body && typeof body === 'object' ? body : {};
  const a = {
    credit: text(b.credit, APPLY_LIMITS.credit).replace(/\s+/g, ' '),
    discord: cleanHandle(b.discord),
    role: ROLES_APPLY.includes(b.role) ? b.role : '',
    where: WHERE.includes(b.where) ? b.where : '',
    experience: EXPERIENCE.includes(b.experience) ? b.experience : '',
    group: text(b.group, APPLY_LIMITS.group).replace(/\s+/g, ' '),
    why: text(b.why, APPLY_LIMITS.why),
    agree: b.agree === true || b.agree === 'yes',
  };
  if (a.credit.length < 2) return { error: 'Please give the name you want to be credited under.' };
  if (!a.discord) return { error: 'Please give your Discord username, like name_123.' };
  if (!a.role) return { error: 'Please say whether you will run games, play, or both.' };
  if (!a.where) return { error: 'Please say where you will play.' };
  if (!a.experience) return { error: 'Please say how much you have played tabletop RPGs.' };
  if (!a.agree) return { error: 'Please agree to the playtester commitments to apply.' };
  return a;
}

export function applicationPost(number, a, tagsJson) {
  const lines = [
    `**Credit as:** ${plain(a.credit)}`,
    `**Discord:** ${plain(a.discord)}`,
    `**Will:** ${a.role === 'Both' ? 'run games and play' : a.role === 'GM' ? 'run games (GM)' : 'play'}`,
    `**Plays:** ${a.where.toLowerCase()}`,
    `**Experience:** ${a.experience}`,
  ];
  if (a.group) lines.push(`**Group:** ${plain(a.group)}`);
  if (a.why) lines.push('', '**Why they want to playtest**', plain(a.why));
  lines.push('', 'Agreed to the playtester commitments.');
  let content = lines.join('\n');
  if (content.length > 1990) content = content.slice(0, 1985) + '\n...';
  const post = {
    thread_name: [`A#${number}`, defang(a.credit), a.role].join(' · ').slice(0, 100),
    content,
    username: '20 Below Playtester Applications',
    allowed_mentions: { parse: [] },
  };
  const tags = tagIds('', tagsJson);
  if (tags.length) post.applied_tags = tags;
  return post;
}
