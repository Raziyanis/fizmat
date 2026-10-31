#!/usr/bin/env python3
"""Урок: контроль на этапах с кодом (8 Практика, 9 Практическая работа, 10 Тест, 12 ДЗ).
- полный экран; уход на другую вкладку/окно или выход из полного экрана — нарушение (красное окно, запись учителю);
- после MAXV нарушений задания закрываются, открыть может учитель PIN-кодом;
- вставка текста в редактор кода и в ответы теста запрещена (Ctrl+V, перетаскивание) — попытка записывается.
Запуск: python3 -I guard-patch.py <урок.html> <выход.html> [PIN] [MAXV]"""
import sys, json
src, out = sys.argv[1:3]
PIN = sys.argv[3] if len(sys.argv) > 3 else '2580'
MAXV = int(sys.argv[4]) if len(sys.argv) > 4 else 3
s = open(src, encoding='utf-8').read()

def fnv(x):
    h = 2166136261
    for ch in x:
        h ^= ord(ch); h = (h * 16777619) & 0xFFFFFFFF
    return h

T = {
 'ru': dict(stage='⚠ Нарушение', tab='ушёл на другую вкладку или свернул окно', win='переключился на другое окно', fs='вышел из полноэкранного режима',
   paste='попытка вставить текст в код', unlock='учитель открыл задания',
   warn='⚠ Нарушение {n} из {m}: ты ушёл с урока ({k}). Учитель это видит.',
   warn2='Работай только на этой странице. После {m}-го нарушения задания закроются.', back='Вернуться к заданию',
   lock='⛔ Задания закрыты: {n} нарушения. Позови учителя.', pin='PIN учителя', open='Открыть', bad='Неверный PIN.',
   nopaste='Вставлять текст нельзя — пиши код сам.'),
 'kz': dict(stage='⚠ Бұзушылық', tab='басқа бетке өтті немесе терезені кішірейтті', win='басқа терезеге ауысты', fs='толық экраннан шықты',
   paste='кодқа мәтін қоюға тырысты', unlock='мұғалім тапсырмаларды ашты',
   warn='⚠ Бұзушылық {n} / {m}: сен сабақтан шықтың ({k}). Мұғалім мұны көреді.',
   warn2='Тек осы бетте жұмыс істе. {m}-ші бұзушылықтан кейін тапсырмалар жабылады.', back='Тапсырмаға оралу',
   lock='⛔ Тапсырмалар жабылды: {n} бұзушылық. Мұғалімді шақыр.', pin='Мұғалімнің PIN-коды', open='Ашу', bad='PIN қате.',
   nopaste='Мәтін қоюға болмайды — кодты өзің жаз.'),
}
CODE = r"""
/* Контроль на этапах с кодом: полный экран, уход со страницы — нарушение, вставка текста запрещена */
const GUARD_STAGES = ["practice", "project", "test", "hw"], GUARD_MAX = %(maxv)d, GUARD_PIN = %(pinh)d;
const GT = %(t)s;
let guardOn = false, guardPause = 0;
function guardHash(x) { let h = 2166136261; for (let i = 0; i < x.length; i++) { h ^= x.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h; }
function guardFs() { try { const d = document.documentElement; if (!document.fullscreenElement && d.requestFullscreen) d.requestFullscreen().catch(() => {}); } catch (e) {} }
function guardBox() {
  let b = document.getElementById("guardBox");
  if (!b) { b = document.createElement("div"); b.id = "guardBox";
    b.style.cssText = "position:fixed;inset:0;z-index:99999;background:rgba(120,10,10,.92);color:#fff;display:flex;align-items:center;justify-content:center;padding:20px;font:600 18px/1.5 sans-serif;text-align:center";
    document.body.appendChild(b); }
  return b;
}
function guardHide() { const b = document.getElementById("guardBox"); if (b) b.remove(); }
function guardLog(kind, n) { if (window.__onAttempt) window.__onAttempt(GT.stage, kind, n ? n + " / " + GUARD_MAX : "", false, ""); }
function guardLock() {
  const n = store.get("viol", 0), b = guardBox();
  b.innerHTML = "<div style='max-width:560px'><p style='font-size:22px;margin:0 0 14px'></p><input type='password' inputmode='numeric' style='font-size:20px;padding:8px;width:160px;border-radius:8px;border:0'> <button type='button' style='font-size:18px;padding:8px 16px;border-radius:8px;border:0;cursor:pointer'></button><p class='gerr' style='min-height:1.5em'></p></div>";
  b.querySelector("p").textContent = GT.lock.replace("{n}", n); const inp = b.querySelector("input"); inp.placeholder = GT.pin;
  const btn = b.querySelector("button"); btn.textContent = GT.open;
  const go = () => { if (guardHash(inp.value.trim()) === GUARD_PIN) { store.set("viol", GUARD_MAX - 1); guardLog(GT.unlock, 0); guardHide(); guardFs(); } else b.querySelector(".gerr").textContent = GT.bad; };
  btn.onclick = go; inp.onkeydown = e => { if (e.key === "Enter") go(); }; inp.focus();
}
function guardWarn(n, kind) {
  const b = guardBox();
  b.innerHTML = "<div style='max-width:620px'><p style='font-size:22px;margin:0 0 8px'></p><p style='font-weight:400;margin:0 0 16px'></p><button type='button' style='font-size:18px;padding:10px 20px;border-radius:8px;border:0;cursor:pointer;color:#7a0b0b;font-weight:700'></button></div>";
  const p = b.querySelectorAll("p"); p[0].textContent = GT.warn.replace("{n}", n).replace("{m}", GUARD_MAX).replace("{k}", kind); p[1].textContent = GT.warn2.replace("{m}", GUARD_MAX);
  const btn = b.querySelector("button"); btn.textContent = GT.back; btn.onclick = () => { guardPause = Date.now() + 1500; guardHide(); guardFs(); };
}
function guardViolation(kind) {
  if (!guardOn || Date.now() < guardPause || document.getElementById("guardBox")) return;
  guardPause = Date.now() + 1500;
  const n = store.get("viol", 0) + 1; store.set("viol", n); guardLog(kind, n);
  if (n >= GUARD_MAX) guardLock(); else guardWarn(n, kind);
}
function guardStage(id) {
  guardOn = GUARD_STAGES.includes(id);
  if (!guardOn) { guardHide(); return; }
  guardPause = Date.now() + 1500; guardFs();
  if (store.get("viol", 0) >= GUARD_MAX) guardLock();
}
document.addEventListener("visibilitychange", () => { if (document.hidden) guardViolation(GT.tab); });
window.addEventListener("blur", () => setTimeout(() => { if (!document.hidden && !document.hasFocus()) guardViolation(GT.win); }, 400));
document.addEventListener("fullscreenchange", () => { if (!document.fullscreenElement) guardViolation(GT.fs); });
const guardNoPaste = e => {
  if (!guardOn) return;
  const t = e.target; if (!t || !t.closest) return;
  if (t.closest(".ed-code") || t.closest("#test input, #test textarea")) { e.preventDefault(); toast(GT.nopaste); guardLog(GT.paste, 0); }
};
document.addEventListener("paste", guardNoPaste, true);
document.addEventListener("drop", guardNoPaste, true);
"""
parts = s.split('function show(id) {\n')
assert len(parts) == 3, len(parts)
res = parts[0]
for lang, p in zip(['ru', 'kz'], parts[1:]):
    res += CODE % dict(maxv=MAXV, pinh=fnv(PIN), t=json.dumps(T[lang], ensure_ascii=False)) + 'function show(id) {\n' + p
s = res
a = '  if (id === "practice" || id === "project" || id === "hw") samplesFill();\n'
assert s.count(a) == 2
s = s.replace(a, a + '  guardStage(id);\n')
b = '    id: me.id, cls: me.cls, name: me.name, stage: STAGES[curStage] || curStage,'
assert s.count(b) == 2
s = s.replace(b, '    id: me.id, cls: me.cls, name: me.name, viol: g("viol") || 0, stage: STAGES[curStage] || curStage,')
open(out, 'w', encoding='utf-8').write(s)
print('OK', out, '| PIN:', PIN, '| нарушений до блокировки:', MAXV)
