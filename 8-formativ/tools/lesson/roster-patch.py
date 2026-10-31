#!/usr/bin/env python3
"""Добавляет в урок проверку ученика по списку класса: нет в списке — входа нет.
Запуск: python3 -I roster-patch.py <урок.html> <список.json> <выход.html>
Список: {"8A": ["Фамилия Имя", ...], ...}"""
import json, sys
src, roster_path, out = sys.argv[1:4]
s = open(src, encoding='utf-8').read()
roster = json.load(open(roster_path, encoding='utf-8'))

HELPER = r"""<script>
/* Список учащихся: войти может только ученик из списка своего класса (сравнение без учёта регистра, ё/е и порядка слов) */
window.ROSTER = %s;
window.__rosterCheck = function (cls, name, normClass) {
  var R = window.ROSTER || {}, keys = Object.keys(R);
  if (!keys.length) return { ok: true, cls: cls, name: name };
  var key = keys.filter(function (k) { return normClass(k) === cls; })[0];
  if (!key) return { err: 'class', list: keys.map(normClass).join(', ') };
  var KZ = { 'ә': 'а', 'ғ': 'г', 'қ': 'к', 'ң': 'н', 'ө': 'о', 'ұ': 'у', 'ү': 'у', 'һ': 'х', 'і': 'и', 'ё': 'е', 'й': 'и' };
  var low = function (x) { return String(x).toLowerCase().replace(/[әғқңөұүһіёй]/g, function (ch) { return KZ[ch]; }).replace(/[^a-zа-яәғқңөұүһі ]/g, '').replace(/\s+/g, ' ').trim(); };
  var sig = function (x) { return low(x).split(' ').sort().join(' '); };
  var want = sig(name), best = null, bd = 99;
  function lev(a, b) { var d = [], i, j; for (i = 0; i <= a.length; i++) { d[i] = [i]; } for (j = 1; j <= b.length; j++) d[0][j] = j;
    for (i = 1; i <= a.length; i++) for (j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[a.length][b.length]; }
  for (var k = 0; k < R[key].length; k++) {
    var full = R[key][k], f = sig(full), first2 = sig(low(full).split(' ').slice(0, 2).join(' '));
    if (f === want || first2 === want) return { ok: true, cls: cls, name: full };
    var dd = Math.min(lev(f, want), lev(first2, want));
    if (dd < bd) { bd = dd; best = full; }
  }
  if (best && bd <= 3) return { suggest: best, cls: cls, local: true };
  return { err: 'name' };
};
</script>
""" % json.dumps(roster, ensure_ascii=False)

anchor = '<script>\n/* Язык урока: РУС | ҚАЗ.'
assert s.count(anchor) == 1, 'нет места для списка'
s = s.replace(anchor, HELPER + anchor)

MSG = {
    'ru': ('Сохраняю…', 'Такого класса нет. Классы: ', 'Тебя нет в списке класса — доступ закрыт. Проверь, как написаны фамилия и имя, или скажи учителю.'),
    'kz': ('Сақтап жатырмын…', 'Мұндай сынып жоқ. Сыныптар: ', 'Сен сынып тізімінде жоқсың — кіру жабық. Тегің мен атыңның жазылуын тексер немесе мұғалімге айт.'),
}
for lang, (saving, badcls, badname) in MSG.items():
    old = '    err.textContent = "%s";\n    document.getElementById("lgGo").disabled = true;' % saving
    assert s.count(old) == 1, (lang, s.count(old))
    new = ('    const rc = window.__rosterCheck(c, n, normClass);\n'
           '    const oldSug = document.getElementById("lgSug"); if (oldSug) oldSug.remove();\n'
           '    if (rc.err) { err.textContent = rc.err === "class" ? "%s" + rc.list + "." : "%s"; err.classList.add("lg-deny"); return; }\n'
           '    err.classList.remove("lg-deny");\n'
           '    if (rc.suggest) { suggest(rc); return; }\n' % (badcls, badname) +
           '    err.textContent = "%s";\n    document.getElementById("lgGo").disabled = true;' % saving)
    s = s.replace(old, new)
    # вход только с именем из списка (как оно записано в списке)
    old2 = '    register(c, n).then(r => {'
    assert s.count(old2) == 2
s = s.replace('    register(c, n).then(r => {', '    register(rc.cls, rc.name).then(r => {')
# «Нет» в подсказке: локальная подсказка из списка — доступ закрыт
CSS = '<style>.lg-deny{color:#fff!important;background:#b3372b;padding:10px 12px;border-radius:8px;font-weight:600}</style>\n'
s = s.replace(anchor, CSS + anchor, 1)
open(out, 'w', encoding='utf-8').write(s)
print('OK', out, {k: len(v) for k, v in roster.items()})
