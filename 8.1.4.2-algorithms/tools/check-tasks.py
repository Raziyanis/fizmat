#!/usr/bin/env python3
"""Проверка ключа: генерирует задания для многих вариантов (через Node) и выполняет код настоящим Python.
Запуск: python3 tools/check-tasks.py [число_вариантов]"""
import json, pathlib, re, subprocess, sys, io, contextlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
N = int(sys.argv[1]) if len(sys.argv) > 1 else 300

JS = """
const vm = require('vm'), fs = require('fs');
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(%r, 'utf8'), ctx);
const out = [];
for (let s = 1; s <= %d; s++) out.push(ctx.window.TASKS.generate(s * 2654435761 >>> 0).map(t => Object.assign({}, t, { svg: t.svg || null })));
process.stdout.write(JSON.stringify(out));
""" % (str(ROOT / 'tasks.js'), N)


def run(code, inputs=()):
    it = iter(inputs)
    buf = io.StringIO()
    with contextlib.redirect_stdout(buf):
        exec(code, {'input': lambda *a: str(next(it)), '__builtins__': __builtins__})
    return buf.getvalue().strip().replace('\n', ' ')


def main():
    variants = json.loads(subprocess.check_output(['node', '-e', JS]))
    checked = 0
    seen = set()
    for T in variants:
        assert len(T) == 20, len(T)
        for i, t in enumerate(T, 1):
            if t['type'] == 'input' and t.get('code') and i not in (13, 14, 15, 16, 19):
                assert run(t['code']) == t['accept'][0], (i, t['code'], run(t['code']), t['accept'])
            elif i == 5:
                m, k = map(int, re.search(r'y = x \* (\d+).*?y = x \+ (\d+)', t['svg']).groups())
                x = int(re.search(r'x = (\d+)\?', t['text']).group(1))
                assert str(x * m if x > k else x + k) == t['accept'][0], (i, x, k, m)
                assert '&gt; %d<' % k in t['svg']
            elif i == 13:
                for a in t['accept']:
                    code = t['code'].replace('___', a)
                    for p, q in [(3, 8), (8, 3), (5, 5)]:
                        want = max(p, q) if '>' in a else min(p, q)
                        assert run('a=%d\nb=%d\n' % (p, q) + code) == str(want), (i, a, p, q)
            elif i == 14:
                d = int(re.search(r'x % (\d+)', t['code']).group(1))
                code = t['code'].replace('___', t['accept'][0])
                for x in range(1, 40):
                    assert run('x=%d\n' % x + code) == ('да' if x % d == 0 else 'нет')
            elif i == 15:
                code = t['code'].replace('___', t['accept'][0])
                for x, w in [(5, 'положительное'), (0, 'ноль'), (-3, 'отрицательное')]:
                    assert run('x=%d\n' % x + code) == w
            elif i == 16:
                code = t['code'].replace('___', t['accept'][0])
                assert run(code, [21]) == '42'
            elif i == 19:
                nums = [int(v) for v in re.search(r'числа: ([\d, ]+)\.', t['text']).group(1).split(', ')]
                assert len(nums) == 6
                cnt = sum(run(t['code'], [x]) == 'да' for x in nums)
                assert str(cnt) == t['accept'][0], (i, nums, cnt)
            elif i == 17:
                k, m = map(int, re.search(r'значение (\d+)·x \+ (\d+)', t['text']).groups())
                assert run('\n'.join(t['answer']), [7]) == str(7 * k + m)
                assert sorted(t['lines']) == sorted(t['answer']) and t['lines'] != t['answer']
            elif i == 18:
                for o in t['options']:
                    try:
                        compile(o + '\n    pass', 'x', 'exec'); ok = True
                    except SyntaxError:
                        ok = False
                    assert ok == (o == t['answer']), (i, o)
            elif i == 20:
                a, b = map(int, re.search(r'a = (\d+), b = (\d+)', t['text']).groups())
                for it, ans in zip(t['items'], t['answer']):
                    assert str(eval(it['code'], {'a': a, 'b': b})) == ans, (i, it, ans)
            if t['type'] in ('choice', 'match'):
                opts = t['options']
                assert len(set(opts)) == len(opts), (i, opts)
                answers = [t['answer']] if t['type'] == 'choice' else t['answer']
                assert all(a in opts for a in answers), (i, answers, opts)
            seen.add(json.dumps(t.get('accept') or t.get('answer'), ensure_ascii=False) + str(i))
            checked += 1
    print(f'OK: {len(variants)} вариантов, {checked} заданий проверено; разных ответов: {len(seen)}')


if __name__ == '__main__':
    main()
