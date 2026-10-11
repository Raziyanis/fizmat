#!/usr/bin/env python3
"""Проверка ключа веб-ресурса 8.1.4.5 настоящим Python.
- Образец решения каждой задачи выполняется на всех 8 тестах и сравнивается с ответом, который считает JS.
- В образце есть все обязательные инструкции (CODE.missing пуст), казахская и русская версии дают те же тесты.
- Неверные решения (без break, с break вместо continue и т. п.) отклоняются проверкой инструкций.
Запуск: python3 tools/check.py [число_вариантов]"""
import json, pathlib, subprocess, sys, io, contextlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
N = int(sys.argv[1]) if len(sys.argv) > 1 else 300
JS = """
const vm = require('vm'), fs = require('fs');
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(%r, 'utf8'), ctx);
const C = ctx.window.CODE, out = [];
for (let s = 1; s <= %d; s++) { const seed = s * 2654435761 >>> 0;
  const ru = C.generate(seed, 'ru'), kz = C.generate(seed, 'kz');
  out.push({ ru, kz, miss: ru.map(t => C.missing(t.solution, t.need)) }); }
const probes = {
  noElse: C.missing('for x in a:\\n    if x:\\n        break\\nif not f:\\n    print(1)', ['break', 'else']),
  ifElse: C.missing('for x in a:\\n    if x:\\n        break\\n    else:\\n        pass', ['else']),
  whileElse: C.missing('while x:\\n    x -= 1\\n    if x == 3:\\n        break\\nelse:\\n    print(0)', ['break', 'else']),
  comment: C.missing('# break continue\\nprint("break")', ['break', 'continue']),
  sameUpper: C.sameOutput('yes\\n', 'YES') && !C.sameOutput('1 2', '1 2 3'),
};
process.stdout.write(JSON.stringify({ out, probes }));
""" % (str(ROOT / 'tasks.js'), N)


def tokens(s):
    return [x.upper() for x in re.sub(r"[\[\],'\"()]", ' ', s).split()]


def run(code, inp):
    lines = iter(inp.split('\n'))
    buf = io.StringIO()
    with contextlib.redirect_stdout(buf):
        exec(code, {'input': lambda *a: next(lines)})
    return buf.getvalue()


def main():
    d = json.loads(subprocess.check_output(['node', '-e', JS]))
    p = d['probes']
    assert p['noElse'] == ['else'] and p['ifElse'] == ['else'] and p['whileElse'] == [] and p['comment'] == ['break', 'continue'] and p['sameUpper'], p
    nt = 0
    for v in d['out']:
        assert len(v['ru']) == 13 and [t['level'] for t in v['ru']] == ['A'] * 4 + ['B'] * 3 + ['C'] * 6
        assert all(m == [] for m in v['miss']), v['miss']
        for a, b in zip(v['ru'], v['kz']):
            assert a['tests'] == b['tests'] and a['solution'] == b['solution'] and a['need'] == b['need'] and a['text'] != b['text']
        for t in v['ru']:
            assert len(t['tests']) == 8 and all(tc['output'].strip() for tc in t['tests']), t['title']
            for tc in t['tests']:
                got = run(t['solution'], tc['input'])
                assert tokens(got) == tokens(tc['output']), (t['title'], tc, got)
                nt += 1
    print(f'OK: {N} вариантов, {nt} тестов — образцы решений (настоящий Python) совпадают с ключом; проверка инструкций работает')


main()
