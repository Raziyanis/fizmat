"""Эталонные решения 10 задач acmp.ru (как их напишет ученик 8 класса: циклы for/while, ввод через input()).
Каждая функция solve_<номер>(text) получает входные данные строкой и возвращает ответ строкой — так их удобно проверять."""


def solve_18(text):          # Факториал
    n = int(text)
    f = 1
    for i in range(2, n + 1):
        f = f * i
    return str(f)


def solve_543(text):         # Фальшивые монеты
    n, w, d, p = map(int, text.split())
    s = 0
    for i in range(1, n):    # из корзины i берут i монет
        s = s + i * w
    k = (s - p) // d         # недостача веса = k * d
    return str(k if k > 0 else n)


def solve_317(text):         # Подарки: ириски, мандарины, пряники
    x, y, z, w = map(int, text.split())
    count = 0
    for a in range(w // x + 1):
        for b in range((w - a * x) // y + 1):
            if (w - a * x - b * y) % z == 0:
                count = count + 1
    return str(count)


def solve_42(text):          # Сила драконьей стаи
    n = int(text)
    p = 1
    while n > 4:
        p = p * 3
        n = n - 3
    return str(p * n)


def solve_333(text):         # Общие цифры
    a, b, c = text.split()
    common = []
    for d in '0123456789':
        if d in a and d in b and d in c:
            common.append(d)
    return str(len(common)) + ('\n' + ' '.join(common) if common else '')


def solve_519(text):         # Наименьшее и наибольшее из тех же цифр
    digits = sorted(text.strip())
    big = ''.join(reversed(digits))
    i = 0
    while digits[i] == '0':  # первая ненулевая цифра встаёт в начало
        i = i + 1
    small = digits[i] + ''.join(digits[:i] + digits[i + 1:])
    return small + ' ' + big


def solve_447(text):         # Последняя ненулевая цифра N!
    n = int(text)
    f = 1
    for i in range(2, n + 1):
        f = f * i
    while f % 10 == 0:
        f = f // 10
    return str(f % 10)


def solve_9(text):           # Домашнее задание
    lines = text.split('\n')
    a = list(map(int, lines[1].split()))
    s = 0
    for x in a:
        if x > 0:
            s = s + x
    i, j = a.index(min(a)), a.index(max(a))
    if i > j:
        i, j = j, i
    p = 1
    for k in range(i + 1, j):
        p = p * a[k]
    return str(s) + ' ' + str(p)


def solve_322(text):         # Числа Фибоначчи в строке
    s = text.strip()
    word = ''
    a, b = 1, 2
    while a <= len(s):
        word = word + s[a - 1]
        a, b = b, a + b
    return word


def solve_170(text):         # Сумма последовательных натуральных чисел
    n = int(text)
    best = 1
    k = 1
    while k * (k + 1) // 2 <= n:   # k чисел: a + (a+1) + … , a ≥ 1
        if (n - k * (k - 1) // 2) % k == 0:
            best = k
        k = k + 1
    return str(best)


SOLVE = {18: solve_18, 543: solve_543, 317: solve_317, 42: solve_42, 333: solve_333,
         519: solve_519, 447: solve_447, 9: solve_9, 322: solve_322, 170: solve_170}
