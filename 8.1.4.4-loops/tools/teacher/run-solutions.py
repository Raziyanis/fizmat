"""Запускает решения из sol/ на примерах листа учителя и на случайных тестах (сверка с check-examples.py)."""
import subprocess, sys, random, pathlib, importlib.util
HERE = pathlib.Path(__file__).parent
spec = importlib.util.spec_from_file_location('ce', HERE / 'check-examples.py')
import io, contextlib
with contextlib.redirect_stdout(io.StringIO()):
    ce = importlib.util.module_from_spec(spec); spec.loader.exec_module(ce)
REF = {1: ce.summa, 2: ce.fact, 3: ce.sq, 4: ce.p2, 5: ce.md, 6: ce.arbuz, 7: ce.zag, 8: ce.nuli, 9: ce.dz, 10: ce.gold}
EX = {1: [('5', '15')], 2: [('5', '120'), ('3', '6'), ('1', '1'), ('0', '1')], 3: [('10', '1 4 9'), ('50', '1 4 9 16 25 36 49')],
      4: [('10', '1 2 4 8'), ('50', '1 2 4 8 16 32')], 5: [('15', '3'), ('35', '5')], 6: [('5\n5 1 6 5 9', '1 9')],
      7: [('4 4', '2 2'), ('5 6', '2 3')], 8: [('00101110000110', '4')],
      9: [('5\n-7 5 -1 3 9', '17 -15'), ('8\n3 14 -9 4 -5 1 -12 4', '26 180'), ('10\n-5 1 2 3 4 5 6 7 8 -3', '36 5040')],
      10: [('6', '3 3'), ('10', '3 7'), ('26', '3 23'), ('100', '3 97'), ('998', '7 991')]}
def rnd(k, r):
    if k == 1: return str(r.randint(-100, 100))
    if k == 2: return str(r.randint(0, 200))
    if k in (3, 4): return str(r.choice([r.randint(1, 1000), 10**9]))
    if k == 5: return str(r.choice([r.randint(2, 1000), 999983, 10**6]))
    if k == 6: n = r.randint(1, 20); return f'{n}\n' + ' '.join(str(r.randint(1, 30000)) for _ in range(n))
    if k == 7: x, y = r.randint(1, 1000), r.randint(1, 1000); return f'{x + y} {x * y}'
    if k == 8: return ''.join(r.choice('01') for _ in range(r.randint(1, 40)))
    if k == 9:
        n = r.randint(2, 12); a = r.sample(range(-9, 10), n); return f'{n}\n' + ' '.join(map(str, a))
    if k == 10: return str(2 * r.randint(2, 499))
def run(k, inp):
    return subprocess.run([sys.executable, HERE / 'sol' / f'{k:02}.py'], input=inp + '\n', capture_output=True, text=True, timeout=5).stdout.split()
r = random.Random(1); bad = 0; count = 0
for k in range(1, 11):
    tests = EX[k] + [(t, REF[k](t)) for t in (rnd(k, r) for _ in range(40))]
    for inp, out in tests:
        count += 1
        if run(k, inp) != out.split(): bad += 1; print('ОШИБКА', k, repr(inp), run(k, inp), out)
print('OK' if not bad else 'ЕСТЬ ОШИБКИ', count, 'тестов')
sys.exit(1 if bad else 0)
