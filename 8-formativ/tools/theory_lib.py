"""Помощники для краткой теории формативок: T, H, UL, EX (вывод получен запуском настоящего Python), C, TABLE."""
import html, io, contextlib, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent


def run(code, inp=''):
    it = iter(inp.split('\n'))
    buf = io.StringIO()
    with contextlib.redirect_stdout(buf):
        exec(code, {'input': lambda *a: next(it)})
    return buf.getvalue().rstrip()


def md(s):
    s = html.escape(s, quote=False)
    s = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', s)
    return re.sub(r'`(.+?)`', r'<code>\1</code>', s)


def T(kz, ru, tag='p'):
    return f'<{tag} class="lang-kz">{md(kz)}</{tag}><{tag} class="lang-ru">{md(ru)}</{tag}>'


def H(kz, ru):
    return f'<h3 class="t-h"><span class="lang-kz">{md(kz)}</span><span class="lang-ru">{md(ru)}</span></h3>'


def UL(items):
    kz = ''.join(f'<li>{md(a)}</li>' for a, b in items)
    ru = ''.join(f'<li>{md(b)}</li>' for a, b in items)
    return f'<ul class="lang-kz">{kz}</ul><ul class="lang-ru">{ru}</ul>'


def EX(code, inp=''):
    out = run(code, inp)
    lab = lambda kz, ru: f'<div class="lbl"><span class="lang-kz">{kz}</span><span class="lang-ru">{ru}</span></div>'
    right = ''
    if inp:
        right += f'<div class="t-box inp">{lab("Кіріс", "Ввод")}<pre>{html.escape(inp)}</pre></div>'
    right += f'<div class="t-box out">{lab("Нәтиже", "Вывод")}<pre>{html.escape(out)}</pre></div>'
    return f'<div class="t-pair"><div class="t-box">{lab("Программа", "Программа")}<pre>{html.escape(code)}</pre></div><div>{right}</div></div>'


def C(x):   # «қазақша / по-русски» в ячейке → показывается только текущий язык
    if ' / ' not in x:
        return md(x)
    kz, ru = x.split(' / ', 1)
    return f'<span class="lang-kz">{md(kz)}</span><span class="lang-ru">{md(ru)}</span>'


def TABLE(head, rows):
    h = ''.join(f'<th>{C(x)}</th>' for x in head)
    b = ''.join('<tr>' + ''.join(f'<td>{C(x)}</td>' for x in r) + '</tr>' for r in rows)
    return f'<table class="t-table">{h and "<tr>" + h + "</tr>"}{b}</table>'
