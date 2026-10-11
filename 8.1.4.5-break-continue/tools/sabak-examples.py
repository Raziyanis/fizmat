#!/usr/bin/env python3
"""Код для раздатки и слайдов 8.1.4.5 → sabak-examples.json. Вывод получен запуском Python, вручную не пишется."""
import io, contextlib, json, pathlib

TRACE = [   # «Что выведет программа?»
    ('for i in range(1, 8):\n    if i == 5:\n        break\n    print(i, end=" ")', ''),
    ('for i in range(1, 8):\n    if i % 3 == 0:\n        continue\n    print(i, end=" ")', ''),
    ('s = 0\nfor x in [5, -2, 7, -1, 3]:\n    if x < 0:\n        continue\n    s = s + x\nprint(s)', ''),
    ('for x in [3, 9, 12]:\n    if x % 2 == 0:\n        print("even", x)\n        break\nelse:\n    print("all odd")', ''),
    ('for x in [3, 9, 15]:\n    if x % 2 == 0:\n        print("even", x)\n        break\nelse:\n    print("all odd")', ''),
    ('n = 10\nwhile n > 0:\n    n = n - 3\n    if n == 4:\n        break\nelse:\n    print("end")\nprint(n)', ''),
    ('k = 0\nwhile True:\n    x = int(input())\n    if x == 0:\n        break\n    k = k + 1\nprint(k)', '4\n7\n0\n5'),
    ('for i in range(1, 4):\n    for j in range(1, 4):\n        if j == 2:\n            break\n        print(i, j)', ''),
]
BUGS = [   # «Найдите ошибку»: (код с ошибкой, исправленный код)
    ('i = 0\nwhile i < 10:\n    if i % 2 == 0:\n        continue\n    print(i)\n    i = i + 1',
     'i = 0\nwhile i < 10:\n    i = i + 1\n    if i % 2 == 0:\n        continue\n    print(i)'),
    ('for x in [1, 3, 5]:\n    if x % 2 == 0:\n        print("found")\n        break\n    else:\n        print("not found")',
     'for x in [1, 3, 5]:\n    if x % 2 == 0:\n        print("found")\n        break\nelse:\n    print("not found")'),
]


def run(code, inp=''):
    it = iter(inp.split('\n'))
    buf = io.StringIO()
    with contextlib.redirect_stdout(buf):
        exec(code, {'input': lambda *a: next(it)})
    return buf.getvalue().rstrip()


out = {'trace': [{'code': c, 'input': i, 'output': run(c, i)} for c, i in TRACE],
       'bugs': [{'code': b, 'fixed': f, 'buggy_output': run(b) if 'while' not in b else None, 'fixed_output': run(f)} for b, f in BUGS]}
p = pathlib.Path(__file__).with_name('sabak-examples.json')
p.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding='utf-8')
for t in out['trace']:
    print(repr(t['output']))
for b in out['bugs']:
    print('bug:', repr(b['buggy_output']), 'fixed:', repr(b['fixed_output']))
