#!/usr/bin/env python3
"""Кілтті тексеру: көп нұсқа жасап (Node арқылы), әр тапсырманың кодын нағыз Python-да орындайды.
Іске қосу: python3 tools/check-tasks.py [нұсқалар_саны]"""
import json, pathlib, re, subprocess, sys, io, contextlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
N = int(sys.argv[1]) if len(sys.argv) > 1 else 300

JS = """
const vm = require('vm'), fs = require('fs');
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(%r, 'utf8'), ctx);
const out = [];
for (let s = 1; s <= %d; s++) {
  const T = ctx.window.TASKS.generate(s * 2654435761 >>> 0);
  out.push(T.map(t => Object.assign({}, t, { ok: t.type === 'input' ? ctx.window.TASKS.isCorrect(t, t.accept[0]) : null,
    okSpaced: t.type === 'input' ? ctx.window.TASKS.isCorrect(t, t.accept[0].replace(/, /g, ',')) : null })));
}
process.stdout.write(JSON.stringify(out));
""" % (str(ROOT / 'tasks.js'), N)


def run(code):
    buf = io.StringIO()
    with contextlib.redirect_stdout(buf):
        exec(code, {'__builtins__': __builtins__})
    return buf.getvalue().strip()


def main():
    variants = json.loads(subprocess.check_output(['node', '-e', JS]))
    answers = set()
    for T in variants:
        assert len(T) == 20, len(T)
        for i, t in enumerate(T, 1):
            if t['type'] == 'input':
                assert t['ok'] and t['okSpaced'], (i, t['accept'])   # жауап кілті өзін-өзі қабылдайды, «[1,2]» да қабылданады
                code = t['code']
                if '___' in code:
                    code = code.replace('___', t['accept'][0])
                    out = run(code)
                    if i == 17:
                        v = re.search(r'\.___\((\d+)\)', t['code']).group(1)
                        assert out == '[1, 2, 3, %s]' % v, out
                    else:
                        lst = eval(re.search(r'a = (\[.*\])', t['code']).group(1))
                        assert out == str(len(lst)), out
                else:
                    out = run(code)
                    assert out == t['accept'][0], (i, code, out, t['accept'])
                answers.add((i, t['accept'][0]))
            elif t['type'] == 'choice':
                assert t['answer'] in t['options'] and len(set(t['options'])) == len(t['options']), (i, t['options'])
                if i == 3:
                    for o in t['options']:
                        try:
                            ok = type(eval(o.split(' = ', 1)[1])) is list
                        except SyntaxError:
                            ok = False
                        assert ok == (o == t['answer']), o
            elif t['type'] == 'match':
                assert sorted(t['options']) == sorted(t['answer']) and len(set(t['answer'])) == len(t['answer'])
            elif t['type'] == 'order':
                out = run('\n'.join(t['answer']))
                lst = eval(t['answer'][0].split(' = ')[1]) + [int(re.search(r'\((\d+)\)', t['answer'][1]).group(1))]
                assert out == str(sorted(lst, reverse=True)), out
                assert sorted(t['lines']) == sorted(t['answer']) and t['lines'] != t['answer']
    print(f'OK: {N} нұсқа, {N * 20} тапсырма тексерілді; әртүрлі жауаптар: {len(answers)}')


main()
