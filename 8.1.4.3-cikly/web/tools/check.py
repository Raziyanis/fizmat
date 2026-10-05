#!/usr/bin/env python3
"""Проверка ключа веб-ресурса 8.1.4.3 настоящим Python.
- Задачи на код: образец решения (solution) выполняется на всех 8 тестах и сравнивается с ответом, который считает JS;
  дополнительно — второе решение «другим циклом» (while вместо for и наоборот) должно давать тот же ответ.
- Тест: код в вопросах выполняется, правильный вариант должен совпасть с выводом; отвлекающие варианты — не совпасть.
Запуск: python3 tools/check.py [число_вариантов]"""
import json, pathlib, re, subprocess, sys, io, contextlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
N = int(sys.argv[1]) if len(sys.argv) > 1 else 300
JS = """
const vm = require('vm'), fs = require('fs');
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(%r, 'utf8'), ctx);
vm.runInNewContext(fs.readFileSync(%r, 'utf8'), ctx);
const out = [];
for (let s = 1; s <= %d; s++) { const seed = s * 2654435761 >>> 0;
  const G = (lang) => ({ code: ctx.window.CODE.generate(seed, lang), quizzes: [1, 2, 3].map(n => ctx.window.QUIZ.generate((seed + n * 7919) >>> 0, n - 1, seed, lang)) });
  out.push(Object.assign(G('ru'), { kz: G('kz') })); }
process.stdout.write(JSON.stringify(out));
""" % (str(ROOT / 'tasks.js'), str(ROOT / 'quiz.js'), N)


def tokens(s):
    return re.sub(r"[\[\],'\"()]", ' ', s).split()


def run(code, inp=''):
    lines = iter(inp.split('\n'))
    buf = io.StringIO()
    with contextlib.redirect_stdout(buf):
        exec(code, {'input': lambda *a: next(lines)})
    return buf.getvalue()


def limits():
    import resource
    resource.setrlimit(resource.RLIMIT_AS, (300 * 2**20, 300 * 2**20))


def run_isolated(code):
    """Отдельный процесс с ограничением памяти и времени; None — не завершилась."""
    try:
        p = subprocess.run([sys.executable, '-c', code], capture_output=True, text=True, timeout=2, preexec_fn=limits)
        return p.stdout if p.returncode == 0 else 'ERROR'
    except subprocess.TimeoutExpired:
        return None


def halts(code):
    return run_isolated(code) is not None


# Вторые решения (другим видом цикла) — проверяем, что задачу действительно можно решить и так
ALT = {
    'Числа от a до b': lambda t: 'a, b = map(int, input().split())\ni = a\nwhile i <= b:\n    print(i, end=" ")\n    i = i + %d' % (int(re.search(r'шагом (\d+)', t['title']).group(1)) if 'шагом' in t['title'] else 1),
    'Сумма от 1 до n': lambda t: 'n = int(input())\ns = 0\ni = 1\nwhile i <= n:\n    s = s + i\n    i = i + 1\nprint(s)',
    'Сумма квадратов': lambda t: 'n = int(input())\ns = 0\ni = 1\nwhile i <= n:\n    s = s + i * i\n    i = i + 1\nprint(s)',
    'Таблица умножения': lambda t: 'k = int(input())\ni = 1\nwhile i <= %s:\n    print(k * i, end=" ")\n    i = i + 1' % re.search(r'k · (\d+)\.', t['text']).group(1),
    'Обратный отсчёт': lambda t: 'n = int(input())\nwhile n > 0:\n    print(n, end=" ")\n    n = n - %d' % (2 if 'n − 2' in t['text'] else 1),
    'Факториал': lambda t: 'n = int(input())\np = 1\nwhile n > 1:\n    p = p * n\n    n = n - 1\nprint(p)',
    'Степень числа': lambda t: 'a, n = map(int, input().split())\np = 1\nwhile n > 0:\n    p = p * a\n    n = n - 1\nprint(p)',
    'Количество делителей': lambda t: 'n = int(input())\nk = 0\nd = 1\nwhile d <= n:\n    if n % d == 0:\n        k = k + 1\n    d = d + 1\nprint(k)',
    'Сумма делителей': lambda t: 'n = int(input())\nk = 0\nd = 1\nwhile d <= n:\n    if n % d == 0:\n        k = k + d\n    d = d + 1\nprint(k)',
    'Цифры числа': lambda t: 'n = input()\nds = [int(c) for c in n]\n' + ('print(sum(ds))' if 'сумму' in t['text'] else 'print(len([d for d in ds if d % 2 == 0]))' if 'чётных' in t['text'] else 'print(max(ds))'),
    'Числа Фибоначчи': lambda t: 'n = int(input())\nf = [1, 1]\nwhile len(f) < n:\n    f.append(f[-1] + f[-2])\n' + ('print(f[n - 1])' if 'n-е' in t['text'] else 'for x in f[:n]:\n    print(x, end=" ")'),
    'Ввод до нуля': lambda t: 'a = []\nfor _ in range(100):\n    x = int(input())\n    if x == 0:\n        break\n    a.append(x)\n' + ('print(sum(a))' if 'сумму' in t['text'] else 'print(max(a))' if 'наибольшее' in t['text'] else 'print(len([x for x in a if x % 2 == 0]))'),
    'Когда сумма превысит n': lambda t: 'n = int(input())\ns = 0\nfor k in range(1, 10**6):\n    s = s + %sk\n    if s > n:\n        print(k)\n        break' % ('2 * ' if '2 + 4' in t['text'] else ''),
}


def main():
    data = json.loads(subprocess.check_output(['node', '-e', JS]))
    nt = 0
    for vi, v in enumerate(data):
        C, QS = v['code'], v['quizzes']
        # казахская версия: те же числа, код, тесты и тот же номер правильного варианта
        K = v['kz']
        for a, b in zip(C, K['code']):
            assert a['tests'] == b['tests'] and a['solution'] == b['solution'] and a['alt'] == b['alt'] and a['level'] == b['level']
            assert a['text'] != b['text'] or not re.search('[А-Яа-яЁё]', a['text'])
        for qa, qb in zip(QS, K['quizzes']):
            for a, b in zip(qa, qb):
                assert a['type'] == b['type'] and a.get('code') == b.get('code') and len(a['options']) == len(b['options'])
                if a['type'] == 'choice':
                    assert a['options'].index(a['answer']) == b['options'].index(b['answer'])
                else:
                    assert [a['options'].index(x) for x in a['answer']] == [b['options'].index(x) for x in b['answer']]
                    assert [i['code'] for i in a['items']] == [i['code'] for i in b['items']] or a.get('title') != b.get('title')
        assert len(C) == 10 and all(len(Q) == 10 for Q in QS)
        for i in (4, 5, 6):   # вопросы 5–7: в трёх попытках три разные формулировки
            assert len({QS[k][i]['text'] + (QS[k][i].get('code') or '')[:12] for k in range(3)}) == 3, (i + 1, [QS[k][i]['title'] for k in range(3)])
        assert [t['level'] for t in C] == ['A'] * 4 + ['B'] * 3 + ['C'] * 3
        for t in C:
            assert len(t['tests']) == 8 and all(tc['output'].strip() for tc in t['tests'])
            alt = ALT[t['title'] if t['title'] in ALT else re.sub(r' с шагом \d+$', '', t['title'])](t)
            alt2 = t['alt']   # второй образец из tasks.js (показывается ученику в разборе)
            assert ('while' in alt2) != ('while' in t['solution']) or 'while True' in alt2, t['title']
            for tc in t['tests']:
                assert tokens(run(t['solution'], tc['input'])) == tokens(tc['output']), (t['title'], tc)
                assert tokens(run(alt, tc['input'])) == tokens(tc['output']), (t['title'], 'alt', tc)
                assert tokens(run(alt2, '\n'.join(tc['input'].split()) if 'int(input())\nb = int' in alt2 or 'a = int(input())\nn = int' in alt2 else tc['input'])) == tokens(tc['output']), (t['title'], 'alt2', tc)
                nt += 1
        for Q in QS:
            for i, q in enumerate(Q, 1):
                if q['type'] == 'match':
                    assert sorted(q['options']) == sorted(q['answer']) and len(set(q['answer'])) == len(q['answer'])
                    if i == 1:
                        for it, ans in zip(q['items'], q['answer']):
                            assert ' '.join(map(str, eval(it['code']))) == ans
                    continue
                assert len(q['options']) == 4 and len(set(q['options'])) == 4 and q['answer'] in q['options'], (i, q['options'])
                if q.get('code'):
                    out = run(q['code'])
                    if i == 3 or q.get('count'):
                        out = str(len(out.split()))
                    got = ' '.join(out.split())
                    assert got == q['answer'], (i, q['code'], got, q['answer'])
                    for o in q['options']:
                        assert (o == got) == (o == q['answer'])
                if q.get('kind') == 'mod-list' and vi < 5:   # только первый вариант действительно умножает элементы списка
                    for o in q['options']:
                        ok = run_isolated('a = [1, 2, 3]\n' + o + '\nprint(a)') == '[2, 4, 6]\n'
                        assert ok == (o == q['answer']), o
                if q.get('kind') == 'infinite' and vi < 10:
                    for o in q['options']:
                        assert halts(o) == (o != q['answer']), o
    print(f'OK: {N} вариантов; задачи на код — {nt} тестов (образец, второй образец из разбора и независимое решение другим циклом); тест — {N * 30} вопросов (3 попытки на ученика)')


main()
