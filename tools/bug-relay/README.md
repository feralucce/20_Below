# Bug relay

Every 20 Below tool has a **Report a bug** button. It opens a short form (`app/bug-report.js`) and sends the report here. This Cloudflare Worker checks the report, numbers it, and posts it to the team's Discord forum channel.

- **Each forum post is a ticket,** titled `#12 · Battle Tracker · Initiative doesn't sort`.
- **Tags are the status:** New, Confirmed, Fixed, Won't fix. Change them by hand.
- **The post's thread is where the team discusses it.**

The Discord webhook address stays secret inside the Worker. The Worker also:

- refuses pages not on the allowed list
- limits each sender to 5 reports every 10 minutes
- quietly drops reports from bots that fill in a hidden field
- turns off @-pings
- shows reports as plain text

Reports never include a player's character file. The form lists exactly what else is sent.

## One-time setup (Feral)

1. **Discord forum.** In the team server, create a **Forum** channel, for example `#bug-reports`.
   - Add the tags **New**, **Confirmed**, **Fixed** and **Won't fix**.
   - Leave "Require tags" off. A new report arrives untagged, and untagged means new.
2. **Webhook.** Open the forum's **Edit Channel → Integrations → Webhooks → New Webhook**, name it `20 Below Bug Reports`, and **Copy Webhook URL**.
   - Treat that URL like a password. Don't paste it into chat or into any file in this repo.
3. **Cloudflare.** Create a free account at dash.cloudflare.com, then run these from this folder:
   ```
   npx wrangler login
   npx wrangler kv namespace create TICKETS
   ```
   Paste the `id` it prints into `wrangler.toml`, in place of `REPLACE_WITH_KV_NAMESPACE_ID`.
4. **The secret.** Run this, then paste the webhook URL when it asks. It goes straight to Cloudflare.
   ```
   npx wrangler secret put DISCORD_WEBHOOK
   ```
5. **Deploy.**
   ```
   npx wrangler deploy
   ```
   It prints the Worker's address, for example `https://20below-bugs.<your-name>.workers.dev`.
6. **Switch the apps on.** In `app/bug-report.js`, set `BUG_RELAY_URL` to that address plus `/report`. Then:
   - run `python tools/stamp-app-modules.py`
   - commit and push
   - run both extension syncs
   - include it in the next desktop releases

Until step 6, the button still opens the form, but it offers **Copy report** instead of sending.

## Test

```
node tools/bug-relay/test.mjs
```

This runs the Worker against a fake Discord and a fake KV store. Nothing leaves your machine.

## Changing the rules

`ALLOWED_ORIGINS` in `wrangler.toml` lists the pages that may send reports:

- the website
- both Owlbear extensions, which share `feralucce.github.io`
- the desktop apps
- the local preview on port 8792

Size limits and the rate limit are set in `LIMITS` at the top of `worker.js`. After changing either file, run `npx wrangler deploy` again.

## Email signups

The site's "Get 20 Below News" box (`app/signup.js`, in the footer of
every page and on the home page) posts to `/subscribe` on this Worker.
Addresses are kept in the `SUBSCRIBERS` KV namespace until the team
picks a newsletter service: the key is the address, and its metadata is
where it came from and when. Nothing else is stored. Signups have the
same origin check, honeypot and rate limit as reports (a separate
limit, so neither uses up the other).

To move the list into a newsletter service (MailerLite, Kit, Buttondown
and others all import CSV):

```
node export-subscribers.mjs
```

That writes `subscribers.csv` here (email, source, signed_up). It holds
people's addresses: `*.csv` is git-ignored in this folder, and the file
should be deleted once the import is done.

Removal requests come by email (the address is shown under the form).
Delete one with:

```
npx wrangler kv key delete "person@example.com" --binding SUBSCRIBERS --remote
```
