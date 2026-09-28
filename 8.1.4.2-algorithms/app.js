/* Формативная работа 8.1.4.2: общий таймер, задания разных типов, возврат к заданиям, защита от выхода.
 * Движок взят из формативной работы 8.2.1.1 (одинаковое поведение для учеников). */
(function () {
  'use strict';

  var TOTAL_MS = 20 * 60 * 1000;   // общее время работы
  var RESULT_MS = 5 * 60 * 1000;   // сколько показывается результат, потом — экран с паролем учителя
  var STORE = 'formativ-8142-state';

  var $ = function (id) { return document.getElementById(id); };
  var state = null;
  var tasks = [];
  var draft = null;          // ответ, который ученик собирает в текущем задании
  var fsActive = false;
  var unloading = false;
  var ignoreUntil = 0;
  var ticker = null;
  var resuming = false;
  var hideTimer = null;

  function save() { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) {} }
  function load() { try { return JSON.parse(localStorage.getItem(STORE)); } catch (e) { return null; } }

  function show(id) {
    ['s-loading', 's-intro', 's-test', 's-menu', 's-resume', 's-result', 's-locked'].forEach(function (s) { $(s).hidden = s !== id; });
    $('timers').hidden = !running();
  }
  function running() { return !!state && state.status === 'running'; }

  // ---------- Полноэкранный режим и защита от выхода ----------

  function fsElement() { return document.fullscreenElement || document.webkitFullscreenElement || null; }
  function fsSupported() { var el = document.documentElement; return !!(el.requestFullscreen || el.webkitRequestFullscreen); }

  function enterFullscreen() {
    var el = document.documentElement;
    var req = el.requestFullscreen || el.webkitRequestFullscreen;
    if (!req || fsElement()) return Promise.resolve();
    try {
      return Promise.resolve(req.call(el, { navigationUI: 'hide' })).then(function () {
        if (navigator.keyboard && navigator.keyboard.lock) navigator.keyboard.lock().catch(function () {});
      }).catch(function () {});
    } catch (e) { return Promise.resolve(); }
  }
  function exitFullscreen() {
    var ex = document.exitFullscreen || document.webkitExitFullscreen;
    if (fsElement() && ex) { try { ex.call(document); } catch (e) {} }
  }
  function onFullscreenChange() {
    if (fsElement()) { fsActive = true; ignoreUntil = Date.now() + 1500; return; }
    if (fsActive) { fsActive = false; violation('вы вышли из полноэкранного режима.'); }
  }
  function violation(reason) {
    if (!running()) return;
    setTimeout(function () {
      if (unloading || !running()) return;
      finish('Работа завершена автоматически: ' + reason);
    }, 300);
  }
  function onVisibility() { if (document.visibilityState === 'hidden') violation('вы переключились на другую вкладку или приложение.'); }
  function onBlur() {
    if (!running() || Date.now() < ignoreUntil) return;
    setTimeout(function () {
      if (!document.hasFocus() && document.visibilityState === 'visible') violation('вы переключились на другое окно или приложение.');
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
    if (e.key === 'Escape') { warn('Не выходите из полноэкранного режима: работа сразу завершится.'); e.preventDefault(); }
    var k = (e.key || '').toLowerCase();
    if (e.key === 'F5' || e.key === 'F11' || ((e.ctrlKey || e.metaKey) && ['r', 'p', 's', 'f', 'o', 'n', 't', 'w', 'l'].indexOf(k) >= 0) ||
        (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight'))) {
      e.preventDefault();
      warn('Это действие недоступно во время работы.');
    }
  }
  function onBeforeUnload(e) {
    if (!running()) return;
    unloading = true;
    setTimeout(function () { unloading = false; }, 1000);
    e.preventDefault();
    e.returnValue = '';
    return '';
  }
  function blockNavigation() {
    history.pushState(null, '', location.href);
    window.addEventListener('popstate', function () {
      if (running()) { history.pushState(null, '', location.href); warn('Переход назад во время работы недоступен.'); }
    });
  }

  // ---------- Отрисовка задания ----------

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function updateAnswerButton() { $('b-answer').disabled = !TASKS.isComplete(tasks[state.cur], draft); }

  function renderBody(t, saved) {
    var box = $('t-body');
    box.innerHTML = '';
    if (t.svg) { var fig = el('div', 'figure'); fig.innerHTML = t.svg; box.appendChild(fig); }   // SVG собран из чисел в tasks.js
    if (t.code) box.appendChild(el('pre', 'code', t.code));

    if (t.type === 'input') {
      draft = saved || '';
      var inp = el('input', 'answer' + (t.numeric ? '' : ' text-answer'));
      inp.type = 'text';
      inp.id = 't-input';
      inp.autocomplete = 'off';
      inp.spellcheck = false;
      inp.setAttribute('autocapitalize', 'off');
      inp.setAttribute('aria-label', 'Ответ');
      inp.maxLength = 40;
      inp.value = draft;
      if (t.numeric) inp.inputMode = 'numeric';
      inp.addEventListener('input', function () { draft = inp.value; updateAnswerButton(); });
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); answer(); } });
      box.appendChild(inp);
      box.appendChild(el('p', 'muted small', t.multi ? 'Если программа выводит несколько чисел, запишите их через пробел — так, как их выведет Python.'
        : t.symbol ? 'Запишите только знак сравнения.' : t.code && !t.numeric ? 'Запишите только пропущенное слово.' : 'Запишите только число.'));
      setTimeout(function () { inp.focus(); }, 0);
    } else if (t.type === 'choice') {
      draft = saved || null;
      var list = el('div', 'choices');
      t.options.forEach(function (o, i) {
        var lab = el('label', 'choice' + (t.mono ? ' mono' : ''));
        var r = el('input');
        r.type = 'radio';
        r.name = 'choice';
        r.value = o;
        r.checked = draft === o;
        r.addEventListener('change', function () { draft = o; updateAnswerButton(); });
        lab.appendChild(r);
        lab.appendChild(el('span', null, o));
        list.appendChild(lab);
      });
      box.appendChild(list);
    } else if (t.type === 'match') {
      draft = Array.isArray(saved) ? saved.slice() : t.items.map(function () { return ''; });
      var tbl = el('div', 'match');
      t.items.forEach(function (it, i) {
        var row = el('div', 'match-row');
        var left = el('div', 'match-left');
        if (it.svg) left.innerHTML = it.svg; else left.appendChild(el('code', 'mono', it.code));
        var sel = el('select');
        sel.setAttribute('aria-label', 'Соответствие для ' + it.name);
        sel.appendChild(el('option', null, '— выберите —')).value = '';
        t.options.forEach(function (o) { var op = el('option', null, o); op.value = o; sel.appendChild(op); });
        sel.value = draft[i] || '';
        sel.addEventListener('change', function () { draft[i] = sel.value; updateAnswerButton(); });
        row.appendChild(left);
        row.appendChild(el('span', 'arrow', '→'));
        row.appendChild(sel);
        tbl.appendChild(row);
      });
      box.appendChild(tbl);
    } else if (t.type === 'order') {
      draft = Array.isArray(saved) ? saved.slice() : t.lines.slice();
      var ol = el('ol', 'order');
      var redraw = function () {
        ol.innerHTML = '';
        draft.forEach(function (line, i) {
          var li = el('li', 'order-row');
          li.appendChild(el('code', 'mono', line));
          var up = el('button', 'mini', '↑'); up.type = 'button'; up.disabled = i === 0; up.setAttribute('aria-label', 'Выше');
          var dn = el('button', 'mini', '↓'); dn.type = 'button'; dn.disabled = i === draft.length - 1; dn.setAttribute('aria-label', 'Ниже');
          up.addEventListener('click', function () { var x = draft[i - 1]; draft[i - 1] = draft[i]; draft[i] = x; redraw(); });
          dn.addEventListener('click', function () { var x = draft[i + 1]; draft[i + 1] = draft[i]; draft[i] = x; redraw(); });
          li.appendChild(up);
          li.appendChild(dn);
          ol.appendChild(li);
        });
      };
      redraw();
      box.appendChild(ol);
    }
  }

  function answered(a) { return a.status === 'correct' || a.status === 'wrong'; }

  function renderNav(box) {
    box.innerHTML = '';
    state.answers.forEach(function (a, i) {
      var b = el('button', 'nav-btn' + (answered(a) ? ' done' : a.status === 'skipped' ? ' skipped' : '') +
        (state.phase !== 'menu' && i === state.cur ? ' cur' : ''), String(i + 1));
      b.type = 'button';
      b.title = answered(a) ? 'Есть ответ' : a.status === 'skipped' ? 'Пропущено' : 'Нет ответа';
      b.addEventListener('click', function () { goTo(i); });
      box.appendChild(b);
    });
  }

  function renderTask() {
    if (resuming) return;
    var i = state.cur, t = tasks[i], a = state.answers[i];
    $('t-num').textContent = 'Задание ' + (i + 1) + ' из ' + tasks.length;
    $('t-text').textContent = t.text;
    renderBody(t, answered(a) ? a.given : null);
    $('t-saved').textContent = answered(a) ? 'Ваш ответ сохранён. Можно изменить его и снова нажать «Ответить».' : '';
    $('t-saved').hidden = !answered(a);
    updateAnswerButton();
    $('b-skip').textContent = answered(a) ? 'Далее' : 'Пропустить';
    $('b-prev').disabled = i === 0;
    renderNav($('t-nav'));
    show('s-test');
    tick();
  }

  // ---------- Ход работы ----------

  function startTask() { save(); renderTask(); }

  function goTo(i) {
    if (!running() || i < 0 || i >= tasks.length) return;
    if (state.phase === 'menu') state.phase = 'main';
    state.cur = i;
    startTask();
  }

  function record(status, given) {
    var a = state.answers[state.cur];
    a.status = status;
    if (given !== undefined) a.given = given;
  }

  function findFrom(i, test, wrap) {
    var n = tasks.length;
    for (var k = 1; k <= (wrap ? n - 1 : n - 1 - i); k++) {
      var j = (i + k) % n;
      if (test(state.answers[j])) return j;
    }
    return -1;
  }

  function next() {
    var i = state.cur;
    var isPending = function (a) { return a.status === 'pending'; };
    var j = state.phase === 'review'
      ? findFrom(i, function (a) { return a.status === 'skipped'; }, true)
      : findFrom(i, isPending, false);
    if (j < 0 && state.phase !== 'review') j = findFrom(i, isPending, true);
    if (j >= 0) { state.cur = j; startTask(); return; }
    state.phase = 'menu';
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
    $('m-title').textContent = s.length ? 'Остались пропущенные задания' : 'Вы ответили на все задания';
    $('m-done').textContent = state.answers.filter(answered).length;
    $('m-total').textContent = tasks.length;
    $('m-skipped').hidden = !s.length;
    $('m-count').textContent = s.length;
    $('m-list').textContent = s.map(function (i) { return '№ ' + (i + 1); }).join(', ');
    $('b-review').hidden = !s.length;
    renderNav($('m-nav'));
    show('s-menu');
    tick();
  }

  function answer() {
    var t = tasks[state.cur];
    if (!TASKS.isComplete(t, draft)) return;
    var given = Array.isArray(draft) ? draft.slice() : typeof draft === 'string' ? draft.trim() : draft;
    record(TASKS.isCorrect(t, given) ? 'correct' : 'wrong', given);
    next();
  }

  function skip() {
    if (!answered(state.answers[state.cur])) record('skipped');
    next();
  }

  function reviewSkipped() {
    var s = skippedList();
    if (!s.length) return;
    state.phase = 'review';
    state.cur = s[0];
    startTask();
  }

  function finish(reason) {
    if (!running()) return;
    state.answers.forEach(function (a) { if (a.status === 'pending') a.status = 'unanswered'; });
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

  // ---------- Таймер ----------

  function fmt(ms) {
    var s = Math.max(0, Math.ceil(ms / 1000));
    return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
  }

  function tick() {
    if (!running()) return;
    var left = state.endsAt - Date.now();
    if (left <= 0) { finish('Время работы (20 минут) закончилось. Оставшиеся задания засчитаны как неправильные.'); return; }
    $('tm-total').textContent = fmt(left);
    $('tm-total-box').classList.toggle('low', left <= 60000);
    $('tm-bar').style.width = (100 * left / TOTAL_MS) + '%';
  }

  function startTicker() { clearInterval(ticker); ticker = setInterval(tick, 250); }

  // ---------- Итог ----------

  var STATUS_TEXT = { correct: 'верно', wrong: 'неверно', skipped: 'пропущено', unanswered: 'нет ответа' };

  function plural(n, one, few, many) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  }

  function renderResult() {
    var score = state.answers.filter(function (a) { return a.status === 'correct'; }).length;
    var n = tasks.length;
    $('r-score-num').textContent = score + ' / ' + n;
    $('r-score-word').textContent = plural(score, 'балл', 'балла', 'баллов');
    $('r-count').textContent = 'Правильных ответов: ' + score + ' из ' + n + '.';
    renderTimeUsed();
    $('r-reason').textContent = state.reason || '';
    $('r-reason').hidden = !state.reason;
    var body = $('r-table');
    body.innerHTML = '';
    tasks.forEach(function (t, i) {
      var a = state.answers[i];
      var tr = el('tr', a.status === 'correct' ? 'ok' : 'bad');
      [String(i + 1), t.title, answered(a) ? TASKS.showGiven(t, a.given) : '—', TASKS.showAnswer(t),
       (a.status === 'correct' ? '✓ ' : '✗ ') + STATUS_TEXT[a.status]].forEach(function (txt) { tr.appendChild(el('td', null, txt)); });
      body.appendChild(tr);
    });
    show('s-result');
    scheduleLock();
  }

  function renderTimeUsed() {
    var box = $('r-time');
    box.innerHTML = '';
    var left = 1000 * Math.floor(Math.max(0, state.endsAt - (state.finishedAt || state.endsAt)) / 1000);
    var line = function (label, value, cls) {
      var p = el('p', cls);
      p.appendChild(document.createTextNode(label + ' '));
      p.appendChild(el('b', null, value));
      box.appendChild(p);
    };
    line('Время работы:', fmt(TOTAL_MS - left) + ' из ' + fmt(TOTAL_MS));
    if (left >= 1000) {
      line('Оставалось времени:', fmt(left), 'left');
      box.appendChild(el('p', 'small', 'Работа завершена досрочно: оставшееся время можно было использовать, чтобы вернуться к заданиям и проверить ответы.'));
    } else {
      line('Оставалось времени:', '0:00');
    }
  }

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

  // ---------- Запуск ----------

  function newSeed() {
    var a = new Uint32Array(1);
    (window.crypto || window.msCrypto).getRandomValues(a);
    return a[0] || 1;
  }

  function begin() {
    $('b-start').disabled = true;
    var fs = enterFullscreen();   // сразу по нажатию — иначе браузер откажет
    var seed = newSeed();
    tasks = TASKS.generate(seed);
    state = {
      v: 1, seed: seed, status: 'running', startedAt: Date.now(), endsAt: Date.now() + TOTAL_MS,
      phase: 'main', cur: 0,
      answers: tasks.map(function () { return { status: 'pending', given: null }; })
    };
    save();
    fs.then(function () { startTicker(); startTask(); });
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
    $('b-answer').addEventListener('click', answer);
    $('b-skip').addEventListener('click', skip);
    $('b-prev').addEventListener('click', function () { goTo(state.cur - 1); });
    $('b-review').addEventListener('click', reviewSkipped);
    $('b-finish').addEventListener('click', function () { $('m-confirm').hidden = false; });
    $('b-finish-yes').addEventListener('click', function () { finish(null); });
    $('b-finish-no').addEventListener('click', function () { $('m-confirm').hidden = true; });
    $('b-resume').addEventListener('click', resume);
    $('warn').addEventListener('click', function () { $('warn').hidden = true; });

    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('beforeunload', onBeforeUnload);
    document.addEventListener('contextmenu', function (e) { if (running()) e.preventDefault(); });
    blockNavigation();

    // Новая работа на этом устройстве — только по паролю учителя (задаётся в config.js / в начале файла).
    $('b-teacher').addEventListener('click', function () { $('r-teacher-form').hidden = false; $('r-pin').focus(); });
    [['b-restart', 'r-pin', 'r-pin-msg'], ['b-unlock', 'l-pin', 'l-pin-msg']].forEach(function (ids) {
      var go = function () {
        if ($(ids[1]).value.trim() !== String(window.TEACHER_PIN)) { $(ids[2]).textContent = 'Неверный пароль'; return; }
        try { localStorage.removeItem(STORE); } catch (e) {}
        location.reload();
      };
      $(ids[0]).addEventListener('click', go);
      $(ids[1]).addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
    });
    if (!fsSupported()) $('i-nofs').hidden = false;

    state = load();
    if (state && state.seed) tasks = TASKS.generate(state.seed); else state = null;

    if (running()) {
      resuming = true;
      show('s-resume');
      startTicker();
      tick();
      return;
    }
    if (state && state.status === 'finished') { renderResult(); return; }
    state = null;
    show('s-intro');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
