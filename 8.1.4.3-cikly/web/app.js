/* Веб-ресурс 8.1.4.3: теория → тест (10 вопросов, проверяется сразу; при низком балле можно перечитать теорию
 * и пройти тест заново, засчитывается лучшая попытка) → 10 задач на код (Python выполняется в браузере через Skulpt).
 * Балл: тест — 1 за верный ответ; задача — 1, если пройдены все 8 тестов. Максимум 20.
 * Полноэкранный режим; выход из него, переключение окна, закрытие или перезагрузка страницы завершают работу,
 * балл считается по ответам и коду на этот момент. Интернет и сервер не нужны. */
(function () {
  'use strict';

  var QUIZ_MS = (window.QUIZ_MIN || 15) * 60 * 1000;
  var CODE_MS = (window.CODE_MIN || 80) * 60 * 1000;
  var ATTEMPTS = window.QUIZ_ATTEMPTS || 3, PASS = window.QUIZ_PASS || 7;
  var RESULT_MS = (window.RESULT_MIN || 5) * 60 * 1000;
  var STORE = 'cikly-8143-state';
  var RUN_LIMIT_MS = 1000, OUT_LIMIT = 20000;
  var LETTERS = ['A', 'B', 'C', 'D'];

  // ---------- Язык: казахский по умолчанию, кнопка ҚАЗ / РУС переключает в любой момент ----------
  var LANG = (function () { try { return localStorage.getItem('cikly-lang') === 'ru' ? 'ru' : 'kz'; } catch (e) { return 'kz'; } })();
  function t(s) {
    if (LANG !== 'kz') return s;
    var d = window.UI_KZ && window.UI_KZ.JS;
    return d && d[s] !== undefined ? d[s] : s;
  }

  var $ = function (id) { return document.getElementById(id); };
  var state = null, quiz = [], code = [], fsActive = false, ignoreUntil = 0, ticker = null, hideTimer = null, busy = false;

  function save() { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) {} }
  function load() { try { return JSON.parse(localStorage.getItem(STORE)); } catch (e) { return null; } }
  function running() { return !!state && state.status === 'running'; }
  function show(id) {
    ['s-loading', 's-theory', 's-intro', 's-work', 's-quizres', 's-eval', 's-result', 's-locked'].forEach(function (s) { $(s).hidden = s !== id; });
    $('timers').hidden = !running() || state.stage === 'quizres' || id !== 's-work';
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
        return { out: out, error: to ? t('Программа работала слишком долго (возможно, бесконечный цикл).') : msg, timeout: to };
      });
  }
  function checkTask(i) {
    var task = code[i], src = state.code[i] || '', res = { passed: 0, total: task.tests.length, details: [] };
    if (!src.trim()) return Promise.resolve(res);
    var k = 0;
    var step = function () {
      if (k >= task.tests.length) return res;
      var tc = task.tests[k];
      return runTest(src, tc.input, tc.output, CODE.sameOutput).then(function (x) {
        var r = x.r, ok = x.ok;
        if (ok) res.passed++;
        res.details.push({ ok: ok, out: r.out, error: r.error || null });
        if (!ok && res.fail == null) res.fail = k;
        k++;
        if (r.timeout) { for (; k < task.tests.length; k++) res.details.push({ ok: false, skipped: true }); return res; }
        return step();
      });
    };
    return step();
  }

  // Если в строке теста несколько чисел, а программа читает каждое число отдельным input(),
  // повторяем запуск, подав каждое число на отдельной строке: засчитываются оба способа ввода.
  function runTest(src, input, output, same) {
    return runPython(src, input).then(function (r) {
      var ok = !r.error && same(r.out, output);
      var multi = String(input).split('\n').some(function (l) { return l.trim().split(/\s+/).length > 1; });
      if (ok || !multi || r.timeout) return { r: r, ok: ok };
      var alt = String(input).trim().split(/\s+/).join('\n');
      return runPython(src, alt).then(function (r2) {
        var ok2 = !r2.error && same(r2.out, output);
        return ok2 ? { r: r2, ok: true } : { r: r, ok: false };
      });
    });
  }
  function inputHint() {
    return t('Подсказка: если в одной строке несколько чисел, прочитайте их так: a, b = map(int, input().split()). ') +
      t('Или в поле «Входные данные» запишите каждое число на отдельной строке — при проверке засчитываются оба способа.');
  }

  // ---------- Полноэкранный режим и защита ----------
  function fsElement() { return document.fullscreenElement || document.webkitFullscreenElement || null; }
  function fsSupported() { var e = document.documentElement; return !!(e.requestFullscreen || e.webkitRequestFullscreen); }
  function enterFullscreen() {
    var e = document.documentElement, req = e.requestFullscreen || e.webkitRequestFullscreen;
    if (!req || fsElement()) return Promise.resolve();
    try {
      return Promise.resolve(req.call(e, { navigationUI: 'hide' })).then(function () {
        if (navigator.keyboard && navigator.keyboard.lock) navigator.keyboard.lock().catch(function () {});
      }).catch(function () {});
    } catch (err) { return Promise.resolve(); }
  }
  function exitFullscreen() { var ex = document.exitFullscreen || document.webkitExitFullscreen; if (fsElement() && ex) { try { ex.call(document); } catch (e) {} } }
  function violation(reason) { if (!running()) return; setTimeout(function () { if (running()) finish(['Работа завершена автоматически: ', reason]); }, 300); }
  function onFullscreenChange() {
    if (fsElement()) { fsActive = true; ignoreUntil = Date.now() + 1500; return; }
    if (fsActive) { fsActive = false; violation('вы вышли из полноэкранного режима.'); }
  }
  function onVisibility() { if (document.visibilityState === 'hidden') violation('вы переключились на другую вкладку или приложение.'); }
  function onBlur() {
    if (!running() || Date.now() < ignoreUntil) return;
    setTimeout(function () { if (!document.hasFocus() && document.visibilityState === 'visible') violation('вы переключились на другое окно или приложение.'); }, 400);
  }
  function warn(text) { $('warn-text').textContent = text; $('warn').hidden = false; clearTimeout(warn.t); warn.t = setTimeout(function () { $('warn').hidden = true; }, 5000); }
  function onKey(e) {
    if (!running()) return;
    if (e.key === 'Escape') { warn(t('Не выходите из полноэкранного режима: работа сразу завершится.')); e.preventDefault(); }
    var k = (e.key || '').toLowerCase();
    if (e.key === 'F5' || e.key === 'F11' || ((e.ctrlKey || e.metaKey) && ['r', 'p', 's', 'f', 'o', 'n', 't', 'w', 'l'].indexOf(k) >= 0) ||
        (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight'))) { e.preventDefault(); warn(t('Это действие недоступно во время работы.')); }
  }
  function onPageHide() { if (running()) { state.closedAt = Date.now(); save(); } }
  function onBeforeUnload(e) { if (!running()) return; e.preventDefault(); e.returnValue = ''; return ''; }

  // ---------- Редактор кода ----------
  function setupEditor(ta) {
    ta.addEventListener('keydown', function (e) {
      var v = ta.value, s = ta.selectionStart, en = ta.selectionEnd, ls = v.lastIndexOf('\n', s - 1) + 1;
      var put = function (txt, a, b, mode) { e.preventDefault(); ta.setRangeText(txt, a, b, mode); ta.dispatchEvent(new Event('input')); };
      if (e.key === 'Tab' && !e.shiftKey) put('    ', s, en, 'end');
      else if (e.key === 'Tab' && e.shiftKey) { var lead = /^ {1,4}/.exec(v.slice(ls)); if (lead) put('', ls, ls + lead[0].length, 'preserve'); else e.preventDefault(); }
      else if (e.key === 'Enter') { var line = v.slice(ls, s), ind = /^ */.exec(line)[0]; if (/:\s*$/.test(line)) ind += '    '; put('\n' + ind, s, en, 'end'); }
      else if (e.key === 'Backspace' && s === en && s > ls && /^ +$/.test(v.slice(ls, s)) && (s - ls) % 4 === 0) put('', s - 4, s, 'end');
    });
  }

  // ---------- Этапы: 'quiz' (попытка теста) → 'quizres' (результат теста) → 'code' (задачи) ----------
  var NQ = 10;
  function quizSeed(n) { return (state.seed + n * 7919) >>> 0; }      // у каждой попытки свои числа
  function stageEnds() { return state.stage === 'quiz' ? state.quizEndsAt : state.codeEndsAt; }
  function stageMs() { return state.stage === 'quiz' ? QUIZ_MS : CODE_MS; }
  function bestAttempt() {
    var b = null;
    state.attempts.forEach(function (a) { if (!b || a.score > b.score) b = a; });
    return b;
  }

  function navClass(i) {
    if (state.stage === 'quiz') return QUIZ.isComplete(quiz[i], state.q[i]) ? ' answered' : '';
    var c = state.checks[i];
    if (c && c.passed === c.total) return ' ok';
    if (c) return ' bad';
    return (state.code[i] || '').trim() ? ' answered' : '';
  }
  function renderNav() {
    var isQ = state.stage === 'quiz';
    $('nav-q-box').hidden = !isQ;
    $('nav-c-box').hidden = isQ;
    $('nav-q-label').textContent = t('Тест — попытка ') + state.attempt + t(' из ') + ATTEMPTS;
    var box = $(isQ ? 'nav-q' : 'nav-c'); box.innerHTML = '';
    for (var k = 0; k < NQ; k++) {
      (function (i) {
        var b = el('button', 'nav-btn' + navClass(i) + (i === state.cur ? ' cur' : ''), isQ ? String(i + 1) : (i + 1) + code[i].level);
        b.type = 'button';
        b.addEventListener('click', function () { goTo(i); });
        box.appendChild(b);
      })(k);
    }
  }
  function goTo(i) { if (!running() || busy || i < 0 || i >= NQ) return; state.cur = i; save(); renderItem(); window.scrollTo(0, 0); }

  function renderItem() {
    var i = state.cur, isQ = state.stage === 'quiz';
    $('q-body').hidden = !isQ;
    $('c-body').hidden = isQ;
    $('m-confirm').hidden = true;
    $('b-prev').disabled = i === 0;
    $('b-next').disabled = i === NQ - 1;
    $('b-finish').textContent = isQ ? t('Сдать тест') : t('Завершить работу');
    $('w-legend').textContent = isQ ? t('Синий — есть ответ. Нажмите на номер, чтобы открыть вопрос.') : t('Синий — код написан; зелёный — все тесты пройдены; красный — при проверке есть ошибки.');
    if (isQ) renderQuiz(i); else renderCode(i);
    renderNav();
    show('s-work');
    tick();
  }

  // ---------- Тест ----------
  function renderQuiz(i) {
    var q = quiz[i], g = state.q[i];
    $('w-num').textContent = t('Тест · вопрос ') + (i + 1) + t(' из ') + NQ;
    $('w-title').textContent = q.title;
    $('w-text').textContent = q.text;
    var box = $('q-body'); box.innerHTML = '';
    if (q.code) box.appendChild(el('pre', 'code', q.code));
    if (q.type === 'choice') {
      var list = el('div', 'choices');
      q.options.forEach(function (o, k) {
        var lab = el('label', 'choice');
        var r = el('input'); r.type = 'radio'; r.name = 'q'; r.value = String(k); r.checked = g === k;
        r.addEventListener('change', function () { state.q[i] = k; save(); renderNav(); $('w-saved').hidden = false; });
        lab.appendChild(r);
        lab.appendChild(el('span', 'letter', LETTERS[k] + ')'));
        lab.appendChild(el('span', 'opt' + (q.mono ? ' mono' : ''), o));
        list.appendChild(lab);
      });
      box.appendChild(list);
    } else {
      var cur = Array.isArray(g) ? g.slice() : q.items.map(function () { return null; });
      var m = el('div', 'match');
      q.items.forEach(function (it, k) {
        var row = el('div', 'match-row');
        var left = el('div', 'match-left'); left.appendChild(el(it.word ? 'b' : 'code', null, it.code));
        var sel = el('select'); sel.setAttribute('aria-label', t('Пара для ') + it.name);
        sel.appendChild(el('option', null, t('— выберите —'))).value = '';
        q.options.forEach(function (o, n) { var op = el('option', null, o); op.value = String(n); sel.appendChild(op); });
        sel.value = cur[k] == null ? '' : String(cur[k]);
        sel.addEventListener('change', function () { cur[k] = sel.value === '' ? null : Number(sel.value); state.q[i] = cur.slice(); save(); renderNav(); $('w-saved').hidden = false; });
        row.appendChild(left); row.appendChild(el('span', 'arrow', '→')); row.appendChild(sel);
        m.appendChild(row);
      });
      box.appendChild(m);
    }
    $('w-saved').hidden = !QUIZ.isComplete(q, g);
  }

  // Сдать попытку теста: результат сохраняется, ученик видит балл и где ошибся
  function submitQuiz(auto) {
    if (!running() || state.stage !== 'quiz') return;
    var ok = quiz.map(function (q, i) { return QUIZ.isCorrect(q, state.q[i]); });
    state.attempts.push({ n: state.attempt, seed: quizSeed(state.attempt), answers: state.q.slice(), ok: ok,
      score: ok.filter(Boolean).length, auto: !!auto, at: Date.now() });
    state.stage = 'quizres';
    save();
    renderQuizResult();
  }
  function renderQuizResult() {
    var last = state.attempts[state.attempts.length - 1], best = bestAttempt();
    var left = ATTEMPTS - state.attempts.length;
    $('qr-score').textContent = last.score + ' / ' + NQ;
    var msg = (last.auto ? t('Время на тест закончилось — тест сдан автоматически. ') : '');
    if (last.score === NQ) msg += t('Отлично, все ответы верные! Переходите к задачам на код.');
    else if (last.score < PASS && left > 0) msg += t('Балл низкий. Перечитайте разделы теории, указанные у неверных ответов, и пройдите тест заново — засчитается лучшая попытка.');
    else if (left > 0) msg += t('Можно перейти к задачам или пройти тест ещё раз, чтобы улучшить результат (засчитается лучшая попытка).');
    else msg += t('Попытки закончились. Переходите к задачам на код.');
    $('qr-msg').textContent = msg;
    $('qr-attempts').textContent = t('Попытка ') + last.n + t(' из ') + ATTEMPTS + t('. Баллы по попыткам: ') +
      state.attempts.map(function (a) { return a.score; }).join(', ') + t('. Засчитывается лучшая: ') + best.score + ' / ' + NQ + '.';
    $('b-retry').hidden = left <= 0 || last.score === NQ;
    $('b-retry').textContent = t('↻ Пройти тест заново (осталось попыток: ') + left + ')';
    $('qr-confirm').hidden = true;
    var lq = quizFor(last.n), list = $('qr-list'); list.innerHTML = '';
    lq.forEach(function (q, i) {
      var card = quizCard(q, last.answers[i], last.ok[i], i);
      if (!last.ok[i]) card.appendChild(el('p', 'rv-theory', t('📖 Повторите теорию: раздел ') + q.theory));
      list.appendChild(card);
    });
    show('s-quizres');
  }
  function quizFor(n) { return QUIZ.generate(quizSeed(n), n - 1, state.seed, LANG); }   // n — номер попытки
  function retryQuiz() {
    if (!running() || state.stage !== 'quizres' || state.attempts.length >= ATTEMPTS) return;
    state.attempt = state.attempts.length + 1;
    quiz = quizFor(state.attempt);
    state.q = quiz.map(function () { return null; });
    state.stage = 'quiz';
    state.cur = 0;
    state.quizEndsAt = Date.now() + QUIZ_MS;
    save();
    renderItem();
  }
  function toCode() {
    if (!running() || state.stage !== 'quizres') return;
    state.stage = 'code';
    state.cur = 0;
    state.codeStartedAt = Date.now();
    state.codeEndsAt = Date.now() + CODE_MS;
    save();
    renderItem();
  }

  // ---------- Задачи на код ----------
  function renderCode(j) {
    var tk = code[j];
    $('w-num').textContent = t('Задача ') + (j + 1) + t(' из ') + NQ;
    $('w-title').innerHTML = '';
    $('w-title').appendChild(document.createTextNode(tk.title));
    $('w-title').appendChild(el('span', 'lvl lvl-' + tk.level, t('уровень ') + tk.level));
    $('w-text').textContent = tk.text;
    $('c-in').textContent = tk.input;
    $('c-out').textContent = tk.output;
    var ex = $('c-ex'); ex.innerHTML = '';
    tk.tests.slice(0, 2).forEach(function (tc) { var tr = el('tr'); tr.appendChild(el('td', null, tc.input)); tr.appendChild(el('td', null, tc.output)); ex.appendChild(tr); });
    $('c-code').value = state.code[j] || '';
    $('c-stdin').value = state.stdin[j] != null ? state.stdin[j] : tk.tests[0].input;
    $('c-result').hidden = true;
    $('w-saved').hidden = true;
  }
  function setBusy(v) {
    busy = v;
    ['b-run', 'b-check', 'b-prev', 'b-next', 'b-finish'].forEach(function (id) {
      $(id).disabled = v || (id === 'b-prev' && state.cur === 0) || (id === 'b-next' && state.cur === NQ - 1);
    });
  }
  function needCode(j) {
    if ((state.code[j] || '').trim()) return false;
    $('c-result').hidden = false; $('c-result').textContent = t('Сначала напишите программу.');
    return true;
  }
  function doRun() {
    var j = state.cur;
    if (busy || state.stage !== 'code' || needCode(j)) return;
    setBusy(true);
    $('c-result').hidden = false; $('c-result').textContent = t('Выполняется…');
    runPython(state.code[j], $('c-stdin').value).then(function (r) {
      setBusy(false);
      if (!running() || state.cur !== j) return;
      var box = $('c-result'); box.innerHTML = '';
      box.appendChild(el('b', null, t('Вывод:')));
      box.appendChild(el('pre', null, r.out || t('(программа ничего не вывела)')));
      if (r.error) { box.appendChild(el('b', 'bad', t('Ошибка:'))); box.appendChild(el('pre', 'bad', r.error)); if (/invalid literal for int/.test(r.error)) box.appendChild(el('p', 'hint', inputHint())); }
    });
  }
  function doCheck() {
    var j = state.cur;
    if (busy || state.stage !== 'code' || needCode(j)) return;
    setBusy(true);
    $('c-result').hidden = false; $('c-result').textContent = t('Проверяется…');
    checkTask(j).then(function (res) {
      setBusy(false);
      if (!running()) return;
      state.checks[j] = { passed: res.passed, total: res.total };
      save(); renderNav();
      if (state.cur !== j) return;
      var box = $('c-result'), all = res.passed === res.total; box.innerHTML = '';
      box.appendChild(el('p', all ? 'ok' : 'bad', all ? t('✓ Все тесты пройдены! Можно переходить к следующей задаче.') : t('Пройдено тестов: ') + res.passed + t(' из ') + res.total));
      box.appendChild(el('b', null, t('Примеры:')));
      res.details.slice(0, 2).forEach(function (d, k) {
        box.appendChild(el('p', d.ok ? 'ok' : 'bad', (d.ok ? '✓ ' : '✗ ') + t('Пример ') + (k + 1)));
        if (!d.ok && !d.skipped) {
          box.appendChild(el('pre', null, t('ожидалось: ') + code[j].tests[k].output + t('\nваш вывод: ') + (d.out || t('(программа ничего не вывела)'))));
          if (d.error) box.appendChild(el('pre', 'bad', d.error));
          if (d.error && /invalid literal for int/.test(d.error)) box.appendChild(el('p', 'hint', inputHint()));
        }
      });
    });
  }

  // ---------- Завершение и подсчёт ----------
  function finish(reason) {
    if (!running()) return;
    if (state.stage === 'quiz') {        // работа прервана во время теста: текущая попытка засчитывается как есть
      var ok = quiz.map(function (q, i) { return QUIZ.isCorrect(q, state.q[i]); });
      state.attempts.push({ n: state.attempt, seed: quizSeed(state.attempt), answers: state.q.slice(), ok: ok, score: ok.filter(Boolean).length, at: Date.now() });
    }
    state.status = 'evaluating';
    state.reason = reason;
    state.finishedAt = state.closedAt || Date.now();
    save();
    clearInterval(ticker);
    $('warn').hidden = true;
    if (navigator.keyboard && navigator.keyboard.unlock) navigator.keyboard.unlock();
    fsActive = false;
    exitFullscreen();
    evaluateAll();
  }
  function evaluateAll() {
    show('s-eval');
    var results = [], j = 0;
    var next = function () {
      $('e-progress').textContent = t('Проверено задач: ') + j + t(' из ') + NQ;
      if (j >= NQ) { state.results = results; state.status = 'finished'; save(); renderResult(); return; }
      checkTask(j).then(function (res) {
        results.push({ passed: res.passed, total: res.total, fail: res.fail, details: res.details.map(function (d) { return { ok: d.ok, out: (d.out || '').slice(0, 500), error: d.error || null }; }) });
        j++; setTimeout(next, 0);
      });
    };
    next();
  }
  function tick() {
    if (!running() || state.stage === 'quizres') return;
    var left = stageEnds() - Date.now();
    if (left <= 0) {
      if (state.stage === 'quiz') submitQuiz(true);
      else finish(['Время на задачи (', String(window.CODE_MIN || 80), ' минут) закончилось.']);
      return;
    }
    $('tm-label').textContent = state.stage === 'quiz' ? t('До конца теста') : t('До конца работы над задачами');
    $('tm-total').textContent = fmt(left);
    $('tm-total-box').classList.toggle('low', left <= 60000);
    $('tm-bar').style.width = (100 * left / stageMs()) + '%';
  }

  function renderResult() {
    var best = bestAttempt();
    var bq = quizFor(best ? best.n : 1);
    var qOk = best ? best.ok : bq.map(function () { return false; });
    var cOk = state.results.map(function (r) { return r.passed === r.total; });
    var qs = qOk.filter(Boolean).length, cs = cOk.filter(Boolean).length;
    $('r-score-num').textContent = (qs + cs) + ' / 20';
    $('r-quiz').textContent = qs + ' / 10';
    $('r-quiz-att').textContent = state.attempts.length ? t('попыток: ') + state.attempts.length + ' (' + state.attempts.map(function (a) { return a.score; }).join(', ') + ')' : t('тест не сдан');
    $('r-code').textContent = cs + ' / 10';
    $('r-reason').textContent = !state.reason ? '' : Array.isArray(state.reason) ? state.reason.map(t).join('') : state.reason;
    $('r-reason').hidden = !state.reason;
    var tb = $('r-time'); tb.innerHTML = '';
    var line = function (label, value) { var p = el('p'); p.appendChild(document.createTextNode(label + ' ')); p.appendChild(el('b', null, value)); tb.appendChild(p); };
    if (state.codeStartedAt) {
      var used = Math.min(CODE_MS, Math.max(0, state.finishedAt - state.codeStartedAt));
      line(t('Время на задачи:'), fmt(used) + t(' из ') + fmt(CODE_MS));
      line(t('Оставалось времени:'), fmt(CODE_MS - used));
    } else line(t('До задач на код ученик не дошёл.'), '');

    var lq = $('r-list-q'); lq.innerHTML = '';
    bq.forEach(function (q, i) { lq.appendChild(quizCard(q, best ? best.answers[i] : null, qOk[i], i)); });
    var lc = $('r-list-c'); lc.innerHTML = '';
    code.forEach(function (tk, j) { lc.appendChild(codeCard(tk, j, state.results[j], cOk[j])); });
    show('s-result');
    scheduleLock();
  }
  function cardHead(label, ok, extra) {
    var card = el('article', 'rv ' + (ok ? 'ok' : 'bad')), head = el('div', 'rv-head');
    head.appendChild(el('span', 'rv-num', label));
    head.appendChild(el('span', 'rv-badge', (ok ? t('✓ верно') : t('✗ неверно')) + (extra || '')));
    card.appendChild(head);
    return card;
  }
  function quizCard(q, g, ok, i) {
    var card = cardHead(t('Вопрос ') + (i + 1) + ' — ' + q.title, ok);
    card.appendChild(el('p', 'rv-q', q.text));
    if (q.code) card.appendChild(el('pre', 'code', q.code));
    if (q.type === 'choice') {
      var ul = el('ul', 'rv-opts' + (q.mono ? ' mono' : ''));
      q.options.forEach(function (o, k) {
        var right = o === q.answer, mine = k === g;
        var li = el('li', right ? 'right' : mine ? 'wrong' : '');
        li.appendChild(el('span', 'rv-mark', right ? '✓' : mine ? '✗' : '•'));
        li.appendChild(el('span', 'letter', LETTERS[k] + ')'));
        var body = el('div', 'rv-opt-body');
        body.appendChild(el('span', 'opt', o));
        if (mine || right) body.appendChild(el('span', 'rv-tag', right && mine ? t('ваш ответ — правильный') : right ? t('правильный ответ') : t('ваш ответ')));
        li.appendChild(body);
        ul.appendChild(li);
      });
      card.appendChild(ul);
      if (!g) card.appendChild(el('p', 'rv-none', t('Ответ не выбран.')));
    } else {
      var tbl = el('table', 'rv-table'), hr = el('tr');
      ['', t('Ваш ответ'), t('Правильный ответ')].forEach(function (h) { hr.appendChild(el('th', null, h)); });
      tbl.appendChild(hr);
      q.items.forEach(function (it, k) {
        var mine = Array.isArray(g) && g[k] != null ? q.options[g[k]] : '', good = mine === q.answer[k], tr = el('tr');
        var c0 = el('td'); c0.appendChild(el(it.word ? 'b' : 'code', null, it.code));
        tr.appendChild(c0);
        tr.appendChild(el('td', good ? 'right' : 'wrong', (good ? '✓ ' : '✗ ') + (mine || t('нет ответа'))));
        tr.appendChild(el('td', null, q.answer[k]));
        tbl.appendChild(tr);
      });
      card.appendChild(tbl);
    }
    return card;
  }
  function codeCard(tk, j, r, ok) {
    var card = cardHead(t('Задача ') + (j + 1) + t(' (уровень ') + tk.level + ') — ' + tk.title, ok, t(' · тестов ') + r.passed + '/' + r.total);
    card.appendChild(el('p', 'rv-q', tk.text));
    var cols = el('div', 'rv-cols one'), src = state.code[j] || '';
    var c1 = el('div'); c1.appendChild(el('b', null, t('Ваша программа'))); c1.appendChild(el('pre', 'code', src.trim() ? src : t('(код не написан)')));
    cols.appendChild(c1);
    card.appendChild(cols);
    // Два образца: одна и та же задача разными циклами
    var how = function (src2) { return /while True/.test(src2) ? t('while True и break') : /while/.test(src2) ? t('цикл while') : t('цикл for'); };
    var sols = el('div', 'rv-cols');
    [tk.solution, tk.alt].forEach(function (src2, k) {
      var c = el('div');
      c.appendChild(el('b', null, t('Образец ') + (k + 1) + ': ' + how(src2)));
      c.appendChild(el('pre', 'code', src2));
      sols.appendChild(c);
    });
    card.appendChild(el('p', 'rv-note', t('Задачу можно решить разными способами — засчитывается любой, если программа выводит правильный ответ:')));
    card.appendChild(sols);
    if (!ok && r.fail != null && src.trim()) {
      var tc = tk.tests[r.fail], d = r.details[r.fail] || {};
      card.appendChild(el('p', 'rv-err', t('Ошибка на тесте:\nвход: ') + tc.input.replace(/\n/g, ' / ') + t('\nожидалось: ') + tc.output + t('\nваш вывод: ') + (d.out || t('(ничего)')) + (d.error ? '\n' + d.error : '')));
    }
    return card;
  }
  function scheduleLock() {
    clearInterval(hideTimer);
    var update = function () {
      var left = state.finishedAt + RESULT_MS - Date.now();
      if (left <= 0) { clearInterval(hideTimer); $('l-pin').value = ''; $('l-pin-msg').textContent = ''; show('s-locked'); return; }
      $('r-hide').textContent = t('Результат будет скрыт через ') + fmt(left) + '.';
      $('r-hide').hidden = false;
    };
    update();
    hideTimer = setInterval(update, 1000);
  }

  // ---------- Запуск ----------
  function newSeed() { var a = new Uint32Array(1); (window.crypto || window.msCrypto).getRandomValues(a); return a[0] || 1; }
  function begin() {
    $('b-start').disabled = true;
    var fs = enterFullscreen(), seed = newSeed();
    state = { v: 2, seed: seed, status: 'running', stage: 'quiz', startedAt: Date.now(), attempt: 1, attempts: [],
      quizEndsAt: Date.now() + QUIZ_MS, cur: 0, q: [], code: [], stdin: [], checks: [] };
    quiz = quizFor(1); code = CODE.generate(seed, LANG);
    state.q = quiz.map(function () { return null; });
    state.code = code.map(function () { return ''; });
    state.stdin = code.map(function () { return null; });
    state.checks = code.map(function () { return null; });
    save();
    fs.then(function () { ticker = setInterval(tick, 250); renderItem(); });
  }
  function showTheory() {
    var during = running();
    $('b-to-intro').hidden = during;
    $('b-theory-back').hidden = !during;
    $('t-end-text').hidden = during;
    show('s-theory');
  }

  // Тексты страницы: при запуске запоминаем русский innerHTML, при смене языка подставляем перевод из UI_KZ.STATIC
  var STATIC = [];
  function initStatic() {
    var dict = (window.UI_KZ && window.UI_KZ.STATIC) || {};
    document.querySelectorAll('title, p, li, h1, h2, button, label, th, small, span').forEach(function (e) {
      if (e.closest('#theory') || e.closest('.lang-switch')) return;
      var h = e.innerHTML.trim();
      if (dict[h] !== undefined) STATIC.push({ el: e, ru: h, kz: dict[h] });
    });
  }
  function applyStatic() {
    STATIC.forEach(function (x) { x.el.innerHTML = LANG === 'kz' ? x.kz : x.ru; });
    document.documentElement.lang = LANG === 'kz' ? 'kk' : 'ru';
    document.querySelectorAll('.i-qmin').forEach(function (e) { e.textContent = String(window.QUIZ_MIN || 15); });
    document.querySelectorAll('.i-cmin').forEach(function (e) { e.textContent = String(window.CODE_MIN || 80); });
    document.querySelectorAll('.i-att').forEach(function (e) { e.textContent = String(ATTEMPTS); });
    ['r-pin', 'l-pin'].forEach(function (id) { $(id).placeholder = t('Пароль учителя'); $(id).setAttribute('aria-label', t('Пароль учителя')); });
    document.querySelectorAll('.lang-switch button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-lang') === LANG); b.setAttribute('aria-pressed', b.getAttribute('data-lang') === LANG); });
  }
  // Смена языка: ответы, код и таймер сохраняются; текущий экран перерисовывается на новом языке
  function setLang(l) {
    if (l === LANG) return;
    LANG = l;
    try { localStorage.setItem('cikly-lang', l); } catch (e) {}
    applyStatic();
    if (state && state.seed) { quiz = quizFor(state.attempt); code = CODE.generate(state.seed, LANG); }
    var vis = ['s-work', 's-quizres', 's-result'].filter(function (id) { return !$(id).hidden; })[0];
    if (vis === 's-work') { var keep = $('c-code').value; renderItem(); if (state.stage === 'code') $('c-code').value = keep; }
    else if (vis === 's-quizres') renderQuizResult();
    else if (vis === 's-result') renderResult();
  }

  function init() {
    initStatic();
    applyStatic();
    document.querySelectorAll('.lang-switch button').forEach(function (b) { b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); }); });
    $('b-to-intro').addEventListener('click', function () { show('s-intro'); });
    $('b-back-theory').addEventListener('click', showTheory);
    $('b-theory-back').addEventListener('click', function () { if (running() && state.stage === 'quizres') renderQuizResult(); });
    $('b-start').addEventListener('click', begin);
    $('b-run').addEventListener('click', doRun);
    $('b-check').addEventListener('click', doCheck);
    $('b-prev').addEventListener('click', function () { goTo(state.cur - 1); });
    $('b-next').addEventListener('click', function () { goTo(state.cur + 1); });
    $('b-finish').addEventListener('click', function () {
      if (state.stage === 'quiz') {
        var u = quiz.filter(function (x, i) { return !QUIZ.isComplete(x, state.q[i]); }).length;
        $('m-confirm-text').textContent = t('Сдать тест?') + (u ? t(' Без ответа: ') + u + t(' вопр.') : '') + t(' После сдачи вы увидите результат.');
      } else {
        var c = code.filter(function (x, j) { return !(state.code[j] || '').trim(); }).length;
        $('m-confirm-text').textContent = t('Завершить работу?') + (c ? t(' Задач без кода: ') + c + '.' : '') + t(' Балл будет посчитан по текущему коду.');
      }
      $('m-confirm').hidden = false;
    });
    $('b-finish-yes').addEventListener('click', function () { if (state.stage === 'quiz') submitQuiz(false); else finish(null); });
    $('b-finish-no').addEventListener('click', function () { $('m-confirm').hidden = true; });
    $('b-reread').addEventListener('click', showTheory);
    $('b-retry').addEventListener('click', retryQuiz);
    $('b-to-code').addEventListener('click', function () { $('qr-confirm').hidden = false; });
    $('b-to-code-yes').addEventListener('click', toCode);
    $('b-to-code-no').addEventListener('click', function () { $('qr-confirm').hidden = true; });
    $('warn').addEventListener('click', function () { $('warn').hidden = true; });
    var ed = $('c-code');
    setupEditor(ed);
    ed.addEventListener('input', function () {
      if (!running() || state.stage !== 'code') return;
      var j = state.cur;
      state.code[j] = ed.value; state.checks[j] = null;   // код изменился — прошлая проверка устарела
      save(); renderNav();
    });
    $('c-stdin').addEventListener('input', function () { if (running() && state.stage === 'code') { state.stdin[state.cur] = $('c-stdin').value; save(); } });

    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('beforeunload', onBeforeUnload);
    window.addEventListener('pagehide', onPageHide);
    document.addEventListener('contextmenu', function (e) { if (running()) e.preventDefault(); });
    history.pushState(null, '', location.href);
    window.addEventListener('popstate', function () { if (running()) { history.pushState(null, '', location.href); warn(t('Переход назад во время работы недоступен.')); } });

    $('b-teacher').addEventListener('click', function () { $('r-teacher-form').hidden = false; $('r-pin').focus(); });
    [['b-restart', 'r-pin', 'r-pin-msg'], ['b-unlock', 'l-pin', 'l-pin-msg']].forEach(function (ids) {
      var go = function () {
        if ($(ids[1]).value.trim() !== String(window.TEACHER_PIN)) { $(ids[2]).textContent = t('Неверный пароль'); return; }
        try { localStorage.removeItem(STORE); } catch (e) {}
        location.reload();
      };
      $(ids[0]).addEventListener('click', go);
      $(ids[1]).addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
    });
    if (!fsSupported()) $('i-nofs').hidden = false;

    state = load();
    if (state && state.v === 2 && state.seed) { quiz = quizFor(state.attempt); code = CODE.generate(state.seed, LANG); } else state = null;
    if (state && state.status === 'running') {
      // Страница была закрыта или перезагружена — работа завершается
      finish(['Работа завершена автоматически: страница была закрыта или перезагружена.']);
      return;
    }
    if (state && state.status === 'evaluating') { evaluateAll(); return; }
    if (state && state.status === 'finished') { renderResult(); return; }
    state = null;
    show('s-theory');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
