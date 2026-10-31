#!/usr/bin/env python3
"""Урок: «Практическая работа» (этап 9) открывается только после всех заданий практики уровней A, B и C.
Запуск: python3 -I project-gate-patch.py <урок.html> <выход.html>"""
import sys, json
src, out = sys.argv[1:3]
s = open(src, encoding='utf-8').read()
MSG = {
  'ru': ('Практическая работа откроется, когда решишь все задания практики уровней A, B и C. Осталось: ', '🔒 Практическая работа — после уровней A, B, C'),
  'kz': ('Практикалық жұмыс A, B және C деңгейлерінің барлық тапсырмасын шешкенде ашылады. Қалғаны: ', '🔒 Практикалық жұмыс — A, B, C деңгейлерінен кейін'),
}
GATE = """/* Практическая работа — только после всех заданий уровней A, B, C */
function prLeft() { try { const pr = store.get("practice-l4", {}) || {}; return TASKS_PR.filter(t => ["A", "B", "C"].includes(t.lv) && !(pr[t.id] && (pr[t.id].ok || pr[t.id].ever))).map(t => t.id); } catch (e) { return ["…"]; } }
setTimeout(() => { try { prGate(); } catch (e) {} }, 0);
function prGate() {
  const left = prLeft(), tab = document.getElementById("tab-project");
  if (left.length) tab.disabled = true; else if (!document.getElementById("tab-practice").disabled) tab.disabled = false;
  tab.title = left.length ? %(msg)s + left.join(", ") : "";
  document.querySelectorAll('[data-go="project"]').forEach(b => { if (b.closest("#practice")) { if (!b.dataset.t0) b.dataset.t0 = b.textContent; b.textContent = left.length ? %(lock)s : b.dataset.t0; b.classList.toggle("main", !left.length); } });
  return left;
}
"""
blocks = s.split('const PANELS = ["review"')
assert len(blocks) == 3, len(blocks)
res = blocks[0]
for lang, b in zip(['ru', 'kz'], blocks[1:]):
    m, lock = MSG[lang]
    b = 'const PANELS = ["review"' + b
    old = 'function show(id) {\n'
    assert b.count(old) == 1
    b = b.replace(old, GATE % {'msg': json.dumps(m, ensure_ascii=False), 'lock': json.dumps(lock, ensure_ascii=False)} +
                  'function show(id) {\n  if (id === "project" && prLeft().length) { const l = prLeft(); toast(%s + l.join(", ")); id = "practice"; }\n' % json.dumps(m, ensure_ascii=False), 1)
    old2 = '["reflect", "actual", "learn", "methods", "match", "practice", "project", "test", "hw"].forEach(p => { document.getElementById("tab-" + p).disabled = !has; });'
    assert b.count(old2) == 1
    b = b.replace(old2, old2 + ' prGate();')
    res += b
s = res
old3 = 'set(k, v) { try { localStorage.setItem(NS + k, JSON.stringify(v)); } catch (e) {} if (window.__onStore) window.__onStore(k); },'
assert s.count(old3) == 2, s.count(old3)
s = s.replace(old3, 'set(k, v) { try { localStorage.setItem(NS + k, JSON.stringify(v)); } catch (e) {} if (window.__onStore) window.__onStore(k); if (k === "practice-l4" && typeof prGate === "function") setTimeout(prGate, 0); },')
open(out, 'w', encoding='utf-8').write(s)
print('OK', out)
