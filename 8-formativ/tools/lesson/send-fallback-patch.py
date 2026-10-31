#!/usr/bin/env python3
"""Урок: запасной способ отправки ответов. Если fetch не прошёл (браузер или сеть не пускают ответ скрипта),
ответы отправляются обычной HTML-формой (её пропускает любой браузер), а доставку подтверждает запрос
JSONP ?a=lstat к скрипту учителя. Нужен скрипт версии 5 (Code.gs: payload из формы, a=lstat).
Запуск: python3 -I send-fallback-patch.py <урок.html> <выход.html>"""
import sys, json
src, out = sys.argv[1:3]
s = open(src, encoding='utf-8').read()
W = {'ru': dict(old='Скрипт учителя старой версии: он не принимает ответы урока. Учителю: вставить новый код скрипта и сделать «Управление развертываниями → ✏ → Новая версия».',
                net='Нет связи со скриптом учителя: ответы не подтвердились. Проверь интернет и нажми ещё раз.'),
     'kz': dict(old='Мұғалімнің скрипті ескі нұсқа: ол сабақ жауаптарын қабылдамайды. Мұғалімге: скрипттің жаңа кодын қойып, «Развертываниями басқару → ✏ → Жаңа нұсқа» жасау.',
                net='Мұғалімнің скриптімен байланыс жоқ: жауаптар расталмады. Интернетті тексеріп, қайта бас.')}
FN = r"""function offJsonp(params) {
  return new Promise((ok, fail) => {
    const cb = "offcb" + Date.now() + Math.floor(Math.random() * 1e6), sc = document.createElement("script"); let done = false;
    const end = () => { done = true; try { delete window[cb]; } catch (e) {} sc.remove(); };
    window[cb] = d => { if (!done) { end(); ok(d); } };
    params.cb = cb; params.t = Date.now();
    sc.src = offUrl() + "?" + Object.keys(params).map(k => encodeURIComponent(k) + "=" + encodeURIComponent(params[k])).join("&");
    sc.onerror = () => { if (!done) { end(); fail(new Error("net")); } };
    sc.onload = () => setTimeout(() => { if (!done) { end(); fail(new Error("old")); } }, 50);
    setTimeout(() => { if (!done) { end(); fail(new Error("net")); } }, 15000);
    document.head.appendChild(sc);
  });
}
function offForm(p, sent, finish) {
  return new Promise(res => {
    const nm = "offf" + Date.now(), ifr = document.createElement("iframe"), f = document.createElement("form"), ta = document.createElement("textarea");
    ifr.name = nm; ifr.style.display = "none"; f.method = "POST"; f.action = offUrl(); f.target = nm; f.style.display = "none";
    ta.name = "payload"; ta.value = JSON.stringify(p); f.appendChild(ta); document.body.appendChild(ifr); document.body.appendChild(f); f.submit();
    setTimeout(() => { f.remove(); ifr.remove(); }, 60000);
    const t0 = Date.now(), need = sent + p.attempts.length;
    const fail = why => { offWhy = why; setNet(false); clearTimeout(offTimer); offTimer = setTimeout(() => offSend(false), 20000); res(false); };
    const check = left => offJsonp({ a: "lstat", lesson: p.lesson, id: p.id }).then(d => {
      if (d && d.n >= need && (!finish || (d.mailed && d.mailed >= t0 - 120000))) { lsSet(NS + "att-sent", need); offWhy = ""; setNet(true); res(true); }
      else if (left > 0) setTimeout(() => check(left - 1), 3000); else fail(%(net)s);
    }, e => { if (e && e.message === "old") fail(%(old)s); else if (left > 0) setTimeout(() => check(left - 1), 3000); else fail(%(net)s); });
    setTimeout(() => check(5), 3000);
  });
}
"""
parts = s.split('let offWhy = "";\nfunction offSend(finish) {')
assert len(parts) == 3, len(parts)
res = parts[0]
for lang, p in zip(['ru', 'kz'], parts[1:]):
    w = {k: json.dumps(v, ensure_ascii=False) for k, v in W[lang].items()}
    a = '.catch(e => { const m = String((e && e.message) || "");'
    assert p.count(a) == 1
    p = p.replace(a, a + ' if (m !== "SKIP" && m !== "ACCESS" && !/^error:/.test(m)) return offForm(p, sent, finish);', 1)
    res += FN % w + 'let offWhy = "";\nfunction offSend(finish) {' + p
s = res.replace(' [v5]"', ' [v6]"')
open(out, 'w', encoding='utf-8').write(s)
print('OK', out)
