#!/usr/bin/env python3
"""Проверка ключей всех 7 формативок настоящим Python.
- В каждом варианте 10 заданий: 1–5 тест (4 разных варианта ответа), 6–10 программа (8 тестов).
- Тест с кодом: код выполняется, его вывод совпадает с вариантом-ключом и не совпадает ни с одним неверным вариантом.
- Программа: образец решения проходит все 8 тестов, обязательные инструкции на месте (CODE.missing пуст).
- Казахская и русская версии одного варианта дают одинаковые тесты, ключи и решения.
Запуск: python3 tools/check.py [число_вариантов]"""
import json, pathlib, subprocess, sys, io, contextlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
N = int(sys.argv[1]) if len(sys.argv) > 1 else 200
JS = """
const vm = require('vm'), fs = require('fs');
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(%r, 'utf8'), ctx);
vm.runInNewContext(fs.readFileSync(%r, 'utf8'), ctx);
const C = ctx.window.CODE, out = [];
for (let s = 1; s <= %d; s++) { const seed = s * 2654435761 >>> 0;
  const ru = C.generate(seed, 'ru'), kz = C.generate(seed, 'kz');
  out.push({ retried: ru.retried || 0, ru, kz, miss: ru.map(t => t.kind === 'code' ? C.missing(t.solution, t.need) : []) }); }
process.stdout.write(JSON.stringify(out));
"""


def tokens(s):
    return [x.upper() for x in re.sub(r"[\[\],'\"()]", ' ', s).split()]


def run(code, inp=''):
    lines = iter(inp.split('\n'))
    buf = io.StringIO()
    with contextlib.redirect_stdout(buf):
        exec(code, {'input': lambda *a: next(lines)})
    return buf.getvalue()


def norm(s):
    return '\n'.join(l.rstrip() for l in s.strip().split('\n'))


def main():
    total = 0
    for tdir in sorted((ROOT / 'topics').iterdir()):
        js = JS % (str(tdir / 'topic.js'), str(ROOT / 'engine' / 'common.js'), N)
        data = json.loads(subprocess.check_output(['node', '-e', js]))
        nq = nc = 0
        for v in data:
            ru, kz = v['ru'], v['kz']
            assert not v['retried'], (tdir.name, 'совпали варианты ответа, понадобилось другое зерно')
            assert [t['kind'] for t in ru] == ['quiz'] * 5 + ['code'] * 5, tdir.name
            assert all(m == [] for m in v['miss']), (tdir.name, v['miss'])
            for a, b in zip(ru, kz):
                if a['kind'] == 'code':
                    assert a['tests'] == b['tests'] and a['solution'] == b['solution'] and a.get('need') == b.get('need'), (tdir.name, a['title'])
                else:
                    assert a['answer'] == b['answer'] and a.get('code') == b.get('code'), (tdir.name, a['title'])
            for t in ru:
                if t['kind'] == 'quiz':
                    o = t['options']
                    assert len(o) == 4 and len(set(o)) == 4 and 0 <= t['answer'] < 4, (tdir.name, t['title'], o)
                    ch = t.get('check')
                    if ch:
                        got = run(ch['code'], ch.get('input', ''))
                        got = str(got.count(ch['count'])) if ch.get('count') else norm(got)
                        assert got == norm(o[t['answer']]), (tdir.name, t['title'], t.get('code'), got, o[t['answer']])
                        assert all(norm(w) != got for k, w in enumerate(o) if k != t['answer']), (tdir.name, t['title'], o)
                        nq += 1
                else:
                    assert len(t['tests']) == 8 and all(tc['output'].strip() for tc in t['tests']), (tdir.name, t['title'])
                    for tc in t['tests']:
                        got = run(t['solution'], tc['input'])
                        assert tokens(got) == tokens(tc['output']), (tdir.name, t['title'], tc, got)
                        nc += 1
        total += nq + nc
        print(f'{tdir.name}: {N} вариантов — {nq} тестов с кодом и {nc} прогонов программ совпали с ключом')
    print(f'OK: всего {total} проверок настоящим Python')


main()
