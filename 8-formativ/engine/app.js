/* Формативка 8-го класса (движок): теория, 5 вопросов теста + 5 задач на код (Python выполняется в браузере через Skulpt).
 * Балл: задача — 1, если пройдены все 8 тестов и в программе есть нужные инструкции. Максимум 13.
 * Полноэкранный режим; выход из него, смена вкладки или окна, перезагрузка страницы — нарушение
 * (первые — предупреждение, на MAX_VIOLATIONS-м работа завершается). Интернет и сервер не нужны. */
(function () {
  'use strict';

  var WORK_MS = (window.WORK_MIN || 35) * 60 * 1000;
  var RESULT_MS = (window.RESULT_MIN || 5) * 60 * 1000;
  var MAX_VIOL = window.MAX_VIOLATIONS || 3;
  var TID = (window.TOPIC && window.TOPIC.id) || 'x', APP = 'fizmat-formativ-' + TID;
  var STORE = 'ff-' + TID + '-state';
  var RUN_LIMIT_MS = 1000, OUT_LIMIT = 20000, NQ = 10;

  var LANG = (function () { try { return localStorage.getItem('ff-lang') === 'ru' ? 'ru' : 'kz'; } catch (e) { return 'kz'; } })();
  function L(kz, ru) { return LANG === 'kz' ? kz : ru; }
  var VIOL = {
    fs: ['сіз толық экраннан шықтыңыз.', 'вы вышли из полноэкранного режима.'],
    tab: ['сіз басқа бетке немесе қосымшаға ауыстыңыз.', 'вы переключились на другую вкладку или приложение.'],
    win: ['сіз басқа терезеге ауыстыңыз.', 'вы переключились на другое окно.'],
    reload: ['бет жабылды немесе қайта жүктелді.', 'страница была закрыта или перезагружена.'],
  };
  function reasonText(rs) {
    if (!rs) return '';
    if (rs.k === 'time') return L('Уақыт (' + rs.min + ' минут) бітті — жұмыс автоматты түрде аяқталды.', 'Время (' + rs.min + ' минут) закончилось — работа завершена автоматически.');
    if (rs.k === 'viol') return L('Жұмыс автоматты түрде аяқталды: ', 'Работа завершена автоматически: ') + L(VIOL[rs.v][0], VIOL[rs.v][1]);
    return '';
  }
  var NEED = { 'break': 'break', 'continue': 'continue', 'else': 'for … else / while … else' };

  var $ = function (id) { return document.getElementById(id); };
  var state = null, code = [], fsActive = false, ignoreUntil = 0, ticker = null, hideTimer = null, busy = false;

  function save() { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) {} }
  function load() { try { return JSON.parse(localStorage.getItem(STORE)); } catch (e) { return null; } }
  function running() { return !!state && state.status === 'running'; }
  function show(id) {
    ['s-loading', 's-gate', 's-teacher', 's-theory', 's-work', 's-eval', 's-result'].forEach(function (s) { $(s).hidden = s !== id; });
    $('timers').hidden = !running() || id !== 's-work';
    window.scrollTo(0, 0);
  }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function fmt(ms) { var s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }

  // ---------- Python (Skulpt) ----------
  var ALLOWED = /^src\/(builtin|lib)\/(sys|math|random)(\.js|\/__init__\.js)$/;   // только sys, math, random
  function runPython(src, input) {
    var lines = String(input).split('\n'), li = 0, out = '';
    Sk.configure({
      output: function (s) { if (out.length < OUT_LIMIT) out += s; },
      read: function (f) {
        if (!ALLOWED.test(f) || !Sk.builtinFiles || Sk.builtinFiles.files[f] === undefined) throw new Sk.builtin.ImportError('module not available');
        return Sk.builtinFiles.files[f];
      },
      inputfun: function () { return li < lines.length ? lines[li++] : ''; },
      inputfunTakesPrompt: true, execLimit: RUN_LIMIT_MS, yieldLimit: 100, __future__: Sk.python3
    });
    ['jseval', 'jsmillis', 'open', 'quit', 'exit'].forEach(function (k) { delete Sk.builtins[k]; });
    return Sk.misceval.asyncToPromise(function () { return Sk.importMainWithBody('<stdin>', false, src, true); })
      .then(function () { return { out: out }; }, function (e) {
        var msg = String(e && e.toString ? e.toString() : e), to = /TimeLimitError/.test(msg);
        return { out: out, error: to ? L('Программа тым ұзақ жұмыс істеді (мүмкін, шексіз цикл).', 'Программа работала слишком долго (возможно, бесконечный цикл).') : msg, timeout: to };
      });
  }
  // Если в строке теста несколько чисел, а программа читает каждое отдельным input(), повторяем запуск,
  // подав каждое число на отдельной строке: засчитываются оба способа ввода.
  function runTest(src, input, output) {
    return runPython(src, input).then(function (r) {
      var ok = !r.error && CODE.sameOutput(r.out, output);
      var multi = String(input).split('\n').some(function (l) { return l.trim().split(/\s+/).length > 1; });
      if (ok || !multi || r.timeout) return { r: r, ok: ok };
      return runPython(src, String(input).trim().split(/\s+/).join('\n')).then(function (r2) {
        var ok2 = !r2.error && CODE.sameOutput(r2.out, output);
        return ok2 ? { r: r2, ok: true } : { r: r, ok: false };
      });
    });
  }
  function checkTask(i) {
    if (code[i].kind === 'quiz') { var ok = state.ans[i] === code[i].answer; return Promise.resolve({ quiz: true, passed: ok ? 1 : 0, total: 1, details: [], missing: [], choice: state.ans[i] }); }
    var task = code[i], src = state.code[i] || '', res = { passed: 0, total: task.tests.length, details: [], missing: CODE.missing(src, task.need) };
    if (!src.trim()) { res.missing = []; return Promise.resolve(res); }
    var k = 0;
    var step = function () {
      if (k >= task.tests.length) return res;
      return runTest(src, task.tests[k].input, task.tests[k].output).then(function (x) {
        if (x.ok) res.passed++;
        res.details.push({ ok: x.ok, out: x.r.out, error: x.r.error || null });
        if (!x.ok && res.fail == null) res.fail = k;
        k++;
        if (x.r.timeout) { for (; k < task.tests.length; k++) res.details.push({ ok: false, skipped: true }); return res; }
        return step();
      });
    };
    return step();
  }
  function solved(res) { return !!res && res.total > 0 && res.passed === res.total && !(res.missing && res.missing.length); }
  function needText(need) { return need.map(function (k) { return NEED[k]; }).join(', '); }
  function inputHint() {
    return L('Кеңес: бір жолда бірнеше сан болса, оларды былай оқыңыз: a, b = map(int, input().split()).',
      'Подсказка: если в одной строке несколько чисел, прочитайте их так: a, b = map(int, input().split()).');
  }

  // ---------- Полноэкранный режим и нарушения ----------
  function fsElement() { return document.fullscreenElement || document.webkitFullscreenElement || null; }
  function fsSupported() { var e = document.documentElement; return !!(e.requestFullscreen || e.webkitRequestFullscreen); }
  function enterFullscreen() {
    var e = document.documentElement, req = e.requestFullscreen || e.webkitRequestFullscreen;
    if (!req || fsElement()) return Promise.resolve();
    try {
      return Promise.resolve(req.call(e, { navigationUI: 'hide' })).then(function () {
        if (navigator.keyboard && navigator.keyboard.lock) navigator.keyboard.lock(['Escape']).catch(function () {});
      }).catch(function () {});
    } catch (err) { return Promise.resolve(); }
  }
  function exitFullscreen() { var ex = document.exitFullscreen || document.webkitExitFullscreen; if (fsElement() && ex) { try { ex.call(document); } catch (e) {} } }
  // Одно действие часто даёт несколько событий подряд — считаем его один раз. При закрытии или перезагрузке
  // страница выгружается раньше, чем сработает таймер: такое нарушение засчитывается при следующем открытии.
  var violLock = 0, leaving = false;
  function violation(v) {
    if (!running() || leaving || Date.now() < violLock) return;
    violLock = Date.now() + 1500;
    setTimeout(function () { if (running() && !leaving) countViolation(v); }, 400);
  }
  function countViolation(v) {
    state.viol = (state.viol || 0) + 1;
    state.lastViol = v;
    save();
    if (state.viol >= MAX_VIOL) { finish({ k: 'viol', v: v }); return; }
    renderBack();
    $('m-back').hidden = false;
  }
  function renderBack() {
    if (!state || !state.lastViol) return;
    var r = L(VIOL[state.lastViol][0], VIOL[state.lastViol][1]);
    $('m-back-text').textContent = r.charAt(0).toUpperCase() + r.slice(1) + ' ' + L('Қалған мүмкіндік: ', 'Осталось попыток: ') + (MAX_VIOL - (state.viol || 0)) + '. ' +
      L('Мүмкіндік біткенде жұмыс аяқталады. Батырманы басып, жұмысты жалғастырыңыз.', 'Когда попытки закончатся, работа завершится. Нажмите кнопку и продолжайте работу.');
  }
  function onFullscreenChange() {
    if (fsElement()) { fsActive = true; ignoreUntil = Date.now() + 1500; $('m-back').hidden = true; return; }
    if (fsActive) { fsActive = false; violation('fs'); }
  }
  function onVisibility() { if (document.visibilityState === 'hidden') violation('tab'); }
  function onBlur() {
    if (!running() || Date.now() < ignoreUntil) return;
    setTimeout(function () { if (!document.hasFocus() && document.visibilityState === 'visible') violation('win'); }, 400);
  }
  function warn(text) { $('warn-text').textContent = text; $('warn').hidden = false; clearTimeout(warn.t); warn.t = setTimeout(function () { $('warn').hidden = true; }, 5000); }
  function onKey(e) {
    if (!running()) return;
    if (e.key === 'Escape') { warn(L('Толық экраннан шықпаңыз: бұл бұзушылық.', 'Не выходите из полноэкранного режима: это нарушение.')); e.preventDefault(); }
    var k = (e.key || '').toLowerCase();
    if (e.key === 'F5' || e.key === 'F11' || ((e.ctrlKey || e.metaKey) && ['r', 'p', 's', 'f', 'o', 'n', 't', 'w', 'l'].indexOf(k) >= 0) ||
        (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight'))) { e.preventDefault(); warn(L('Жұмыс кезінде бұл әрекетке болмайды.', 'Это действие недоступно во время работы.')); }
  }
  function onPageHide() { leaving = true; if (running()) { state.closedAt = Date.now(); save(); } }
  function onBeforeUnload(e) {
    if (!running()) return;
    leaving = true; setTimeout(function () { leaving = false; }, 3000);
    e.preventDefault(); e.returnValue = ''; return '';
  }

  // ---------- Редактор кода ----------
  // Режим «Латиница»: при любой раскладке клавиша вводит символ английской раскладки, как подписано на клавише.
  var US = { Backquote: '`~', Digit1: '1!', Digit2: '2@', Digit3: '3#', Digit4: '4$', Digit5: '5%', Digit6: '6^', Digit7: '7&',
    Digit8: '8*', Digit9: '9(', Digit0: '0)', Minus: '-_', Equal: '=+', BracketLeft: '[{', BracketRight: ']}', Backslash: '\\|',
    IntlBackslash: '\\|', Semicolon: ';:', Quote: '\'"', Comma: ',<', Period: '.>', Slash: '/?' };
  var latin = (function () { try { return localStorage.getItem('ff-latin') !== 'off'; } catch (e) { return true; } })();
  function usChar(e) {
    if (!latin || e.ctrlKey || e.metaKey || e.altKey || !e.key || e.key.length !== 1) return null;
    var m = /^Key([A-Z])$/.exec(e.code || '');
    if (m) { var up = e.shiftKey !== (e.getModifierState && e.getModifierState('CapsLock')); return up ? m[1] : m[1].toLowerCase(); }
    var p = US[e.code];
    return p ? p.charAt(e.shiftKey ? 1 : 0) : null;
  }
  function renderLatin() {
    $('b-kbd').textContent = '⌨ ' + L('Латиница: ', 'Латиница: ') + (latin ? L('қосулы', 'вкл.') : L('өшірулі', 'выкл.'));
    $('b-kbd').classList.toggle('on', latin);
    $('b-kbd').title = latin ? L('Пернелер кез келген тілде ағылшын әріптері мен белгілерін енгізеді. Кириллицамен жазу үшін өшіріңіз.', 'Клавиши вводят английские буквы и знаки при любой раскладке. Выключите, чтобы писать кириллицей.')
      : L('Пернелер ағылшын әріптерін енгізуі үшін қосыңыз.', 'Включите, чтобы клавиши вводили английские буквы и знаки.');
  }
  function toggleLatin() {
    latin = !latin;
    try { localStorage.setItem('ff-latin', latin ? 'on' : 'off'); } catch (e) {}
    renderLatin();
    $('c-code').focus();
  }
  function latinKeys(ta) {
    ta.addEventListener('keydown', function (e) {
      var ch = usChar(e);
      if (ch === null || ch === e.key) return;
      e.preventDefault();
      ta.setRangeText(ch, ta.selectionStart, ta.selectionEnd, 'end');
      ta.dispatchEvent(new Event('input'));
    });
  }
  function setupEditor(ta) {
    latinKeys(ta);
    ta.addEventListener('keydown', function (e) {
      if (e.defaultPrevented) return;
      var v = ta.value, s = ta.selectionStart, en = ta.selectionEnd, ls = v.lastIndexOf('\n', s - 1) + 1;
      var put = function (txt, a, b, mode) { e.preventDefault(); ta.setRangeText(txt, a, b, mode); ta.dispatchEvent(new Event('input')); };
      if (e.key === 'Tab' && !e.shiftKey) put('    ', s, en, 'end');
      else if (e.key === 'Tab' && e.shiftKey) { var lead = /^ {1,4}/.exec(v.slice(ls)); if (lead) put('', ls, ls + lead[0].length, 'preserve'); else e.preventDefault(); }
      else if (e.key === 'Enter') { var line = v.slice(ls, s), ind = /^ */.exec(line)[0]; if (/:\s*$/.test(line)) ind += '    '; put('\n' + ind, s, en, 'end'); }
      else if (e.key === 'Backspace' && s === en && s > ls && /^ +$/.test(v.slice(ls, s)) && (s - ls) % 4 === 0) put('', s - 4, s, 'end');
    });
  }

  // ---------- Задачи ----------
  function navClass(i) {
    if (code[i].kind === 'quiz') return state.ans[i] != null ? ' answered' : '';
    var c = state.checks[i];
    if (c) return solved(c) ? ' ok' : ' bad';
    return (state.code[i] || '').trim() ? ' answered' : '';
  }
  function renderNav() {
    var box = $('nav'); box.innerHTML = '';
    for (var k = 0; k < NQ; k++) {
      (function (i) {
        var b = el('button', 'nav-btn' + navClass(i) + (i === state.cur ? ' cur' : ''), String(i + 1));
        b.type = 'button';
        b.addEventListener('click', function () { goTo(i); });
        box.appendChild(b);
      })(k);
    }
  }
  function goTo(i) { if (!running() || busy || i < 0 || i >= NQ) return; state.cur = i; save(); renderItem(); window.scrollTo(0, 0); }
  function renderItem() {
    var j = state.cur, tk = code[j];
    $('m-confirm').hidden = true;
    $('b-prev').disabled = j === 0;
    $('b-next').disabled = j === NQ - 1;
    $('w-num').textContent = (tk.kind === 'quiz' ? L('Тест · ', 'Тест · ') : L('Программа · ', 'Программа · ')) + L('тапсырма ', 'задание ') + (j + 1) + L(' / ', ' из ') + NQ;
    $('w-title').innerHTML = '';
    $('w-title').appendChild(document.createTextNode(tk.title));
    $('w-title').appendChild(el('span', 'lvl lvl-' + tk.level, L(tk.level + ' деңгейі', 'уровень ' + tk.level)));
    $('w-text').textContent = tk.text;
    $('q-body').hidden = tk.kind !== 'quiz'; $('c-body').hidden = tk.kind === 'quiz';
    if (tk.kind === 'quiz') { renderQuiz(j, tk); renderNav(); show('s-work'); tick(); return; }
    $('w-need').textContent = L('Программада міндетті түрде болуы керек: ', 'В программе обязательно должно быть: ') + needText(tk.need);
    $('c-in').textContent = tk.input;
    $('c-out').textContent = tk.output;
    var ex = $('c-ex'); ex.innerHTML = '';
    tk.tests.slice(0, 2).forEach(function (tc, k) {
      var tr = el('tr'); tr.appendChild(el('td', null, String(k + 1)));
      tr.appendChild(el('td', null, tc.input)); tr.appendChild(el('td', null, tc.output)); ex.appendChild(tr);
    });
    $('c-code').value = state.code[j] || '';
    $('c-stdin').value = state.stdin[j] != null ? state.stdin[j] : tk.tests[0].input;
    $('c-result').hidden = true;
    renderNav();
    show('s-work');
    tick();
  }
  function renderQuiz(j, tk) {
    var box = $('q-body'); box.innerHTML = '';
    if (tk.code) box.appendChild(el('pre', 'code', tk.code));
    var list = el('div', 'choices');
    tk.options.forEach(function (o, k) {
      var lab = el('label', 'choice' + (state.ans[j] === k ? ' sel' : ''));
      var rb = el('input'); rb.type = 'radio'; rb.name = 'q' + j; rb.checked = state.ans[j] === k;
      rb.addEventListener('change', function () { if (!running()) return; state.ans[j] = k; save(); renderNav(); renderQuiz(j, tk); });
      lab.appendChild(rb); lab.appendChild(el('span', 'letter', 'ABCD'[k] + ')')); lab.appendChild(el('span', 'opt' + (tk.mono ? ' mono' : ''), o));
      list.appendChild(lab);
    });
    box.appendChild(list);
    box.appendChild(el('p', 'muted small', state.ans[j] != null ? L('Жауап сақталды. Оны өзгертуге болады.', 'Ответ сохранён. Его можно изменить.') : L('Бір жауапты таңдаңыз.', 'Выберите один ответ.')));
  }
  function setBusy(v) {
    busy = v;
    ['b-run', 'b-check', 'b-prev', 'b-next', 'b-finish'].forEach(function (id) {
      $(id).disabled = v || (id === 'b-prev' && state.cur === 0) || (id === 'b-next' && state.cur === NQ - 1);
    });
  }
  function needCode(j) {
    if ((state.code[j] || '').trim()) return false;
    $('c-result').hidden = false; $('c-result').textContent = L('Алдымен программа жазыңыз.', 'Сначала напишите программу.');
    return true;
  }
  function doRun() {
    var j = state.cur;
    if (busy || !running() || needCode(j)) return;
    setBusy(true);
    $('c-result').hidden = false; $('c-result').textContent = L('Орындалуда…', 'Выполняется…');
    runPython(state.code[j], $('c-stdin').value).then(function (r) {
      setBusy(false);
      if (!running() || state.cur !== j) return;
      var box = $('c-result'); box.innerHTML = '';
      box.appendChild(el('b', null, L('Шығыс:', 'Вывод:')));
      box.appendChild(el('pre', null, r.out || L('(программа ештеңе шығармады)', '(программа ничего не вывела)')));
      if (r.error) { box.appendChild(el('b', 'bad', L('Қате:', 'Ошибка:'))); box.appendChild(el('pre', 'bad', r.error)); if (/invalid literal for int/.test(r.error)) box.appendChild(el('p', 'hint', inputHint())); }
    });
  }
  function doCheck() {
    var j = state.cur;
    if (busy || !running() || needCode(j)) return;
    setBusy(true);
    $('c-result').hidden = false; $('c-result').textContent = L('Тексерілуде…', 'Проверяется…');
    checkTask(j).then(function (res) {
      setBusy(false);
      if (!running()) return;
      state.checks[j] = { passed: res.passed, total: res.total, missing: res.missing };
      save(); renderNav();
      if (state.cur !== j) return;
      var box = $('c-result'), all = res.passed === res.total; box.innerHTML = '';
      if (all && !res.missing.length) box.appendChild(el('p', 'ok', L('✓ Барлық тест өтті! Есеп шешілді.', '✓ Все тесты пройдены! Задача решена.')));
      else box.appendChild(el('p', all ? 'bad' : 'bad', L('Өткен тест: ', 'Пройдено тестов: ') + res.passed + L(' / ', ' из ') + res.total));
      if (res.missing.length) box.appendChild(el('p', 'bad', L('Программада жоқ: ', 'В программе нет: ') + needText(res.missing) + L('. Шарт бойынша оларды қолдану міндетті — онсыз есеп есептелмейді.', '. По условию их нужно использовать — без них задача не засчитывается.')));
      var rows = el('div', 'tests-row');
      res.details.forEach(function (d, k) { rows.appendChild(el('span', 'tst ' + (d.ok ? 'ok' : 'bad'), (d.ok ? '✓ ' : '✗ ') + (k + 1))); });
      box.appendChild(rows);
      res.details.slice(0, 2).forEach(function (d, k) {
        if (d.ok || d.skipped) return;
        box.appendChild(el('b', null, L('Мысал ', 'Пример ') + (k + 1) + ':'));
        box.appendChild(el('pre', null, L('күтілген: ', 'ожидалось: ') + code[j].tests[k].output + '\n' + L('сіздің шығыс: ', 'ваш вывод: ') + (d.out || L('(ештеңе)', '(ничего)'))));
        if (d.error) box.appendChild(el('pre', 'bad', d.error));
        if (d.error && /invalid literal for int/.test(d.error)) box.appendChild(el('p', 'hint', inputHint()));
      });
      if (res.fail != null && res.fail >= 2) box.appendChild(el('p', 'hint', L('Жасырын тестте қате: шекаралық жағдайларды ойлаңыз (бос тізім, жауап жоқ, ең кіші немесе ең үлкен мән).', 'Ошибка на скрытом тесте: подумайте о граничных случаях (ничего не найдено, наименьшее или наибольшее значение).')));
    });
  }

  // ---------- Завершение и подсчёт ----------
  function finish(reason) {
    if (!running()) return;
    state.status = 'evaluating';
    state.reason = reason || null;
    state.finishedAt = state.closedAt || Date.now();
    save();
    clearInterval(ticker);
    $('warn').hidden = true; $('m-back').hidden = true; $('m-cheat').hidden = true;
    if (navigator.keyboard && navigator.keyboard.unlock) navigator.keyboard.unlock();
    fsActive = false;
    exitFullscreen();
    evaluateAll();
  }
  function evaluateAll() {
    show('s-eval');
    var results = [], j = 0;
    var next = function () {
      $('e-progress').textContent = L('Тексерілген тапсырма: ', 'Проверено заданий: ') + j + L(' / ', ' из ') + NQ;
      if (j >= NQ) { state.results = results; state.status = 'finished'; save(); queueResult(); renderResult(); flushOutbox(); return; }
      checkTask(j).then(function (res) {
        results.push({ quiz: !!res.quiz, choice: res.choice, passed: res.passed, total: res.total, fail: res.fail, missing: res.missing,
          details: res.details.map(function (d) { return { ok: d.ok, out: (d.out || '').slice(0, 500), error: d.error || null }; }) });
        j++; setTimeout(next, 0);
      });
    };
    next();
  }
  function tick() {
    if (!running() || state.stage === 'theory') return;
    var left = state.endsAt - Date.now();
    if (left <= 0) { finish({ k: 'time', min: window.WORK_MIN || 35 }); return; }
    $('tm-total').textContent = fmt(left);
    $('tm-total-box').classList.toggle('low', left <= 60000);
    $('tm-bar').style.width = (100 * left / WORK_MS) + '%';
  }

  function renderResult() {
    var ok = state.results.map(solved), score = ok.filter(Boolean).length;
    $('r-who').textContent = (state.who ? state.who.name + ', ' + state.who.cls : '');
    $('r-score-num').textContent = score + ' / ' + NQ;
    $('r-reason').textContent = reasonText(state.reason);
    $('r-reason').hidden = !state.reason;
    // Сводная таблица: задача, тесты, нужные инструкции, балл
    var tbl = el('table', 'report'), hr = el('tr');
    [L('№', '№'), L('Тапсырма', 'Задание'), L('Түрі', 'Тип'), L('Нәтиже', 'Результат'), L('Балл', 'Балл')].forEach(function (h) { hr.appendChild(el('th', null, h)); });
    tbl.appendChild(hr);
    code.forEach(function (tk, j) {
      var r = state.results[j], src = (state.code[j] || '').trim(), tr = el('tr', ok[j] ? 'ok' : 'bad');
      tr.appendChild(el('td', null, String(j + 1)));
      tr.appendChild(el('td', null, tk.title));
      tr.appendChild(el('td', null, tk.kind === 'quiz' ? L('тест', 'тест') : L('программа', 'программа')));
      tr.appendChild(el('td', null, tk.kind === 'quiz' ? (r.choice == null ? L('жауап жоқ', 'нет ответа') : 'ABCD'[r.choice] + (ok[j] ? ' ✓' : ' ✗')) : !src ? L('код жоқ', 'нет кода') : L('тест ', 'тестов ') + r.passed + ' / ' + r.total + (r.missing && r.missing.length ? ' · ' + L('жоқ: ', 'нет: ') + needText(r.missing) : '')));
      tr.appendChild(el('td', null, ok[j] ? '1' : '0'));
      tbl.appendChild(tr);
    });
    var total = el('tr'); ['', L('Барлығы', 'Итого'), '', '', score + ' / ' + NQ].forEach(function (x, k) { total.appendChild(el(k === 1 || k === 4 ? 'th' : 'td', null, x)); });
    tbl.appendChild(total);
    $('r-table').innerHTML = ''; $('r-table').appendChild(tbl);
    var tb = $('r-time'); tb.innerHTML = '';
    var used = state.startedAt ? Math.min(WORK_MS, Math.max(0, state.finishedAt - state.startedAt)) : 0;
    var p = el('p'); p.appendChild(document.createTextNode(L('Жұмыс уақыты: ', 'Время работы: '))); p.appendChild(el('b', null, fmt(used) + L(' / ', ' из ') + fmt(WORK_MS))); tb.appendChild(p);
    var p2 = el('p'); p2.appendChild(document.createTextNode(L('Бұзушылықтар: ', 'Нарушения: '))); p2.appendChild(el('b', null, String(state.viol || 0))); tb.appendChild(p2);
    var list = $('r-list'); list.innerHTML = '';
    code.forEach(function (tk, j) { list.appendChild(card(tk, j, state.results[j], ok[j])); });
    show('s-result');
    renderSend();
    scheduleLock();
  }
  function card(tk, j, r, ok) {
    if (tk.kind === 'quiz') {
      var q = el('article', 'rv ' + (ok ? 'ok' : 'bad')), qh = el('div', 'rv-head');
      qh.appendChild(el('span', 'rv-num', L('Тапсырма ', 'Задание ') + (j + 1) + ' (' + L('тест', 'тест') + ') — ' + tk.title));
      qh.appendChild(el('span', 'rv-badge', ok ? L('✓ дұрыс', '✓ верно') : L('✗ қате', '✗ неверно')));
      q.appendChild(qh); q.appendChild(el('p', 'rv-q', tk.text));
      if (tk.code) q.appendChild(el('pre', 'code', tk.code));
      var ul = el('ul', 'rv-opts');
      tk.options.forEach(function (o, k) {
        var right = k === tk.answer, mine = k === r.choice;
        var li = el('li', right ? 'right' : mine ? 'wrong' : '');
        li.appendChild(el('span', 'rv-mark', right ? '✓' : mine ? '✗' : '•'));
        li.appendChild(el('span', 'letter', 'ABCD'[k] + ')'));
        li.appendChild(el('span', 'opt', o + (right && mine ? L(' — сіздің жауабыңыз, дұрыс', ' — ваш ответ, верный') : right ? L(' — дұрыс жауап', ' — верный ответ') : mine ? L(' — сіздің жауабыңыз', ' — ваш ответ') : '')));
        ul.appendChild(li);
      });
      q.appendChild(ul);
      if (r.choice == null) q.appendChild(el('p', 'rv-err', L('Жауап таңдалмаған.', 'Ответ не выбран.')));
      if (tk.why) q.appendChild(el('p', 'rv-note', tk.why));
      return q;
    }
    var c = el('article', 'rv ' + (ok ? 'ok' : 'bad')), head = el('div', 'rv-head');
    head.appendChild(el('span', 'rv-num', L('Тапсырма ', 'Задание ') + (j + 1) + ' (' + L('программа', 'программа') + ') — ' + tk.title));
    head.appendChild(el('span', 'rv-badge', (ok ? L('✓ шешілді', '✓ решена') : L('✗ шешілмеді', '✗ не решена')) + ' · ' + L('тест ', 'тестов ') + r.passed + '/' + r.total));
    c.appendChild(head);
    c.appendChild(el('p', 'rv-q', tk.text));
    var src = state.code[j] || '', cols = el('div', 'rv-cols');
    var c1 = el('div'); c1.appendChild(el('b', null, L('Сіздің программаңыз', 'Ваша программа'))); c1.appendChild(el('pre', 'code', src.trim() ? src : L('(код жазылмаған)', '(код не написан)')));
    var c2 = el('div'); c2.appendChild(el('b', null, L('Үлгі шешім', 'Образец решения'))); c2.appendChild(el('pre', 'code', tk.solution));
    cols.appendChild(c1); cols.appendChild(c2); c.appendChild(cols);
    if (src.trim() && r.missing && r.missing.length) c.appendChild(el('p', 'rv-err', L('Программада жоқ: ', 'В программе нет: ') + needText(r.missing)));
    if (!ok && r.fail != null && src.trim()) {
      var tc = tk.tests[r.fail], d = r.details[r.fail] || {};
      c.appendChild(el('p', 'rv-err', L('Қате тест № ', 'Ошибка на тесте № ') + (r.fail + 1) + '\n' + L('кіріс: ', 'вход: ') + tc.input.replace(/\n/g, ' / ') + '\n' +
        L('күтілген: ', 'ожидалось: ') + tc.output + '\n' + L('сіздің шығыс: ', 'ваш вывод: ') + (d.out || L('(ештеңе)', '(ничего)')) + (d.error ? '\n' + d.error : '')));
    }
    return c;
  }
  function scheduleLock() {
    clearInterval(hideTimer);
    var update = function () {
      var left = state.finishedAt + RESULT_MS - Date.now();
      if (left <= 0) { clearInterval(hideTimer); resetToStart(); return; }
      $('r-hide').textContent = L('Бастапқы бет ашылуына ', 'Начальная страница откроется через ') + fmt(left) + L(' қалды.', '.');
      $('r-hide').hidden = false;
    };
    update();
    hideTimer = setInterval(update, 1000);
  }

  // ---------- Запуск ----------
  function newSeed() { var a = new Uint32Array(1); (window.crypto || window.msCrypto).getRandomValues(a); return a[0] || 1; }
  // ---------- Оқушы: сынып тізімі берілсе — сыныбын, содан кейін аты-жөнін тізімнен таңдайды ----------
  var OTHER = '__other__';
  function classList() { var c = window.CLASSES; return c && typeof c === 'object' && !Array.isArray(c) && Object.keys(c).length ? c : null; }
  function setupWho() {
    var cl = classList(); if (!cl) return;
    $('w-cls-sel').hidden = false; $('w-cls').hidden = true;
    var sc = $('s-cls'), keep = sc.value; sc.innerHTML = '';
    var o0 = el('option', null, L('— таңдаңыз —', '— выберите —')); o0.value = ''; sc.appendChild(o0);
    Object.keys(cl).forEach(function (k) { var o = el('option', null, k); o.value = k; sc.appendChild(o); });
    sc.value = keep; sc.onchange = function () { $('g-err').hidden = true; lockMsg(''); fillNames(); }; fillNames();
  }
  function fillNames() {
    var cl = classList(), sn = $('s-name'), c = $('s-cls').value, keep = sn.value; sn.innerHTML = '';
    var o0 = el('option', null, c ? L('— аты-жөніңізді таңдаңыз —', '— выберите себя —') : L('— алдымен сыныпты таңдаңыз —', '— сначала выберите класс —')); o0.value = ''; sn.appendChild(o0);
    if (c) {
      (cl[c] || []).forEach(function (n) { var o = el('option', null, n); o.value = n; sn.appendChild(o); });
      var oo = el('option', null, L('Тізімде жоқпын (өзім жазамын)', 'Меня нет в списке (впишу сам)')); oo.value = OTHER; sn.appendChild(oo);
    }
    sn.disabled = !c; $('w-name-sel').hidden = !c;
    if (keep && Array.prototype.some.call(sn.options, function (o) { return o.value === keep; })) sn.value = keep;
    $('w-name').hidden = sn.value !== OTHER;
    sn.onchange = function () { $('w-name').hidden = sn.value !== OTHER; $('g-err').hidden = true; lockMsg(''); if (sn.value === OTHER) $('g-name').focus(); };
  }
  function who() {
    var cl = classList();
    if (cl) {
      var c0 = $('s-cls').value, sel = $('s-name').value;
      var n0 = sel === OTHER ? $('g-name').value.replace(/\s+/g, ' ').trim() : sel;
      return c0 && n0 ? { name: n0, cls: c0 } : null;
    }
    var n = $('g-name').value.trim().replace(/\s+/g, ' '), c = $('g-class').value.trim().toUpperCase();
    return n && c ? { name: n, cls: c } : null;
  }

  // ---------- Нәтижені мұғалімге жіберу (Google Apps Script) ----------
  // Интернет болмаса, нәтиже осы компьютерде сақталады (OUTBOX) және кейін өзі жіберіледі.
  var OUTBOX = 'ff-' + TID + '-outbox', sending = false, lastErr = '';
  function resultsUrl() { var u = String(window.RESULTS_URL || '').trim(); return /^https:\/\/script\.google(usercontent)?\.com\//.test(u) ? u : ''; }
  function outbox() { try { return JSON.parse(localStorage.getItem(OUTBOX)) || []; } catch (e) { return []; } }
  function setOutbox(list) { try { localStorage.setItem(OUTBOX, JSON.stringify(list)); } catch (e) {} }
  function payload() {
    var ok = state.results.map(solved);
    var used = state.startedAt ? Math.min(WORK_MS, Math.max(0, state.finishedAt - state.startedAt)) : 0;
    return {
      app: APP, id: state.seed + '-' + (state.startedAt || 0), seed: state.seed, lang: LANG,
      name: state.who ? state.who.name : '', cls: state.who ? state.who.cls : '',
      topic: L(window.TOPIC.title.kz, window.TOPIC.title.ru), score: ok.filter(Boolean).length, max: NQ, time: fmt(used), viol: state.viol || 0, reasonText: reasonText(state.reason),
      tasks: code.map(function (tk, j) {
        var r = state.results[j], src = (state.code[j] || '').trim();
        if (tk.kind === 'quiz') return { no: j + 1, title: L('Тест: ', 'Тест: ') + tk.title, tests: L('тест', 'тест'),
          need: (r.choice == null ? L('жауап жоқ', 'нет ответа') : L('жауабы ', 'ответ ') + 'ABCD'[r.choice]) + ' · ' + L('дұрысы ', 'верный ') + 'ABCD'[tk.answer],
          pts: ok[j] ? 1 : 0, code: (tk.code ? tk.code + '\n\n' : '') + tk.options.map(function (o, k) { return 'ABCD'[k] + ') ' + o; }).join('\n') };
        return { no: j + 1, title: L('Программа: ', 'Программа: ') + tk.title, tests: src ? r.passed + ' / ' + r.total : L('код жоқ', 'нет кода'),
          need: !src || !tk.need.length ? '—' : r.missing && r.missing.length ? L('жоқ: ', 'нет: ') + needText(r.missing) : '✓ ' + needText(tk.need),
          pts: ok[j] ? 1 : 0, code: (state.code[j] || '').slice(0, 4000) };
      }),
    };
  }
  // Жауап: ok / dup / skip — қабылданды; error: … — скрипттегі қате; HTML (кіру беті) — қолжетімділік жабық
  function postResult(url, p) {
    return fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(p), redirect: 'follow' })
      .then(function (r) { return r.text(); })
      .then(function (txt) {
        txt = String(txt || '').trim();
        if (/^(ok|dup|skip)\b/.test(txt)) return txt;
        throw new Error(/^error:/.test(txt) ? txt : 'noaccess');
      });
  }
  function queueResult() {
    if (!resultsUrl() || state.queued) return;
    var list = outbox(); list.push(payload()); setOutbox(list);
    state.queued = true; state.sent = false; save();
  }
  function flushOutbox() {
    var url = resultsUrl(), list = outbox();
    if (!url || !list.length || sending) { renderSend(); return; }
    sending = true; renderSend();
    var p = list[0];
    postResult(url, p).then(function () {
      setOutbox(outbox().filter(function (x) { return x.id !== p.id; }));
      if (state && state.seed + '-' + (state.startedAt || 0) === p.id) { state.sent = true; save(); }
      sending = false; lastErr = ''; flushOutbox();
    }, function (e) { sending = false; lastErr = e && e.message || 'net'; renderSend(); setTimeout(flushOutbox, 30000); });
  }
  function renderSend() {
    var e = $('r-send'); if (!e) return;
    if (!state || state.status !== 'finished') { e.hidden = true; return; }
    if (!resultsUrl()) {
      e.hidden = false; e.className = 'r-send none';
      e.textContent = L('Нәтиже мұғалімге жіберілмеді: бұл файлда жіберу бапталмаған (мұғалімге: бастапқы беттегі сілтеме).', 'Результат учителю не отправлен: в этом файле отправка не настроена (для учителя: ссылка на начальной странице).');
      return;
    }
    if (!state.queued) { e.hidden = true; return; }
    e.hidden = false;
    e.className = 'r-send ' + (state.sent ? 'ok' : sending ? 'wait' : 'bad');
    e.textContent = state.sent ? L('✓ Нәтиже мұғалімге жіберілді.', '✓ Результат отправлен учителю.')
      : sending ? L('Нәтиже мұғалімге жіберілуде…', 'Результат отправляется учителю…')
      : /^error:/.test(lastErr) ? L('Нәтиже әзірге жіберілмеді: мұғалімнің скрипті қате қайтарды (', 'Результат пока не отправлен: скрипт учителя вернул ошибку (') + lastErr.slice(0, 160) + L('). Нәтиже сақталды, кейін қайта жіберіледі.', '). Результат сохранён и будет отправлен повторно.')
      : lastErr === 'noaccess' ? L('Нәтиже әзірге жіберілмеді: мұғалімнің скриптіне кіру жабық (жариялау баптауы). Нәтиже сақталды.', 'Результат пока не отправлен: скрипт учителя недоступен (настройка развертывания). Результат сохранён.')
      : L('Интернет жоқ: нәтиже осы компьютерде сақталды, интернет қосылғанда өзі жіберіледі.', 'Нет интернета: результат сохранён на этом компьютере и отправится сам, когда появится интернет.');
  }

  // ---------- Мұғалімге: Apps Script және сілтемесі бар файлды жүктеп алу ----------
  var PAGE_SRC = '';
  function showTeacher() {
    var src = document.getElementById('gs-src');
    $('gs-code').value = src ? src.textContent.trim().replace(/<\\\/script/gi, '</script') : L('(скрипт тек жинақталған файлда бар)', '(скрипт есть только в собранном файле)');
    $('i-url').value = String(window.RESULTS_URL || '');
    var u = resultsUrl();
    $('t-status').textContent = u ? L('Бұл файлда сілтеме бар — нәтижелер жіберіледі: ', 'В этом файле ссылка уже есть — результаты отправляются: ') + u : L('Бұл файлда сілтеме әлі жоқ — нәтижелер жіберілмейді.', 'В этом файле ссылки пока нет — результаты не отправляются.');
    $('url-msg').textContent = '';
    show('s-teacher');
  }
  function urlOk(u) { return /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(u); }
  var BAD_URL = ['Сілтеме https://script.google.com/macros/s/…/exec түрінде болуы керек.', 'Ссылка должна быть вида https://script.google.com/macros/s/…/exec'];
  function downloadConfigured() {
    var u = $('i-url').value.trim();
    if (!urlOk(u)) { $('url-msg').textContent = L(BAD_URL[0], BAD_URL[1]); return; }
    var html = PAGE_SRC.replace(/window\.RESULTS_URL = "[^"]*";/, 'window.RESULTS_URL = "' + u + '";');
    if (html.indexOf(u) < 0) { $('url-msg').textContent = L('Файлды жасау мүмкін болмады.', 'Не удалось создать файл.'); return; }
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
    a.download = window.TOPIC.file;
    document.body.appendChild(a); a.click(); a.remove();
    $('url-msg').textContent = L('Файл жүктелді (Жүктеулер қалтасында). Оқушыларға осы файлды беріңіз.', 'Файл скачан (папка «Загрузки»). Давайте ученикам этот файл.');
  }
  function testUrl() {
    var u = $('i-url').value.trim();
    if (!urlOk(u)) { $('url-msg').textContent = L(BAD_URL[0], BAD_URL[1]); return; }
    $('url-msg').textContent = L('Тексерілуде…', 'Проверка…');
    var p = { app: APP, topic: L(window.TOPIC.title.kz, window.TOPIC.title.ru), id: 'test-' + Date.now(), seed: 0, lang: LANG, name: L('ТЕКСЕРУ (мұғалім)', 'ПРОВЕРКА (учитель)'), cls: '—', score: 0, max: NQ, time: '0:00', viol: 0, reasonText: '', tasks: [] };
    postResult(u, p).then(function (txt) {
      $('url-msg').textContent = L('✓ Скрипт жауап берді («' + txt + '»): бәрі жұмыс істейді. Поштаны (Спам қалтасын да) қараңыз — «ТЕКСЕРУ» деген хат келуі керек.', '✓ Скрипт ответил («' + txt + '»): всё работает. Проверьте почту (и «Спам») — должно прийти письмо «ПРОВЕРКА».');
    }, function (e) {
      $('url-msg').textContent = /^error:/.test(e.message)
        ? L('✗ Скрипт қате қайтарды: ', '✗ Скрипт вернул ошибку: ') + e.message + L(' — редакторда setup функциясын іске қосып, рұқсат беріңіз, содан кейін жаңа нұсқаны жариялаңыз.', ' — запустите в редакторе setup, разрешите доступ и разверните новую версию.')
        : L('✗ Скрипт жауап бермеді немесе кіруді сұрайды. Жариялау баптауы: «Кімнің атынан» — Мен, «Кімге қолжетімді» — Барлығы. Сілтеме /exec деп аяқталуы керек.', '✗ Скрипт не ответил или требует входа. Развертывание: «Запуск от имени» — Я, «У кого есть доступ» — Все. Ссылка должна заканчиваться на /exec.');
    });
  }

  // ---------- Бір оқушы — бір кіру (LOCK_HOURS сағат) ----------
  // Осы браузерде — localStorage; басқа браузер мен компьютерлер үшін — мұғалімнің скриптіндегі «Кірулер» парағы.
  var CLAIMS = 'ff-claims';
  function lockMs() { var h = Number(window.LOCK_HOURS); return (isFinite(h) && h > 0 ? h : 0) * 3600 * 1000; }
  function claimKey(w) { return [TID, w.cls, w.name].join('|').replace(/\s+/g, ' ').toLowerCase(); }
  function localClaims() { try { return JSON.parse(localStorage.getItem(CLAIMS)) || {}; } catch (e) { return {}; } }
  function setLocalClaim(w, at) { var c = localClaims(), now = Date.now(); Object.keys(c).forEach(function (k) { if (now - c[k] > lockMs()) delete c[k]; }); c[claimKey(w)] = at; try { localStorage.setItem(CLAIMS, JSON.stringify(c)); } catch (e) {} }
  function jsonp(url, params, ms) {
    return new Promise(function (ok, fail) {
      var cb = 'ffcb' + Date.now() + Math.floor(Math.random() * 1e6), s = document.createElement('script'), done = false;
      function end() { done = true; try { delete window[cb]; } catch (e) { window[cb] = undefined; } if (s.parentNode) s.parentNode.removeChild(s); }
      window[cb] = function (d) { if (done) return; end(); ok(d); };
      params.cb = cb; params.t = Date.now();
      s.src = url + '?' + Object.keys(params).map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]); }).join('&');
      s.onerror = function () { if (!done) { end(); fail(new Error('net')); } };
      setTimeout(function () { if (!done) { end(); fail(new Error('timeout')); } }, ms);
      document.head.appendChild(s);
    });
  }
  function when(t) { var d = new Date(t), p = function (x) { return ('0' + x).slice(-2); }; return p(d.getDate()) + '.' + p(d.getMonth() + 1) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()); }
  function lockMsg(text, wait) { var m = $('g-lock'); m.textContent = text; m.classList.toggle('wait', !!wait); m.hidden = !text; }
  function denyText(w, at, until) {
    return L('⛔ Кіру жабық. «' + w.name + ', ' + w.cls + '» бұл жұмысты ' + when(at) + ' уақытында бастаған.\nҚайта кіру: ' + when(until) + ' кейін.\nБұл сіз болмасаңыз (біреу сіздің атыңызды таңдаған), мұғалімге айтыңыз.',
      '⛔ Доступ закрыт. «' + w.name + ', ' + w.cls + '» уже начинал(а) эту работу ' + when(at) + '.\nСнова войти можно после ' + when(until) + '.\nЕсли это были не вы (кто-то выбрал ваше имя), скажите учителю.');
  }
  var claiming = false;
  function start() {
    if (state || claiming) return;
    var w = who();
    if (!w) { $('g-err').hidden = false; return; }
    lockMsg('');
    var lim = lockMs(), seed = newSeed();
    if (!lim) return begin(w, seed);
    var prev = localClaims()[claimKey(w)];
    if (prev && Date.now() - prev < lim) { lockMsg(denyText(w, prev, prev + lim)); return; }
    var url = resultsUrl();
    if (!url) { setLocalClaim(w, Date.now()); return begin(w, seed); }
    claiming = true; $('b-start').disabled = true;
    lockMsg(L('Тексерілуде… (мұғалімнің скриптіне сұрау)', 'Проверка… (запрос к скрипту учителя)'), true);
    jsonp(url, { a: 'claim', app: APP, cls: w.cls, name: w.name, wid: seed, ua: navigator.userAgent.slice(0, 120) }, 20000).then(function (d) {
      if (d && d.ok) { lockMsg(''); setLocalClaim(w, Date.now()); begin(w, seed); }
      else if (d && d.at) { setLocalClaim(w, d.at); lockMsg(denyText(w, d.at, d.until)); }
      else lockMsg(L('⛔ Мұғалімнің скрипті қате қайтарды: ' + (d && d.error) + '. Мұғалімге айтыңыз.', '⛔ Скрипт учителя вернул ошибку: ' + (d && d.error) + '. Скажите учителю.'));
    }, function () {
      lockMsg(L('⛔ Интернет жоқ немесе мұғалімнің скрипті жауап бермеді — кіруді тексеру мүмкін емес. Интернетті тексеріп, батырманы қайта басыңыз.', '⛔ Нет интернета или скрипт учителя не ответил — проверить вход невозможно. Проверьте интернет и нажмите кнопку ещё раз.'));
    }).then(function () { claiming = false; $('b-start').disabled = false; });
  }
  function begin(w, seed) {
    var name = w.name, cls = w.cls;
    var fs = enterFullscreen();
    code = CODE.generate(seed, LANG);
    state = { v: 1, seed: seed, status: 'running', stage: 'theory', who: { name: name, cls: cls }, startedAt: null, endsAt: null, viol: 0, cur: 0,
      code: code.map(function () { return ''; }), ans: code.map(function () { return null; }), stdin: code.map(function () { return null; }), checks: code.map(function () { return null; }) };
    save();
    ticker = setInterval(tick, 250);
    fs.then(function () { show('s-theory'); });
  }
  // Время на задачи начинается, когда ученик закончил читать теорию
  function toWork() {
    if (!running() || state.stage !== 'theory') return;
    enterFullscreen();
    state.stage = 'work'; state.startedAt = Date.now(); state.endsAt = Date.now() + WORK_MS;
    save();
    renderItem();
  }
  function resetToStart() {
    try { localStorage.removeItem(STORE); } catch (e) {}
    location.reload();
  }

  function applyLang() {
    document.documentElement.lang = LANG === 'kz' ? 'kk' : 'ru';
    document.title = L(window.TOPIC.title.kz, window.TOPIC.title.ru);
    document.querySelectorAll('.i-min').forEach(function (e) { e.textContent = String(window.WORK_MIN || 35); });
    document.querySelectorAll('.i-lock').forEach(function (e) { e.textContent = String(lockMs() / 3600000); });
    document.querySelectorAll('.lock-warn').forEach(function (e) { e.hidden = !lockMs(); });
    document.querySelectorAll('.lang-switch button').forEach(function (b) { var on = b.getAttribute('data-lang') === LANG; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
  }
  // Смена языка: код и таймер сохраняются; числа и тесты те же (зависят только от seed)
  function setLang(l) {
    if (l === LANG) return;
    LANG = l;
    try { localStorage.setItem('ff-lang', l); } catch (e) {}
    applyLang();
    setupWho();
    if (state && state.seed) code = CODE.generate(state.seed, LANG);
    if (!$('s-work').hidden) { var keep = $('c-code').value, out = $('c-result').hidden; renderItem(); $('c-code').value = keep; $('c-result').hidden = out; }
    else if (!$('s-result').hidden) renderResult();
    if (!$('m-back').hidden) renderBack();
    renderLatin();
  }

  function init() {
    PAGE_SRC = '<!doctype html>\n' + document.documentElement.outerHTML;
    applyLang();
    setupWho();
    $('b-teacher').addEventListener('click', showTeacher);
    $('b-teacher-back').addEventListener('click', function () { show('s-gate'); });
    $('b-gs-copy').addEventListener('click', function () { var ta = $('gs-code'); ta.select(); try { if (navigator.clipboard) navigator.clipboard.writeText(ta.value); else document.execCommand('copy'); } catch (e) { document.execCommand('copy'); } warn(L('Скрипт көшірілді.', 'Скрипт скопирован.')); });
    $('b-download').addEventListener('click', downloadConfigured);
    $('b-test-url').addEventListener('click', testUrl);
    if (outbox().length) setTimeout(flushOutbox, 1500);
    document.querySelectorAll('.lang-switch button').forEach(function (b) { b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); }); });
    $('b-start').addEventListener('click', start);
    // Шпаргалку можно открыть в любой момент работы (окно поверх задачи; код и таймер не останавливаются)
    $('cheat-slot').appendChild($('theory').cloneNode(true)).removeAttribute('id');
    $('b-to-work').addEventListener('click', toWork);
    $('b-cheat').addEventListener('click', function () { $('m-cheat').hidden = false; $('b-cheat-close').focus(); });
    $('b-cheat-close').addEventListener('click', function () { $('m-cheat').hidden = true; $('c-code').focus({ preventScroll: true }); });
    $('m-cheat').addEventListener('click', function (e) { if (e.target === $('m-cheat')) $('m-cheat').hidden = true; });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !$('m-cheat').hidden) $('m-cheat').hidden = true; });
    ['g-name', 'g-class'].forEach(function (id) { $(id).addEventListener('input', function () { $('g-err').hidden = true; }); $(id).addEventListener('keydown', function (e) { if (e.key === 'Enter') start(); }); });
    $('b-back-fs').addEventListener('click', function () { enterFullscreen().then(function () { if (fsElement() || !fsSupported()) $('m-back').hidden = true; }); });
    $('b-restart').addEventListener('click', resetToStart);
    $('b-run').addEventListener('click', doRun);
    $('b-check').addEventListener('click', doCheck);
    $('b-prev').addEventListener('click', function () { goTo(state.cur - 1); });
    $('b-next').addEventListener('click', function () { goTo(state.cur + 1); });
    $('b-finish').addEventListener('click', function () {
      var c = code.filter(function (x, j) { return x.kind === 'quiz' ? state.ans[j] == null : !(state.code[j] || '').trim(); }).length;
      $('m-confirm-text').textContent = L('Жұмысты аяқтайсыз ба?', 'Завершить работу?') + (c ? L(' Орындалмаған тапсырма: ', ' Невыполненных заданий: ') + c + '.' : '') +
        L(' Балл қазіргі жауаптар мен код бойынша есептеледі.', ' Балл будет посчитан по текущим ответам и коду.');
      $('m-confirm').hidden = false;
    });
    $('b-finish-yes').addEventListener('click', function () { finish(null); });
    $('b-finish-no').addEventListener('click', function () { $('m-confirm').hidden = true; });
    $('warn').addEventListener('click', function () { $('warn').hidden = true; });
    var ed = $('c-code');
    setupEditor(ed);
    latinKeys($('c-stdin'));
    $('b-kbd').addEventListener('click', toggleLatin);
    renderLatin();
    ed.addEventListener('input', function () {
      if (!running()) return;
      var j = state.cur;
      state.code[j] = ed.value; state.checks[j] = null;   // код изменился — прошлая проверка устарела
      save(); renderNav();
    });
    $('c-stdin').addEventListener('input', function () { if (running()) { state.stdin[state.cur] = $('c-stdin').value; save(); } });

    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('beforeunload', onBeforeUnload);
    window.addEventListener('pagehide', onPageHide);
    document.addEventListener('contextmenu', function (e) { if (running()) e.preventDefault(); });
    history.pushState(null, '', location.href);
    window.addEventListener('popstate', function () { if (running()) { history.pushState(null, '', location.href); warn(L('Жұмыс кезінде артқа өтуге болмайды.', 'Переход назад во время работы недоступен.')); } });

    if (!fsSupported()) $('i-nofs').hidden = false;

    state = load();
    if (state && state.v === 1 && state.seed && state.ans) code = CODE.generate(state.seed, LANG); else state = null;
    if (state && state.status === 'running') {
      // Страница была закрыта или перезагружена — нарушение; работа продолжается с того же места (таймер не останавливался)
      state.viol = (state.viol || 0) + 1; state.lastViol = 'reload';
      if (state.viol >= MAX_VIOL) { finish({ k: 'viol', v: 'reload' }); return; }
      delete state.closedAt; save();
      violLock = Date.now() + 1500;
      ticker = setInterval(tick, 250);
      if (state.stage === 'theory') show('s-theory'); else renderItem();
      renderBack();
      $('m-back').hidden = false;
      return;
    }
    if (state && state.status === 'evaluating') { evaluateAll(); return; }
    if (state && state.status === 'finished') { renderResult(); return; }
    state = null;
    show('s-gate');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
