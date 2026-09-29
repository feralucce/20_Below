// Tests for the bug relay, with a fake KV store and a fake Discord.
//   node tools/bug-relay/test.mjs
import assert from 'node:assert/strict';
import worker, { clean, plain, discordPost, webhookFrom, LIMITS } from './worker.js';

function fakeKV() {
  const m = new Map();
  return { get: async (k) => m.get(k) ?? null, put: async (k, v) => { m.set(k, v); }, map: m };
}

const sent = [];
globalThis.fetch = async (url, init) => {
  sent.push({ url, body: JSON.parse(init.body) });
  return new Response('{}', { status: 200 });
};

const env = () => ({
  DISCORD_WEBHOOK: 'https://discord.com/api/webhooks/1/abc',
  NEW_TAG_ID: '555',
  ALLOWED_ORIGINS: 'https://20belowrpg.com,https://feralucce.github.io',
  TICKETS: fakeKV(),
});

function req(body, { origin = 'https://20belowrpg.com', ip = '1.2.3.4', method = 'POST', path = '/report' } = {}) {
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
