#!/usr/bin/env python3
"""Урок: при неудачной отправке ответов учителю показывать причину (старый скрипт, закрытый доступ, ошибка скрипта, нет сети).
Запуск: python3 -I send-diag-patch.py <урок.html> <выход.html>"""
import sys, json
src, out = sys.argv[1:3]
s = open(src, encoding='utf-8').read()
W = {
 'ru': dict(skip='Скрипт учителя старой версии: он не принимает ответы урока. Учителю: вставить новый код скрипта и сделать «Управление развертываниями → ✏ → Новая версия».',
            access='Скрипт учителя закрыт (Google просит войти). Учителю: в развертывании «У кого есть доступ» — «Все».',
            net='Нет связи с интернетом или скрипт не ответил.', err='Скрипт учителя вернул ошибку: '),
 'kz': dict(skip='Мұғалімнің скрипті ескі нұсқа: ол сабақ жауаптарын қабылдамайды. Мұғалімге: скрипттің жаңа кодын қойып, «Развертываниями басқару → ✏ → Жаңа нұсқа» жасау.',
            access='Мұғалімнің скрипті жабық (Google кіруді сұрайды). Мұғалімге: жариялауда «Кімге қолжетімді» — «Барлығы».',
            net='Интернет жоқ немесе скрипт жауап бермеді.', err='Мұғалімнің скрипті қате қайтарды: '),
}
old_then = '.then(r => r.text()).then(t => { if (!/^ok/.test(String(t).trim())) throw new Error(t); lsSet(NS + "att-sent", sent + p.attempts.length); setNet(true); return true; })'
old_catch = '.catch(() => { setNet(false);'
assert s.count(old_then) == 2 and s.count(old_catch) == 2
parts = s.split('function offSend(finish) {')
assert len(parts) == 3
res = parts[0]
for lang, p in zip(['ru', 'kz'], parts[1:]):
    w = {k: json.dumps(v, ensure_ascii=False) for k, v in W[lang].items()}
    p = p.replace(old_then, '.then(r => r.text()).then(t => { t = String(t).trim(); if (!/^ok/.test(t)) throw new Error(/^skip/.test(t) ? "SKIP" : /<html|<!doctype/i.test(t) ? "ACCESS" : t || "NET"); offWhy = ""; lsSet(NS + "att-sent", sent + p.attempts.length); setNet(true); return true; })', 1)
    p = p.replace(old_catch, '.catch(e => { const m = String((e && e.message) || ""); offWhy = m === "SKIP" ? %(skip)s : m === "ACCESS" ? %(access)s : /^error:/.test(m) ? %(err)s + m.slice(6).trim().slice(0, 200) : %(net)s; setNet(false);' % w, 1)
    res += 'let offWhy = "";\nfunction offSend(finish) {' + p
s = res
old_t = 'toast(ok ? '
n = s.count(old_t)
assert n == 2, n
import re
s, k = re.subn(r'toast\(ok \? ("[^"]*") : ("[^"]*")\); \}\); \};',
               r'const msgNo = "⛔ " + (offWhy || "?") + " [v5]"; toast(ok ?  : msgNo); const st = document.getElementById("offStat"); if (st) { st.textContent = ok ?  : msgNo; st.style.color = ok ? "#1d7652" : "#b3372b"; } }); };', s)
assert k == 2, k
old_box = "box.innerHTML = \"<p style='margin:0 0 10px'></p><button type='button' class='btn main'></button>\";"
assert s.count(old_box) == 2
s = s.replace(old_box, "box.innerHTML = \"<p style='margin:0 0 10px'></p><button type='button' class='btn main'></button><p id='offStat' style='margin:10px 0 0;font-weight:600'></p>\";")
s = s.replace('toast.t = setTimeout(() => { el.hidden = true; }, 3500);', 'toast.t = setTimeout(() => { el.hidden = true; }, t.length > 80 ? 9000 : 3500);')
open(out, 'w', encoding='utf-8').write(s)
print('OK', out)
