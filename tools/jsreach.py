# -*- coding: utf-8 -*-
"""Which exports of a shared module does an app actually reach?

app/state.js is staged into four installers and is 1300 lines of mostly
character creator. The Battle Tracker imports five functions out of it and
the Encounter Difficulty Calculator imports one. So "state.js changed"
answers nothing: 181 lines moved in it between prep-v0.2.4 and today and
not one of them was a line either app can run.

check-desktop-drift.py used to ask that question per file, which meant
both apps were flagged for a release on every creator change - the same
crying wolf that made the tool unreadable before, just at a different
granularity. This answers it per export instead: walk the imports out
from an app's own files, expand each imported name to the definitions it
actually depends on, and let the caller compare that set against what
changed.

Deliberately not a JavaScript parser. It reads the shapes this codebase
is written in - top-level `export function`, `const`, `class`, static
`import` - and is honest about the rest: anything it cannot resolve comes
back as UNRESOLVED and the caller is expected to treat that as "assume
reachable" rather than "assume safe". A drift check that guesses wrong in
the direction of silence is worse than no check.
"""
import os
import re

# A module we were told to follow but could not read or parse. The caller
# must fall back to whole-file comparison when it sees one.
UNRESOLVED = "?unresolved"

_LINE_COMMENT = re.compile(r"//.*$")
_STRINGS = re.compile(r"'(?:\\.|[^'\\])*'"
                      r'|"(?:\\.|[^"\\])*"'
                      r"|`(?:\\.|[^`\\])*`")

_DEF = re.compile(
    r"^(?:export\s+)?(?:default\s+)?(?:async\s+)?"
    r"(?:function\*?\s+(?P<fn>[A-Za-z_$][\w$]*)"
    r"|class\s+(?P<cls>[A-Za-z_$][\w$]*)"
    r"|(?:const|let|var)\s+(?P<var>[A-Za-z_$][\w$]*)\s*=)")

_IMPORT = re.compile(
    r"^\s*import\s+(?P<what>[^;]*?)\s+from\s+['\"](?P<spec>[^'\"]+)['\"]",
    re.M)
_BARE_IMPORT = re.compile(r"^\s*import\s+['\"](?P<spec>[^'\"]+)['\"]", re.M)
_NAMED = re.compile(r"\{([^}]*)\}")
_WORD = re.compile(r"[A-Za-z_$][\w$]*")


def _decomment(src):
    """Blank out comments and string bodies, keeping line structure.

    Brace depth is counted on the result, so a `{` inside a string or a
    comment cannot open a block that never closes.
    """
    out = []
    in_block = False
    for line in src.split("\n"):
        if in_block:
            end = line.find("*/")
            if end == -1:
                out.append("")
                continue
            line = " " * (end + 2) + line[end + 2:]
            in_block = False
        while True:
            start = line.find("/*")
            if start == -1:
                break
            end = line.find("*/", start + 2)
            if end == -1:
                line = line[:start]
                in_block = True
                break
            line = line[:start] + " " * (end + 2 - start) + line[end + 2:]
        line = _STRINGS.sub(lambda m: " " * len(m.group(0)), line)
        line = _LINE_COMMENT.sub("", line)
        out.append(line)
    return "\n".join(out)


def definitions(src):
    """Top-level definitions by name, plus everything that is not one.

    Returns (defs, loose). `loose` is module-level code - re-exports, side
    effects, bare statements - which always counts as reachable, because
    nothing has to import it for it to run.
    """
    lines = src.split("\n")
    clean = _decomment(src).split("\n")
    defs, loose = {}, []
    # A doc comment belongs to the thing it documents. Held back until we
    # know what follows, because attributing it to the module instead made
    # every comment rewrite look like a change to module-level code - and
    # module-level code always counts as reachable, so one reworded comment
    # above an unreachable function would have asked four apps for a
    # release.
    pending = []
    i, depth = 0, 0
    while i < len(lines):
        m = _DEF.match(clean[i]) if depth == 0 else None
        if not m:
            if depth == 0:
                if clean[i].strip():
                    loose.extend(pending)
                    pending = []
                    loose.append(lines[i])
                else:
                    pending.append(lines[i])
            depth += clean[i].count("{") - clean[i].count("}")
            i += 1
            continue

        name = m.group("fn") or m.group("cls") or m.group("var")
        start = i - len(pending)
        pending = []
        depth = clean[i].count("{") - clean[i].count("}")
        i += 1
        # A one-line definition never opens a block; a block one runs until
        # the braces close again.
        while i < len(lines) and depth > 0:
            depth += clean[i].count("{") - clean[i].count("}")
            i += 1
        defs[name] = "\n".join(lines[start:i])
        depth = 0
    loose.extend(pending)
    return defs, "\n".join(loose)


def imports(src):
    """Static imports as [(spec, symbols)].

    A namespace or default import yields None for symbols, meaning the
    whole module is in play - there is no way to tell from
    `import * as s` which parts of it get used.
    """
    found = []
    for m in _IMPORT.finditer(src):
        what, spec = m.group("what"), m.group("spec")
        named = _NAMED.search(what)
        before = what[:named.start()] if named else what
        # `import def, { a } from` or `import * as ns from` - the default
        # and namespace forms hide which names are touched.
        if before.strip().strip(",") or not named:
            found.append((spec, None))
            continue
        syms = []
        for part in named.group(1).split(","):
            part = part.strip()
            if not part:
                continue
            # `a as b` - the export's own name is the first one.
            syms.append(part.split()[0])
        found.append((spec, syms))
    for m in _BARE_IMPORT.finditer(src):
        found.append((m.group("spec"), []))
    return found


def _resolve(importer, spec):
    if not spec.startswith("."):
        return None                      # bare specifier: not ours to follow
    path = os.path.normpath(os.path.join(os.path.dirname(importer), spec))
    return path.replace(os.sep, "/")


def _closure(names, defs, loose):
    """Grow a set of names to everything in the module they lean on."""
    seen = set()
    queue = list(names)
    # Module-level code runs regardless, so whatever it mentions is live.
    queue += [w for w in _WORD.findall(_decomment(loose)) if w in defs]
    while queue:
        n = queue.pop()
        if n in seen or n not in defs:
            continue
        seen.add(n)
        body = _decomment(defs[n])
        queue += [w for w in _WORD.findall(body) if w in defs and w not in seen]
    return seen


def reachable(entries, read):
    """Which names of which modules an app can actually run.

    `entries` are the app's own files - the roots. `read(path)` returns a
    module's source or None. Returns {path: set(names)}, where a value of
    None means the whole module is reachable, and the key UNRESOLVED
    appears if anything could not be followed.
    """
    wanted = {}          # path -> set of names, or None for "all of it"
    order = []
    unresolved = False

    def want(path, syms):
        if path not in wanted:
            wanted[path] = set()
            order.append(path)
        if syms is None or wanted[path] is None:
            wanted[path] = None
        else:
            wanted[path] |= set(syms)

    for entry in entries:
        src = read(entry)
        if src is None:
            unresolved = True
            continue
        for spec, syms in imports(src):
            target = _resolve(entry, spec)
            if target:
                want(target, syms)

    # Walk on: a reachable definition may itself import from elsewhere.
    i = 0
    while i < len(order):
        path = order[i]
        i += 1
        src = read(path)
        if src is None:
            unresolved = True
            continue
        defs, loose = definitions(src)
        names = wanted[path]
        live_text = src if names is None else "\n".join(
            [loose] + [defs[n] for n in _closure(names, defs, loose)
                       if n in defs])
        for spec, syms in imports(src):
            target = _resolve(path, spec)
            if not target:
                continue
            if syms is None:
                want(target, None)
                continue
            used = [s for s in syms
                    if re.search(r"\b%s\b" % re.escape(s), live_text)]
            want(target, used)

    out = {}
    for path in order:
        names = wanted[path]
        if names is None:
            out[path] = None
            continue
        src = read(path)
        if src is None:
            out[path] = None
            continue
        defs, loose = definitions(src)
        out[path] = _closure(names, defs, loose)
    if unresolved:
        out[UNRESOLVED] = None
    return out


def changed_names(old_src, new_src):
    """Definitions that differ between two versions of a module.

    Module-level code counts as the pseudo-name '' - a change out there is
    a change to whatever runs on import, and no export owns it.
    """
    old_defs, old_loose = definitions(old_src)
    new_defs, new_loose = definitions(new_src)
    names = set()
    for n in set(old_defs) | set(new_defs):
        if old_defs.get(n) != new_defs.get(n):
            names.add(n)
    if old_loose.strip() != new_loose.strip():
        names.add("")
    return names
