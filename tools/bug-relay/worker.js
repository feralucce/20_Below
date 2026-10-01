// 20 Below bug relay: a Cloudflare Worker between the apps and Discord.
// It also takes newsletter signups: POST /subscribe keeps the address
// and hands it to Kit, which emails the person to confirm (see README.md,
// "Email signups").
//
// The apps POST a report here. The Worker checks it, gives it the next
// ticket number and posts it to a Discord forum channel, where each post
// is one ticket, its tags are its status, and its thread is the talk
// about it. The Discord webhook URL never leaves this Worker: it is a
// secret (DISCORD_WEBHOOK), so nobody can read it out of an app and spam
// the channel directly.
//
// Bindings (see wrangler.toml and README.md):
//   DISCORD_WEBHOOK  secret  webhook URL of the forum channel
//   NEW_TAG_ID       var     id of the forum's "New" tag (optional)
//   ALLOWED_ORIGINS  var     comma-separated origins allowed to report
//   TICKETS          KV      ticket counter and per-sender rate limits
//   SUBSCRIBERS      KV      email signups: key = address, metadata =
//                            where they signed up, when, and whether Kit
//                            has it yet. Nothing else.
//   KIT_API_KEY      secret  Kit (kit.com) v4 API key
//   KIT_FORM_ID      var     the Kit form new signups join (double opt-in)
//   PLAYTEST_WEBHOOK, PLAYTEST_TAGS  playtest feedback (playtest.js)
//   APPLY_WEBHOOK, APPLY_TAGS        playtester applications (apply.js)
//
// GET /news lists the newsletter issues Kit has sent and marked public,
// for the site's News page (news.html). It is cached in TICKETS for a few
// minutes, so the site never waits on Kit and the key never leaves here.

import { cleanFeedback, feedbackPost } from './playtest.js';
import { cleanApplication, applicationPost } from './apply.js';

export const LIMITS = {
  summary: 100,       // becomes the post title
  section: 80,        // where in the app, picked from a list
  happened: 2000,
  expected: 1000,
  steps: 1500,
  contact: 200,
  context: 1500,      // everything the app fills in by itself
  perWindow: 5,       // reports one sender may send...
  windowSeconds: 600, // ...in this many seconds
  email: 254,         // the longest valid address
  source: 40,         // which signup box, e.g. "footer"
};

export const APPS = new Set([
  'Character Creator', 'Battle Tracker', 'Owlbear Character Sheet',
  'Owlbear Battle Tracker', 'Brewery', 'Website', 'Other',
]);

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const cors = corsHeaders(origin, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: cors ? 204 : 403, headers: cors || {} });
    }
    const url = new URL(request.url);
    if (request.method === 'GET' && url.pathname === '/news') {
      if (!cors) return json({ error: 'Not found.' }, 404, null);
      return news(env, cors);
    }
    if (request.method !== 'POST' || !['/report', '/subscribe', '/playtest', '/apply'].includes(url.pathname)) {
      return json({ error: 'Not found.' }, 404, cors);
    }
    if (!cors) return json({ error: 'This site is not allowed to send reports.' }, 403, null);
    if (url.pathname === '/subscribe') return subscribe(request, env, cors);
    if (url.pathname === '/playtest') return playtest(request, env, cors);
    if (url.pathname === '/apply') return apply(request, env, cors);

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'The report could not be read.' }, 400, cors);
    }

    // A filled-in hidden field means a bot, not a player. Pretend it worked.
    if (body && typeof body.website === 'string' && body.website.trim()) {
      return json({ ticket: 0 }, 200, cors);
    }

    const report = clean(body);
    if (report.error) return json({ error: report.error }, 400, cors);

    const who = await senderKey(request);
    if (!(await allow(env.TICKETS, who))) {
      return json({ error: 'Too many reports in a short time. Please wait a few minutes and try again.' }, 429, cors);
    }

    // The secret may arrive with a byte-order mark, a label or extra lines
    // around the address. Pick out the webhook itself; never echo it back.
    const hook = webhookFrom(env.DISCORD_WEBHOOK);
    if (!hook) {
      return json({ error: 'The relay is not set up yet.', stage: 'webhook' }, 500, cors);
    }

    const ticket = await nextTicket(env.TICKETS);
    const post = discordPost(ticket, report, env.NEW_TAG_ID);
    let sent;
    try {
      sent = await fetch(hook + '?wait=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      });
    } catch {
      return json({ error: 'The report could not be delivered. Please try again later.', stage: 'send' }, 502, cors);
    }
    if (!sent.ok) {
      console.log('Discord refused the post', sent.status, (await sent.text()).slice(0, 300));
      return json({ error: 'The report could not be delivered. Please try again later.' }, 502, cors);
    }
    return json({ ticket }, 200, cors);
  },
};

export function webhookFrom(secret) {
  const m = String(secret || '').match(/https:\/\/(?:canary\.|ptb\.)?discord(?:app)?\.com\/api\/webhooks\/\d+\/[\w-]+/);
  return m ? m[0] : '';
}

// A deliberately plain check: something@something.something, no spaces.
// The real test is the confirmation a newsletter service sends later.
export function cleanEmail(value) {
  const email = text(value, LIMITS.email).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
}

async function subscribe(request, env, cors) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'The signup could not be read.' }, 400, cors);
  }
  // Same trap as reports: a filled-in hidden field is a bot.
  if (body && typeof body.website === 'string' && body.website.trim()) {
    return json({ ok: true }, 200, cors);
  }
  const email = cleanEmail(body && body.email);
  if (!email) return json({ error: 'Please enter a valid email address.' }, 400, cors);

  const who = await senderKey(request);
  if (!(await allow(env.TICKETS, who, 'subrate:'))) {
    return json({ error: 'Too many signups in a short time. Please wait a few minutes and try again.' }, 429, cors);
  }
  // Signing up twice is harmless: the first date is kept.
  const existing = await env.SUBSCRIBERS.getWithMetadata(email);
  let meta = existing && existing.value !== null ? existing.metadata || {} : null;
  if (!meta) {
    const source = text(body.source, LIMITS.source).replace(/[^\w -]/g, '') || 'site';
    meta = { source, at: new Date().toISOString() };
    await env.SUBSCRIBERS.put(email, '1', { metadata: meta });
  }
  // Hand it to Kit once. If Kit is down or not set up yet, the address is
  // still kept here and goes over on the person's next signup.
  if (!meta.kit && env.KIT_API_KEY && env.KIT_FORM_ID && (await toKit(email, meta.source, env))) {
    await env.SUBSCRIBERS.put(email, '1', { metadata: { ...meta, kit: new Date().toISOString() } });
  }
  return json({ ok: true }, 200, cors);
}

// Kit's double opt-in, through its v4 API: create the subscriber as
// inactive (the API would otherwise mark them confirmed), then add them
// to a double opt-in form, which sends Kit's confirmation email. Nobody
// gets newsletters until they click it.
export async function toKit(email, source, env) {
  const call = (path, payload) => fetch('https://api.kit.com/v4' + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Kit-Api-Key': String(env.KIT_API_KEY).trim() },
    body: JSON.stringify(payload),
  });
  try {
    const made = await call('/subscribers', { email_address: email, state: 'inactive' });
    if (!made.ok) return false;
    const form = String(env.KIT_FORM_ID).trim();
    const added = await call(`/forms/${encodeURIComponent(form)}/subscribers`, {
      email_address: email,
      referrer: 'https://20belowrpg.com/#' + (source || 'site'),
    });
    return added.ok;
  } catch {
    return false;
  }
}

// Playtest feedback (playtest.js): the same checks as a bug report, its
// own P# counter and rate limit, and its own forum and webhook.
async function playtest(request, env, cors) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'The feedback could not be read.' }, 400, cors);
  }
  if (body && typeof body.website === 'string' && body.website.trim()) {
    return json({ ticket: 0 }, 200, cors);
  }
  const f = cleanFeedback(body);
  if (f.error) return json({ error: f.error }, 400, cors);

  const who = await senderKey(request);
  if (!(await allow(env.TICKETS, who, 'ptrate:'))) {
    return json({ error: 'Too much feedback in a short time. Please wait a few minutes and try again.' }, 429, cors);
  }
  const hook = webhookFrom(env.PLAYTEST_WEBHOOK);
  if (!hook) return json({ error: 'Playtest feedback is not set up yet.', stage: 'webhook' }, 500, cors);

  const number = await nextTicket(env.TICKETS, 'playtest:last');
  let sent;
  try {
    sent = await fetch(hook + '?wait=true', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedbackPost(number, f, env.PLAYTEST_TAGS)),
    });
  } catch {
    return json({ error: 'The feedback could not be delivered. Please try again later.', stage: 'send' }, 502, cors);
  }
  if (!sent.ok) {
    console.log('Discord refused the playtest post', sent.status, (await sent.text()).slice(0, 300));
    return json({ error: 'The feedback could not be delivered. Please try again later.' }, 502, cors);
  }
  return json({ ticket: number }, 200, cors);
}

// Playtester applications (apply.js): the same checks again, an A#
// counter, its own rate limit, forum and webhook.
async function apply(request, env, cors) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'The application could not be read.' }, 400, cors);
  }
  if (body && typeof body.website === 'string' && body.website.trim()) {
    return json({ application: 0 }, 200, cors);
  }
  const a = cleanApplication(body);
  if (a.error) return json({ error: a.error }, 400, cors);

  const who = await senderKey(request);
  if (!(await allow(env.TICKETS, who, 'aprate:'))) {
    return json({ error: 'Too many applications in a short time. Please wait a few minutes and try again.' }, 429, cors);
  }
  const hook = webhookFrom(env.APPLY_WEBHOOK);
  if (!hook) return json({ error: 'Applications are not open yet.', stage: 'webhook' }, 500, cors);

  const number = await nextTicket(env.TICKETS, 'apply:last');
  let sent;
  try {
    sent = await fetch(hook + '?wait=true', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(applicationPost(number, a, env.APPLY_TAGS)),
    });
  } catch {
    return json({ error: 'The application could not be delivered. Please try again later.', stage: 'send' }, 502, cors);
  }
  if (!sent.ok) {
    console.log('Discord refused the application post', sent.status, (await sent.text()).slice(0, 300));
    return json({ error: 'The application could not be delivered. Please try again later.' }, 502, cors);
  }
  return json({ application: number }, 200, cors);
}

// The public issues, newest first. Only what the page shows goes out:
// no subscriber data, and no email address or template details. The
// issue HTML is cleaned again in the browser (news.html) before display.
export const NEWS_CACHE_SECONDS = 600;

async function news(env, cors) {
  const cached = await env.TICKETS.get('news:cache');
  if (cached) return new Response(cached, { status: 200, headers: { 'Content-Type': 'application/json', ...cors } });
  if (!env.KIT_API_KEY) return json({ issues: [] }, 200, cors);
  let issues;
  try {
    issues = await publicIssues(env);
  } catch {
    return json({ error: 'News is unavailable right now.' }, 502, cors);
  }
  const body = JSON.stringify({ issues });
  await env.TICKETS.put('news:cache', body, { expirationTtl: NEWS_CACHE_SECONDS });
  return new Response(body, { status: 200, headers: { 'Content-Type': 'application/json', ...cors } });
}

export async function publicIssues(env) {
  const out = [];
  let after = '';
  for (let page = 0; page < 10; page++) {
    const q = new URLSearchParams({ status: 'completed', per_page: '100' });
    if (after) q.set('after', after);
    const r = await fetch('https://api.kit.com/v4/broadcasts?' + q, {
      headers: { 'X-Kit-Api-Key': String(env.KIT_API_KEY).trim() },
    });
    if (!r.ok) throw new Error('Kit ' + r.status);
    const data = await r.json();
    for (const b of data.broadcasts || []) {
      if (b.public !== true || !b.published_at) continue;
      out.push({
        id: String(b.id),
        subject: text(b.subject || '', 200),
        preview: text(b.preview_text || b.description || '', 400),
        published_at: b.published_at,
        image: /^https:\/\//.test(b.thumbnail_url || '') ? b.thumbnail_url : '',
        image_alt: text(b.thumbnail_alt || '', 200),
        html: noLiquid(b.content),
      });
    }
    const pg = data.pagination || {};
    if (!pg.has_next_page || !pg.end_cursor) break;
    after = pg.end_cursor;
  }
  return out.sort((a, b) => String(b.published_at).localeCompare(String(a.published_at)));
}

// Kit's personalisation tags make no sense on a public page: a
// conditional block goes whole, any other tag is dropped.
export function noLiquid(html) {
  return String(html || '')
    .replace(/\{%-?\s*(if|unless|case|for)\b[\s\S]*?\{%-?\s*end\1\s*-?%\}/g, '')
    .replace(/\{\{[\s\S]*?\}\}|\{%[\s\S]*?%\}/g, '');
}

export function corsHeaders(origin, env) {
  const allowed = String(env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (!origin || !allowed.includes(origin)) return null;
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

// Characters nobody can see: zero-width and direction-changing marks,
// and the Unicode "tag" and variation blocks that can carry whole hidden
// sentences, or make text read differently from how it looks. A report
// may say only what shows on screen.
const INVISIBLE = /[\u00AD\u034F\u061C\u115F\u1160\u17B4\u17B5\u180B-\u180F\u200B-\u200F\u202A-\u202E\u2060-\u206F\u3164\uFE00-\uFE0F\uFEFF\uFFA0\uFFF0-\uFFF8]|[\u{E0000}-\u{E0FFF}]/gu;

export function text(value, max) {
  if (typeof value !== 'string') return '';
  // Drop control characters except line breaks and tabs, and anything
  // invisible, then trim to size.
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(INVISIBLE, '')
    .trim()
    .slice(0, max);
}

// "https://x" -> "https[:]//x": still readable, but not clickable in
// Discord, so a link in a report can't be a phishing trap. Links in a
// report are evidence to look at, not places to go.
export function defang(value) {
  return value.replace(/\b([a-z][a-z0-9+.-]{1,15}):\/\//gi, '$1[:]//');
}

export function clean(body) {
  if (!body || typeof body !== 'object') return { error: 'The report was empty.' };
  const report = {
    app: APPS.has(body.app) ? body.app : 'Other',
    summary: text(body.summary, LIMITS.summary),
    section: text(body.section, LIMITS.section).replace(/\s+/g, ' '),
    happened: text(body.happened, LIMITS.happened),
    expected: text(body.expected, LIMITS.expected),
    steps: text(body.steps, LIMITS.steps),
    contact: text(body.contact, LIMITS.contact),
    context: text(body.context, LIMITS.context),
  };
  if (report.summary.length < 3) return { error: 'Please give the bug a short title.' };
  if (report.happened.length < 5) return { error: 'Please say what happened.' };
  return report;
}

// Discord would turn "@everyone" or "<@123>" into pings, and markdown
// links into clickable ones. Reports are shown as plain text.
export function plain(value) {
  return defang(value)
    .replace(/@/g, '@​')
    .replace(/([\\`*_~|>\[\]()#-])/g, '\\$1');
}

export function discordPost(ticket, r, newTagId) {
  const lines = [
    `**App:** ${plain(r.app)}`,
    ...(r.section ? [`**Section:** ${plain(r.section)}`] : []),
    '',
    '**Description**',
    plain(r.happened),
  ];
  if (r.expected) lines.push('', '**What they expected**', plain(r.expected));
  if (r.steps) lines.push('', '**Steps to reproduce**', plain(r.steps));
  if (r.contact) lines.push('', `**Contact:** ${plain(r.contact)}`);
  if (r.context) lines.push('', '**Details from the app**', '```', defang(r.context).replace(/```/g, "'''"), '```');
  let content = lines.join('\n');
  if (content.length > 1990) content = content.slice(0, 1985) + '\n...';
  const post = {
    // "Creating a character: Skills" is titled by its last part, "Skills".
    thread_name: [`#${ticket}`, r.app, r.section.split(': ').pop(), defang(r.summary)].filter(Boolean).join(' · ').slice(0, 100),
    content,
    username: '20 Below Bug Reports',
    allowed_mentions: { parse: [] },
  };
  if (newTagId) post.applied_tags = [String(newTagId)];
  return post;
}

async function senderKey(request) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  // Only a hash of the address is kept, and only for the rate-limit window.
  const bytes = new TextEncoder().encode('20below-bugs:' + ip);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].slice(0, 12).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function allow(kv, who, prefix = 'rate:') {
  const key = prefix + who;
  const count = parseInt((await kv.get(key)) || '0', 10);
  if (count >= LIMITS.perWindow) return false;
  await kv.put(key, String(count + 1), { expirationTtl: LIMITS.windowSeconds });
  return true;
}

export async function nextTicket(kv, key = 'ticket:last') {
  const current = parseInt((await kv.get(key)) || '0', 10);
  const next = current + 1;
  await kv.put(key, String(next));
  return next;
}

function json(data, status, cors) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...(cors || {}) },
  });
}
