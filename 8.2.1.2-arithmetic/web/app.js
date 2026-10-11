/* 8.2.1.2 «Санау жүйелерінде қосу және азайту»: веб-ресурс (теория → 10 тапсырма + 3 қосымша тапсырма → нәтиже және талдау).
 * Жұмыс кезінде теорияға қайтуға болмайды. Тіл: ҚАЗ / РУС батырмасы, кез келген уақытта.
 * Толық экран басынан бастап; MAX_VIOLATIONS-ші бұзушылықта жұмыс аяқталады;
 * нәтиже RESULT_MIN минут көрінеді, содан кейін бастапқы бет ашылады (құпиясөзсіз).
 * Жауап өрістері пернетақтаның тіліне тәуелсіз: A–F пернелері қазақ/орыс тілінде де латын әрпін жазады. */
(function () {
  'use strict';
  var STORE = 'qosu-azaytu-8.2.1.2';
  var WORK_MS = (window.WORK_MIN || 40) * 60 * 1000;
  var RESULT_MS = (window.RESULT_MIN || 4) * 60 * 1000;
  var MAX_VIOL = window.MAX_VIOLATIONS || 3;
  var C = window.CONTENT;
  var LANG = (function () { try { return localStorage.getItem('qosu-lang') === 'ru' ? 'ru' : 'kz'; } catch (e) { return 'kz'; } })();
  var state = null, tasks = [], ticker = null, hideTimer = null, fsActive = false, ignoreUntil = 0, lastInput = null;

  var $ = function (id) { return document.getElementById(id); };
  function T(kz, ru) { return LANG === 'kz' ? kz : ru; }
  function L(o) { return o ? o[LANG] : ''; }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function html(tag, cls, h) { var e = el(tag, cls); e.innerHTML = h; return e; }
  function save() { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) {} }
  function load() { try { return JSON.parse(localStorage.getItem(STORE)); } catch (e) { return null; } }
  function running() { return !!state && state.status === 'running'; }
  function fmt(ms) { var s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
  function isStar(t) { return !!t.star; }
  function navName(i) { var n = tasks.filter(function (t) { return !isStar(t); }).length; return i < n ? String(i + 1) : '★' + (i - n + 1); }
  function show(id) {
    ['s-loading', 's-gate', 's-theory', 's-intro', 's-work', 's-result'].forEach(function (s) { $(s).hidden = s !== id; });
    $('timers').hidden = !(id === 's-work' && running() && state.stage === 'work');
    window.scrollTo(0, 0);
  }

  // ---------- Толық экран және бұзушылықтар ----------
  function fsElement() { return document.fullscreenElement || document.webkitFullscreenElement || null; }
  function fsSupported() { var e = document.documentElement; return !!(e.requestFullscreen || e.webkitRequestFullscreen); }
  function enterFullscreen() {
    var e = document.documentElement, req = e.requestFullscreen || e.webkitRequestFullscreen;
    if (!req || fsElement()) return Promise.resolve();
    try {
      return Promise.resolve(req.call(e, { navigationUI: 'hide' })).then(function () {
        // тек Esc ұсталады: пернетақта тілін ауыстыру (Alt+Shift, Win+Бос орын) жұмыс істей береді
        if (navigator.keyboard && navigator.keyboard.lock) navigator.keyboard.lock(['Escape']).catch(function () {});
      }).catch(function () {});
    } catch (err) { return Promise.resolve(); }
  }
  function exitFullscreen() { var ex = document.exitFullscreen || document.webkitExitFullscreen; if (fsElement() && ex) { try { ex.call(document); } catch (e) {} } }
  // Бір әрекет бірнеше оқиға тудырады — бір рет санаймыз; бет жабылғанда/қайта жүктелгенде бет ашылғанда бір рет есептеледі
  var violLock = 0, leaving = false;
  function violation(reason) {
    if (!running() || leaving || Date.now() < violLock) return;
    violLock = Date.now() + 1500;
    setTimeout(function () { if (running() && !leaving) countViolation(reason); }, 400);
  }
  function countViolation(reason) {
    state.lastViol = reason;
    state.viol = (state.viol || 0) + 1; save();
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
    var k = (e.code || '').replace(/^Key/, '').toLowerCase();
    if (e.key === 'F5' || e.key === 'F11' || ((e.ctrlKey || e.metaKey) && ['r', 'p', 's', 'f', 'o', 'n', 't', 'w', 'l', 'c', 'v', 'x'].indexOf(k) >= 0) ||
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
    fs.then(function () { show('s-theory'); });
  }
  function toIntro() { state.stage = 'intro'; save(); show('s-intro'); }
  function backTheory() { state.stage = 'theory'; save(); show('s-theory'); }
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
  function renderNav() {
    var nav = $('nav'); nav.innerHTML = '';
    var mk = function (i) {
      var t = tasks[i], b = el('button', 'nav-btn' + (isStar(t) ? ' star' : ''), navName(i));
      if (C.complete(t, state.ans[i])) b.classList.add('done'); else if (C.touched(t, state.ans[i])) b.classList.add('half');
      if (i === state.cur) b.classList.add('cur');
      b.addEventListener('click', function () { goTo(i); });
      return b;
    };
    var g1 = el('div', 'nav-group'), g2 = el('div', 'nav-group');
    g1.appendChild(el('span', 'nav-label', T('Негізгі тапсырмалар (10 балл)', 'Основные задания (10 баллов)')));
    g2.appendChild(el('span', 'nav-label', T('★ Қосымша тапсырма (6 балл)', '★ Дополнительное задание (6 баллов)')));
    var r1 = el('div', 'nav'), r2 = el('div', 'nav');
    tasks.forEach(function (t, i) { (isStar(t) ? r2 : r1).appendChild(mk(i)); });
    g1.appendChild(r1); g2.appendChild(r2); nav.appendChild(g1); nav.appendChild(g2);
  }
  function renderTask() {
    show('s-work');
    renderNav();
    var i = state.cur, t = tasks[i], box = $('task'); box.innerHTML = '';
    var head = el('div', 'task-head');
    head.appendChild(el('span', 'task-no', (isStar(t) ? T('★ Қосымша ', '★ Доп. ') + navName(i).slice(1) : navName(i)) + ' · ' + t.max + ' ' + T('балл', t.max === 1 ? 'балл' : 'балла')));
    head.appendChild(el('h2', null, L(t.title)));
    box.appendChild(head);
    box.appendChild(html('p', 'lead', L(t.prompt)));
    if (t.type === 'cmp') rCmp(t, i, box);
    else {
      box.appendChild(html('p', 'expr', t.expr));
      if (t.type === 'choice') rChoice(t, i, box); else rInput(t, i, box);
    }
    $('b-prev').disabled = i === 0;
    $('b-next').disabled = i === tasks.length - 1;
    $('m-confirm').hidden = true;
  }
  function rChoice(t, i, box) {
    var wrap = el('div', 'choices');
    t.opts.forEach(function (o, n) {
      var b = el('button', 'choice' + (state.ans[i] === n ? ' on' : ''));
      b.appendChild(el('b', null, 'ABCD'[n] + ') ')); b.appendChild(document.createTextNode(T(['Айгерім', 'Нұрлан', 'Дана', 'Ерлан'][n], ['Айгерим', 'Нурлан', 'Дана', 'Ерлан'][n]) + ': ' + o));
      b.addEventListener('click', function () { state.ans[i] = n; save(); renderTask(); });
      wrap.appendChild(b);
    });
    box.appendChild(wrap);
  }
  function rCmp(t, i, box) {
    var row = el('div', 'cmp');
    row.appendChild(el('span', 'cmp-side', t.left));
    var mid = el('span', 'cmp-signs');
    ['<', '=', '>'].forEach(function (s, n) {
      var b = el('button', 'sign' + (state.ans[i] === n ? ' on' : ''), s);
      b.addEventListener('click', function () { state.ans[i] = n; save(); renderTask(); });
      mid.appendChild(b);
    });
    row.appendChild(mid);
    row.appendChild(el('span', 'cmp-side', t.right));
    box.appendChild(row);
  }
  // Жауап өрісі: тек осы жүйенің цифрлары; A–F пернелері кез келген тілде латын әрпін жазады
  var CYR = { 'Ф': 'A', 'И': 'B', 'С': 'C', 'В': 'D', 'У': 'E', 'А': 'F' };
  function allowed(q) { return '0123456789ABCDEF'.slice(0, q); }
  function clean(v, q) {
    var ok = allowed(q);
    return String(v).toUpperCase().split('').map(function (c) { return CYR[c] || c; }).filter(function (c) { return ok.indexOf(c) >= 0; }).join('').slice(0, 16);
  }
  function insertAt(inp, ch) {
    var s = inp.selectionStart == null ? inp.value.length : inp.selectionStart, e = inp.selectionEnd == null ? s : inp.selectionEnd;
    inp.value = inp.value.slice(0, s) + ch + inp.value.slice(e);
    try { inp.setSelectionRange(s + ch.length, s + ch.length); } catch (er) {}
    inp.dispatchEvent(new Event('input'));
  }
  function rInput(t, i, box) {
    var form = el('div', 'fields');
    t.fields.forEach(function (f, k) {
      var row = el('label', 'field');
      row.appendChild(html('span', 'f-label', L(f.label)));
      var inp = el('input', 'ans'); inp.type = 'text'; inp.value = state.ans[i][k] || '';
      inp.setAttribute('autocomplete', 'off'); inp.setAttribute('spellcheck', 'false'); inp.setAttribute('autocapitalize', 'characters');
      var iq = f.inputQ || f.q;   // ★3: q белгісіз, сондықтан барлық цифрға рұқсат (жүйені алдын ала көрсетпеу үшін)
      inp.setAttribute('inputmode', iq > 10 ? 'text' : 'numeric');
      inp.addEventListener('keydown', function (e) {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        var m = /^(?:Digit|Numpad)(\d)$/.exec(e.code || '') , ch = null;
        if (m) ch = m[1]; else { var l = /^Key([A-F])$/.exec(e.code || ''); if (l) ch = l[1]; else if (/^Key[G-Z]$/.test(e.code || '')) { e.preventDefault(); return; } }
        if (ch === null) return;
        e.preventDefault();
        if (allowed(iq).indexOf(ch) < 0) { hint(iq); return; }
        insertAt(inp, ch);
      });
      inp.addEventListener('input', function () {
        var c = clean(inp.value, iq);
        if (c !== inp.value) { var p = inp.selectionStart; inp.value = c; try { inp.setSelectionRange(Math.min(p, c.length), Math.min(p, c.length)); } catch (er) {} }
        var a = state.ans[i].slice(); a[k] = c; state.ans[i] = a; save(); renderNav();
      });
      inp.addEventListener('focus', function () { lastInput = inp; renderPad(iq); });
      row.appendChild(inp);
      row.appendChild(el('span', 'f-sub', f.subText || C.sub(f.q)));
      form.appendChild(row);
    });
    box.appendChild(form);
    box.appendChild(el('div', 'pad')); box.lastChild.id = 'pad';
    box.appendChild(el('p', 'muted small pad-note', ''));
    var first = form.querySelector('input'); lastInput = first; renderPad(t.fields[0].inputQ || t.fields[0].q);
  }
  function hint(q) { warn(T('Бұл жүйеде тек мына цифрлар бар: ', 'В этой системе только цифры: ') + allowed(q).split('').join(' ')); }
  function renderPad(q) {
    var pad = $('pad'); if (!pad) return; pad.innerHTML = '';
    allowed(q).split('').forEach(function (d) {
      var b = el('button', 'key', d); b.type = 'button';
      b.addEventListener('mousedown', function (e) { e.preventDefault(); });
      b.addEventListener('click', function () { if (lastInput) { lastInput.focus(); insertAt(lastInput, d); } });
      pad.appendChild(b);
    });
    var bs = el('button', 'key wide', '⌫'); bs.type = 'button';
    bs.addEventListener('mousedown', function (e) { e.preventDefault(); });
    bs.addEventListener('click', function () {
      if (!lastInput) return; var v = lastInput.value, s = lastInput.selectionStart == null ? v.length : lastInput.selectionStart, e = lastInput.selectionEnd == null ? s : lastInput.selectionEnd;
      if (s === e && s > 0) s--;
      lastInput.value = v.slice(0, s) + v.slice(e); lastInput.focus(); try { lastInput.setSelectionRange(s, s); } catch (er) {} lastInput.dispatchEvent(new Event('input'));
    });
    pad.appendChild(bs);
    var note = document.querySelector('.pad-note');
    if (note) note.textContent = T('Цифрларды пернетақтадан немесе осы батырмалардан теріңіз. ', 'Набирайте цифры на клавиатуре или этими кнопками. ') + (q > 10 ? T('A–F әріптері пернетақтаның тіліне қарамай латынша жазылады.', 'Буквы A–F пишутся латиницей при любой раскладке.') : '');
  }

  // ---------- Аяқтау және нәтиже ----------
  function finish(reason) {
    if (!running()) return;
    state.status = 'finished';
    state.reason = reason || null;
    state.finishedAt = state.closedAt || Date.now();
    state.scores = tasks.map(function (t, i) { return C.score(t, state.ans[i]); });
    state.resultAt = Date.now();
    save();
    clearInterval(ticker);
    $('warn').hidden = true; $('m-back').hidden = true;
    if (navigator.keyboard && navigator.keyboard.unlock) navigator.keyboard.unlock();
    fsActive = false;
    exitFullscreen();
    renderResult();
  }
  function sums() {
    var m = 0, mm = 0, s = 0, sm = 0;
    tasks.forEach(function (t, i) { if (isStar(t)) { s += state.scores[i]; sm += t.max; } else { m += state.scores[i]; mm += t.max; } });
    return { main: m, mainMax: mm, star: s, starMax: sm };
  }
  function renderResult() {
    show('s-result');
    var s = sums();
    $('r-score').textContent = s.main + ' / ' + s.mainMax;
    $('r-star').textContent = T('★ Қосымша тапсырма: ', '★ Дополнительное задание: ') + s.star + ' / ' + s.starMax + ' ' + T('балл', 'баллов');
    if (state.reason && state.reason !== 'done') {
      $('r-reason').hidden = false;
      $('r-reason').textContent = state.reason === 'time' ? L(REASONS.time) + ' ' + T('Жұмыс автоматты түрде тапсырылды.', 'Работа сдана автоматически.')
        : T('Жұмыс автоматты түрде аяқталды: ', 'Работа завершена автоматически: ') + L(REASONS[state.reason]).toLowerCase() + ' ' + T('(' + MAX_VIOL + '-ші бұзушылық)', '(' + MAX_VIOL + '-е нарушение)');
    } else $('r-reason').hidden = true;
    var start = state.workStartedAt || state.startedAt;
    $('r-time').textContent = T('Жұмысқа жұмсалған уақыт: ', 'Время работы: ') + fmt(state.finishedAt - start) + (state.viol ? ' · ' + T('бұзушылықтар: ', 'нарушений: ') + state.viol : '');
    var tb = $('r-table'); tb.innerHTML = '';
    var table = el('table', 'res'), hr = el('tr');
    [T('№', '№'), T('Тапсырма', 'Задание'), T('Балл', 'Балл')].forEach(function (h) { hr.appendChild(el('th', null, h)); }); table.appendChild(hr);
    tasks.forEach(function (t, i) {
      var tr = el('tr', state.scores[i] === t.max ? 'ok' : state.scores[i] === 0 ? 'bad' : 'mid');
      tr.appendChild(el('td', null, navName(i))); tr.appendChild(el('td', null, L(t.title))); tr.appendChild(el('td', null, state.scores[i] + ' / ' + t.max));
      table.appendChild(tr);
    });
    tb.appendChild(table);
    var rv = $('r-review'); rv.innerHTML = '';
    tasks.forEach(function (t, i) { rv.appendChild(review(t, i)); });
    scheduleReset();
  }
  function shown(t, a) {
    if (t.type === 'choice') return a == null ? '—' : 'ABCD'[a] + ') ' + t.opts[a];
    if (t.type === 'cmp') return a == null ? '—' : t.left + ' ' + ['<', '=', '>'][a] + ' ' + t.right;
    return null;
  }
  function review(t, i) {
    var a = state.ans[i], sc = state.scores[i];
    var card = el('div', 'rv-card ' + (sc === t.max ? 'ok' : sc === 0 ? 'bad' : 'mid'));
    card.appendChild(el('h3', null, navName(i) + '. ' + L(t.title) + ' — ' + sc + ' / ' + t.max));
    if (t.type !== 'cmp') card.appendChild(html('p', 'expr small-expr', t.expr));
    if (t.type === 'input') {
      t.fields.forEach(function (f, k) {
        var ok = C.fieldOk(f, a && a[k]);
        var p = el('p', 'rv-line ' + (ok ? 'ok' : 'bad'));
        p.appendChild(el('span', ok ? 'rv-ok' : 'rv-bad', ok ? '✓' : '✗'));
        p.appendChild(html('span', null, ' ' + (t.fields.length > 1 ? L(f.label).replace(/\s*=$/, '') + ' — ' + T('сіздің жауабыңыз: ', 'ваш ответ: ') : T('Сіздің жауабыңыз: ', 'Ваш ответ: ')) + '<b>' + ((a && a[k]) || '—') + '</b>' + (ok ? '' : ' · ' + T('дұрыс жауап: ', 'верный ответ: ') + '<b>' + f.key + '</b>')));
        card.appendChild(p);
      });
    } else {
      var ok = sc === 1, right = t.type === 'choice' ? 'ABCD'[t.key] + ') ' + t.opts[t.key] : t.left + ' ' + ['<', '=', '>'][t.key] + ' ' + t.right;
      var p = el('p', 'rv-line ' + (ok ? 'ok' : 'bad'));
      p.appendChild(el('span', ok ? 'rv-ok' : 'rv-bad', ok ? '✓' : '✗'));
      p.appendChild(html('span', null, ' ' + T('Сіздің жауабыңыз: ', 'Ваш ответ: ') + '<b>' + shown(t, a) + '</b>' + (ok ? '' : ' · ' + T('дұрыс жауап: ', 'верный ответ: ') + '<b>' + right + '</b>')));
      card.appendChild(p);
    }
    var det = el('details', 'rv-sol'); if (sc < t.max) det.open = true;
    det.appendChild(el('summary', null, T('Шешуі', 'Решение')));
    det.appendChild(html('div', 'sol', C.solution(t, LANG)));
    card.appendChild(det);
    return card;
  }
  function scheduleReset() {
    clearInterval(hideTimer);
    var upd = function () {
      var left = (state.resultAt || state.finishedAt) + RESULT_MS - Date.now();
      if (left <= 0) { clearInterval(hideTimer); resetToStart(); return; }
      $('r-hide').textContent = T('Бастапқы бет мына уақыттан кейін ашылады: ', 'Начальная страница откроется через ') + fmt(left) + '.';
    };
    upd();
    hideTimer = setInterval(upd, 1000);
  }

  // ---------- Тіл ----------
  function setLang(l) {
    LANG = l;
    try { localStorage.setItem('qosu-lang', l); } catch (e) {}
    document.documentElement.lang = l === 'kz' ? 'kk' : 'ru';
    document.title = l === 'kz' ? 'Санау жүйелерінде қосу және азайту — 8.2.1.2' : 'Сложение и вычитание в системах счисления — 8.2.1.2';
    document.querySelectorAll('.lang-switch button').forEach(function (b) { var on = b.getAttribute('data-lang') === l; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    if (!state) return;
    if (!$('s-work').hidden) { var y = window.scrollY; renderTask(); window.scrollTo(0, y); }
    if (!$('s-result').hidden) renderResult();
    if (!$('m-back').hidden) renderBack();
    if (!$('m-confirm').hidden) confirmText();
  }
  function confirmText() {
    var u = tasks.filter(function (t, i) { return !isStar(t) && !C.complete(t, state.ans[i]); }).length,
        us = tasks.filter(function (t, i) { return isStar(t) && !C.complete(t, state.ans[i]); }).length;
    $('m-confirm-text').textContent = T('Жұмысты тапсырасыз ба?', 'Сдать работу?') + (u ? ' ' + T('Жауап берілмеген негізгі тапсырмалар: ', 'Основных заданий без ответа: ') + u + '.' : '') +
      (us ? ' ' + T('Толық орындалмаған қосымша тапсырмалар: ', 'Не до конца выполненных дополнительных: ') + us + '.' : '') + ' ' + T('Тапсырғаннан кейін жауаптарды өзгертуге болмайды.', 'После сдачи ответы изменить нельзя.');
  }

  // ---------- Іске қосу ----------
  function init() {
    $('theory-kz').innerHTML = C.theory('kz');
    $('theory-ru').innerHTML = C.theory('ru');
    document.querySelectorAll('.i-min').forEach(function (e) { e.textContent = String(window.WORK_MIN || 40); });
    document.querySelectorAll('.lang-switch button').forEach(function (b) { b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); }); });
    setLang(LANG);
    $('b-gate').addEventListener('click', startSession);
    $('b-to-intro').addEventListener('click', toIntro);
    $('b-back-theory').addEventListener('click', backTheory);
    $('b-start').addEventListener('click', begin);
    $('b-prev').addEventListener('click', function () { goTo(state.cur - 1); });
    $('b-next').addEventListener('click', function () { goTo(state.cur + 1); });
    $('b-finish').addEventListener('click', function () { confirmText(); $('m-confirm').hidden = false; });
    $('b-finish-yes').addEventListener('click', function () { finish('done'); });
    $('b-finish-no').addEventListener('click', function () { $('m-confirm').hidden = true; });
    $('b-back-fs').addEventListener('click', backToFullscreen);
    $('warn').addEventListener('click', function () { $('warn').hidden = true; });

    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('beforeunload', onBeforeUnload);
    window.addEventListener('pagehide', onPageHide);
    document.addEventListener('contextmenu', function (e) { if (running()) e.preventDefault(); });
    document.addEventListener('paste', function (e) { if (running()) e.preventDefault(); });
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
      if (state.stage === 'work') renderTask(); else show(state.stage === 'intro' ? 's-intro' : 's-theory');
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
