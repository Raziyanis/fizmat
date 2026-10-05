#!/usr/bin/env python3
"""Все примеры кода из теории 8.1.4.3. Каждый пример запускается настоящим Python,
его вывод записывается в tools/examples.json — документ берёт вывод оттуда, вручную ничего не пишется.
Запуск: python3 tools/examples.py"""
import io, contextlib, json, pathlib

EX = {
    'hello3': 'for i in range(3):\n    print("Привет!")',
    'r_stop': 'for i in range(5):\n    print(i)',
    'r_start': 'for i in range(1, 6):\n    print(i)',
    'r_step': 'for i in range(1, 10, 2):\n    print(i)',
    'r_step5': 'for i in range(0, 21, 5):\n    print(i, end=" ")',
    'r_back1': 'for i in range(10, 0, -1):\n    print(i, end=" ")',
    'r_back3': 'for i in range(10, 0, -3):\n    print(i, end=" ")',
    'r_empty': 'for i in range(5, 1):\n    print(i)\nprint("Цикл не выполнился ни разу")',
    'end_demo': 'for i in range(1, 6):\n    print(i, end=" ")\nprint()\nprint("Готово")',
    'use_i': 'for i in range(1, 6):\n    print(i, "в квадрате =", i * i)',
    'n_input': 'n = 4\nfor i in range(1, n + 1):\n    print(i, end=" ")',
    'for_list': 'marks = [5, 4, 3, 5]\nfor x in marks:\n    print(x, end=" ")',
    'for_str': 'for ch in "Python":\n    print(ch, end=" ")',
    'for_index': 'marks = [5, 4, 3, 5]\nfor i in range(len(marks)):\n    print("Индекс", i, "- оценка", marks[i])',
    'change_list': 'a = [3, 7, 2]\nfor i in range(len(a)):\n    a[i] = a[i] * 10\nprint(a)',
    'change_wrong': 'a = [3, 7, 2]\nfor x in a:\n    x = x * 10\nprint(a)',
    'sum': 's = 0\nfor i in range(1, 6):\n    s = s + i\nprint(s)',
    'prod': 'p = 1\nfor i in range(1, 6):\n    p = p * i\nprint(p)',
    'count': 'k = 0\nfor x in range(1, 21):\n    if x % 3 == 0:\n        k = k + 1\nprint(k)',
    'w_count': 'i = 1\nwhile i <= 5:\n    print(i)\n    i = i + 1',
    'w_digits': 'n = 2026\ns = 0\nwhile n > 0:\n    s = s + n % 10\n    n = n // 10\nprint(s)',
    'w_double': 'x = 1\nwhile x < 100:\n    x = x * 2\nprint(x)',
    'w_never': 'x = 10\nwhile x < 5:\n    print(x)\nprint("Условие сразу ложно")',
    'w_input': 's = 0\nx = int(input())\nwhile x != 0:\n    s = s + x\n    x = int(input())\nprint(s)',
    'w_break': 'i = 1\nwhile True:\n    if i * i > 50:\n        break\n    i = i + 1\nprint(i)',
    'for_as_while_for': 'for i in range(1, 10, 3):\n    print(i, end=" ")',
    'for_as_while_while': 'i = 1\nwhile i < 10:\n    print(i, end=" ")\n    i = i + 3',
    'continue': 'for i in range(1, 8):\n    if i % 2 == 0:\n        continue\n    print(i, end=" ")',
    'i_change': 'for i in range(3):\n    print(i, end=" ")\n    i = 100',
}


INPUTS = {'w_input': ['8', '3', '5', '0']}   # что ученик вводит с клавиатуры


def run(code, inputs=()):
    it = iter(inputs)
    buf = io.StringIO()
    with contextlib.redirect_stdout(buf):
        exec(code, {'input': lambda *a: next(it)})
    return buf.getvalue().rstrip('\n')


def trace_sum():
    rows, s = [], 0
    for i in range(1, 6):
        s = s + i
        rows.append([str(len(rows) + 1), str(i), str(s)])
    return rows


def trace_digits():
    rows, n, s = [], 2026, 0
    while n > 0:
        cond = 'n > 0 → True'
        d = n % 10
        s = s + d
        rows.append([str(len(rows) + 1), str(n), cond, str(d), str(s), str(n // 10)])
        n = n // 10
    rows.append(['—', str(n), 'n > 0 → False', '—', str(s), 'цикл закончен'])
    return rows


out = {k: {'code': c, 'output': run(c, INPUTS.get(k, ())), 'input': INPUTS.get(k)} for k, c in EX.items()}
out['_trace_sum'] = trace_sum()
out['_trace_digits'] = trace_digits()
out['_ranges'] = [[r, ' '.join(map(str, eval(r))) or '(пусто)', str(len(eval(r)))] for r in
                  ['range(5)', 'range(1, 6)', 'range(2, 10, 2)', 'range(1, 10, 3)', 'range(10, 0, -1)', 'range(10, 0, -2)', 'range(5, 1)', 'range(0)']]
pathlib.Path(__file__).with_name('examples.json').write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding='utf-8')
for k, v in out.items():
    if not k.startswith('_'):
        print(f'{k}: {v["output"]!r}')
print(out['_ranges'])
