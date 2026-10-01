// Training courses (training/*.html): makes a course page's pieces
// interactive. The page is plain HTML that reads in order without this;
// the script adds tabs, flip cards, sorting, knowledge checks, the final
// check and a "mark as done" per lesson, remembered in this browser only.
//
// Markup it looks for (see training/playtest.html):
//   .tabs            > .tab-panel[data-tab]          tabs
//   .card            [data-front] [data-back]        flip card (button)
//   .sort-item       [data-answer] + .sort[data-piles="A|B|C"]
//   .kc              [data-correct] [data-right] [data-wrong]
//   .final           [data-pass] [data-pass-msg] with .q[data-correct="1" or "0,2"]
//   .lesson[id]      with a .lesson-done button; .course-toc a[href="#id"]

(function () {
  "use strict";
  const KEY = "training:" + location.pathname;

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch { return {}; }
  }
  function save(state) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private window: fine */ }
  }
  const state = load();
  state.done = state.done || {};

  // Tabs
  let tabsSeen = 0;
  document.querySelectorAll(".tabs").forEach((box) => {
    const panels = [...box.querySelectorAll(".tab-panel")];
    const list = document.createElement("div");
    list.setAttribute("role", "tablist");
    const n = ++tabsSeen;
    panels.forEach((panel, i) => {
      const tab = document.createElement("button");
      tab.type = "button";
      tab.setAttribute("role", "tab");
      tab.id = `tabs${n}-tab${i}`;
      tab.textContent = panel.dataset.tab;
      tab.setAttribute("aria-controls", `tabs${n}-panel${i}`);
      panel.id = `tabs${n}-panel${i}`;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", tab.id);
      list.append(tab);
    });
    const select = (i, focus) => {
      [...list.children].forEach((tab, k) => {
        tab.setAttribute("aria-selected", String(k === i));
        tab.tabIndex = k === i ? 0 : -1;
        panels[k].hidden = k !== i;
      });
      if (focus) list.children[i].focus();
    };
    list.addEventListener("click", (e) => {
      const i = [...list.children].indexOf(e.target.closest("[role=tab]"));
      if (i >= 0) select(i);
    });
    list.addEventListener("keydown", (e) => {
      const i = [...list.children].indexOf(document.activeElement);
      if (i < 0) return;
      if (e.key === "ArrowRight") select((i + 1) % panels.length, true);
      if (e.key === "ArrowLeft") select((i - 1 + panels.length) % panels.length, true);
    });
    box.prepend(list);
    box.classList.add("ready");
    select(0);
  });

  // Flip cards
  document.querySelectorAll(".card").forEach((card) => {
    card.setAttribute("aria-pressed", "false");
    card.addEventListener("click", () => {
      card.setAttribute("aria-pressed", String(card.getAttribute("aria-pressed") !== "true"));
    });
  });

  // Sorting: each item gets one button per pile.
  document.querySelectorAll(".sort").forEach((sort) => {
    const piles = sort.dataset.piles.split("|");
    const items = [...sort.querySelectorAll(".sort-item")];
    const score = document.createElement("p");
    score.className = "sort-score";
    score.setAttribute("aria-live", "polite");
    const update = () => {
      const right = items.filter((it) => it.dataset.got === "right").length;
      score.textContent = `${right} of ${items.length} sorted correctly.`;
    };
    items.forEach((item) => {
      const choices = document.createElement("div");
      choices.className = "choices";
      const result = document.createElement("p");
      result.className = "result";
      result.setAttribute("aria-live", "polite");
      piles.forEach((pile) => {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = pile;
        b.addEventListener("click", () => {
          choices.querySelectorAll("button").forEach((x) => x.classList.remove("right", "wrong"));
          const ok = pile === item.dataset.answer;
          b.classList.add(ok ? "right" : "wrong");
          item.dataset.got = ok ? "right" : "wrong";
          result.className = "result " + (ok ? "right" : "wrong");
          result.textContent = ok ? "Right." : `Not quite. This one goes to ${item.dataset.answer}.`;
          update();
        });
        choices.append(b);
      });
      item.append(choices, result);
    });
    sort.append(score);
    update();
  });

  // Knowledge checks: one question, check, feedback.
  document.querySelectorAll(".kc").forEach((kc) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "check";
    btn.textContent = "Check";
    const result = document.createElement("p");
    result.className = "result";
    result.setAttribute("aria-live", "polite");
    btn.addEventListener("click", () => {
      const picked = kc.querySelector("input:checked");
      if (!picked) { result.className = "result"; result.textContent = "Choose an answer first."; return; }
      const inputs = [...kc.querySelectorAll("input")];
      const ok = String(inputs.indexOf(picked)) === kc.dataset.correct;
      result.className = "result " + (ok ? "right" : "wrong");
      result.textContent = ok ? kc.dataset.right : kc.dataset.wrong;
    });
    kc.append(btn, result);
  });

  // Final check: all questions, one score.
  document.querySelectorAll(".final").forEach((final) => {
    const qs = [...final.querySelectorAll(".q")];
    const pass = Number(final.dataset.pass || qs.length);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "check";
    btn.textContent = "Submit answers";
    const score = document.createElement("div");
    score.className = "score";
    score.hidden = true;
    score.setAttribute("aria-live", "polite");
    btn.addEventListener("click", () => {
      let right = 0;
      qs.forEach((q) => {
        const inputs = [...q.querySelectorAll("input")];
        const want = q.dataset.correct.split(",").map(Number).sort().join(",");
        const got = inputs.map((x, i) => (x.checked ? i : -1)).filter((i) => i >= 0).join(",");
        const ok = got === want;
        if (ok) right++;
        q.classList.toggle("right", ok);
        q.classList.toggle("wrong", !ok);
      });
      const passed = right >= pass;
      score.hidden = false;
      score.innerHTML = "";
      const h = document.createElement("strong");
      h.textContent = `${right} of ${qs.length} right. ${passed ? "You passed!" : `You need ${pass} to pass.`}`;
      const p = document.createElement("p");
      p.style.margin = "0.4rem 0 0";
      p.textContent = passed
        ? (final.dataset.passMsg || "That's the whole course.")
        : "Questions outlined in red need another look. Change your answers and submit again.";
      score.append(h, p);
      if (passed) {
        state.passed = true;
        if (final.id) state.done[final.id] = true;
        save(state);
        paint();
      }
      score.scrollIntoView({ block: "nearest" });
    });
    final.append(btn, score);
  });

  // Mark lessons done, and show it in the contents.
  const toc = document.querySelectorAll(".course-toc a[href^='#']");
  const progress = document.querySelector(".course-progress");
  const lessons = [...document.querySelectorAll(".lesson[id]:not(.final)")];
  function paint() {
    toc.forEach((a) => {
      const id = a.getAttribute("href").slice(1);
      const done = !!state.done[id];
      a.classList.toggle("done", done);
      const tick = a.querySelector(".tick");
      if (tick) tick.textContent = done ? "Done ✓" : "";
    });
    if (progress) {
      const n = lessons.filter((l) => state.done[l.id]).length;
      progress.textContent = `${n} of ${lessons.length} lessons done${state.passed ? ", final check passed" : ""}. Saved in this browser only.`;
    }
  }
  lessons.forEach((lesson) => {
    const b = lesson.querySelector(".lesson-done");
    if (!b) return;
    const set = () => {
      const done = !!state.done[lesson.id];
      b.setAttribute("aria-pressed", String(done));
      b.textContent = done ? "Done ✓" : "Mark this lesson done";
    };
    b.addEventListener("click", () => {
      state.done[lesson.id] = !state.done[lesson.id];
      save(state);
      set();
      paint();
    });
    set();
  });
  paint();
})();
