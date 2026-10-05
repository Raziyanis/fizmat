#!/usr/bin/env python3
"""Проверка ключа: генерирует задания для многих вариантов (Node) и выполняет код настоящим Python.
Запуск: python3 tools/check-tasks.py [число_вариантов]"""
import json, pathlib, re, subprocess, sys, io, contextlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
N = int(sys.argv[1]) if len(sys.argv) > 1 else 300
JS = """
const vm = require('vm'), fs = require('fs');
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(%r, 'utf8'), ctx);
const out = [];
for (let s = 1; s <= %d; s++) {
  const T = ctx.window.TASKS.generate(s * 2654435761 >>> 0);
  out.push(T.map(t => Object.assign({}, t, { ok: t.type === 'input' ? ctx.window.TASKS.isCorrect(t, t.accept[0]) : null })));
}
process.stdout.write(JSON.stringify(out));
""" % (str(ROOT / 'tasks.js'), N)


def run(code):
    buf = io.StringIO()
    with contextlib.redirect_stdout(buf):
        exec(code, {})
    return buf.getvalue().strip()


def halts(code):
    try:
        subprocess.run([sys.executable, '-c', code], stdout=subprocess.DEVNULL, timeout=2)
        return True
    except subprocess.TimeoutExpired:
        return False


def main():
    variants = json.loads(subprocess.check_output(['node', '-e', JS]))
    answers = set()
    for vi, T in enumerate(variants):
        assert len(T) == 20
        for i, t in enumerate(T, 1):
            if t['type'] == 'input':
                assert t['ok'], (i, t['accept'])
                code = t['code']
                if i == 4:
                    assert run(code).count('Привет') == int(t['accept'][0])
                elif i == 17:
                    a, b = map(int, re.search(r'числа от (\d+) до (\d+)', t['text']).groups())
                    assert run(code.replace('___', t['accept'][0])).split() == [str(x) for x in range(a, b + 1)]
                elif i == 18:
                    b = int(re.search(r'от 1 до (\d+)', t['text']).group(1))
                    assert run(code.replace('___', t['accept'][0])).split() == [str(x) for x in range(1, b + 1)]
                else:
                    assert run(code) == t['accept'][0], (i, code, run(code), t['accept'])
                answers.add((i, t['accept'][0]))
            elif t['type'] == 'match':
                for it, ans in zip(t['items'], t['answer']):
                    assert ' '.join(map(str, eval(it['code']))) == ans, (it, ans)
                assert sorted(t['options']) == sorted(t['answer']) and len(set(t['answer'])) == 4
            elif t['type'] == 'choice':
                assert t['answer'] in t['options'] and len(set(t['options'])) == len(t['options'])
                if i == 19 and vi < 15:
                    for o in t['options']:
                        assert halts(o) == (o != t['answer']), o
            elif t['type'] == 'order':
                n = int(re.search(r'от 1 до (\d+)', t['text']).group(1))
                assert run('\n'.join(t['answer'])) == str(n * (n + 1) // 2)
                assert sorted(t['lines']) == sorted(t['answer']) and t['lines'] != t['answer']
    print(f'OK: {N} вариантов, {N * 20} заданий проверено; разных ответов: {len(answers)}')


main()
