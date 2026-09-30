#!/usr/bin/env python3
"""Кілтті тексеру: көп нұсқа жасайды (Node), әр тапсырманың үлгі шешімін (solution) нағыз Python-да
барлық тестте іске қосып, JS есептеген жауаппен салыстырады. Шектеулер (n ≤ 10⁹ т.б.) де тексеріледі.
Іске қосу: python3 tools/check-tasks.py [нұсқалар_саны]"""
import json, pathlib, subprocess, sys, io, contextlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
N = int(sys.argv[1]) if len(sys.argv) > 1 else 300
JS = """
const vm = require('vm'), fs = require('fs');
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(%r, 'utf8'), ctx);
const out = [];
for (let s = 1; s <= %d; s++) out.push(ctx.window.TASKS.generate(s * 2654435761 >>> 0));
process.stdout.write(JSON.stringify(out));
""" % (str(ROOT / 'tasks.js'), N)


def tokens(s):
    return re.sub(r"[\[\],'\"()]", ' ', s).split()


def run(code, inp):
    lines = iter(inp.split('\n'))
    buf = io.StringIO()
    with contextlib.redirect_stdout(buf):
        exec(code, {'input': lambda *a: next(lines), '__builtins__': __builtins__})
    return buf.getvalue()


def main():
    variants = json.loads(subprocess.check_output(['node', '-e', JS]))
    total = 0
    titles = set()
    for T in variants:
        assert len(T) == 10
        for i, t in enumerate(T, 1):
            assert len(t['tests']) == 8, i
            for k in ('title', 'text', 'input', 'output'):
                assert t[k]['kz'] and t[k]['ru'], (i, k)
            titles.add((i, t['title']['kz']))
            for tc in t['tests']:
                got = run(t['solution'], tc['input'])
                assert tokens(got) == tokens(tc['output']), (i, t['solution'], tc, got)
                if i in (2, 4, 6):
                    assert 1 <= int(tc['input']) <= {2: 1000, 4: 10000, 6: 10 ** 9}[i], (i, tc)
                if i == 3:
                    assert 0 <= int(tc['input']) <= 100
                total += 1
            # мысалдардың жауабы бос болмауы керек (оқушы үлгіні көруі үшін)
            assert all(tc['output'].strip() for tc in t['tests'][:2]), (i, t['tests'][:2])
    print(f'OK: {N} нұсқа, {total} тест үлгі шешіммен сәйкес; әртүрлі тапсырма атаулары: {len(titles)}')


main()
