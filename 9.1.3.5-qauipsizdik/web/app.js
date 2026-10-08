/* 9.1.3.5–9.1.3.6 «Желідегі қауіпсіздік. Желілік этикет»: веб-ресурс (теория → 11 тапсырма → нәтиже және талдау).
 * Тіл: ҚАЗ / РУС батырмасы, кез келген уақытта; жауаптар тілге тәуелсіз (индекстер) сақталады.
 * Толық экран режимі басынан бастап; MAX_VIOLATIONS-ші бұзушылықта жұмыс аяқталады;
 * нәтиже RESULT_MIN минут көрінеді, содан кейін бастапқы бет ашылады (құпиясөзсіз). */
(function () {
  'use strict';
  var STORE = 'qauipsizdik-9.1.3.5';
  var WORK_MS = (window.WORK_MIN || 30) * 60 * 1000;
  var RESULT_MS = (window.RESULT_MIN || 4) * 60 * 1000;
  var MAX_VIOL = window.MAX_VIOLATIONS || 3;
  var C = window.CONTENT;
  var LANG = (function () { try { return localStorage.getItem('qauip-lang') === 'ru' ? 'ru' : 'kz'; } catch (e) { return 'kz'; } })();
  var state = null, tasks = [], ticker = null, hideTimer = null, fsActive = false, ignoreUntil = 0;

  var $ = function (id) { return document.getElementById(id); };
  function T(kz, ru) { return LANG === 'kz' ? kz : ru; }
  function L(o) { return o ? o[LANG] : ''; }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function save() { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) {} }
  function load() { try { return JSON.parse(localStorage.getItem(STORE)); } catch (e) { return null; } }
  function running() { return !!state && state.status === 'running'; }
  function fmt(ms) { var s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
  function show(id) {
    ['s-loading', 's-gate', 's-theory', 's-intro', 's-work', 's-result'].forEach(function (s) { $(s).hidden = s !== id; });
    $('timers').hidden = !(running() && state.stage === 'work');
    window.scrollTo(0, 0);
  }
  var LETTERS = 'ABCDEFGH';

  // ---------- Толық экран және бұзушылықтар ----------
  function fsElement() { return document.fullscreenElement || document.webkitFullscreenElement || null; }
  function fsSupported() { var e = document.documentElement; return !!(e.requestFullscreen || e.webkitRequestFullscreen); }
  function enterFullscreen() {
    var e = document.documentElement, req = e.requestFullscreen || e.webkitRequestFullscreen;
    if (!req || fsElement()) return Promise.resolve();
    try {
      return Promise.resolve(req.call(e, { navigationUI: 'hide' })).then(function () {
        // тек Esc: Alt+Shift, Ctrl+Shift, Win+Бос орын (пернетақта тілін ауыстыру) жұмыс істейді
        if (navigator.keyboard && navigator.keyboard.lock) navigator.keyboard.lock(['Escape']).catch(function () {});
      }).catch(function () {});
    } catch (err) { return Promise.resolve(); }
  }
  function exitFullscreen() { var ex = document.exitFullscreen || document.webkitExitFullscreen; if (fsElement() && ex) { try { ex.call(document); } catch (e) {} } }
  // Бір әрекет бірнеше оқиға тудырады (толық экраннан шығу + фокусты жоғалту) — бір рет санаймыз.
  // Бет жабылғанда/қайта жүктелгенде браузер өзі толық экраннан шығады: бұл кейінге қалдырылып, бет ашылғанда бір рет есептеледі.
  var violLock = 0, leaving = false;
  function violation(reason) {
    if (!running() || leaving || Date.now() < violLock) return;
    violLock = Date.now() + 1500;
    setTimeout(function () { if (running() && !leaving) countViolation(reason); }, 400);
  }
  function countViolation(reason) {
    state.viol = (state.viol || 0) + 1;
    state.lastViol = reason;
    save();
    if (state.viol >= MAX_VIOL) { finish(reason); return; }
    renderBack();
    $('m-back').hidden = false;
  }
  var REASONS = {
    fs: { kz: 'Сіз толық экран режимінен шықтыңыз.', ru: 'Вы вышли из полноэкранного режима.' },
    tab: { kz: 'Сіз басқа қойындыға немесе қосымшаға ауыстыңыз.', ru: 'Вы переключились на другую вкладку или приложение.' },
    win: { kz: 'Сіз басқа терезеге немесе қосымшаға ауыстыңыз.', ru: 'Вы переключились на другое окно или приложение.' },
    reload: { kz: 'Бет жабылды немесе қайта жүктелді.', ru: 'Страница была закрыта или перезагружена.' },
    time: { kz: 'Уақыт бітті.', ru: 'Время вышло.' },
  };
  function renderBack() {
    if (!state) return;
    $('m-back-text').textContent = L(REASONS[state.lastViol]) + ' ' + T('Қалған мүмкіндік: ', 'Осталось попыток: ') + (MAX_VIOL - (state.viol || 0)) + '. ' +
      T('Мүмкіндіктер біткенде жұмыс аяқталады. Батырманы басып, жұмысты жалғастырыңыз.', 'Когда попытки закончатся, работа завершится. Нажмите кнопку и продолжайте работу.');
  }
  function backToFullscreen() { enterFullscreen().then(function () { if (fsElement() || !fsSupported()) $('m-back').hidden = true; }); }
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
    if (e.key === 'Escape') { warn(T('Толық экран режимінен шықпаңыз: бұл — ереже бұзу.', 'Не выходите из полноэкранного режима: это нарушение.')); e.preventDefault(); }
    var k = (e.key || '').toLowerCase();
    if (e.key === 'F5' || e.key === 'F11' || ((e.ctrlKey || e.metaKey) && ['r', 'p', 's', 'f', 'o', 'n', 't', 'w', 'l', 'c', 'v'].indexOf(k) >= 0) ||
        (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight'))) { e.preventDefault(); warn(T('Жұмыс кезінде бұл әрекет қолжетімсіз.', 'Это действие недоступно во время работы.')); }
  }
  function onPageHide() { leaving = true; if (running()) { state.closedAt = Date.now(); save(); } }
  function onBeforeUnload(e) {
    if (!running()) return;
    leaving = true; setTimeout(function () { leaving = false; }, 3000);
    e.preventDefault(); e.returnValue = ''; return '';
  }

  // ---------- Кезеңдер ----------
  function newSeed() { var a = new Uint32Array(1); (window.crypto || window.msCrypto).getRandomValues(a); return a[0] || 1; }
  function startSession() {
    if (state) return;
    var fs = enterFullscreen(), seed = newSeed();
    tasks = C.generate(seed);
    state = { v: 1, seed: seed, status: 'running', stage: 'theory', startedAt: Date.now(), viol: 0, cur: 0, ans: tasks.map(C.empty) };
    save();
    ticker = setInterval(tick, 250);
    fs.then(showTheory);
  }
  function showTheory() {
    var during = running() && state.stage === 'work';
    $('b-to-intro').hidden = during;
    $('b-theory-back').hidden = !during;
    $('t-end-text').hidden = during;
    show('s-theory');
  }
  function begin() {
    $('b-start').disabled = true;
    enterFullscreen();
    state.stage = 'work';
    state.workStartedAt = Date.now();
    state.endsAt = Date.now() + WORK_MS;
    save();
    renderTask();
  }
  function tick() {
    if (!running() || state.stage !== 'work') return;
    var left = state.endsAt - Date.now();
    if (left <= 0) { finish('time'); return; }
    $('tm').textContent = fmt(left);
    $('tm-bar').style.width = (100 * left / WORK_MS) + '%';
    $('timers').classList.toggle('low', left < 3 * 60 * 1000);
  }
  function resetToStart() { try { localStorage.removeItem(STORE); } catch (e) {} location.reload(); }

  // ---------- Тапсырмалар ----------
  function goTo(i) { if (!running() || i < 0 || i >= tasks.length) return; state.cur = i; save(); renderTask(); }
  function set(i, a) { state.ans[i] = a; save(); renderNav(); }
  function renderNav() {
    var nav = $('nav'); nav.innerHTML = '';
    tasks.forEach(function (t, i) {
      var b = el('button', 'nav-btn' + (C.touched(t, state.ans[i]) ? ' done' : '') + (i === state.cur ? ' cur' : ''), String(i + 1));
      b.title = L(t.title);
      b.addEventListener('click', function () { goTo(i); });
      nav.appendChild(b);
    });
  }
  function renderTask() {
    var i = state.cur, t = tasks[i], box = $('task');
    box.innerHTML = '';
    $('m-confirm').hidden = true;
    box.appendChild(el('p', 'muted small', T('Тапсырма ', 'Задание ') + (i + 1) + ' / ' + tasks.length + ' · ' + T('оқу мақсаты ', 'цель ') + t.obj + ' · ' + T('ең жоғары балл: ', 'максимум баллов: ') + t.max));
    box.appendChild(el('h2', 'task-title', L(t.title)));
    var R = { match: rMatch, fill: rFill, tf: rTF, hot: rHot, sort: rSort, order: rOrder, chat: rChat, multi: rMulti };
    R[t.type](t, state.ans[i], box, i);
    $('b-prev').disabled = i === 0;
    $('b-next').disabled = i === tasks.length - 1;
    renderNav();
    show('s-work');
    tick();
  }
  function rerender() { var y = window.scrollY; renderTask(); window.scrollTo(0, y); }
  function choose(text) { var o = el('option', null, text); return o; }

  function rMatch(t, a, box, i) {
    box.appendChild(el('p', 'lead', T('Әр терминге анықтаманың әрпін таңдаңыз.', 'Для каждого термина выберите букву определения.')));
    var defs = el('ol', 'defs');
    t.right.forEach(function (r, k) { var li = el('li'); li.appendChild(el('b', null, LETTERS[k] + ') ')); li.appendChild(document.createTextNode(L(r))); defs.appendChild(li); });
    var rows = el('div', 'match');
    t.left.forEach(function (l, k) {
      var row = el('div', 'match-row');
      row.appendChild(el('span', 'term', L(l)));
      var sel = el('select');
      sel.appendChild(choose('—'));
      t.right.forEach(function (r, n) { var o = choose(LETTERS[n]); o.value = String(n); sel.appendChild(o); });
      sel.firstChild.value = '';
      sel.value = a[k] === null ? '' : String(a[k]);
      sel.addEventListener('change', function () { var b = state.ans[i].slice(); b[k] = sel.value === '' ? null : Number(sel.value); set(i, b); });
      row.appendChild(sel);
      rows.appendChild(row);
    });
    box.appendChild(rows);
    box.appendChild(defs);
  }
  function rFill(t, a, box, i) {
    box.appendChild(el('p', 'lead', T('Әр бос орынға тізімнен дұрыс сөзді таңдаңыз.', 'В каждый пропуск выберите из списка подходящее слово.')));
    var p = el('p', 'fill-text');
    t.text[LANG].forEach(function (seg) {
      if (typeof seg === 'string') { p.appendChild(document.createTextNode(seg)); return; }
      var k = seg.b, sel = el('select', 'fill-sel' + (a[k] === null ? ' empty' : ''));
      sel.appendChild(choose('……'));
      sel.firstChild.value = '';
      t.blanks[k].opts.forEach(function (o, n) { var op = choose(L(o)); op.value = String(n); sel.appendChild(op); });
      sel.value = a[k] === null ? '' : String(a[k]);
      sel.addEventListener('change', function () { var b = state.ans[i].slice(); b[k] = sel.value === '' ? null : Number(sel.value); set(i, b); sel.classList.toggle('empty', sel.value === ''); });
      p.appendChild(sel);
    });
    box.appendChild(p);
  }
  function rTF(t, a, box, i) {
    box.appendChild(el('p', 'lead', T('Әр тұжырымға «Ақиқат» немесе «Жалған» деп жауап беріңіз.', 'Для каждого утверждения выберите «Правда» или «Ложь».')));
    t.items.forEach(function (it, k) {
      var row = el('div', 'tf-row');
      row.appendChild(el('span', 'tf-text', (k + 1) + '. ' + L(it.s)));
      var g = el('span', 'seg');
      [[true, T('Ақиқат', 'Правда')], [false, T('Жалған', 'Ложь')]].forEach(function (x) {
        var b = el('button', 'seg-btn' + (a[k] === x[0] ? ' on' : ''), x[1]);
        b.addEventListener('click', function () { var c = state.ans[i].slice(); c[k] = x[0]; set(i, c); rerender(); });
        g.appendChild(b);
      });
      row.appendChild(g);
      box.appendChild(row);
    });
  }
  function rHot(t, a, box, i) {
    var marked = a.filter(Boolean).length;
    box.appendChild(el('p', 'lead', t.style === 'mail'
      ? T('Хабарламада алаяқтықтың ' + t.nBad + ' белгісі бар. Күдікті жолдарды басып белгілеңіз (қайта басса — белгі алынады).', 'В сообщении ' + t.nBad + ' признаков мошенничества. Нажмите на подозрительные строки, чтобы отметить их (повторное нажатие снимает отметку).')
      : T('Чатта ' + t.nBad + ' хабарлама нетикетті бұзады. Оларды басып белгілеңіз (қайта басса — белгі алынады).', 'В чате ' + t.nBad + ' сообщений нарушают нетикет. Нажмите на них, чтобы отметить (повторное нажатие снимает отметку).')));
    box.appendChild(el('p', 'counter', T('Белгіленді: ', 'Отмечено: ') + marked + ' / ' + t.nBad));
    var card = el('div', t.style === 'mail' ? 'mail' : 'chatlog');
    card.appendChild(el('div', 'mail-head', L(t.head)));
    t.parts.forEach(function (p, k) {
      var b = el('button', (t.style === 'mail' ? 'mail-part' : 'chat-msg') + (a[k] ? ' marked' : ''));
      if (t.style === 'chat') {
        var h = el('span', 'chat-meta'); h.appendChild(el('b', null, L(p.who))); h.appendChild(el('span', 'chat-time', ' ' + p.time)); b.appendChild(h);
        b.appendChild(el('span', 'chat-text', L(p.text)));
      } else b.textContent = L(p.text);
      b.setAttribute('aria-pressed', a[k] ? 'true' : 'false');
      b.addEventListener('click', function () { var c = state.ans[i].slice(); c[k] = !c[k]; set(i, c); rerender(); });
      card.appendChild(b);
    });
    box.appendChild(card);
  }
  function rSort(t, a, box, i) {
    box.appendChild(el('p', 'lead', L(t.lead)));
    t.items.forEach(function (it, k) {
      var row = el('div', 'tf-row');
      row.appendChild(el('span', 'tf-text' + (t.mono ? ' mono' : ''), L(it.t)));
      var g = el('span', 'seg');
      t.bins.forEach(function (bn, n) {
        var b = el('button', 'seg-btn' + (a[k] === n ? ' on' : ''), L(bn));
        b.addEventListener('click', function () { var c = state.ans[i].slice(); c[k] = n; set(i, c); rerender(); });
        g.appendChild(b);
      });
      row.appendChild(g);
      box.appendChild(row);
    });
  }
  function rOrder(t, a, box, i) {
    box.appendChild(el('p', 'lead', L(t.lead)));
    var list = el('ol', 'order');
    a.forEach(function (item, k) {
      var li = el('li', 'order-row');
      li.appendChild(el('span', 'order-n', String(k + 1)));
      li.appendChild(el('code', 'order-text', t.items[item]));
      [[-1, '↑'], [1, '↓']].forEach(function (x) {
        var b = el('button', 'order-btn', x[1]);
        b.disabled = k + x[0] < 0 || k + x[0] >= a.length;
        b.setAttribute('aria-label', x[0] < 0 ? T('Жоғары', 'Вверх') : T('Төмен', 'Вниз'));
        b.addEventListener('click', function () { var c = state.ans[i].slice(), j = k + x[0], tmp = c[k]; c[k] = c[j]; c[j] = tmp; set(i, c); rerender(); });
        li.appendChild(b);
      });
      list.appendChild(li);
    });
    box.appendChild(el('p', 'order-end muted small', T('↑ ең әлсіз', '↑ самый слабый')));
    box.appendChild(list);
    box.appendChild(el('p', 'order-end muted small', T('↓ ең күшті', '↓ самый надёжный')));
  }
  function rChat(t, a, box, i) {
    box.appendChild(el('p', 'lead', T('Сізге хабарлама келді. Әр қадамда ең дұрыс жауапты таңдаңыз — сонда келесі хабарлама шығады.', 'Вам пишут. На каждом шаге выберите самый правильный ответ — после этого придёт следующее сообщение.')));
    var log = el('div', 'chatlog sim');
    log.appendChild(el('div', 'mail-head', L(t.who)));
    for (var k = 0; k < t.steps.length; k++) {
      if (k > 0 && a[k - 1] === null) break;
      (function (k) {
        var s = t.steps[k];
        log.appendChild(el('div', 'bubble in', L(s.msg)));
        if (a[k] !== null) {
          log.appendChild(el('div', 'bubble out', L(s.opts[a[k]])));
          var ch = el('button', 'link chat-change', T('Жауапты өзгерту', 'Изменить ответ'));
          // жауапты өзгерткенде келесі қадамдар қайта басталады
          ch.addEventListener('click', function () { var c = state.ans[i].slice(); for (var m = k; m < c.length; m++) c[m] = null; set(i, c); rerender(); });
          var wrap = el('div', 'chat-opts'); wrap.appendChild(ch); log.appendChild(wrap);
          return;
        }
        var opts = el('div', 'chat-opts');
        s.opts.forEach(function (o, n) {
          var b = el('button', 'chat-opt' + (a[k] === n ? ' on' : ''), L(o));
          b.addEventListener('click', function () { var c = state.ans[i].slice(); c[k] = n; set(i, c); rerender(); });
          opts.appendChild(b);
        });
        log.appendChild(opts);
      })(k);
    }
    box.appendChild(log);
  }
  function rMulti(t, a, box, i) {
    box.appendChild(el('div', 'case', L(t.text)));
    box.appendChild(el('p', 'lead', L(t.q) + ' ' + T('(Дұрыс тұжырым — ' + t.nOk + '; қате белгі балды азайтады.)', '(Верных утверждений — ' + t.nOk + '; лишняя отметка уменьшает балл.)')));
    t.opts.forEach(function (o, k) {
      var lab = el('label', 'check' + (a[k] ? ' on' : ''));
      var cb = el('input'); cb.type = 'checkbox'; cb.checked = !!a[k];
      cb.addEventListener('change', function () { var c = state.ans[i].slice(); c[k] = cb.checked; set(i, c); lab.classList.toggle('on', cb.checked); });
      lab.appendChild(cb);
      lab.appendChild(el('span', null, L(o.t)));
      box.appendChild(lab);
    });
  }

  // ---------- Аяқтау және нәтиже ----------
  function finish(reason) {
    if (!running()) return;
    state.status = 'finished';
    state.reason = reason || null;
    state.finishedAt = state.closedAt || Date.now();
    state.scores = tasks.map(function (t, i) { return C.score(t, state.ans[i]); });
    save();
    clearInterval(ticker);
    $('warn').hidden = true; $('m-back').hidden = true;
    if (navigator.keyboard && navigator.keyboard.unlock) navigator.keyboard.unlock();
    fsActive = false;
    exitFullscreen();
    renderResult();
  }
  function totals() {
    var got = state.scores.reduce(function (s, x) { return s + x; }, 0), max = tasks.reduce(function (s, t) { return s + t.max; }, 0);
    return { got: got, max: max };
  }
  function renderResult() {
    var tt = totals();
    $('r-score').textContent = tt.got + ' / ' + tt.max;
    $('r-pct').textContent = Math.round(100 * tt.got / tt.max) + '%';
    if (state.reason && state.reason !== 'done') {
      $('r-reason').hidden = false;
      $('r-reason').textContent = state.reason === 'time' ? L(REASONS.time) + ' ' + T('Жұмыс автоматты түрде тапсырылды.', 'Работа сдана автоматически.')
        : T('Жұмыс автоматты түрде аяқталды: ', 'Работа завершена автоматически: ') + L(REASONS[state.reason]).toLowerCase() + ' ' + T('(' + MAX_VIOL + '-ші бұзушылық)', '(' + MAX_VIOL + '-е нарушение)');
    } else $('r-reason').hidden = true;
    var tb = $('r-table'); tb.innerHTML = '';
    var table = el('table', 'res');
    var hr = el('tr'); [T('№', '№'), T('Тапсырма', 'Задание'), T('Балл', 'Балл')].forEach(function (h) { hr.appendChild(el('th', null, h)); }); table.appendChild(hr);
    tasks.forEach(function (t, i) {
      var tr = el('tr', state.scores[i] === t.max ? 'ok' : state.scores[i] === 0 ? 'bad' : 'mid');
      tr.appendChild(el('td', null, String(i + 1))); tr.appendChild(el('td', null, L(t.title))); tr.appendChild(el('td', null, state.scores[i] + ' / ' + t.max));
      table.appendChild(tr);
    });
    tb.appendChild(table);
    var start = state.workStartedAt || state.startedAt;
    $('r-time').textContent = T('Жұмысқа жұмсалған уақыт: ', 'Время работы: ') + fmt(state.finishedAt - start) + (state.viol ? ' · ' + T('бұзушылықтар: ', 'нарушений: ') + state.viol : '');
    var rv = $('r-review'); rv.innerHTML = '';
    tasks.forEach(function (t, i) { rv.appendChild(review(t, state.ans[i], state.scores[i], i)); });
    show('s-result');
    scheduleReset();
  }
  function scheduleReset() {
    clearInterval(hideTimer);
    var upd = function () {
      var left = state.finishedAt + RESULT_MS - Date.now();
      if (left <= 0) { clearInterval(hideTimer); resetToStart(); return; }
      $('r-hide').textContent = T('Бастапқы бет мына уақыттан кейін ашылады: ', 'Начальная страница откроется через ') + fmt(left) + '.';
    };
    upd();
    hideTimer = setInterval(upd, 1000);
  }
  function mark(ok) { return el('span', ok ? 'rv-ok' : 'rv-bad', ok ? '✓' : '✗'); }
  function line(ok, main, extra) {
    var d = el('div', 'rv-line ' + (ok ? 'ok' : 'bad'));
    d.appendChild(mark(ok)); var s = el('span'); s.appendChild(document.createTextNode(' ' + main)); d.appendChild(s);
    if (extra) d.appendChild(el('div', 'rv-why', extra));
    return d;
  }
  function review(t, a, sc, i) {
    var card = el('div', 'rv-card ' + (sc === t.max ? 'ok' : sc === 0 ? 'bad' : 'mid'));
    card.appendChild(el('h3', null, (i + 1) + '. ' + L(t.title) + ' — ' + sc + ' / ' + t.max));
    var you = T('Сіздің жауабыңыз: ', 'Ваш ответ: '), right = T('Дұрыс жауап: ', 'Правильный ответ: '), none = T('жауап жоқ', 'нет ответа');
    switch (t.type) {
      case 'match':
        t.left.forEach(function (l, k) {
          var ok = a[k] === t.key[k];
          card.appendChild(line(ok, L(l) + ' — ' + L(t.right[t.key[k]]), ok ? null : you + (a[k] === null ? none : L(t.right[a[k]]))));
        });
        break;
      case 'fill':
        t.blanks.forEach(function (b, k) {
          var ok = a[k] === b.key;
          card.appendChild(line(ok, (k + 1) + ') ' + L(b.opts[b.key]), ok ? null : you + (a[k] === null ? none : L(b.opts[a[k]]))));
        });
        break;
      case 'tf':
        t.items.forEach(function (it, k) {
          var ok = a[k] === it.v;
          card.appendChild(line(ok, L(it.s) + ' — ' + (it.v ? T('Ақиқат', 'Правда') : T('Жалған', 'Ложь')), (ok ? '' : you + (a[k] === null ? none : a[k] ? T('Ақиқат', 'Правда') : T('Жалған', 'Ложь')) + '. ') + L(it.why)));
        });
        break;
      case 'hot':
        card.appendChild(el('p', 'muted small', T('Қызылмен — күдікті бөліктер. ✓ — сіз дұрыс шештіңіз, ✗ — қателестіңіз.', 'Красным — подозрительные части. ✓ — вы решили верно, ✗ — ошиблись.')));
        t.parts.forEach(function (p, k) {
          var ok = !!a[k] === p.bad, txt = (p.who ? L(p.who) + ' (' + p.time + '): ' : '') + L(p.text);
          var d = line(ok, txt, (p.bad ? T('Күдікті: ', 'Подозрительно: ') : T('Қалыпты: ', 'Нормально: ')) + L(p.why) + (ok ? '' : ' ' + (a[k] ? T('(Сіз белгіледіңіз — артық.)', '(Вы отметили — лишнее.)') : T('(Сіз белгілемедіңіз.)', '(Вы не отметили.)'))));
          if (p.bad) d.classList.add('hot');
          card.appendChild(d);
        });
        break;
      case 'sort':
        t.items.forEach(function (it, k) {
          var ok = a[k] === it.bin;
          card.appendChild(line(ok, L(it.t) + ' — ' + L(t.bins[it.bin]), (ok ? '' : you + (a[k] === null ? none : L(t.bins[a[k]])) + '. ') + (it.why ? L(it.why) : '')));
        });
        break;
      case 'order':
        card.appendChild(el('p', 'muted small', right + t.items.join('  <  ')));
        a.forEach(function (item, k) { card.appendChild(line(item === k, (k + 1) + '. ' + t.items[item], item === k ? null : right + t.items[k])); });
        card.appendChild(el('p', 'rv-why', L(t.why)));
        break;
      case 'chat':
        t.steps.forEach(function (s, k) {
          var ok = a[k] === s.key;
          card.appendChild(el('div', 'bubble in', L(s.msg)));
          card.appendChild(line(ok, right + L(s.opts[s.key]), (ok ? '' : you + (a[k] === null ? none : L(s.opts[a[k]])) + '. ') + L(s.why)));
        });
        break;
      case 'multi':
        card.appendChild(el('div', 'case', L(t.text)));
        t.opts.forEach(function (o, k) {
          var ok = !!a[k] === o.ok;
          card.appendChild(line(ok, L(o.t) + ' — ' + (o.ok ? T('дұрыс тұжырым', 'верно') : T('қате тұжырым', 'неверно')), ok ? null : (a[k] ? T('Сіз белгіледіңіз.', 'Вы отметили.') : T('Сіз белгілемедіңіз.', 'Вы не отметили.'))));
        });
        break;
    }
    return card;
  }

  // ---------- Тіл ----------
  function setLang(l) {
    LANG = l;
    try { localStorage.setItem('qauip-lang', l); } catch (e) {}
    document.documentElement.lang = l === 'kz' ? 'kk' : 'ru';
    document.title = l === 'kz' ? 'Желідегі қауіпсіздік — 9.1.3.5–9.1.3.6' : 'Безопасность в сети — 9.1.3.5–9.1.3.6';
    document.querySelectorAll('.lang-switch button').forEach(function (b) { var on = b.getAttribute('data-lang') === l; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    if (!state) return;
    if (!$('s-work').hidden) rerender();
    if (!$('s-result').hidden) renderResult();
    if (!$('m-back').hidden) renderBack();
    if (!$('m-confirm').hidden) confirmText();
  }
  function confirmText() {
    var u = tasks.filter(function (t, i) { return !C.complete(t, state.ans[i]); }).length;
    $('m-confirm-text').textContent = T('Жұмысты тапсырасыз ба?', 'Сдать работу?') + (u ? ' ' + T('Толық орындалмаған тапсырмалар: ', 'Не до конца выполненных заданий: ') + u + '.' : '') + ' ' + T('Тапсырғаннан кейін жауаптарды өзгертуге болмайды.', 'После сдачи ответы изменить нельзя.');
  }

  function init() {
    $('theory-kz').innerHTML = C.THEORY.kz;
    $('theory-ru').innerHTML = C.THEORY.ru;
    document.querySelectorAll('.i-min').forEach(function (e) { e.textContent = String(window.WORK_MIN || 30); });
    document.querySelectorAll('.lang-switch button').forEach(function (b) { b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); }); });
    setLang(LANG);
    $('b-gate').addEventListener('click', startSession);
    $('b-to-intro').addEventListener('click', function () { show('s-intro'); });
    $('b-back-theory').addEventListener('click', showTheory);
    $('b-theory-back').addEventListener('click', renderTask);
    $('b-read').addEventListener('click', showTheory);
    $('b-start').addEventListener('click', begin);
    $('b-prev').addEventListener('click', function () { goTo(state.cur - 1); });
    $('b-next').addEventListener('click', function () { goTo(state.cur + 1); });
    $('b-finish').addEventListener('click', function () { confirmText(); $('m-confirm').hidden = false; });
    $('b-finish-yes').addEventListener('click', function () { finish('done'); });
    $('b-finish-no').addEventListener('click', function () { $('m-confirm').hidden = true; });
    $('b-back-fs').addEventListener('click', backToFullscreen);
    $('b-restart').addEventListener('click', resetToStart);
    $('warn').addEventListener('click', function () { $('warn').hidden = true; });

    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('beforeunload', onBeforeUnload);
    window.addEventListener('pagehide', onPageHide);
    document.addEventListener('contextmenu', function (e) { if (running()) e.preventDefault(); });
    history.pushState(null, '', location.href);
    window.addEventListener('popstate', function () { if (running()) { history.pushState(null, '', location.href); warn(T('Жұмыс кезінде артқа өтуге болмайды.', 'Переход назад во время работы недоступен.')); } });

    state = load();
    if (state && state.v === 1 && state.seed) tasks = C.generate(state.seed); else state = null;
    if (state && state.status === 'running') {
      // Бет жабылды немесе қайта жүктелді — бұл бұзушылық: жұмыс сол жерден жалғасады, MAX_VIOL-ші рет аяқталады
      state.viol = (state.viol || 0) + 1; state.lastViol = 'reload';
      if (state.viol >= MAX_VIOL) { finish('reload'); return; }
      delete state.closedAt; save();
      violLock = Date.now() + 1500;
      ticker = setInterval(tick, 250);
      if (state.stage === 'work') renderTask(); else showTheory();
      renderBack();
      $('m-back').hidden = false;
      return;
    }
    if (state && state.status === 'finished') { renderResult(); return; }
    state = null;
    show('s-gate');
  }
  document.addEventListener('DOMContentLoaded', init);
})();
