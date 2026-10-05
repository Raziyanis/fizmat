#!/usr/bin/env python3
"""Раздаточный лист 8.1.4.3: задания и ответы на двух языках (ru, kz).
Все ответы получаются запуском Python, вручную не пишутся. Для задач на код каждое решение (for и while)
проверяется на примерах и на дополнительных тестах: оба решения должны давать одинаковый вывод.
Результат: tools/handout.json (его читает tools/build-docs.js).
Запуск: python3 tools/handout.py"""
import contextlib, io, json, pathlib, random

ROOT = pathlib.Path(__file__).resolve().parent.parent


def run(code, inp=''):
    lines = iter(inp.split('\n')) if inp else iter([])
    out = io.StringIO()
    g = {'input': lambda prompt='': next(lines), '__name__': '__main__'}
    with contextlib.redirect_stdout(out):
        exec(code, g)
    return out.getvalue().rstrip('\n')


def rng(*a):
    return ' '.join(map(str, range(*a))) or None


# 1. range → числа
RANGES = ['range(4)', 'range(2, 7)', 'range(0, 20, 5)', 'range(9, 0, -2)', 'range(3, 3)', 'range(1, 11, 4)']
t1 = []
for r in RANGES:
    nums = list(eval(r))
    t1.append({'range': r, 'nums': ' '.join(map(str, nums)), 'count': len(nums)})

# 2. Что выведет программа
T2 = [
    'for i in range(3, 8):\n    print(i, end=" ")',
    's = 0\nfor i in range(2, 9, 2):\n    s = s + i\nprint(s)',
    'p = 1\nfor i in range(1, 5):\n    p = p * 2\nprint(p)',
    'a = [4, 9, 1, 7]\nk = 0\nfor x in a:\n    if x > 5:\n        k = k + 1\nprint(k)',
    'n = 1\nwhile n < 30:\n    n = n * 3\nprint(n)',
    'n = 7302\nk = 0\nwhile n > 0:\n    if n % 10 == 0:\n        k = k + 1\n    n = n // 10\nprint(k)',
]
t2 = [{'code': c, 'out': run(c)} for c in T2]

# 3. Найди ошибку: (код с ошибкой, исправленный код, объяснение ru, kz). Ожидаемый вывод исправленного кода — из Python.
T3 = [
    ('s = 0\nfor i in range(1, 10):\n    s = s + i\nprint(s)', 's = 0\nfor i in range(1, 11):\n    s = s + i\nprint(s)',
     'Нужна сумма чисел от 1 до 10', '1-ден 10-ға дейінгі сандардың қосындысы керек',
     'range(1, 10) не включает 10. Нужно range(1, 11).', 'range(1, 10) ішіне 10 кірмейді. range(1, 11) керек.'),
    ('i = 1\nwhile i <= 5:\n    print(i * i)', 'i = 1\nwhile i <= 5:\n    print(i * i)\n    i = i + 1',
     'Нужно вывести квадраты чисел от 1 до 5', '1-ден 5-ке дейінгі сандардың квадраттарын шығару керек',
     'i не меняется — бесконечный цикл. Добавить в тело i = i + 1.', 'i өзгермейді — шексіз цикл. Цикл денесіне i = i + 1 қосу керек.'),
    ('a = [2, 5, 3]\nfor x in a:\n    s = 0\n    s = s + x\nprint(s)', 'a = [2, 5, 3]\ns = 0\nfor x in a:\n    s = s + x\nprint(s)',
     'Нужна сумма элементов списка', 'Тізім элементтерінің қосындысы керек',
     's = 0 стоит внутри цикла и обнуляет сумму. Перенести s = 0 до цикла.', 's = 0 цикл ішінде тұр және қосындыны нөлдейді. s = 0-ді цикл алдына шығару керек.'),
]
t3 = []
for bad, good, goal_ru, goal_kz, why_ru, why_kz in T3:
    bad_out = None if 'while' in bad and 'i = i + 1' not in bad else run(bad)
    t3.append({'bad': bad, 'good': good, 'goal': {'ru': goal_ru, 'kz': goal_kz}, 'why': {'ru': why_ru, 'kz': why_kz},
               'bad_out': bad_out, 'good_out': run(good)})

# 4. Перепиши for через while (вывод должен совпасть)
T4 = [
    ('for i in range(1, 6):\n    print(i * 10)', 'i = 1\nwhile i < 6:\n    print(i * 10)\n    i = i + 1'),
    ('for i in range(20, 0, -5):\n    print(i, end=" ")', 'i = 20\nwhile i > 0:\n    print(i, end=" ")\n    i = i - 5'),
]
t4 = []
for f, w in T4:
    assert run(f) == run(w), (f, w)
    t4.append({'for': f, 'while': w, 'out': run(f)})

# 5. Напиши программу: уровни A, B, C. Каждая задача: условие ru/kz, примеры (ввод), решения for и while.
def ints(*xs):
    return '\n'.join(map(str, xs))

T5 = [
    {'level': 'A', 'ru': 'Дано натуральное число n. Выведите в одну строку квадраты чисел от 1 до n.',
     'kz': 'n натурал саны берілген. 1-ден n-ге дейінгі сандардың квадраттарын бір жолға шығарыңыз.',
     'ex': ['5', '3'],
     'for': 'n = int(input())\nfor i in range(1, n + 1):\n    print(i * i, end=" ")',
     'while': 'n = int(input())\ni = 1\nwhile i <= n:\n    print(i * i, end=" ")\n    i = i + 1',
     'gen': lambda r: str(r.randint(1, 15))},
    {'level': 'A', 'ru': 'Дано натуральное число n. Выведите в одну строку все нечётные числа от n до 1 (по убыванию).',
     'kz': 'n натурал саны берілген. n-нен 1-ге дейінгі барлық тақ сандарды кему ретімен бір жолға шығарыңыз.',
     'ex': ['10', '7'],
     'for': 'n = int(input())\nfor i in range(n, 0, -1):\n    if i % 2 == 1:\n        print(i, end=" ")',
     'while': 'n = int(input())\ni = n\nwhile i >= 1:\n    if i % 2 == 1:\n        print(i, end=" ")\n    i = i - 1',
     'gen': lambda r: str(r.randint(1, 30))},
    {'level': 'B', 'ru': 'Сначала вводится n, затем n целых чисел (каждое в отдельной строке). Выведите, сколько среди них положительных.',
     'kz': 'Алдымен n, содан кейін n бүтін сан енгізіледі (әрқайсысы жеке жолда). Олардың ішінде неше оң сан бар екенін шығарыңыз.',
     'ex': [ints(5, 3, -2, 0, 7, -1), ints(3, -5, -6, -7)],
     'for': 'n = int(input())\nk = 0\nfor i in range(n):\n    x = int(input())\n    if x > 0:\n        k = k + 1\nprint(k)',
     'while': 'n = int(input())\nk = 0\ni = 0\nwhile i < n:\n    x = int(input())\n    if x > 0:\n        k = k + 1\n    i = i + 1\nprint(k)',
     'gen': lambda r: (lambda n: ints(n, *[r.randint(-20, 20) for _ in range(n)]))(r.randint(1, 8))},
    {'level': 'B', 'ru': 'В пробирке a бактерий, каждый час их число удваивается. Через сколько часов бактерий станет не меньше 1000?',
     'kz': 'Пробиркада a бактерия бар, әр сағат сайын олардың саны екі есе артады. Неше сағаттан кейін бактерия саны 1000-нан кем болмайды?',
     'ex': ['100', '1000'],
     'for': 'a = int(input())\nh = 0\nfor i in range(1000):\n    if a >= 1000:\n        break\n    a = a * 2\n    h = h + 1\nprint(h)',
     'while': 'a = int(input())\nh = 0\nwhile a < 1000:\n    a = a * 2\n    h = h + 1\nprint(h)',
     'gen': lambda r: str(r.randint(1, 1500))},
    {'level': 'C', 'ru': 'Дано натуральное число n. Выведите число, записанное теми же цифрами в обратном порядке (например, 2026 → 6202).',
     'kz': 'n натурал саны берілген. Сол цифрлармен кері ретпен жазылған санды шығарыңыз (мысалы, 2026 → 6202).',
     'ex': ['2026', '120'],
     'for': 'n = int(input())\nr = 0\nfor i in range(len(str(n))):\n    r = r * 10 + n % 10\n    n = n // 10\nprint(r)',
     'while': 'n = int(input())\nr = 0\nwhile n > 0:\n    r = r * 10 + n % 10\n    n = n // 10\nprint(r)',
     'gen': lambda r: str(r.randint(1, 10 ** r.randint(1, 7)))},
    {'level': 'C', 'ru': 'Вводятся натуральные числа, по одному в строке; ввод заканчивается числом 0. Выведите наибольшее из введённых чисел (0 не учитывается, хотя бы одно число есть).',
     'kz': 'Натурал сандар әр жолға біреуден енгізіледі; енгізу 0 санымен аяқталады. Енгізілген сандардың ең үлкенін шығарыңыз (0 есептелмейді, кемінде бір сан бар).',
     'ex': [ints(4, 17, 9, 0), ints(5, 0)],
     'for': 'm = 0\nfor i in range(1000):\n    x = int(input())\n    if x == 0:\n        break\n    if x > m:\n        m = x\nprint(m)',
     'while': 'm = 0\nx = int(input())\nwhile x != 0:\n    if x > m:\n        m = x\n    x = int(input())\nprint(m)',
     'gen': lambda r: ints(*[r.randint(1, 100) for _ in range(r.randint(1, 10))], 0)},
]
R = random.Random(843)
t5 = []
for t in T5:
    tests = t['ex'] + [t['gen'](R) for _ in range(200)]
    for inp in tests:
        a, b = run(t['for'], inp), run(t['while'], inp)
        assert a.split() == b.split(), (t['ru'], inp, a, b)
    t5.append({'level': t['level'], 'ru': t['ru'], 'kz': t['kz'], 'for': t['for'], 'while': t['while'],
               'ex': [{'in': i, 'out': run(t['while'], i).strip()} for i in t['ex']]})

json.dump({'t1': t1, 't2': t2, 't3': t3, 't4': t4, 't5': t5}, open(ROOT / 'tools' / 'handout.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('t1', [x['nums'] for x in t1])
print('t2', [x['out'] for x in t2])
print('t3', [x['good_out'] for x in t3], [x['bad_out'] for x in t3])
print('t4', [x['out'] for x in t4])
print('t5', [[e['out'] for e in x['ex']] for x in t5])
