import subprocess, sys, re
sys.path.insert(0, '.')
from content import *
def run(code, inp=()):
    p = subprocess.run([sys.executable, '-I', '-c', code], input='\n'.join(inp)+'\n', capture_output=True, text=True, timeout=10)
    return p.stdout, p.stderr
def line_match(out, exp):
    lines = [l.strip() for l in out.strip().split('\n')]
    pos = 0
    for x in exp:
        k = pos
        while k < len(lines) and lines[k] != x: k += 1
        if k >= len(lines): return x
        pos = k + 1
    return None
bad = 0
for t in PRAC + TASKS:
    code = re.sub(r'#.*$', '', t['sol'], flags=re.M)
    for n in t['need']:
        if n not in code: print('NEED MISSING', t['id'], repr(n)); bad += 1
    for tc in t['tests']:
        o, e = run(t['sol'], tc['in'])
        m = line_match(o, tc['exp'])
        if e or m is not None: print('FAIL', t['id'], tc, repr(o), e); bad += 1
    # starter code must not pass
    o, e = run(t['code'], t['tests'][0]['in'])
    if not e and line_match(o, t['tests'][0]['exp']) is None: print('STARTER PASSES', t['id']); bad += 1
for i, d in enumerate(DBG):
    o, e = run(d['code']); ok_bug = (not e) and line_match(o, d['exp']) is None
    o2, e2 = run(d['fix']); ok_fix = (not e2) and line_match(o2, d['exp']) is None
    print('DBG', i+1, 'buggy passes?' , ok_bug, '| fix passes?', ok_fix, '| buggy out:', repr(o[:60]))
    if ok_bug or not ok_fix: bad += 1
for i, q in enumerate(QUIZ):
    if len(q) < 5:
        src = q[0].split('\n#')[0]
        o, e = run(src)
        print('QUIZ', i+1, 'answer=', q[1][q[2]], '| out:', repr(o.strip()[:80]), e[:80])
for a, b in MATCH:
    o, e = run(a); print('MATCH', repr(o.strip()), '==', repr(b), o.strip() == b)
for m in METHODS:
    o, e = run(m[3]); print('METHOD', m[1], '|', o.strip().replace('\n', ' / ')[:110], e[:60])
for c in (SANDBOX, RACE_CODE, RACE5_CODE):
    o, e = run(c); print('CODE', o.strip().split('\n')[-1], e[:60])
print('BAD =', bad)
