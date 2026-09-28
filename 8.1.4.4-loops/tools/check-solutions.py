#!/usr/bin/env python3
"""Сверка эталонных решений с независимыми переборными решениями на случайных тестах."""
import math, random, itertools, sys
sys.path.insert(0, __import__('os').path.dirname(__file__))
from solutions import SOLVE

sys.set_int_max_str_digits(0)  # для проверки 9999! (в Python 3.11+ по умолчанию не больше 4300 цифр)
random.seed(8144)

def brute(t, text):
    if t == 18: return str(math.factorial(int(text)))
    if t == 543:
        n, w, d, p = map(int, text.split())
        for k in range(1, n + 1):
            if sum(i * (w - d if i == k else w) for i in range(1, n)) == p: return str(k)
    if t == 317:
        x, y, z, w = map(int, text.split())
        return str(sum(1 for a in range(w + 1) for b in range(w + 1) for c in range(w + 1) if a * x + b * y + c * z == w)) if w <= 60 else None
    if t == 42:
        n = int(text); best = {0: 1}
        for s in range(1, n + 1): best[s] = max([s] + [best[s - h] * h for h in range(1, s)])
        return str(best[n])
    if t == 333:
        a, b, c = text.split(); com = sorted(set(a) & set(b) & set(c))
        return str(len(com)) + ('\n' + ' '.join(com) if com else '')
    if t == 519:
        s = text.strip(); perms = {int(''.join(p)) for p in itertools.permutations(s) if p[0] != '0'}
        return f'{min(perms)} {max(perms)}' if len(s) <= 7 else None
    if t == 447:
        s = str(math.factorial(int(text))).rstrip('0'); return s[-1]
    if t == 9:
        a = list(map(int, text.split('\n')[1].split())); i, j = sorted((a.index(min(a)), a.index(max(a))))
        return f'{sum(x for x in a if x > 0)} {math.prod(a[i + 1:j])}'
    if t == 322:
        s = text.strip(); fibs = [1, 2]
        while fibs[-1] <= len(s): fibs.append(fibs[-1] + fibs[-2])
        return ''.join(s[f - 1] for f in fibs if f <= len(s))
    if t == 170:
        n = int(text)
        return str(max(k for k in range(1, n + 1) if any(sum(range(a, a + k)) == n for a in range(1, n + 1)))) if n <= 300 else None

def gen(t):
    r = random.randint
    if t == 18: return str(r(0, 300))
    if t == 543:
        n, w = r(2, 60), r(2, 30); d = r(1, w - 1); k = r(1, n)
        return f'{n} {w} {d} {sum(i * (w - d if i == k else w) for i in range(1, n))}'
    if t == 317: return f'{r(1, 15)} {r(1, 15)} {r(1, 15)} {r(1, 60)}'
    if t == 42: return str(r(1, 99))
    if t == 333: return ' '.join(str(r(1, 10 ** r(1, 12))) for _ in range(3))
    if t == 519:
        s = str(r(1, 9)) + ''.join(random.choice('0123456789') for _ in range(r(0, 6))); return s
    if t == 447: return str(r(1, 1500))
    if t == 9:
        n = r(2, 12)
        while True:
            a = [r(-100, 100) for _ in range(n)]
            if a.count(min(a)) == 1 and a.count(max(a)) == 1 and abs(math.prod(a[min(a.index(min(a)), a.index(max(a))) + 1:max(a.index(min(a)), a.index(max(a)))])) <= 30000: break
        return f'{n}\n' + ' '.join(map(str, a))
    if t == 322: return ''.join(random.choice('abcdefghij') for _ in range(r(1, 120)))
    if t == 170: return str(r(1, 300))

total = 0
for t, f in SOLVE.items():
    for _ in range(300):
        text = gen(t); want = brute(t, text)
        if want is None: continue
        got = f(text)
        assert got == want, (t, text, got, want)
        total += 1
# крайние случаи
assert SOLVE[18]('0') == '1' and SOLVE[42]('1') == '1' and SOLVE[42]('2') == '2' and SOLVE[42]('4') == '4'
assert SOLVE[170]('1') == '1' and SOLVE[170]('25') == '5'          # пример из условия задачи 170
assert SOLVE[333]('123 456 789') == '0'
assert SOLVE[519]('1000') == '1000 1000' and SOLVE[322]('a') == 'a'
assert SOLVE[447]('9999') == brute(447, '9999')
print(f'OK: {total} случайных тестов совпали с переборными решениями')
