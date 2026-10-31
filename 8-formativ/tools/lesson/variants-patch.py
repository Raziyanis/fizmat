#!/usr/bin/env python3
"""Урок, задачи 4–10: у каждой 7 вариантов (вариант 1 — исходная задача, 2–7 — из ol_variants.py).
Вариант выбирается по классу и фамилии ученика: у соседей разные задачи, у одного ученика набор не меняется.
Ответы примеров считает настоящий Python; все эталоны проверяются на примерах, скрытых и случайных тестах.
Запуск: python3 -I variants-patch.py <урок.html> <выход.html>"""
import sys, json, io, contextlib, subprocess, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from ol_variants import V
src, out = sys.argv[1:3]
s = open(src, encoding='utf-8').read()

def run(code, inp):
    it = iter(inp.split('\n')); buf = io.StringIO()
    with contextlib.redirect_stdout(buf):
        exec(code, {'input': lambda *a: next(it)})
    return buf.getvalue()

# 1) примеры и скрытые тесты — настоящим Python
for t in V:
    t['samples_io'] = []
    for x in t['samples']:
        o = ' '.join(run(t['ref'], x).split())
        assert o, (t['id'], x)
        t['samples_io'].append([x, o])
    for x in t['hidden']:
        assert run(t['ref'], x).split(), (t['id'], x)
# 2) случайные тесты из генераторов (JS) — тоже через Python
js = 'const olRnd=' + r'''(seed) => { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const olInt = (r, lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
const olArr = (r, n, lo, hi) => Array.from({ length: n }, () => olInt(r, lo, hi));
const G = {''' + ','.join('%s: %s' % (json.dumps(t['id']), t['gen']) for t in V) + '''};
const out = {}; for (const id in G) { const r = olRnd(7); out[id] = Array.from({ length: 60 }, () => G[id](r)); }
process.stdout.write(JSON.stringify(out));'''
gens = json.loads(subprocess.check_output(['node', '-e', js]))
nrun = 0
for t in V:
    for x in gens[t['id']]:
        assert run(t['ref'], x).split(), (t['id'], x); nrun += 1

J = lambda x: json.dumps(x, ensure_ascii=False)
def js_task(t, L):
    return ('{ id: %s, slot: %s, stars: %d, name: %s, text: %s, inp: %s, out: %s, samples: %s, hidden: %s, gen: %s, start: %s, ref: %s, hint: %s }'
            % (J(t['id']), J(t['slot']), t['stars'], J(t['name'][L]), J(t['text'][L]), J(t['inp'][L]), J(t['out'][L]),
               J(t['samples_io']), J(t['hidden']), t['gen'], J(t['start']), J(t['ref']), J(t['hint'][L])))
SEL = r'''
/* Варианты задач 4–10: по 7 на каждую, вариант зависит от класса и фамилии ученика */
const OL_EXTRA = [
  %s
];
(function () {
  const who = (typeof me !== "undefined" && me) ? me.cls + "|" + me.name : "";
  const hash = str => { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h; };
  ["A", "B", "C", "D", "E", "F", "G"].forEach((slot, i) => {
    const v = who ? hash(who + "|" + slot) %% 7 : 0;
    if (v > 0) { const t = OL_EXTRA.find(x => x.slot === slot && x.id === slot + (v + 1)); if (t) TASKS_OL[i] = t; }
  });
})();
TASKS_OL.forEach((t, i) => {
  t.no = i + 4;
'''
anchor = 'TASKS_OL.forEach((t, i) => {\n  t.no = i + 4;\n'
parts = s.split(anchor)
assert len(parts) == 3, len(parts)
s = parts[0] + SEL % ',\n  '.join(js_task(t, 'ru') for t in V) + parts[1] + SEL % ',\n  '.join(js_task(t, 'kz') for t in V) + parts[2]
a = '"Задача " + t.no'
assert s.count(a) == 2
s = s.replace(a, '"Задача " + t.no + " · " + t.name')
open(out, 'w', encoding='utf-8').write(s)
print('OK', out, '| задач:', len(V), '| прогонов эталонов на случайных тестах:', nrun)
