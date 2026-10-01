// Tests for the bug relay, with a fake KV store and a fake Discord.
//   node tools/bug-relay/test.mjs
import assert from 'node:assert/strict';
import { cleanFeedback, feedbackPost, tagIds } from './playtest.js';
import { cleanApplication, applicationPost, cleanHandle } from './apply.js';
import worker, { clean, plain, discordPost, webhookFrom, defang, LIMITS, publicIssues } from './worker.js';

function fakeKV() {
  const m = new Map();
  const meta = new Map();
  return {
    get: async (k) => m.get(k) ?? null,
    getWithMetadata: async (k) => ({ value: m.get(k) ?? null, metadata: meta.get(k) ?? null }),
    put: async (k, v, o = {}) => { m.set(k, v); if (o.metadata) meta.set(k, o.metadata); },
    map: m, meta,
  };
}

const sent = [];
let kitBroadcasts = { broadcasts: [], pagination: { has_next_page: false } };
globalThis.fetch = async (url, init = {}) => {
  sent.push({ url, body: init.body ? JSON.parse(init.body) : null });
  if (String(url).startsWith('https://api.kit.com/v4/broadcasts')) {
    return new Response(JSON.stringify(kitBroadcasts), { status: 200 });
  }
  return new Response('{}', { status: 200 });
};

const env = () => ({
  DISCORD_WEBHOOK: 'https://discord.com/api/webhooks/1/abc',
  NEW_TAG_ID: '555',
  ALLOWED_ORIGINS: 'https://20belowrpg.com,https://feralucce.github.io',
  TICKETS: fakeKV(),
  SUBSCRIBERS: fakeKV(),
});

function req(body, { origin = 'https://20belowrpg.com', ip = '1.2.3.4', method = 'POST', path = '/report' } = {}) {
  if (method === 'GET') return new Request('https://relay.example' + path, { method, headers: { Origin: origin } });
  return new Request('https://relay.example' + path, {
    method,
    headers: { 'Content-Type': 'application/json', Origin: origin, 'CF-Connecting-IP': ip },
    body: method === 'POST' ? JSON.stringify(body) : undefined,
  });
}

const good = { app: 'Battle Tracker', summary: 'Initiative does not sort', happened: 'Added two creatures and the order stayed wrong.', context: 'Version: 0.3.4' };
let passed = 0;
const t = async (name, fn) => { await fn(); passed++; console.log('ok -', name); };

await t('a good report becomes ticket #1 in Discord, tagged New, with pings off', async () => {
  const e = env(); sent.length = 0;
  const r = await worker.fetch(req(good), e);
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { ticket: 1 });
  assert.equal(r.headers.get('Access-Control-Allow-Origin'), 'https://20belowrpg.com');
  assert.equal(sent.length, 1);
  assert.equal(sent[0].url, e.DISCORD_WEBHOOK + '?wait=true');
  assert.equal(sent[0].body.thread_name, '#1 · Battle Tracker · Initiative does not sort');
  assert.deepEqual(sent[0].body.applied_tags, ['555']);
  assert.deepEqual(sent[0].body.allowed_mentions, { parse: [] });
});

await t('ticket numbers count up', async () => {
  const e = env();
  await worker.fetch(req(good), e);
  const r = await worker.fetch(req(good, { ip: '9.9.9.9' }), e);
  assert.deepEqual(await r.json(), { ticket: 2 });
});

await t('an unknown origin is refused and nothing is sent', async () => {
  const e = env(); sent.length = 0;
  const r = await worker.fetch(req(good, { origin: 'https://evil.example' }), e);
  assert.equal(r.status, 403);
  assert.equal(sent.length, 0);
});

await t('the preflight answers allowed origins only', async () => {
  const e = env();
  assert.equal((await worker.fetch(req(null, { method: 'OPTIONS' }), e)).status, 204);
  assert.equal((await worker.fetch(req(null, { method: 'OPTIONS', origin: 'https://evil.example' }), e)).status, 403);
});

await t('a bot that fills the hidden field is told OK but nothing is sent', async () => {
  const e = env(); sent.length = 0;
  const r = await worker.fetch(req({ ...good, website: 'spam.example' }), e);
  assert.equal(r.status, 200);
  assert.equal(sent.length, 0);
});

await t('missing title or description is refused with a plain message', async () => {
  const e = env();
  const r1 = await worker.fetch(req({ ...good, summary: '' }), e);
  assert.equal(r1.status, 400);
  assert.match((await r1.json()).error, /short title/);
  const r2 = await worker.fetch(req({ ...good, happened: 'no' }), e);
  assert.equal(r2.status, 400);
});

await t('one sender is limited per window; others are not', async () => {
  const e = env();
  for (let i = 0; i < LIMITS.perWindow; i++) assert.equal((await worker.fetch(req(good), e)).status, 200);
  assert.equal((await worker.fetch(req(good), e)).status, 429);
  assert.equal((await worker.fetch(req(good, { ip: '5.5.5.5' }), e)).status, 200);
});

await t('pings and markdown links are neutralized', async () => {
  const p = plain('@everyone see [x](https://evil.example)');
  assert.ok(!p.includes('@everyone'));
  assert.ok(p.includes('\\['));
  const post = discordPost(3, clean({ ...good, happened: '<@123> @here broke it' }), '');
  assert.ok(!post.content.includes('@here'));
  assert.equal(post.applied_tags, undefined);
});

await t('overlong fields are cut to size and the title stays under 100', async () => {
  const r = clean({ ...good, summary: 'x'.repeat(500), happened: 'y'.repeat(5000) });
  assert.equal(r.summary.length, LIMITS.summary);
  assert.equal(r.happened.length, LIMITS.happened);
  const post = discordPost(99999, r, '');
  assert.ok(post.thread_name.length <= 100);
  assert.ok(post.content.length <= 2000);
});

await t('an unknown app name is filed as Other', async () => {
  assert.equal(clean({ ...good, app: 'Hacker Tool' }).app, 'Other');
});

await t('a Discord failure is reported back, not hidden', async () => {
  const e = env();
  const real = globalThis.fetch;
  globalThis.fetch = async () => new Response('no', { status: 500 });
  const r = await worker.fetch(req(good), e);
  globalThis.fetch = real;
  assert.equal(r.status, 502);
});

await t('the section is shown in the post and titled by its last part', async () => {
  const post = discordPost(7, clean({ ...good, app: 'Character Creator', section: 'Creating a character: Skills' }), '');
  assert.equal(post.thread_name, '#7 · Character Creator · Skills · ' + good.summary);
  assert.ok(post.content.includes('**Section:** Creating a character: Skills'));
});

await t('invisible characters are removed, so a report says only what shows', async () => {
  const hidden = [...'ignore this'].map((c) => String.fromCodePoint(0xE0000 + c.charCodeAt(0))).join('');
  const r = clean({ ...good, happened: 'Save​ does‮ nothing' + hidden + '﻿' });
  assert.equal(r.happened, 'Save does nothing');
  assert.equal(clean({ ...good, summary: 'Ti⁦tle⁩' }).summary, 'Title');
});

await t('links in a report are not clickable', async () => {
  assert.equal(defang('see https://evil.example/x and HTTP://a.b'), 'see https[:]//evil.example/x and HTTP[:]//a.b');
  const post = discordPost(9, clean({ ...good, summary: 'Go to https://evil.example', happened: 'Open https://evil.example now', context: 'Page: https://x.example' }), '');
  assert.ok(!/https:\/\//i.test(post.content + post.thread_name));
  assert.ok(post.content.includes('evil.example'));
});

await t('a signup is stored once, lowercased, with where and when', async () => {
  const e = env();
  const r = await worker.fetch(req({ email: '  Fan@Example.COM ', source: 'footer' }, { path: '/subscribe' }), e);
  assert.equal(r.status, 200);
  assert.equal(e.SUBSCRIBERS.map.get('fan@example.com'), '1');
  const first = e.SUBSCRIBERS.meta.get('fan@example.com');
  assert.equal(first.source, 'footer');
  await worker.fetch(req({ email: 'fan@example.com', source: 'store' }, { path: '/subscribe', ip: '9.9.9.9' }), e);
  assert.deepEqual(e.SUBSCRIBERS.meta.get('fan@example.com'), first);
  assert.equal(e.SUBSCRIBERS.map.size, 1);
});

await t('a bad address, a bot or another site is refused, and nothing is stored', async () => {
  const e = env();
  assert.equal((await worker.fetch(req({ email: 'not an email' }, { path: '/subscribe' }), e)).status, 400);
  assert.equal((await worker.fetch(req({ email: 'bot@example.com', website: 'spam' }, { path: '/subscribe' }), e)).status, 200);
  assert.equal((await worker.fetch(req({ email: 'x@example.com' }, { path: '/subscribe', origin: 'https://evil.example' }), e)).status, 403);
  assert.equal(e.SUBSCRIBERS.map.size, 0);
});

await t('signups are rate-limited separately from bug reports', async () => {
  const e = env();
  for (let i = 0; i < LIMITS.perWindow; i++) {
    assert.equal((await worker.fetch(req({ email: `p${i}@example.com` }, { path: '/subscribe' }), e)).status, 200);
  }
  assert.equal((await worker.fetch(req({ email: 'late@example.com' }, { path: '/subscribe' }), e)).status, 429);
  assert.equal((await worker.fetch(req(good), e)).status, 200);
});

await t('a new signup goes to Kit once, unconfirmed, then onto the form', async () => {
  const e = { ...env(), KIT_API_KEY: 'kit_test', KIT_FORM_ID: '42' };
  const before = sent.length;
  await worker.fetch(req({ email: 'Fan@Example.com', source: 'footer' }, { path: '/subscribe' }), e);
  const kit = sent.slice(before);
  assert.equal(kit.length, 2);
  assert.equal(kit[0].url, 'https://api.kit.com/v4/subscribers');
  assert.deepEqual(kit[0].body, { email_address: 'fan@example.com', state: 'inactive' });
  assert.equal(kit[1].url, 'https://api.kit.com/v4/forms/42/subscribers');
  assert.equal(kit[1].body.email_address, 'fan@example.com');
  assert.ok(e.SUBSCRIBERS.meta.get('fan@example.com').kit);
  await worker.fetch(req({ email: 'fan@example.com' }, { path: '/subscribe', ip: '9.9.9.9' }), e);
  assert.equal(sent.length, before + 2);
});

await t('without Kit set up, a signup is only kept', async () => {
  const before = sent.length;
  const e = env();
  assert.equal((await worker.fetch(req({ email: 'solo@example.com' }, { path: '/subscribe' }), e)).status, 200);
  assert.equal(sent.length, before);
  assert.ok(!e.SUBSCRIBERS.meta.get('solo@example.com').kit);
});

await t('the news lists only public, sent issues, newest first, without Kit tags', async () => {
  kitBroadcasts = { pagination: { has_next_page: false }, broadcasts: [
    { id: 1, subject: 'Old news', public: true, published_at: '2026-10-01T10:00:00Z', content: '<p>One</p>', thumbnail_url: 'https://x.example/a.png' },
    { id: 2, subject: 'Private note', public: false, published_at: null, content: '<p>Two</p>' },
    { id: 3, subject: 'New news', public: true, published_at: '2026-11-01T10:00:00Z', content: '<p>Hi {{ subscriber.first_name }}!</p>{% if x %}y{% endif %}', thumbnail_url: 'javascript:alert(1)', email_address: 'a@b.c' },
  ] };
  const issues = await publicIssues({ KIT_API_KEY: 'k' });
  assert.deepEqual(issues.map((i) => i.subject), ['New news', 'Old news']);
  assert.equal(issues[0].html, '<p>Hi !</p>');
  assert.equal(issues[0].image, '');
  assert.equal(issues[1].image, 'https://x.example/a.png');
  assert.ok(!('email_address' in issues[0]));
});

await t('the news is cached, and only this site may read it', async () => {
  const e = { ...env(), KIT_API_KEY: 'k' };
  const before = sent.length;
  const r1 = await worker.fetch(req(null, { method: 'GET', path: '/news' }), e);
  assert.equal(r1.status, 200);
  assert.equal((await r1.json()).issues.length, 2);
  await worker.fetch(req(null, { method: 'GET', path: '/news' }), e);
  assert.equal(sent.length, before + 1);
  assert.equal((await worker.fetch(req(null, { method: 'GET', path: '/news', origin: 'https://evil.example' }), e)).status, 404);
});

await t('playtest feedback is numbered P#, tagged New plus its kind, and posted to its own forum', async () => {
  const e = { ...env(), PLAYTEST_WEBHOOK: 'https://discord.com/api/webhooks/9/pt', PLAYTEST_TAGS: '{"New":"11111","Balance":"22222","Too slow":"33333"}' };
  const before = sent.length;
  const r = await worker.fetch(req({ kind: 'Balance', summary: 'Sprint costs too little Ki', area: 'Movement', happened: 'Everyone sprinted every round.', better: 'Cost 2 Ki', played: 'Oct 3', players: '4', role: 'GM', contact: '@tester' }, { path: '/playtest' }), e);
  assert.equal(r.status, 200);
  assert.equal((await r.json()).ticket, 1);
  const post = sent[before];
  assert.equal(post.url, 'https://discord.com/api/webhooks/9/pt?wait=true');
  assert.equal(post.body.thread_name, 'P#1 · Balance · Sprint costs too little Ki');
  assert.deepEqual(post.body.applied_tags, ['11111', '22222']);
  assert.ok(post.body.content.includes('**Session:** played Oct 3, 4 players, as GM'));
  assert.deepEqual(post.body.allowed_mentions, { parse: [] });
  const r2 = await worker.fetch(req({ kind: 'Too slow', summary: 'x', happened: 'y' }, { path: '/playtest', ip: '5.5.5.5' }), e);
  assert.equal((await r2.json()).ticket, 2);
  assert.equal(e.TICKETS.map.get('ticket:last'), undefined);
});

await t('a session report needs something about the session, other kinds need what happened', async () => {
  assert.ok(cleanFeedback({ kind: 'Session report', summary: 'Round 3 night' }).error);
  assert.ok(!cleanFeedback({ kind: 'Session report', summary: 'Round 3 night', well: 'Fast combat' }).error);
  assert.ok(cleanFeedback({ kind: 'Balance', summary: 'x' }).error);
  assert.ok(cleanFeedback({ kind: 'Made up', summary: 'x', happened: 'y' }).error);
  assert.equal(cleanFeedback({ kind: 'Balance', summary: 'x', happened: 'y', role: 'Boss' }).role, '');
  const p = feedbackPost(3, cleanFeedback({ kind: 'Session report', summary: 'Night', well: 'Fast', dragged: 'Setup' }), '');
  assert.ok(p.content.includes('**What went well**'));
  assert.ok(!p.content.includes('What happened at the table'));
  assert.ok(!('applied_tags' in p));
});

await t('playtest feedback is cleaned like a bug report and refused without its webhook', async () => {
  const p = feedbackPost(4, cleanFeedback({ kind: 'Not fun', summary: 'See https://evil.example', happened: '@everyone look' }), '{}');
  assert.ok(!/https:\/\//.test(p.thread_name + p.content));
  assert.ok(!p.content.includes('@everyone'));
  assert.deepEqual(tagIds('Balance', 'not json'), []);
  const before = sent.length;
  const r = await worker.fetch(req({ kind: 'Balance', summary: 'x', happened: 'y' }, { path: '/playtest' }), env());
  assert.equal(r.status, 500);
  assert.equal(sent.length, before);
});

await t('a playtester application is numbered A#, tagged New, and posted to its own forum', async () => {
  const e = { ...env(), APPLY_WEBHOOK: 'https://discord.com/api/webhooks/8/ap', APPLY_TAGS: '{"New":"44444","Approved":"55555"}' };
  const before = sent.length;
  const good = { credit: 'Annie Average', discord: '@annie_avg', role: 'GM', where: 'Online', experience: 'Played a few', group: '4 friends', why: 'We love horror games.', agree: true };
  const r = await worker.fetch(req(good, { path: '/apply' }), e);
  assert.equal(r.status, 200);
  assert.equal((await r.json()).application, 1);
  const post = sent[before];
  assert.equal(post.url, 'https://discord.com/api/webhooks/8/ap?wait=true');
  assert.equal(post.body.thread_name, 'A#1 · Annie Average · GM');
  assert.deepEqual(post.body.applied_tags, ['44444']);
  assert.ok(post.body.content.includes('**Discord:** annie\\_avg'));
  assert.ok(post.body.content.includes('Agreed to the playtester commitments.'));
  assert.deepEqual(post.body.allowed_mentions, { parse: [] });
  assert.equal(e.TICKETS.map.get('playtest:last'), undefined);
});

await t('an application needs a credit name, a Discord handle, its choices and the agreement', async () => {
  const ok = { credit: 'Tony', discord: 'tough.tony', role: 'Player', where: 'In person', experience: 'Played for years', agree: true };
  assert.ok(!cleanApplication(ok).error);
  assert.ok(cleanApplication({ ...ok, credit: '' }).error);
  assert.ok(cleanApplication({ ...ok, discord: 'has spaces in it' }).error);
  assert.ok(cleanApplication({ ...ok, role: 'Boss' }).error);
  assert.ok(cleanApplication({ ...ok, where: '' }).error);
  assert.ok(cleanApplication({ ...ok, experience: 'Some' }).error);
  assert.ok(cleanApplication({ ...ok, agree: false }).error);
  assert.equal(cleanHandle('@Old#1234'), 'Old#1234');
  assert.equal(cleanHandle('x'), '');
  const p = applicationPost(2, cleanApplication({ ...ok, credit: 'See https://evil.example', why: '@everyone hi' }), '');
  assert.ok(!/https:\/\//.test(p.thread_name + p.content));
  assert.ok(!p.content.includes('@everyone'));
  assert.ok(!('applied_tags' in p));
});

await t('applications are refused without their webhook', async () => {
  const before = sent.length;
  const r = await worker.fetch(req({ credit: 'Tony', discord: 'tough.tony', role: 'Player', where: 'Online', experience: 'Played a few', agree: true }, { path: '/apply', ip: '7.7.7.7' }), env());
  assert.equal(r.status, 500);
  assert.equal(sent.length, before);
});

await t('the webhook is found inside a messy secret', async () => {
  const url = 'https://discord.com/api/webhooks/123/abc-DEF_9';
  assert.equal(webhookFrom('﻿' + url + '\r\n'), url);
  assert.equal(webhookFrom('Bug reports webhook: ' + url + '\nmade 9/29'), url);
  assert.equal(webhookFrom('not a webhook'), '');
});

await t('a missing webhook is refused before anything is sent', async () => {
  const before = sent.length;
  const r = await worker.fetch(req(good), { ...env(), DISCORD_WEBHOOK: 'oops' });
  assert.equal(r.status, 500);
  assert.equal(sent.length, before);
});

console.log(`\n${passed} passed`);
