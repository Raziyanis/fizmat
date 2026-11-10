# -*- coding: utf-8 -*-
"""Этап «Список, кортеж или множество?» у ученика:
варианты — кнопки, а после сдачи — балл и разбор (раньше было «/»)."""

CSS = '''  /* этап 6: варианты ответа — кнопки */
  .topt { display: flex; align-items: center; justify-content: space-between; gap: 12px;
          padding: 14px 16px; border: 1px solid var(--line); border-radius: 10px; margin-bottom: 10px;
          background: var(--card); font-weight: 600; font-size: 17px; }
  .topt.tap { cursor: pointer; border-color: var(--accent); color: var(--accent); }
  .topt.tap:hover { background: var(--accent-soft); }
  .topt.right { border-color: var(--ok); background: var(--ok-bg); color: var(--ok); }
  .topt.chosen-ok { border: 2px solid var(--ok); background: var(--ok-bg); color: var(--ok); font-weight: 800; }
  .topt.chosen-bad { border: 2px solid var(--bad); background: var(--bad-bg); color: var(--bad); font-weight: 800; }
  .topt.dim { opacity: .45; }
'''

GRADE = '''
function gradeDecide(ans){
  var items = (L.decide && L.decide.items) || [], score = 0, detail = [];
  var kk = (typeof LANG !== 'undefined' && LANG === 'kk') ? ((LKK.decide || {}).items || []) : [];
  items.forEach(function(it, i){
    var got = (ans[String(i)] === it.answer) ? 1 : 0;
    score += got;
    detail.push({ n: i+1, got: got, max: 1, note: (kk[i] && kk[i].note) || it.note });
  });
  return { score: score, total: items.length, detail: detail };
}
'''


def patch_student(src, sub1):
    src = sub1(src, '</style>', CSS + '</style>')
    src = sub1(src, 'function gradeWork(ans){', GRADE.lstrip('\n') + '\nfunction gradeWork(ans){')
    src = sub1(src, "    else res = { score: '', total: '', detail: [], choice: p.choice, text: p.text };",
               "    else if (p.stage === 'decide') res = gradeDecide(p.answers || {});\n"
               "    else res = { score: '', total: '', detail: [], choice: p.choice, text: p.text };")
    return src
