// 20 Below bug relay: a Cloudflare Worker between the apps and Discord.
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
    if (url.pathname !== '/report' || request.method !== 'POST') {
      return json({ error: 'Not found.' }, 404, cors);
    }
    if (!cors) return json({ error: 'This site is not allowed to send reports.' }, 403, null);

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

export function corsHeaders(origin, env) {
  const allowed = String(env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (!origin || !allowed.includes(origin)) return null;
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function text(value, max) {
  if (typeof value !== 'string') return '';
  // Drop control characters except line breaks and tabs, then trim to size.
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max);
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
  return value
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
  if (r.context) lines.push('', '**Details from the app**', '```', r.context.replace(/```/g, "'''"), '```');
  let content = lines.join('\n');
  if (content.length > 1990) content = content.slice(0, 1985) + '\n...';
  const post = {
    // "Creating a character: Skills" is titled by its last part, "Skills".
    thread_name: [`#${ticket}`, r.app, r.section.split(': ').pop(), r.summary].filter(Boolean).join(' · ').slice(0, 100),
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

export async function allow(kv, who) {
  const key = 'rate:' + who;
  const count = parseInt((await kv.get(key)) || '0', 10);
  if (count >= LIMITS.perWindow) return false;
  await kv.put(key, String(count + 1), { expirationTtl: LIMITS.windowSeconds });
  return true;
}

export async function nextTicket(kv) {
  const current = parseInt((await kv.get('ticket:last')) || '0', 10);
  const next = current + 1;
  await kv.put('ticket:last', String(next));
  return next;
}

function json(data, status, cors) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...(cors || {}) },
  });
}
