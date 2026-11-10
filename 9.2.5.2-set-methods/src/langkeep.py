# -*- coding: utf-8 -*-
"""Смена языка перезагружает страницу (так устроен шаблон: подписи переводятся
поверх готовой страницы). Здесь — правки, чтобы после перезагрузки ученик и
учитель оказывались там же, где были: тот же этап, слайд, ученик, ответы."""

STUDENT_VIEW = r'''/* ---------- смена языка: запоминаем, где были ---------- */
var VIEW_KEY = 'setmethods.view';
function saveView_() {
  try {
    sessionStorage.setItem(VIEW_KEY, JSON.stringify({
      stage: STAGE, screen: currentScreen, slide: SLIDE, open: SLIDE_OPEN,
      chosen: chosen, attempt: attemptId, step: step, answers: answers, verdicts: verdicts,
      result: window.__lastResult || null, check: checkAnswers,
      stageRes: window.__stageRes || {},
      decide: { a: decideAnswers, v: decideVerdict, i: decideIdx },
      pending: PENDING
    }));
  } catch (e) {}
}
function restoreView_() {
  var v = null;
  try {
    v = JSON.parse(sessionStorage.getItem(VIEW_KEY) || 'null');
    sessionStorage.removeItem(VIEW_KEY);
  } catch (e) {}
  if (!v) return;
  SLIDE = v.slide || 0;
  SLIDE_OPEN = !!v.open;
  if (v.chosen && v.chosen.name) {
    chosen = v.chosen;
    workForget();                       // практика сама поднимется из памяти компьютера
    renderWhoami();
    checkAnswers = v.check || {};
    if (v.decide) {
      decideAnswers = v.decide.a || {}; decideVerdict = v.decide.v || {};
      decideIdx = v.decide.i || 0; decideLocked = (decideIdx in decideVerdict);
    }
    window.__stageRes = v.stageRes || {};
    if (v.screen === 'screen-result' && v.result) {
      showResult(v.result);
      startChat();
    } else if (v.screen === 'screen-test') {
      attemptId = v.attempt || uid();
      answers = v.answers || {}; verdicts = v.verdicts || {}; step = v.step || 0;
      show('screen-test'); renderWho_line(); startChat();
      var q = DATA.questions[step];
      if (q && (q.id in verdicts)) {
        if (step + 1 < DATA.total) { step++; renderStep(); }
        else finish();
      } else {
        renderStep();
      }
    }
  }
  PENDING = v.pending || '';
  if (v.stage && v.stage !== 'test') setStage(v.stage);
}

'''

TEACHER_VIEW = r'''/* ---------- смена языка: запоминаем, где были ---------- */
var VIEW_KEY = 'setmethods.view.t';
function saveView_() {
  try {
    sessionStorage.setItem(VIEW_KEY, JSON.stringify({
      stage: STAGE, slide: SLIDE, open: SLIDE_OPEN, qidx: QIDX, reveal: REVEAL,
      filter: FILTER, task: TASK_IDX, taskOpen: TASK_OPEN, decide: DECIDE_OPEN, all: ALL_OPEN
    }));
  } catch (e) {}
}
function restoreView_() {
  var v = null;
  try {
    v = JSON.parse(sessionStorage.getItem(VIEW_KEY) || 'null');
    sessionStorage.removeItem(VIEW_KEY);
  } catch (e) {}
  if (!v) return '';
  SLIDE = v.slide || 0; SLIDE_OPEN = !!v.open;
  QIDX = v.qidx || 0; REVEAL = !!v.reveal; FILTER = v.filter || '';
  if (v.task) TASK_IDX = v.task;
  if (v.taskOpen) TASK_OPEN = v.taskOpen;
  DECIDE_OPEN = !!v.decide; ALL_OPEN = !!v.all;
  return v.stage || '';
}

'''

RELOAD_OLD = "    try { localStorage.setItem('lesson-lang', lang); } catch (e) {}\n    location.reload();"
RELOAD_NEW = ("    try { localStorage.setItem('lesson-lang', lang); } catch (e) {}\n"
              "    saveView_();\n    window.__langSwitch = true;\n    location.reload();")


def patch_student(src, sub1):
    src = sub1(src, "  box.textContent = 'Ученик: ';", "  box.textContent = tx('Ученик:') + ' ';")
    src = sub1(src, 'function drawLangSwitch() {', STUDENT_VIEW + 'function drawLangSwitch() {')
    src = sub1(src, RELOAD_OLD, RELOAD_NEW)
    src = sub1(src, 'renderWho(); flushQueue();', 'renderWho(); restoreView_(); flushQueue();')
    src = sub1(src, 'function showResult(result) {', 'function showResult(result) {\n  window.__lastResult = result;')
    src = sub1(src, 'function showStageResult(slotId, res, title) {',
               'function showStageResult(slotId, res, title, quiet) {\n'
               '  window.__stageRes = window.__stageRes || {};\n'
               '  window.__stageRes[slotId] = { res: res, title: title };')
    src = sub1(src, "  slot.scrollIntoView({ behavior: 'smooth', block: 'start' });",
               "  if (!quiet) slot.scrollIntoView({ behavior: 'smooth', block: 'start' });")
    src = sub1(src, "  slot.id = 'check-result';\n  box.appendChild(slot);",
               "  slot.id = 'check-result';\n  box.appendChild(slot);\n"
               "  var was = (window.__stageRes || {})['check-result'];\n"
               "  if (was) { send.style.display = 'none'; showStageResult('check-result', was.res, was.title, true); }")
    src = sub1(src, "  slot.id = 'decide-result';\n  box.appendChild(slot);",
               "  slot.id = 'decide-result';\n  box.appendChild(slot);\n"
               "  var was = (window.__stageRes || {})['decide-result'];\n"
               "  if (was) showStageResult('decide-result', was.res, was.title, true);")
    src = sub1(src, "  window.addEventListener('beforeunload', function (ev) {\n    if (!workGuard()) return;",
               "  window.addEventListener('beforeunload', function (ev) {\n    if (!workGuard() || window.__langSwitch) return;")
    # введённые ответы проверки понимания показываем снова
    src = sub1(src, "        r.addEventListener('change', function () { checkAnswers[i] = pair[1]; });",
               "        r.addEventListener('change', function () { checkAnswers[i] = pair[1]; });\n"
               "        if (checkAnswers[i] === pair[1]) r.checked = true;")
    src = sub1(src, "        r.addEventListener('change', function () { checkAnswers[i] = oi; });",
               "        r.addEventListener('change', function () { checkAnswers[i] = oi; });\n"
               "        if (checkAnswers[i] === oi) r.checked = true;")
    src = sub1(src, "      inp.addEventListener('input', function () { checkAnswers[i] = inp.value; });",
               "      if (typeof checkAnswers[i] === 'string') inp.value = checkAnswers[i];\n"
               "      inp.addEventListener('input', function () { checkAnswers[i] = inp.value; });")
    src = sub1(src, "        sel.addEventListener('change', function () {",
               "        if (checkAnswers[i][li] >= 0) sel.value = String(checkAnswers[i][li]);\n"
               "        sel.addEventListener('change', function () {")
    return src


def patch_teacher(src, sub1):
    src = sub1(src, 'function drawLangSwitch() {', TEACHER_VIEW + 'function drawLangSwitch() {')
    src = sub1(src, RELOAD_OLD, RELOAD_NEW)
    src = sub1(src, "      draw();\n    })\n    .withFailureHandler",
               "      var back = '';\n"
               "      if (!window.__viewDone) { window.__viewDone = true; back = restoreView_(); }\n"
               "      draw();\n"
               "      if (back && back !== 'test') setStage(back);\n"
               "    })\n    .withFailureHandler")
    return src
