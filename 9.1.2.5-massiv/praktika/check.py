"""Практикалық тапсырмалардың шешімдерін тексеру: мысалдар + кездейсоқ тестілер (тәуелсіз эталонмен салыстыру)."""
import random, subprocess, sys, pathlib, json
HERE = pathlib.Path(__file__).parent
EX = json.loads((HERE / 'examples.json').read_text(encoding='utf-8'))
def ref(k, inp):
    L = inp.split('\n'); a = list(map(int, L[0].split()))
    if k == 'A1': return f'{a[0]} {a[-1]} {len(a)}'
    if k == 'A2': return str([0] + a + [100])
    if k == 'A3': return str(sorted(a)) + '\n' + str(sum(a))
    if k == 'B1': e = [x for x in a if x % 2 == 0]; return f'{len(e)} {sum(e)}'
    if k == 'B2': x = int(L[1]); return str([y for y in a if y != x])
    if k == 'B3': m = max(a); return f'{m} {min(i for i, y in enumerate(a) if y == m)}'
    if k == 'C1': return str(list(dict.fromkeys(a)))
    if k == 'C2': return str(a[::-1])
    if k == 'C3': b = set(map(int, L[1].split())); return str(list(dict.fromkeys(y for y in a if y in b)))
def gen(k, r):
    a = [r.randint(-5, 12) for _ in range(r.randint(1, 10))]
    s = ' '.join(map(str, a))
    if k == 'B2': return s + '\n' + str(r.choice(a + [99]))
    if k == 'C3': return s + '\n' + ' '.join(str(r.randint(-5, 12)) for _ in range(r.randint(1, 10)))
    return s
def run(k, inp):
    return subprocess.run([sys.executable, HERE / 'sol' / f'{k}.py'], input=inp + '\n', capture_output=True, text=True, timeout=5).stdout.strip()
r = random.Random(7); n = bad = 0
for k in ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3']:
    for inp, out in EX[k]:
        n += 1
        if ref(k, inp) != out or run(k, inp) != out: bad += 1; print('МЫСАЛ ҚАТЕ', k, repr(inp), ref(k, inp), run(k, inp), out)
    for _ in range(60):
        inp = gen(k, r); n += 1
        if run(k, inp) != ref(k, inp): bad += 1; print('ҚАТЕ', k, repr(inp))
print('OK' if not bad else 'ҚАТЕЛЕР БАР', n, 'тест'); sys.exit(1 if bad else 0)
