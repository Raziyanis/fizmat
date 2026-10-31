#!/usr/bin/env python3
"""Урок без Google-хостинга: ответы ученика отправляются в скрипт учителя (Code.gs, app 'fizmat-lesson').
Запуск: python3 -I send-patch.py <урок.html> <url /exec> <выход.html>"""
import sys, json
src, url, out = sys.argv[1:4]
s = open(src, encoding='utf-8').read()

T = {
  'ru': dict(btn='📨 Отправить ответы учителю', ok='Ответы отправлены учителю на почту.', fail='Не удалось отправить — проверь интернет и нажми ещё раз.',
             sending='Отправляю…', hint='Когда закончишь урок, нажми кнопку — учитель получит все твои ответы.'),
  'kz': dict(btn='📨 Жауаптарды мұғалімге жіберу', ok='Жауаптар мұғалімнің поштасына жіберілді.', fail='Жіберілмеді — интернетті тексеріп, қайта бас.',
             sending='Жіберіп жатырмын…', hint='Сабақты аяқтағанда батырманы бас — мұғалім барлық жауабыңды алады.'),
}
FN = r"""/* Без Google-хостинга: ответы уходят в скрипт учителя (LESSON_URL) — таблица и письмо */
let offTimer = null, offBusy = false;
function offUrl() { return String(window.LESSON_URL || "").trim(); }
function offSoon() { clearTimeout(offTimer); offTimer = setTimeout(() => offSend(false), 3000); }
function offSend(finish) {
  if (!me || !offUrl()) return Promise.resolve(false);
  if (offBusy) return new Promise(r => setTimeout(() => r(offSend(finish)), 700));
  const all = lsGet(NS + "att", []), sent = lsGet(NS + "att-sent", 0);
  const p = { app: "fizmat-lesson", lesson: document.title, lang: "%(lang)s", id: me.id, cls: me.cls, name: me.name, summary: lessonSummary(), attempts: all.slice(sent), from: sent, finish: !!finish };
  offBusy = true;
  return fetch(offUrl(), { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(p), redirect: "follow" })
    .then(r => r.text()).then(t => { if (!/^ok/.test(String(t).trim())) throw new Error(t); lsSet(NS + "att-sent", sent + p.attempts.length); setNet(true); return true; })
    .catch(() => { setNet(false); clearTimeout(offTimer); offTimer = setTimeout(() => offSend(false), 15000); return false; }).finally(() => { offBusy = false; });
}
function offStart() {
  if (!offUrl()) return;
  window.__onAttempt = (stage, task, answer, ok, note) => { const a = lsGet(NS + "att", []); a.push({ t: Date.now(), stage, task, answer: String(answer).slice(0, 3000), ok: !!ok, note: note || "" }); lsSet(NS + "att", a); offSoon(); };
  window.__onStore = offSoon;
  window.__onStage = id => { curStage = id; offSoon(); };
  const finish = btn => { btn.disabled = true; const t = btn.textContent; btn.textContent = %(sending)s;
    offSend(true).then(ok => { btn.disabled = false; btn.textContent = t; toast(ok ? %(ok)s : %(fail)s); }); };
  const b = document.createElement("button"); b.type = "button"; b.className = "linkbtn"; b.textContent = %(btn)s; b.style.marginLeft = "10px";
  b.onclick = () => finish(b); document.getElementById("who").appendChild(b);
  const rf = document.getElementById("reflect");
  if (rf) { const box = document.createElement("div"); box.style.cssText = "margin:18px 0;padding:14px;border:2px solid #1d7652;border-radius:10px;background:#eef7f2";
    box.innerHTML = "<p style='margin:0 0 10px'></p><button type='button' class='btn main'></button>";
    box.querySelector("p").textContent = %(hint)s; const bb = box.querySelector("button"); bb.textContent = %(btn)s; bb.onclick = () => finish(bb);
    const nx = rf.querySelector(".next"); rf.insertBefore(box, nx || null); }
  offSend(false); setInterval(() => offSend(false), 60000);
  window.addEventListener("online", () => offSend(false));
}
"""
anchor = '/* Вход: ученик сам вписывает класс, фамилию и имя */'
parts = s.split(anchor)
assert len(parts) == 3, len(parts)
res = parts[0]
for lang, part in zip(['ru', 'kz'], parts[1:]):
    t = {k: json.dumps(v, ensure_ascii=False) for k, v in T[lang].items()}; t['lang'] = lang
    old = '    if (!ONLINE) return;\n    syncNow();'
    assert part.count(old) == 1, lang
    part = part.replace(old, '    if (!ONLINE) { offStart(); return; }\n    syncNow();')
    res += FN % t + anchor + part
s = res
a2 = '<script>\n/* Язык урока: РУС | ҚАЗ.'
assert s.count(a2) == 1
s = s.replace(a2, '<script>window.LESSON_URL = %s;</script>\n' % json.dumps(url) + a2)
open(out, 'w', encoding='utf-8').write(s)
print('OK', out)
