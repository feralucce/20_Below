// Email signup: one small form, shared by every page that wants one.
//
// Addresses go to the bug relay's /subscribe (tools/bug-relay/), which
// keeps a private copy and hands them to Kit; Kit emails a confirmation
// link, and sent newsletters also appear on news.html.
//
//   import { addSignup } from '/app/signup.js';
//   addSignup(document.getElementById('signup'), { source: 'footer' });

export const SIGNUP_URL = 'https://20below-bugs.20below.workers.dev/subscribe';

// A test page can point the form at a local relay instead.
function signupUrl() {
  return (typeof window !== 'undefined' && window.__SIGNUP_URL__) || SIGNUP_URL;
}

const STYLE_ID = 'signup-style';
const CSS = `
.signup { letter-spacing: normal; font-size: 1rem; line-height: 1.5; max-width: 34rem; margin: 0 auto; padding: 1.1rem 1.25rem; border: 1px solid var(--panel-border, #24404f); border-left: 3px solid var(--accent, #3d84c4); border-radius: 10px; background: var(--panel, #12232e); color: var(--text, #eaf5fb); text-align: left; }
.signup h2 { color: var(--text, #eaf5fb); border: 0; padding: 0; text-align: left; margin: 0 0 0.3rem; font-family: "Bebas Neue", Impact, sans-serif; font-weight: 400; font-size: 1.5rem; letter-spacing: 0.03em; line-height: 1.1; }
.signup p { margin: 0 0 0.7rem; color: var(--text-dim, #8fadbe); font-size: 0.95rem; line-height: 1.45; }
.signup form { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.signup input[type=email] { flex: 1 1 14rem; min-width: 0; font: inherit; font-size: 1rem; color: var(--text, #eaf5fb); background: #0a1720; border: 1px solid var(--panel-border, #24404f); border-radius: 999px; padding: 0.5rem 0.95rem; }
.signup input[type=email]:focus { outline: 2px solid var(--accent, #3d84c4); outline-offset: 1px; }
.signup button { font: inherit; font-size: 0.95rem; font-weight: 600; cursor: pointer; border: 0; border-radius: 999px; padding: 0.5rem 1.2rem; background: var(--accent, #3d84c4); color: #fff; }
.signup button:disabled { opacity: 0.6; cursor: default; }
.signup .fine { margin: 0.6rem 0 0; font-size: 0.8rem; }
.signup .status { margin: 0.6rem 0 0; font-size: 0.92rem; }
.signup .status.error { color: #ff9b8a; }
.signup .status.done { color: #7fd6a4; }
.site-footer .signup { margin-bottom: 1.4rem; }
.signup .hp { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }
`;

function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = CSS;
  document.head.appendChild(style);
}

export function addSignup(container, {
  source = 'site',
  heading = 'Get 20 Below News',
  text = 'Playtest rounds, new releases, and word when print is ready. Only 20 Below news, and your address is never shared.',
} = {}) {
  if (!container) return null;
  ensureStyle();

  const box = document.createElement('section');
  box.className = 'signup';
  box.setAttribute('aria-labelledby', 'signup-heading-' + source);

  const h = document.createElement('h2');
  h.id = 'signup-heading-' + source;
  h.textContent = heading;
  const p = document.createElement('p');
  p.textContent = text;

  const form = document.createElement('form');
  form.noValidate = true;
  const email = document.createElement('input');
  email.type = 'email'; email.name = 'email'; email.required = true;
  email.autocomplete = 'email'; email.placeholder = 'you@example.com';
  email.setAttribute('aria-label', 'Email address');
  const hp = document.createElement('input');
  hp.name = 'website'; hp.tabIndex = -1; hp.autocomplete = 'off';
  const hpWrap = document.createElement('div');
  hpWrap.className = 'hp'; hpWrap.setAttribute('aria-hidden', 'true'); hpWrap.append(hp);
  const button = document.createElement('button');
  button.type = 'submit'; button.textContent = 'Notify me';
  form.append(email, hpWrap, button);

  const status = document.createElement('p');
  status.className = 'status'; status.setAttribute('role', 'status');
  const fine = document.createElement('p');
  fine.className = 'fine';
  fine.append('To be taken off the list at any time, email ');
  const mail = document.createElement('a');
  mail.href = 'mailto:20belowrpg@gmail.com?subject=20%20Below%20news%3A%20remove%20me';
  mail.textContent = '20belowrpg@gmail.com';
  fine.append(mail, '.');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const value = email.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      status.className = 'status error';
      status.textContent = 'Please enter a valid email address.';
      email.focus();
      return;
    }
    button.disabled = true;
    status.className = 'status';
    status.textContent = 'Signing you up…';
    try {
      const res = await fetch(signupUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: value, source, website: hp.value }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'The signup could not be sent.');
      status.className = 'status done';
      status.textContent = 'You’re on the list. Thank you!';
      form.hidden = true;
    } catch (err) {
      status.className = 'status error';
      status.textContent = (err && err.message) || 'The signup could not be sent. Please try again later.';
      button.disabled = false;
    }
  });

  box.append(h, p, form, status, fine);
  container.append(box);
  return box;
}
