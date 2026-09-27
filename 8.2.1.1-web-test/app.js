/* Страница ученика: выдача варианта, два таймера, проверка ответов, защита от выхода. */
(function () {
  'use strict';

  var TOTAL_MS = 15 * 60 * 1000;   // общее время работы
  var TASK_MS = 60 * 1000;         // время на одно задание
  var RESULT_MS = 5 * 60 * 1000;   // сколько показывается результат, потом — экран с паролем учителя
  var STORE = 'ntest-8211-state';  // состояние хранится только в этом браузере

  var $ = function (id) { return document.getElementById(id); };
  var state = null;
  var tasks = [];
  var fsActive = false;      // страница сейчас в полноэкранном режиме, который включили мы
  var unloading = false;     // идёт обновление/закрытие страницы — это не нарушение
  var ignoreUntil = 0;       // короткая пауза проверки фокуса сразу после входа в полный экран
  var ticker = null;
  var resuming = false;
  var hideTimer = null;      // показан экран «Работа восстановлена» после обновления страницы

  // ---------- Хранение ----------

  function save() {
    try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) {}
  }
  function load() {
    try { return JSON.parse(localStorage.getItem(STORE)); } catch (e) { return null; }
  }

  // ---------- Экраны ----------

  function show(id) {
    ['s-loading', 's-intro', 's-full', 's-error', 's-test', 's-menu', 's-resume', 's-result', 's-locked'].forEach(function (s) {
      $(s).hidden = s !== id;
    });
    $('timers').hidden = !(state && state.status === 'running');
  }

  function running() { return state && state.status === 'running'; }

  // ---------- Полноэкранный режим ----------

  function fsElement() { return document.fullscreenElement || document.webkitFullscreenElement || null; }
  function fsSupported() {
    var el = document.documentElement;
    return !!(el.requestFullscreen || el.webkitRequestFullscreen);
  }

  function enterFullscreen() {
    var el = document.documentElement;
    var req = el.requestFullscreen || el.webkitRequestFullscreen;
    if (!req || fsElement()) return Promise.resolve();
    try {
      var p = req.call(el, { navigationUI: 'hide' });
      return Promise.resolve(p).then(function () {
        // Chrome/Edge: клавиши (в том числе Esc) сначала получает страница, выход — только удержанием Esc.
        if (navigator.keyboard && navigator.keyboard.lock) navigator.keyboard.lock().catch(function () {});
      }).catch(function () {});
    } catch (e) {
      return Promise.resolve();
    }
  }

  function exitFullscreen() {
    var ex = document.exitFullscreen || document.webkitExitFullscreen;
    if (fsElement() && ex) { try { ex.call(document); } catch (e) {} }
  }

  function onFullscreenChange() {
    if (fsElement()) {
      fsActive = true;
      ignoreUntil = Date.now() + 1500;
      return;
    }
    if (fsActive) {
      fsActive = false;
      violation('вы вышли из полноэкранного режима.');
    }
  }

  // ---------- Нарушения ----------

  function violation(reason) {
    if (!running()) return;
    // Даём браузеру мгновение: при обновлении страницы сначала срабатывает beforeunload.
    setTimeout(function () {
      if (unloading || !running()) return;
      finish('Работа завершена автоматически: ' + reason);
    }, 300);
  }

  function onVisibility() {
    if (document.visibilityState === 'hidden') violation('вы переключились на другую вкладку или приложение.');
  }

  function onBlur() {
    if (!running() || Date.now() < ignoreUntil) return;
    setTimeout(function () {
      if (!document.hasFocus() && document.visibilityState === 'visible') {
        violation('вы переключились на другое окно или приложение.');
      }
    }, 400);
  }

  function warn(text) {
    $('warn-text').textContent = text;
    $('warn').hidden = false;
    clearTimeout(warn.t);
    warn.t = setTimeout(function () { $('warn').hidden = true; }, 5000);
  }

  function onKey(e) {
    if (!running()) return;
    if (e.key === 'Escape') {
      warn('Не выходите из полноэкранного режима: работа сразу завершится.');
      e.preventDefault();
    }
    var k = (e.key || '').toLowerCase();
    // Блокируем то, что страница вправе блокировать: обновление, печать, сохранение, поиск, новую вкладку.
    if (e.key === 'F5' || e.key === 'F11' || ((e.ctrlKey || e.metaKey) && ['r', 'p', 's', 'f', 'o', 'n', 't', 'w', 'l'].indexOf(k) >= 0) ||
        (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight'))) {
      e.preventDefault();
      warn('Это действие недоступно во время работы.');
    }
  }

  function onBeforeUnload(e) {
    if (!running()) return;
    unloading = true;
    setTimeout(function () { unloading = false; }, 1000); // если ученик нажал «Остаться»
    e.preventDefault();
    e.returnValue = '';
    return '';
  }

  function blockNavigation() {
    history.pushState(null, '', location.href);
    window.addEventListener('popstate', function () {
      if (running()) {
        history.pushState(null, '', location.href);
        warn('Переход назад во время работы недоступен.');
      }
    });
  }

  // ---------- Ход работы ----------

  function current() { return state.queue[state.pos]; }

  function startTask() {
    state.taskEnds = Date.now() + TASK_MS;
    save();
    renderTask();
  }

  function renderTask() {
    if (resuming) return;
    var i = current();
    var t = tasks[i];
    var review = state.phase === 'review';
    $('t-num').textContent = review
      ? 'Пропущенное задание ' + (i + 1) + ' (' + (state.pos + 1) + ' из ' + state.queue.length + ')'
      : 'Задание ' + (i + 1) + ' из ' + tasks.length;
    $('t-text').textContent = t.text;
    var hint = { 2: 'цифры 0 и 1', 8: 'цифры от 0 до 7', 10: 'цифры от 0 до 9', 16: 'цифры 0–9 и буквы A–F' }[t.to];
    $('t-hint').textContent = 'Ответ запишите в ' + { 2: 'двоичной', 8: 'восьмеричной', 10: 'десятичной', 16: 'шестнадцатеричной' }[t.to] +
      ' системе (' + hint + '), без индекса основания.';
    var inp = $('t-input');
    inp.value = '';
    inp.inputMode = t.to === 16 ? 'text' : 'numeric';
    $('b-answer').disabled = true;
    show('s-test');
    inp.focus();
    tick();
  }

  function record(status, given) {
    var a = state.answers[current()];
    a.status = status;
    if (given !== undefined) a.given = given;
  }

  function next() {
    state.pos++;
    if (state.pos < state.queue.length) { startTask(); return; }
    var skipped = skippedList();
    if (!skipped.length) { finish(null); return; }
    state.phase = 'menu';
    state.taskEnds = null;
    save();
    renderMenu();
  }

  function skippedList() {
    var out = [];
    state.answers.forEach(function (a, i) { if (a.status === 'skipped') out.push(i); });
    return out;
  }

  function renderMenu() {
    if (resuming) return;
    $('m-confirm').hidden = true;
    var s = skippedList();
    $('m-count').textContent = s.length;
    $('m-list').textContent = s.map(function (i) { return '№ ' + (i + 1); }).join(', ');
    show('s-menu');
    tick();
  }

  function answer() {
    var v = $('t-input').value;
    if (!NT.normalize(v)) return;
    record(NT.isCorrect(v, tasks[current()]) ? 'correct' : 'wrong', v.trim());
    next();
  }

  function skip() {
    record('skipped');
    next();
  }

  function reviewSkipped() {
    state.phase = 'review';
    state.queue = skippedList();
    state.pos = 0;
    startTask();
  }

  function finish(reason) {
    if (!state || state.status !== 'running') return;
    state.answers.forEach(function (a) {
      if (a.status === 'pending') a.status = 'unanswered';
    });
    resuming = false;
    state.status = 'finished';
    state.reason = reason;
    state.finishedAt = Date.now();
    save();
    clearInterval(ticker);
    $('warn').hidden = true;
    if (navigator.keyboard && navigator.keyboard.unlock) navigator.keyboard.unlock();
    fsActive = false;
    exitFullscreen();
    renderResult();
  }

  // ---------- Таймеры ----------

  function fmt(ms) {
    var s = Math.max(0, Math.ceil(ms / 1000));
    return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
  }

  function tick() {
    if (!running()) return;
    var now = Date.now();
    var left = state.endsAt - now;
    if (left <= 0) { finish('Время работы (15 минут) закончилось. Оставшиеся задания засчитаны как неправильные.'); return; }
    $('tm-total').textContent = fmt(left);
    $('tm-total-box').classList.toggle('low', left <= 60000);

    var inTask = (state.phase === 'main' || state.phase === 'review') && state.taskEnds;
    if (inTask) {
      var tl = state.taskEnds - now;
      if (tl <= 0) {
        var num = current() + 1;
        record('timeout');
        next();
        // Задание сменилось само — явно предупреждаем, чтобы ответ не ушёл в новое задание.
        if (running() && !resuming) {
          warn('Время на задание ' + num + ' вышло. Открыто следующее задание — прочитайте его.');
          var inp = $('t-input');
          inp.disabled = true;
          $('s-test').classList.add('changed');
          setTimeout(function () {
            inp.disabled = false;
            $('s-test').classList.remove('changed');
            if (!$('s-test').hidden) inp.focus();
          }, 1500);
        }
        return;
      }
      $('tm-task').textContent = fmt(Math.min(tl, left));
      $('tm-task-box').classList.toggle('low', tl <= 10000);
      $('tm-bar').style.width = (100 * tl / TASK_MS) + '%';
    } else {
      $('tm-task').textContent = '—';
      $('tm-task-box').classList.remove('low');
      $('tm-bar').style.width = '0%';
    }
  }

  function startTicker() {
    clearInterval(ticker);
    ticker = setInterval(tick, 250);
  }

  // ---------- Итог ----------

  var STATUS_TEXT = {
    correct: 'верно',
    wrong: 'неверно',
    skipped: 'пропущено',
    timeout: 'время вышло',
    unanswered: 'нет ответа'
  };

  function renderResult() {
    var score = state.answers.filter(function (a) { return a.status === 'correct'; }).length;
    var n = tasks.length;
    $('r-score-num').textContent = score + ' / ' + n;
    $('r-score-word').textContent = plural(score, 'балл', 'балла', 'баллов');
    $('r-count').textContent = 'Правильных ответов: ' + score + ' из ' + n + '.';
    $('r-reason').textContent = state.reason || '';
    $('r-reason').hidden = !state.reason;
    var body = $('r-table');
    body.innerHTML = '';
    tasks.forEach(function (t, i) {
      var a = state.answers[i];
      var tr = document.createElement('tr');
      tr.className = a.status === 'correct' ? 'ok' : 'bad';
      [String(i + 1), t.text, a.given ? a.given : '—', t.answerShown,
       (a.status === 'correct' ? '✓ ' : '✗ ') + STATUS_TEXT[a.status]].forEach(function (txt) {
        var td = document.createElement('td');
        td.textContent = txt;
        tr.appendChild(td);
      });
      body.appendChild(tr);
    });
    show('s-result');
    if (window.STANDALONE) scheduleLock();
  }

  // Автономная версия: через 5 минут результат скрывается, новая работа — только по паролю учителя.
  function scheduleLock() {
    clearInterval(hideTimer);
    var update = function () {
      var left = (state.finishedAt || 0) + RESULT_MS - Date.now();
      if (left <= 0) {
        clearInterval(hideTimer);
        $('l-pin').value = '';
        $('l-pin-msg').textContent = '';
        show('s-locked');
        $('l-pin').focus();
        return;
      }
      $('r-hide').textContent = 'Результат будет скрыт через ' + fmt(left) + '.';
      $('r-hide').hidden = false;
    };
    update();
    hideTimer = setInterval(update, 1000);
  }

  function plural(n, one, few, many) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  }

  // ---------- Запуск ----------

  function begin() {
    $('b-start').disabled = true;
    var fs = enterFullscreen();   // вызываем сразу по нажатию — иначе браузер откажет
    var sid = NT.newId();
    NT.api({ action: 'issue', sid: sid }).then(function (res) {
      if (!res.ok && res.error === 'full') { exitFullscreen(); show('s-full'); return; }
      if (!res.ok || !window.VARIANTS[res.variant - 1]) throw new Error(res.error || 'нет варианта');
      state = {
        v: 1,
        sid: sid,
        round: res.round,
        variant: res.variant,
        status: 'running',
        startedAt: Date.now(),
        endsAt: Date.now() + TOTAL_MS,
        phase: 'main',
        queue: window.VARIANTS[res.variant - 1].map(function (_, i) { return i; }),
        pos: 0,
        taskEnds: null,
        answers: window.VARIANTS[res.variant - 1].map(function () { return { status: 'pending', given: '' }; })
      };
      tasks = window.VARIANTS[res.variant - 1].map(NT.task);
      return fs.then(function () {
        startTicker();
        startTask();
      });
    }).catch(function (err) {
      exitFullscreen();
      $('b-start').disabled = false;
      $('e-text').textContent = 'Не удалось получить вариант (' + err.message + '). Проверьте подключение к интернету и нажмите «Начать» ещё раз.';
      show('s-error');
    });
  }

  function resume() {
    enterFullscreen().then(function () {
      if (!running()) return;
      resuming = false;
      startTicker();
      if (state.phase === 'menu') renderMenu(); else renderTask();
    });
  }

  function init() {
    $('b-start').addEventListener('click', begin);
    $('b-retry').addEventListener('click', function () { show('s-intro'); });
    $('b-answer').addEventListener('click', answer);
    $('b-skip').addEventListener('click', skip);
    $('b-review').addEventListener('click', reviewSkipped);
    // Своё подтверждение вместо confirm(): системное окно снимает фокус со страницы.
    $('b-finish').addEventListener('click', function () { $('m-confirm').hidden = false; });
    $('b-finish-yes').addEventListener('click', function () { finish(null); });
    $('b-finish-no').addEventListener('click', function () { $('m-confirm').hidden = true; });
    $('b-resume').addEventListener('click', resume);
    $('warn').addEventListener('click', function () { $('warn').hidden = true; });
    $('t-input').addEventListener('input', function () { $('b-answer').disabled = !NT.normalize(this.value); });
    $('t-input').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); answer(); } });

    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('beforeunload', onBeforeUnload);
    document.addEventListener('contextmenu', function (e) { if (running()) e.preventDefault(); });
    blockNavigation();

    if (NT.demo) $('demo').hidden = false;
    if (window.STANDALONE) {
      // Без сервера учитель очищает результат на общем компьютере PIN-кодом (задаётся в файле).
      $('r-teacher').hidden = false;
      $('b-teacher').addEventListener('click', function () { $('r-teacher-form').hidden = false; $('r-pin').focus(); });
      var restart = function (input, msg) {
        return function () {
          if ($(input).value.trim() !== String(window.TEACHER_PIN)) { $(msg).textContent = 'Неверный пароль'; return; }
          try { localStorage.removeItem(STORE); } catch (e) {}
          location.reload();
        };
      };
      [['b-restart', 'r-pin', 'r-pin-msg'], ['b-unlock', 'l-pin', 'l-pin-msg']].forEach(function (ids) {
        var go = restart(ids[1], ids[2]);
        $(ids[0]).addEventListener('click', go);
        $(ids[1]).addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
      });
    }
    if (!fsSupported()) $('i-nofs').hidden = false;

    state = load();
    if (state && state.variant && window.VARIANTS[state.variant - 1]) {
      tasks = window.VARIANTS[state.variant - 1].map(NT.task);
    } else {
      state = null;
    }

    if (running()) {
      // Страницу обновили во время работы: время шло, восстанавливаем ход работы.
      resuming = true;
      show('s-resume');
      startTicker();
      tick();
      return;
    }

    show('s-loading');
    NT.api({ action: 'status' }).then(function (res) { return res && res.ok ? res.round : null; }, function () { return null; })
      .then(function (round) {
        // После сброса учителем (новый урок) старый результат на этом устройстве больше не показываем.
        if (state && state.status === 'finished' && (!round || round === state.round)) { renderResult(); return; }
        state = null;
        try { localStorage.removeItem(STORE); } catch (e) {}
        show('s-intro');
      });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
