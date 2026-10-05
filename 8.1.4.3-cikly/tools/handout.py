#!/usr/bin/env python3
"""Раздаточный лист 8.1.4.3: четыре варианта (I–IV), задания и ответы на двух языках (ru, kz).
Варианты одинаковы по структуре и трудности, но программы и числа в них разные — соседи по парте получают разные листы.
Все ответы получаются запуском Python, вручную не пишутся. Для задач на код каждое решение (for и while)
проверяется на примерах и на 200 случайных тестах: оба решения должны давать одинаковый вывод.
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


def ints(*xs):
    return '\n'.join(map(str, xs))


VARIANTS = []


def build(RANGES, T2, T3, T4, T5, NOTE, seed):
    t1 = []
    for r in RANGES:
        nums = list(eval(r))
        t1.append({'range': r, 'nums': ' '.join(map(str, nums)), 'count': len(nums)})
    t2 = [{'code': c, 'out': run(c)} for c in T2]
    t3 = []
    for bad, good, goal_ru, goal_kz, why_ru, why_kz, infinite in T3:
        t3.append({'bad': bad, 'good': good, 'goal': {'ru': goal_ru, 'kz': goal_kz}, 'why': {'ru': why_ru, 'kz': why_kz},
                   'bad_out': None if infinite else run(bad), 'good_out': run(good)})
    t4 = []
    for f, w in T4:
        assert run(f) == run(w), (f, w)
        t4.append({'for': f, 'while': w, 'out': run(f)})
    R = random.Random(seed)
    t5 = []
    for t in T5:
        for inp in t['ex'] + [t['gen'](R) for _ in range(200)]:
            a, b = run(t['for'], inp), run(t['while'], inp)
            assert a.split() == b.split(), (t['ru'], inp, a, b)
        t5.append({'level': t['level'], 'ru': t['ru'], 'kz': t['kz'], 'for': t['for'], 'while': t['while'],
                   'ex': [{'in': i, 'out': run(t['while'], i).strip()} for i in t['ex']]})
    VARIANTS.append({'t1': t1, 't2': t2, 't3': t3, 't4': t4, 't5': t5, 'note': NOTE})


# ============================ Вариант I ============================
build(
    ['range(4)', 'range(2, 7)', 'range(0, 20, 5)', 'range(9, 0, -2)', 'range(3, 3)', 'range(1, 11, 4)'],
    [
        'for i in range(3, 8):\n    print(i, end=" ")',
        's = 0\nfor i in range(2, 9, 2):\n    s = s + i\nprint(s)',
        'p = 1\nfor i in range(1, 5):\n    p = p * 2\nprint(p)',
        'a = [4, 9, 1, 7]\nk = 0\nfor x in a:\n    if x > 5:\n        k = k + 1\nprint(k)',
        'n = 1\nwhile n < 30:\n    n = n * 3\nprint(n)',
        'n = 7302\nk = 0\nwhile n > 0:\n    if n % 10 == 0:\n        k = k + 1\n    n = n // 10\nprint(k)',
    ],
    [
        ('s = 0\nfor i in range(1, 10):\n    s = s + i\nprint(s)', 's = 0\nfor i in range(1, 11):\n    s = s + i\nprint(s)',
         'Нужна сумма чисел от 1 до 10', '1-ден 10-ға дейінгі сандардың қосындысы керек',
         'range(1, 10) не включает 10. Нужно range(1, 11).', 'range(1, 10) ішіне 10 кірмейді. range(1, 11) керек.', False),
        ('i = 1\nwhile i <= 5:\n    print(i * i)', 'i = 1\nwhile i <= 5:\n    print(i * i)\n    i = i + 1',
         'Нужно вывести квадраты чисел от 1 до 5', '1-ден 5-ке дейінгі сандардың квадраттарын шығару керек',
         'i не меняется — бесконечный цикл. Добавить в тело i = i + 1.', 'i өзгермейді — шексіз цикл. Цикл денесіне i = i + 1 қосу керек.', True),
        ('a = [2, 5, 3]\nfor x in a:\n    s = 0\n    s = s + x\nprint(s)', 'a = [2, 5, 3]\ns = 0\nfor x in a:\n    s = s + x\nprint(s)',
         'Нужна сумма элементов списка', 'Тізім элементтерінің қосындысы керек',
         's = 0 стоит внутри цикла и обнуляет сумму. Перенести s = 0 до цикла.', 's = 0 цикл ішінде тұр және қосындыны нөлдейді. s = 0-ді цикл алдына шығару керек.', False),
    ],
    [
        ('for i in range(1, 6):\n    print(i * 10)', 'i = 1\nwhile i < 6:\n    print(i * 10)\n    i = i + 1'),
        ('for i in range(20, 0, -5):\n    print(i, end=" ")', 'i = 20\nwhile i > 0:\n    print(i, end=" ")\n    i = i - 5'),
    ],
    [
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
    ],
    {'ru': 'Примечание к 5.4: в решении через for используется range(1000) с break — так задаётся «достаточно большое» число повторений; естественнее эта задача решается через while. Примечание к 5.5: 120 → 21 (ведущий ноль у числа не записывается).',
     'kz': '5.4-ке ескерту: for арқылы шешімде break бар range(1000) қолданылады — осылайша «жеткілікті үлкен» қайталану саны беріледі; бұл есеп while арқылы табиғи шығады. 5.5-ке ескерту: 120 → 21 (санның басындағы нөл жазылмайды).'},
    843)

# ============================ Вариант II ============================
build(
    ['range(6)', 'range(3, 9)', 'range(0, 30, 10)', 'range(12, 0, -3)', 'range(8, 2)', 'range(2, 15, 5)'],
    [
        'for i in range(4, 10, 2):\n    print(i, end=" ")',
        's = 0\nfor i in range(1, 8, 3):\n    s = s + i\nprint(s)',
        'p = 1\nfor i in range(3):\n    p = p * 3\nprint(p)',
        'a = [6, 2, 8, 3, 5]\nk = 0\nfor x in a:\n    if x % 2 == 0:\n        k = k + 1\nprint(k)',
        'n = 100\nwhile n > 10:\n    n = n // 2\nprint(n)',
        'n = 4815\ns = 0\nwhile n > 0:\n    if n % 2 == 1:\n        s = s + n % 10\n    n = n // 10\nprint(s)',
    ],
    [
        ('p = 0\nfor i in range(1, 6):\n    p = p * i\nprint(p)', 'p = 1\nfor i in range(1, 6):\n    p = p * i\nprint(p)',
         'Нужно произведение чисел от 1 до 5', '1-ден 5-ке дейінгі сандардың көбейтіндісі керек',
         'Произведение начинается с 0, поэтому всё время равно 0. Нужно p = 1.', 'Көбейтінді 0-ден басталады, сондықтан әрдайым 0-ге тең. p = 1 керек.', False),
        ('i = 10\nwhile i > 0:\n    print(i)\n    i = i + 1', 'i = 10\nwhile i > 0:\n    print(i)\n    i = i - 1',
         'Нужен обратный отсчёт от 10 до 1', '10-нан 1-ге дейін кері санау керек',
         'i увеличивается, условие i > 0 всегда истинно — бесконечный цикл. Нужно i = i - 1.', 'i артып отырады, i > 0 шарты әрқашан ақиқат — шексіз цикл. i = i - 1 керек.', True),
        ('a = [1, 2, 3]\nfor x in a:\n    y = x * 2\nprint(y)', 'a = [1, 2, 3]\nfor x in a:\n    y = x * 2\n    print(y)',
         'Нужно вывести каждое число списка, умноженное на 2', 'Тізімнің әр санын 2-ге көбейтіп шығару керек',
         'print(y) стоит вне цикла и выполняется один раз. Нужен отступ у print(y).', 'print(y) цикл сыртында тұр және бір рет орындалады. print(y)-ке шегініс керек.', False),
    ],
    [
        ('for i in range(2, 11, 2):\n    print(i)', 'i = 2\nwhile i < 11:\n    print(i)\n    i = i + 2'),
        ('for i in range(5, 0, -1):\n    print(i * i, end=" ")', 'i = 5\nwhile i > 0:\n    print(i * i, end=" ")\n    i = i - 1'),
    ],
    [
        {'level': 'A', 'ru': 'Дано натуральное число n. Выведите в одну строку все числа от 1 до n, которые делятся на 3.',
         'kz': 'n натурал саны берілген. 1-ден n-ге дейінгі 3-ке бөлінетін барлық сандарды бір жолға шығарыңыз.',
         'ex': ['10', '3'],
         'for': 'n = int(input())\nfor i in range(3, n + 1, 3):\n    print(i, end=" ")',
         'while': 'n = int(input())\ni = 3\nwhile i <= n:\n    print(i, end=" ")\n    i = i + 3',
         'gen': lambda r: str(r.randint(3, 40))},
        {'level': 'A', 'ru': 'Дано натуральное число n. Выведите сумму всех чётных чисел от 1 до n.',
         'kz': 'n натурал саны берілген. 1-ден n-ге дейінгі барлық жұп сандардың қосындысын шығарыңыз.',
         'ex': ['10', '5'],
         'for': 'n = int(input())\ns = 0\nfor i in range(2, n + 1, 2):\n    s = s + i\nprint(s)',
         'while': 'n = int(input())\ns = 0\ni = 2\nwhile i <= n:\n    s = s + i\n    i = i + 2\nprint(s)',
         'gen': lambda r: str(r.randint(1, 100))},
        {'level': 'B', 'ru': 'Сначала вводится n, затем n целых чисел (каждое в отдельной строке). Выведите сумму чётных чисел среди них.',
         'kz': 'Алдымен n, содан кейін n бүтін сан енгізіледі (әрқайсысы жеке жолда). Олардың ішіндегі жұп сандардың қосындысын шығарыңыз.',
         'ex': [ints(5, 4, 7, 10, 3, 1), ints(3, 1, 3, 5)],
         'for': 'n = int(input())\ns = 0\nfor i in range(n):\n    x = int(input())\n    if x % 2 == 0:\n        s = s + x\nprint(s)',
         'while': 'n = int(input())\ns = 0\ni = 0\nwhile i < n:\n    x = int(input())\n    if x % 2 == 0:\n        s = s + x\n    i = i + 1\nprint(s)',
         'gen': lambda r: (lambda n: ints(n, *[r.randint(-20, 20) for _ in range(n)]))(r.randint(1, 8))},
        {'level': 'B', 'ru': 'Дано натуральное число n. Сколько раз нужно разделить его на 2 нацело (n = n // 2), чтобы получилась 1?',
         'kz': 'n натурал саны берілген. 1 шығуы үшін оны 2-ге неше рет бүтін бөлу керек (n = n // 2)?',
         'ex': ['20', '1'],
         'for': 'n = int(input())\nk = 0\nfor i in range(100):\n    if n == 1:\n        break\n    n = n // 2\n    k = k + 1\nprint(k)',
         'while': 'n = int(input())\nk = 0\nwhile n > 1:\n    n = n // 2\n    k = k + 1\nprint(k)',
         'gen': lambda r: str(r.randint(1, 10 ** 6))},
        {'level': 'C', 'ru': 'Дано натуральное число n. Выведите произведение его цифр, не равных нулю (например, 2306 → 36).',
         'kz': 'n натурал саны берілген. Оның нөлге тең емес цифрларының көбейтіндісін шығарыңыз (мысалы, 2306 → 36).',
         'ex': ['2306', '505'],
         'for': 'n = int(input())\np = 1\nfor i in range(len(str(n))):\n    if n % 10 != 0:\n        p = p * (n % 10)\n    n = n // 10\nprint(p)',
         'while': 'n = int(input())\np = 1\nwhile n > 0:\n    if n % 10 != 0:\n        p = p * (n % 10)\n    n = n // 10\nprint(p)',
         'gen': lambda r: str(r.randint(1, 10 ** r.randint(1, 7)))},
        {'level': 'C', 'ru': 'Вводятся натуральные числа, по одному в строке; ввод заканчивается числом 0. Выведите, сколько среди введённых чисел чётных (0 не учитывается).',
         'kz': 'Натурал сандар әр жолға біреуден енгізіледі; енгізу 0 санымен аяқталады. Енгізілген сандардың ішінде неше жұп сан бар екенін шығарыңыз (0 есептелмейді).',
         'ex': [ints(4, 7, 12, 9, 0), ints(3, 5, 0)],
         'for': 'k = 0\nfor i in range(1000):\n    x = int(input())\n    if x == 0:\n        break\n    if x % 2 == 0:\n        k = k + 1\nprint(k)',
         'while': 'k = 0\nx = int(input())\nwhile x != 0:\n    if x % 2 == 0:\n        k = k + 1\n    x = int(input())\nprint(k)',
         'gen': lambda r: ints(*[r.randint(1, 100) for _ in range(r.randint(0, 10))], 0)},
    ],
    {'ru': 'Примечание к 5.4 и 5.6: в решениях через for используется range(…) с break — так задаётся «достаточно большое» число повторений; естественнее эти задачи решаются через while. Примечание к 5.5: нули пропускаются, поэтому 505 → 25.',
     'kz': '5.4 және 5.6-ға ескерту: for арқылы шешімдерде break бар range(…) қолданылады — осылайша «жеткілікті үлкен» қайталану саны беріледі; бұл есептер while арқылы табиғи шығады. 5.5-ке ескерту: нөлдер өткізіліп жіберіледі, сондықтан 505 → 25.'},
    844)

# ============================ Вариант III ============================
build(
    ['range(7)', 'range(5, 10)', 'range(10, 50, 10)', 'range(15, 0, -4)', 'range(6, 6)', 'range(3, 20, 6)'],
    [
        'for i in range(1, 12, 3):\n    print(i, end=" ")',
        's = 0\nfor i in range(5, 0, -1):\n    s = s + i\nprint(s)',
        'p = 1\nfor i in range(2, 5):\n    p = p * i\nprint(p)',
        'a = [3, 8, 5, 1, 9]\nm = a[0]\nfor x in a:\n    if x < m:\n        m = x\nprint(m)',
        'n = 5\nk = 0\nwhile n < 100:\n    n = n * 2\n    k = k + 1\nprint(k)',
        'n = 1234\nwhile n >= 10:\n    n = n // 10\nprint(n)',
    ],
    [
        ('for i in range(1, 10, 2):\n    print(i, end=" ")', 'for i in range(2, 11, 2):\n    print(i, end=" ")',
         'Нужно вывести чётные числа от 2 до 10', '2-ден 10-ға дейінгі жұп сандарды шығару керек',
         'Начало 1 даёт нечётные числа, а конец 10 не входит. Нужно range(2, 11, 2).', '1-ден бастасақ, тақ сандар шығады, ал соңғы мән 10 кірмейді. range(2, 11, 2) керек.', False),
        ('k = 0\nn = 345\nwhile n > 0:\n    k = k + 1\nprint(k)', 'k = 0\nn = 345\nwhile n > 0:\n    k = k + 1\n    n = n // 10\nprint(k)',
         'Нужно найти количество цифр числа 345', '345 санының цифрлар санын табу керек',
         'n не меняется — бесконечный цикл. Добавить в тело n = n // 10.', 'n өзгермейді — шексіз цикл. Цикл денесіне n = n // 10 қосу керек.', True),
        ('s = 0\nfor i in range(1, 6):\n    s = s + i\n    print(s)', 's = 0\nfor i in range(1, 6):\n    s = s + i\nprint(s)',
         'Нужно вывести только итоговую сумму чисел от 1 до 5', '1-ден 5-ке дейінгі сандардың тек қорытынды қосындысын шығару керек',
         'print(s) стоит внутри цикла и печатает на каждой итерации. Убрать отступ у print(s).', 'print(s) цикл ішінде тұр және әр итерацияда шығарады. print(s)-тің шегінісін алып тастау керек.', False),
    ],
    [
        ('for i in range(3, 16, 3):\n    print(i)', 'i = 3\nwhile i < 16:\n    print(i)\n    i = i + 3'),
        ('for i in range(10, 4, -2):\n    print(i, end=" ")', 'i = 10\nwhile i > 4:\n    print(i, end=" ")\n    i = i - 2'),
    ],
    [
        {'level': 'A', 'ru': 'Дано натуральное число n. Выведите в одну строку кубы чисел от 1 до n.',
         'kz': 'n натурал саны берілген. 1-ден n-ге дейінгі сандардың кубтарын бір жолға шығарыңыз.',
         'ex': ['4', '2'],
         'for': 'n = int(input())\nfor i in range(1, n + 1):\n    print(i * i * i, end=" ")',
         'while': 'n = int(input())\ni = 1\nwhile i <= n:\n    print(i * i * i, end=" ")\n    i = i + 1',
         'gen': lambda r: str(r.randint(1, 15))},
        {'level': 'A', 'ru': 'Дано натуральное число n. Выведите сумму всех чисел от 1 до n, которые делятся на 5.',
         'kz': 'n натурал саны берілген. 1-ден n-ге дейінгі 5-ке бөлінетін барлық сандардың қосындысын шығарыңыз.',
         'ex': ['20', '4'],
         'for': 'n = int(input())\ns = 0\nfor i in range(5, n + 1, 5):\n    s = s + i\nprint(s)',
         'while': 'n = int(input())\ns = 0\ni = 5\nwhile i <= n:\n    s = s + i\n    i = i + 5\nprint(s)',
         'gen': lambda r: str(r.randint(1, 100))},
        {'level': 'B', 'ru': 'Сначала вводится n, затем n целых чисел (каждое в отдельной строке). Выведите наименьшее из них.',
         'kz': 'Алдымен n, содан кейін n бүтін сан енгізіледі (әрқайсысы жеке жолда). Олардың ең кішісін шығарыңыз.',
         'ex': [ints(4, 7, -3, 5, 0), ints(1, 12)],
         'for': 'n = int(input())\nm = int(input())\nfor i in range(n - 1):\n    x = int(input())\n    if x < m:\n        m = x\nprint(m)',
         'while': 'n = int(input())\nm = int(input())\ni = 1\nwhile i < n:\n    x = int(input())\n    if x < m:\n        m = x\n    i = i + 1\nprint(m)',
         'gen': lambda r: (lambda n: ints(n, *[r.randint(-50, 50) for _ in range(n)]))(r.randint(1, 8))},
        {'level': 'B', 'ru': 'В первый день спортсмен пробежал a км, а каждый следующий день пробегает на 1 км больше. За сколько дней суммарная дистанция станет не меньше 50 км?',
         'kz': 'Спортшы бірінші күні a км жүгірді, ал келесі әр күні 1 км-ге көп жүгіреді. Неше күнде жалпы қашықтық 50 км-ден кем болмайды?',
         'ex': ['5', '50'],
         'for': 'a = int(input())\ns = 0\nd = 0\nfor i in range(100):\n    if s >= 50:\n        break\n    s = s + a\n    a = a + 1\n    d = d + 1\nprint(d)',
         'while': 'a = int(input())\ns = 0\nd = 0\nwhile s < 50:\n    s = s + a\n    a = a + 1\n    d = d + 1\nprint(d)',
         'gen': lambda r: str(r.randint(1, 60))},
        {'level': 'C', 'ru': 'Дано натуральное число n. Выведите, сколько в нём чётных цифр (например, 2468 → 4, 135 → 0).',
         'kz': 'n натурал саны берілген. Онда неше жұп цифр бар екенін шығарыңыз (мысалы, 2468 → 4, 135 → 0).',
         'ex': ['2026', '135'],
         'for': 'n = int(input())\nk = 0\nfor i in range(len(str(n))):\n    if n % 10 % 2 == 0:\n        k = k + 1\n    n = n // 10\nprint(k)',
         'while': 'n = int(input())\nk = 0\nwhile n > 0:\n    if n % 10 % 2 == 0:\n        k = k + 1\n    n = n // 10\nprint(k)',
         'gen': lambda r: str(r.randint(1, 10 ** r.randint(1, 7)))},
        {'level': 'C', 'ru': 'Вводятся натуральные числа, по одному в строке; ввод заканчивается числом 0. Выведите сумму тех чисел, которые больше 10.',
         'kz': 'Натурал сандар әр жолға біреуден енгізіледі; енгізу 0 санымен аяқталады. 10-нан үлкен сандардың қосындысын шығарыңыз.',
         'ex': [ints(5, 12, 30, 10, 0), ints(3, 0)],
         'for': 's = 0\nfor i in range(1000):\n    x = int(input())\n    if x == 0:\n        break\n    if x > 10:\n        s = s + x\nprint(s)',
         'while': 's = 0\nx = int(input())\nwhile x != 0:\n    if x > 10:\n        s = s + x\n    x = int(input())\nprint(s)',
         'gen': lambda r: ints(*[r.randint(1, 30) for _ in range(r.randint(0, 10))], 0)},
    ],
    {'ru': 'Примечание к 5.4 и 5.6: в решениях через for используется range(…) с break — так задаётся «достаточно большое» число повторений; естественнее эти задачи решаются через while. В 5.5 цифра 0 тоже чётная: 2026 → 4 (цифры 2, 0, 2, 6).',
     'kz': '5.4 және 5.6-ға ескерту: for арқылы шешімдерде break бар range(…) қолданылады — осылайша «жеткілікті үлкен» қайталану саны беріледі; бұл есептер while арқылы табиғи шығады. 5.5-те 0 цифры да жұп: 2026 → 4 (2, 0, 2, 6 цифрлары).'},
    845)

# ============================ Вариант IV ============================
build(
    ['range(3)', 'range(6, 12)', 'range(1, 20, 6)', 'range(20, 0, -6)', 'range(10, 1)', 'range(0, 9, 2)'],
    [
        'for i in range(9, 2, -2):\n    print(i, end=" ")',
        's = 0\nfor i in range(3, 13, 3):\n    s = s + i\nprint(s)',
        'p = 1\nfor i in range(1, 4):\n    p = p * 5\nprint(p)',
        'a = [7, 2, 7, 4, 7]\nk = 0\nfor x in a:\n    if x == 7:\n        k = k + 1\nprint(k)',
        'n = 0\ns = 0\nwhile s < 20:\n    n = n + 1\n    s = s + n\nprint(n)',
        'n = 352\np = 1\nwhile n > 0:\n    p = p * (n % 10)\n    n = n // 10\nprint(p)',
    ],
    [
        ('k = 0\nfor i in range(1, 21):\n    if i % 4 == 0:\n        k = 1\nprint(k)', 'k = 0\nfor i in range(1, 21):\n    if i % 4 == 0:\n        k = k + 1\nprint(k)',
         'Нужно найти, сколько чисел от 1 до 20 делятся на 4', '1-ден 20-ға дейінгі сандардың нешеуі 4-ке бөлінетінін табу керек',
         'k = 1 не увеличивает счётчик, а каждый раз записывает 1. Нужно k = k + 1.', 'k = 1 санауышты арттырмайды, әр жолы 1 жазады. k = k + 1 керек.', False),
        ('i = 1\nwhile i < 10:\n    print(i)\ni = i + 2', 'i = 1\nwhile i < 10:\n    print(i)\n    i = i + 2',
         'Нужно вывести нечётные числа от 1 до 9', '1-ден 9-ға дейінгі тақ сандарды шығару керек',
         'Строка i = i + 2 без отступа — она не в теле цикла, i не меняется, цикл бесконечный. Нужен отступ.', 'i = i + 2 жолында шегініс жоқ — ол цикл денесіне кірмейді, i өзгермейді, цикл шексіз. Шегініс керек.', True),
        ('a = [5, 3, 8]\nfor x in a:\n    x = x + 1\nprint(a)', 'a = [5, 3, 8]\nfor i in range(len(a)):\n    a[i] = a[i] + 1\nprint(a)',
         'Нужно увеличить каждый элемент списка на 1', 'Тізімнің әр элементін 1-ге арттыру керек',
         'Изменение x не меняет список. Нужен перебор по индексам: for i in range(len(a)): a[i] = a[i] + 1.', 'x-ті өзгерту тізімді өзгертпейді. Индекстер бойынша іріктеу керек: for i in range(len(a)): a[i] = a[i] + 1.', False),
    ],
    [
        ('for i in range(1, 10, 4):\n    print(i)', 'i = 1\nwhile i < 10:\n    print(i)\n    i = i + 4'),
        ('for i in range(30, 0, -10):\n    print(i, end=" ")', 'i = 30\nwhile i > 0:\n    print(i, end=" ")\n    i = i - 10'),
    ],
    [
        {'level': 'A', 'ru': 'Дано натуральное число n. Выведите в одну строку все числа от n до 2n включительно.',
         'kz': 'n натурал саны берілген. n-нен 2n-ге дейінгі (2n қоса) барлық сандарды бір жолға шығарыңыз.',
         'ex': ['4', '1'],
         'for': 'n = int(input())\nfor i in range(n, 2 * n + 1):\n    print(i, end=" ")',
         'while': 'n = int(input())\ni = n\nwhile i <= 2 * n:\n    print(i, end=" ")\n    i = i + 1',
         'gen': lambda r: str(r.randint(1, 20))},
        {'level': 'A', 'ru': 'Дано натуральное число n. Выведите сумму всех нечётных чисел от 1 до n.',
         'kz': 'n натурал саны берілген. 1-ден n-ге дейінгі барлық тақ сандардың қосындысын шығарыңыз.',
         'ex': ['10', '1'],
         'for': 'n = int(input())\ns = 0\nfor i in range(1, n + 1, 2):\n    s = s + i\nprint(s)',
         'while': 'n = int(input())\ns = 0\ni = 1\nwhile i <= n:\n    s = s + i\n    i = i + 2\nprint(s)',
         'gen': lambda r: str(r.randint(1, 100))},
        {'level': 'B', 'ru': 'Сначала вводится n, затем n целых чисел (каждое в отдельной строке). Выведите, сколько среди них чисел, делящихся на 3.',
         'kz': 'Алдымен n, содан кейін n бүтін сан енгізіледі (әрқайсысы жеке жолда). Олардың ішінде 3-ке бөлінетін неше сан бар екенін шығарыңыз.',
         'ex': [ints(5, 9, 4, 12, 7, 3), ints(2, 1, 2)],
         'for': 'n = int(input())\nk = 0\nfor i in range(n):\n    x = int(input())\n    if x % 3 == 0:\n        k = k + 1\nprint(k)',
         'while': 'n = int(input())\nk = 0\ni = 0\nwhile i < n:\n    x = int(input())\n    if x % 3 == 0:\n        k = k + 1\n    i = i + 1\nprint(k)',
         'gen': lambda r: (lambda n: ints(n, *[r.randint(-30, 30) for _ in range(n)]))(r.randint(1, 8))},
        {'level': 'B', 'ru': 'Дано натуральное число n. Выведите в одну строку все степени двойки (1, 2, 4, 8, …), которые не больше n.',
         'kz': 'n натурал саны берілген. n-нен аспайтын екінің барлық дәрежелерін (1, 2, 4, 8, …) бір жолға шығарыңыз.',
         'ex': ['20', '1'],
         'for': 'n = int(input())\np = 1\nfor i in range(100):\n    if p > n:\n        break\n    print(p, end=" ")\n    p = p * 2',
         'while': 'n = int(input())\np = 1\nwhile p <= n:\n    print(p, end=" ")\n    p = p * 2',
         'gen': lambda r: str(r.randint(1, 10 ** 6))},
        {'level': 'C', 'ru': 'Дано натуральное число n. Выведите сумму его первой и последней цифры (например, 2026 → 8, 7 → 14).',
         'kz': 'n натурал саны берілген. Оның бірінші және соңғы цифрларының қосындысын шығарыңыз (мысалы, 2026 → 8, 7 → 14).',
         'ex': ['2026', '7'],
         'for': 'n = int(input())\nlast = n % 10\nfor i in range(len(str(n)) - 1):\n    n = n // 10\nprint(n + last)',
         'while': 'n = int(input())\nlast = n % 10\nwhile n >= 10:\n    n = n // 10\nprint(n + last)',
         'gen': lambda r: str(r.randint(1, 10 ** r.randint(1, 7)))},
        {'level': 'C', 'ru': 'Вводятся натуральные числа, по одному в строке; ввод заканчивается числом 0. Выведите через пробел количество введённых чисел и их сумму (0 не учитывается).',
         'kz': 'Натурал сандар әр жолға біреуден енгізіледі; енгізу 0 санымен аяқталады. Енгізілген сандардың санын және қосындысын бос орын арқылы шығарыңыз (0 есептелмейді).',
         'ex': [ints(4, 6, 10, 0), ints(0)],
         'for': 'k = 0\ns = 0\nfor i in range(1000):\n    x = int(input())\n    if x == 0:\n        break\n    k = k + 1\n    s = s + x\nprint(k, s)',
         'while': 'k = 0\ns = 0\nx = int(input())\nwhile x != 0:\n    k = k + 1\n    s = s + x\n    x = int(input())\nprint(k, s)',
         'gen': lambda r: ints(*[r.randint(1, 100) for _ in range(r.randint(0, 10))], 0)},
    ],
    {'ru': 'Примечание к 5.4 и 5.6: в решениях через for используется range(…) с break — так задаётся «достаточно большое» число повторений; естественнее эти задачи решаются через while. В 5.5 у однозначного числа первая и последняя цифра совпадают: 7 → 14.',
     'kz': '5.4 және 5.6-ға ескерту: for арқылы шешімдерде break бар range(…) қолданылады — осылайша «жеткілікті үлкен» қайталану саны беріледі; бұл есептер while арқылы табиғи шығады. 5.5-те бір таңбалы санның бірінші және соңғы цифры бірдей: 7 → 14.'},
    846)

# Варианты не должны повторять друг друга
for key, f in [('t1', 'range'), ('t2', 'code'), ('t3', 'bad'), ('t4', 'for'), ('t5', 'ru')]:
    allv = [x[f] for v in VARIANTS for x in v[key]]
    assert len(allv) == len(set(allv)), ('повтор в ' + key)

json.dump({'variants': VARIANTS}, open(ROOT / 'tools' / 'handout.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
for n, v in enumerate(VARIANTS, 1):
    print('Вариант', n)
    print(' t1', [x['nums'] for x in v['t1']])
    print(' t2', [x['out'] for x in v['t2']])
    print(' t3', [x['good_out'] for x in v['t3']], [x['bad_out'] for x in v['t3']])
    print(' t4', [x['out'] for x in v['t4']])
    print(' t5', [[e['out'] for e in x['ex']] for x in v['t5']])
