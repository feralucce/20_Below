import { el } from '../app/ui.js';
import {
  createInitialState,
  importCharacter,
  removeFromRoster,
  setRole,
  setInitiative,
  rollInitiativeFor,
  allInitiativeSet,
  beginCombat,
  setBracket,
  bumpBracket,
  allBracketsDeclared,
  resolveRound,
  currentTurnCombatant,
  advanceTurn,
  endCombat,
  adjustTrack,
  trackStatus,
  saveState,
  loadState,
  clearState,
} from './gm-state.js';

const state = loadState() || createInitialState();
const app = document.getElementById('app');

function render() {
  saveState(state);
  app.innerHTML = '';
  if (state.combat.started) {
    app.appendChild(state.combat.resolutionOrder ? renderResolvingScreen() : renderDeclareScreen());
  } else {
    app.appendChild(renderRosterScreen());
  }
}

// ---- shared bits ----

function trackRow(c, track, label) {
  const key = `current${track}`;
  const max = track === 'Health' ? c.figured['Health Levels'] : c.figured[track];
  const value = c[key];
  const status = trackStatus(track, value, c);
  const critical = value <= 0;
  return el('div', { class: 'stat-track' }, [
    el('span', { class: 'label' }, label),
    el('button', {
      class: 'small-btn',
      text: '−',
      onClick: () => {
        adjustTrack(state, c.id, track, -1);
        render();
      },
    }),
    el('span', { class: `value${critical ? ' critical' : ''}` }, [
      `${value}/${max}`,
      status ? el('span', { class: 'status-tag' }, status) : null,
    ]),
    el('button', {
      class: 'small-btn',
      text: '+',
      disabled: value >= max ? '' : undefined,
      onClick: () => {
        adjustTrack(state, c.id, track, 1);
        render();
      },
    }),
  ]);
}

function statTracks(c) {
  return el('div', { class: 'stat-tracks' }, [
    trackRow(c, 'Health', 'HP'),
    trackRow(c, 'Poise', 'Poise'),
    trackRow(c, 'Sanity', 'San'),
    el('div', { class: 'stat-track' }, [
      el('span', { class: 'label' }, 'Ki'),
      el('span', { class: 'value' }, `${c.currentKi}/${c.figured.Ki}`),
    ]),
  ]);
}

const ROLES = ['PC', 'Ally', 'NPC'];

function roleToggle(c) {
  return el(
    'div',
    { class: 'role-toggle' },
    ROLES.map((role) =>
      el('button', {
        class: `${role.toLowerCase()}${c.role === role ? ` active ${role.toLowerCase()}` : ''}`,
        text: role,
        onClick: () => {
          setRole(state, c.id, role);
          render();
        },
      }),
    ),
  );
}

function roleClass(c) {
  return `role-${c.role.toLowerCase()}`;
}

// ---- Roster screen (import, roles, initiative, and Begin Combat) ----

function renderRosterScreen() {
  const wrap = el('div', {});

  const fileInput = el('input', {
    type: 'file',
    accept: 'application/json,.json',
    multiple: '',
    id: 'importInput',
    style: 'display:none;',
    onChange: (e) => {
      Array.from(e.target.files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            importCharacter(state, reader.result);
          } catch (err) {
            alert(`Couldn't read "${file.name}" as a character JSON export.`);
          }
          render();
        };
        reader.readAsText(file);
      });
      e.target.value = '';
    },
  });

  wrap.append(
    el('div', { class: 'import-row' }, [
      fileInput,
      el('p', {}, 'Import one or more character JSON files, exported from the Character Creator\'s "Download JSON" button. Nothing is created here - only loaded.'),
      el('button', {
        class: 'primary-btn',
        text: 'Import Characters',
        onClick: () => fileInput.click(),
      }),
    ]),
  );

  if (state.roster.length === 0) {
    wrap.appendChild(el('div', { class: 'empty-state' }, 'No one imported yet. Import your PCs, Allies, and NPCs to get started.'));
    return wrap;
  }

  wrap.appendChild(el('h2', { class: 'section-heading' }, 'Roster & Initiative'));

  const grid = el('div', { class: 'roster-grid' });
  state.roster.forEach((c) => {
    const initCell =
      c.role !== 'PC'
        ? el('div', { style: 'display:flex;align-items:center;gap:0.4rem;' }, [
            el('span', { class: 'init-value' }, String(c.initiative ?? '—')),
            el('button', {
              class: 'small-btn',
              text: 'Roll',
              onClick: () => {
                rollInitiativeFor(state, c.id);
                render();
              },
            }),
          ])
        : el('input', {
            class: 'init-input',
            type: 'number',
            value: c.initiative ?? '',
            placeholder: 'Init',
            onInput: (e) => {
              setInitiative(state, c.id, e.target.value);
            },
            onChange: render,
          });

    grid.appendChild(
      el('div', { class: `roster-card ${roleClass(c)}` }, [
        el('span', { class: `roster-name ${roleClass(c)}` }, c.name),
        roleToggle(c),
        initCell,
        statTracks(c),
        el('button', {
          class: 'remove-btn',
          text: '×',
          title: 'Remove from roster',
          onClick: () => {
            removeFromRoster(state, c.id);
            render();
          },
        }),
      ]),
    );
  });
  wrap.appendChild(grid);

  wrap.appendChild(
    el('div', { class: 'footer-actions' }, [
      el('button', {
        class: 'primary-btn',
        text: 'Begin Combat',
        disabled: allInitiativeSet(state) ? undefined : '',
        onClick: () => {
          beginCombat(state);
          render();
        },
      }),
    ]),
  );
  if (!allInitiativeSet(state)) {
    wrap.appendChild(el('p', { class: 'empty-state', style: 'padding:0.5rem;' }, 'Every combatant needs an Initiative before combat can begin.'));
  }

  return wrap;
}

// ---- Declare screen (Action Brackets + Ki pushes, before resolving the round) ----

function bracketButtons(c) {
  const options = ['Fast', 'Normal', 'Slow'];
  return el(
    'div',
    { class: 'bracket-group' },
    options.map((b) =>
      el('button', {
        class: `${b.toLowerCase()}${c.bracket === b ? ' active' : ''}`,
        text: b,
        onClick: () => {
          setBracket(state, c.id, b);
          render();
        },
      }),
    ),
  );
}

function renderDeclareScreen() {
  const wrap = el('div', {});
  wrap.appendChild(el('h2', { class: 'section-heading' }, `Round ${state.combat.round} - Declare Action Brackets`));

  const grid = el('div', { class: 'roster-grid' });
  state.roster.forEach((c) => {
    grid.appendChild(
      el('div', { class: `roster-card ${roleClass(c)}` }, [
        el('span', { class: `roster-name ${roleClass(c)}` }, c.name),
        el('span', { class: 'init-value', title: 'Initiative' }, String(c.initiative)),
        bracketButtons(c),
        c.bracket && c.bracket !== 'Fast'
          ? el('button', {
              class: 'small-btn',
              text: `Push (1 Ki, have ${c.currentKi})`,
              disabled: c.currentKi > 0 ? undefined : '',
              onClick: () => {
                bumpBracket(state, c.id);
                render();
              },
            })
          : null,
        statTracks(c),
      ]),
    );
  });
  wrap.appendChild(grid);

  wrap.appendChild(
    el('div', { class: 'footer-actions' }, [
      el('button', {
        class: 'primary-btn',
        text: 'Resolve Round',
        disabled: allBracketsDeclared(state) ? undefined : '',
        onClick: () => {
          resolveRound(state);
          render();
        },
      }),
      el('button', {
        class: 'ghost-btn',
        text: 'End Combat',
        onClick: () => {
          endCombat(state);
          render();
        },
      }),
    ]),
  );
  if (!allBracketsDeclared(state)) {
    wrap.appendChild(el('p', { class: 'empty-state', style: 'padding:0.5rem;' }, 'Every combatant needs a declared Action Bracket before the round can resolve.'));
  }

  return wrap;
}

// ---- Resolving screen (turn-by-turn cycling through the computed order) ----

function renderResolvingScreen() {
  const wrap = el('div', {});
  const current = currentTurnCombatant(state);
  const isLast = state.combat.turnIndex === state.combat.resolutionOrder.length - 1;

  wrap.appendChild(
    el('div', { class: 'spotlight' }, [
      el('div', { class: 'round-label' }, `Round ${state.combat.round} · Turn ${state.combat.turnIndex + 1} of ${state.combat.resolutionOrder.length}`),
      el('div', { class: `name ${roleClass(current)}` }, current.name),
      el('div', { class: 'meta' }, [
        el('span', { class: `bracket-badge ${current.bracket.toLowerCase()}` }, current.bracket),
        el('span', {}, `Initiative ${current.initiative}`),
        el('span', {}, `${current.role}`),
      ]),
      el('button', {
        class: 'primary-btn next-btn',
        text: isLast ? 'Next → Start New Round' : 'Next →',
        onClick: () => {
          advanceTurn(state);
          render();
        },
      }),
    ]),
  );

  wrap.appendChild(el('h2', { class: 'section-heading' }, 'Turn Order'));
  const grid = el('div', { class: 'roster-grid' });
  state.combat.resolutionOrder.forEach((id, idx) => {
    const c = state.roster.find((x) => x.id === id);
    const isCurrent = idx === state.combat.turnIndex;
    const isDone = idx < state.combat.turnIndex;
    grid.appendChild(
      el('div', { class: `roster-card ${roleClass(c)}${isCurrent ? ' current-turn' : ''}${isDone ? ' done-turn' : ''}` }, [
        el('span', { class: `roster-name ${roleClass(c)}` }, c.name),
        el('span', { class: `bracket-badge ${c.bracket.toLowerCase()}` }, c.bracket),
        el('span', { class: 'init-value', title: 'Initiative' }, String(c.initiative)),
        statTracks(c),
      ]),
    );
  });
  wrap.appendChild(grid);

  wrap.appendChild(
    el('div', { class: 'footer-actions' }, [
      el('button', {
        class: 'ghost-btn',
        text: 'End Combat',
        onClick: () => {
          endCombat(state);
          render();
        },
      }),
    ]),
  );

  return wrap;
}

document.getElementById('resetBtn').addEventListener('click', () => {
  if (!confirm('Clear the entire roster and combat state? This cannot be undone.')) return;
  clearState();
  window.location.reload();
});

render();
