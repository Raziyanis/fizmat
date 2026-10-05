/* Формативтік жұмыс: оқушы Python-да код жазады, код браузерде Skulpt арқылы орындалып, тестілермен тексеріледі.
 * Интернет те, сервер де керек емес. Жұмыс толық экранда жүреді; толық экраннан шығу, басқа терезеге ауысу
 * немесе бетті жабу жұмысты бірден аяқтайды — балл соңғы жазылған код бойынша автоматты есептеледі. */
(function () {
  'use strict';

  var L = {
    kz: {
      title: 'Формативтік жұмыс: Python тілінде бағдарлама жазу',
      topic: 'Шарт, for және while циклдері, тізімдер, жиындар — 10 есеп',
      rulesTitle: 'Нұсқаулық',
      rules: [
        'Жұмыста <b>10 есеп</b> бар. Әр есепке Python тілінде бағдарлама жазасыз.',
        'Деректерді <b>input()</b> арқылы енгізіп, жауапты <b>print()</b> арқылы шығарыңыз. Есептің астында кіріс пен шығыстың мысалдары берілген. Бір жолдағы бірнеше санды бір жолмен (<code>a, b = map(int, input().split())</code>) немесе әрқайсысын жеке <code>input()</code> арқылы оқуға болады — екеуі де есептеледі.',
        '<b>«▶ Іске қосу»</b> — бағдарламаны өзіңіз жазған кіріс деректерімен орындайды. <b>«✓ Тексеру»</b> — бағдарламаны 8 тестпен тексереді (2 мысал + 6 жасырын тест).',
        'Есеп барлық 8 тесттен өтсе, <b>1 балл</b> беріледі. Ең жоғары балл — <b>10</b>.',
        'Балл жұмыс аяқталғанда <b>соңғы жазылған кодыңыз бойынша автоматты түрде</b> есептеледі. Кодыңыз әр өзгерісте сақталады.',
        'Есептердің арасында нөмірлер және «← Алдыңғы», «Келесі →» батырмалары арқылы еркін ауысуға болады.',
        'Жұмыс <b>{min} минуттан кейін автоматты түрде аяқталады</b>.',
        '!Жұмыс толық экран режимінде орындалады. <b>Толық экраннан шықсаңыз, басқа қойындыға, терезеге не қосымшаға ауыссаңыз немесе бетті жапсаңыз, жұмыс бірден аяқталады</b> және балл сол сәттегі кодыңыз бойынша шығады.'
      ],
      privacy: 'Аты-жөніңіз қажет емес. Код пен балл ешқайда жіберілмейді. Әр оқушының есептері мен сандары әртүрлі.',
      start: 'Бастау', timeLeft: 'Жұмыстың аяқталуына',
      legend: 'Жасыл — барлық тесттен өтті, қызыл — тексеруде қате бар, көк — код жазылған, тексерілмеген.',
      taskN: '{n}-есеп / {total}', inputLabel: 'Кіріс:', outputLabel: 'Шығыс:', exIn: 'Кіріс', exOut: 'Шығыс',
      yourCode: 'Сіздің бағдарламаңыз:', stdinLabel: 'Іске қосуға арналған кіріс деректері (өзгертуге болады):',
      run: '▶ Іске қосу', check: '✓ Тексеру', prev: '← Алдыңғы', next: 'Келесі →', finish: 'Жұмысты аяқтау',
      confirm: 'Жұмысты аяқтайсыз ба? Балл қазіргі кодыңыз бойынша есептеледі.', yes: 'Иә, аяқтау', no: 'Жоқ',
      running: 'Орындалуда…', output: 'Шығыс:', noOutput: '(бағдарлама ештеңе шығармады)', error: 'Қате:',
      timeout: 'Бағдарлама тым ұзақ орындалды (шексіз цикл болуы мүмкін).',
      examples: 'Мысалдар:', exampleN: '{n}-мысал', expected: 'күтілген:', got: 'сіздікі:',
      testsPassed: 'Өткен тестілер: {p} / {t}', allPassed: '✓ Барлық тесттен өтті! Келесі есепке көшуге болады.',
      emptyCode: 'Алдымен бағдарлама жазыңыз.',
      evalTitle: 'Жұмыс тексерілуде…', evalProgress: '{n} / {total} есеп тексерілді',
      doneTitle: 'Жұмыс аяқталды', points: 'балл', count: 'Шығарылған есептер: {s} / {n}.',
      timeUsed: 'Жұмыс уақыты:', timeRest: 'Қалған уақыт:', early: 'Жұмыс мерзімінен бұрын аяқталды.',
      hideIn: 'Нәтиже {t} кейін жасырылады.', review: 'Есептерді талдау',
      yourSol: 'Сіздің бағдарламаңыз', sampleSol: 'Үлгі шешім', solved: '✓ шығарылды', notSolved: '✗ шығарылмады',
      noCode: '(код жазылмаған)', firstFail: 'Қате тест:',
      teacher: 'Мұғалімге: осы құрылғыда жаңа жұмыс', restart: 'Қайта бастау', pin: 'Мұғалімнің құпиясөзі', badPin: 'Құпиясөз қате',
      lockedText: 'Нәтиже жасырылды. Осы құрылғыда жаңа жұмысты бастау үшін мұғалім құпиясөзді енгізеді.',
      rTime: 'Жұмыс уақыты ({min} минут) бітті.', rFs: 'Жұмыс автоматты түрде аяқталды: сіз толық экран режимінен шықтыңыз.',
      rTab: 'Жұмыс автоматты түрде аяқталды: сіз басқа қойындыға немесе қосымшаға ауыстыңыз.',
      rWin: 'Жұмыс автоматты түрде аяқталды: сіз басқа терезеге немесе қосымшаға ауыстыңыз.',
      rClosed: 'Жұмыс автоматты түрде аяқталды: бет жабылды немесе қайта жүктелді.',
      wEsc: 'Толық экран режимінен шықпаңыз: жұмыс бірден аяқталады.', wKey: 'Жұмыс кезінде бұл әрекетті орындауға болмайды.',
      wBack: 'Жұмыс кезінде артқа қайтуға болмайды.', noFs: 'Бұл браузер толық экран режимін қолдамайды. Басқа қойындыларға ауыспаңыз — жұмыс аяқталады.',
      inputHint: 'Кеңес: бір жолда бірнеше сан болса, оларды былай оқыңыз: a, b = map(int, input().split()). Немесе «Кіріс деректері» өрісінде әр санды жеке жолға жазыңыз — тексергенде екі тәсіл де есептеледі.',
      topicIf: 'шарт', topicFor: 'for циклі', topicWhile: 'while циклі', topicList: 'тізім', topicSet: 'жиын'
    },
    ru: {
      title: 'Формативная работа: программирование на Python',
      topic: 'Условие, циклы for и while, списки, множества — 10 задач',
      rulesTitle: 'Инструкция',
      rules: [
        'В работе <b>10 задач</b>. К каждой задаче вы пишете программу на Python.',
        'Вводите данные через <b>input()</b>, выводите ответ через <b>print()</b>. Под условием даны примеры входных и выходных данных. Несколько чисел из одной строки можно читать одной строкой (<code>a, b = map(int, input().split())</code>) или каждое отдельным <code>input()</code> — засчитываются оба способа.',
        '<b>«▶ Запустить»</b> — выполняет программу с вашими входными данными. <b>«✓ Проверить»</b> — проверяет программу на 8 тестах (2 примера + 6 скрытых тестов).',
        'Если программа прошла все 8 тестов, ставится <b>1 балл</b>. Максимальный балл — <b>10</b>.',
        'Балл считается <b>автоматически по последней версии вашего кода</b>, когда работа завершается. Код сохраняется при каждом изменении.',
        'Между задачами можно свободно переходить по номерам и кнопкам «← Предыдущая», «Следующая →».',
        'Работа <b>автоматически завершится через {min} минут</b>.',
        '!Работа идёт в полноэкранном режиме. <b>Если выйти из полноэкранного режима, переключиться на другую вкладку, окно или приложение или закрыть страницу, работа сразу завершится</b>, а балл будет посчитан по коду на этот момент.'
      ],
      privacy: 'Имя не нужно. Код и баллы никуда не отправляются. У каждого ученика свои задачи и числа.',
      start: 'Начать', timeLeft: 'До конца работы',
      legend: 'Зелёный — все тесты пройдены, красный — при проверке есть ошибки, синий — код написан, но не проверен.',
      taskN: 'Задача {n} из {total}', inputLabel: 'Вход:', outputLabel: 'Выход:', exIn: 'Входные данные', exOut: 'Выходные данные',
      yourCode: 'Ваша программа:', stdinLabel: 'Входные данные для запуска (можно изменить):',
      run: '▶ Запустить', check: '✓ Проверить', prev: '← Предыдущая', next: 'Следующая →', finish: 'Завершить работу',
      confirm: 'Завершить работу? Балл будет посчитан по текущему коду.', yes: 'Да, завершить', no: 'Нет',
      running: 'Выполняется…', output: 'Вывод:', noOutput: '(программа ничего не вывела)', error: 'Ошибка:',
      timeout: 'Программа работала слишком долго (возможно, бесконечный цикл).',
      examples: 'Примеры:', exampleN: 'Пример {n}', expected: 'ожидалось:', got: 'ваш вывод:',
      testsPassed: 'Пройдено тестов: {p} из {t}', allPassed: '✓ Все тесты пройдены! Можно переходить к следующей задаче.',
      emptyCode: 'Сначала напишите программу.',
      evalTitle: 'Работа проверяется…', evalProgress: 'Проверено задач: {n} из {total}',
      doneTitle: 'Работа завершена', points: 'баллов', count: 'Решено задач: {s} из {n}.',
      timeUsed: 'Время работы:', timeRest: 'Оставалось времени:', early: 'Работа завершена досрочно.',
      hideIn: 'Результат будет скрыт через {t}.', review: 'Разбор задач',
      yourSol: 'Ваша программа', sampleSol: 'Образец решения', solved: '✓ решено', notSolved: '✗ не решено',
      noCode: '(код не написан)', firstFail: 'Ошибка на тесте:',
      teacher: 'Для учителя: новая работа на этом устройстве', restart: 'Начать заново', pin: 'Пароль учителя', badPin: 'Неверный пароль',
      lockedText: 'Результат скрыт. Чтобы начать новую работу на этом устройстве, учитель вводит пароль.',
      rTime: 'Время работы ({min} минут) закончилось.', rFs: 'Работа завершена автоматически: вы вышли из полноэкранного режима.',
      rTab: 'Работа завершена автоматически: вы переключились на другую вкладку или приложение.',
      rWin: 'Работа завершена автоматически: вы переключились на другое окно или приложение.',
      rClosed: 'Работа завершена автоматически: страница была закрыта или перезагружена.',
      wEsc: 'Не выходите из полноэкранного режима: работа сразу завершится.', wKey: 'Это действие недоступно во время работы.',
      wBack: 'Переход назад во время работы недоступен.', noFs: 'Этот браузер не поддерживает полноэкранный режим. Не переключайтесь на другие вкладки — работа завершится.',
      inputHint: 'Подсказка: если в одной строке несколько чисел, прочитайте их так: a, b = map(int, input().split()). Или в поле «Входные данные» запишите каждое число на отдельной строке — при проверке засчитываются оба способа.',
      topicIf: 'условие', topicFor: 'цикл for', topicWhile: 'цикл while', topicList: 'список', topicSet: 'множество'
    }
  };
  var LANG = L[window.LANG] ? window.LANG : 'kz';
  var t = function (key, vars) {
    var s = L[LANG][key];
    Object.keys(vars || {}).forEach(function (k) { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  };

  var TOTAL_MS = (window.TOTAL_MIN || 40) * 60 * 1000;
  var RESULT_MS = (window.RESULT_MIN || 5) * 60 * 1000;
  var STORE = 'python-kod-formativ-' + LANG;
  var RUN_LIMIT_MS = 1000;       // бір іске қосудың ең ұзақ уақыты
  var OUT_LIMIT = 20000;         // шығыстың ең үлкен ұзындығы

  var $ = function (id) { return document.getElementById(id); };
  var state = null, tasks = [], fsActive = false, ignoreUntil = 0, ticker = null, hideTimer = null, busy = false;

  function save() { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) {} }
  function load() { try { return JSON.parse(localStorage.getItem(STORE)); } catch (e) { return null; } }
  function running() { return !!state && state.status === 'running'; }
  function show(id) {
    ['s-loading', 's-intro', 's-test', 's-eval', 's-result', 's-locked'].forEach(function (s) { $(s).hidden = s !== id; });
    $('timers').hidden = !running();
  }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  // ---------- Python (Skulpt) ----------

  // Тек sys, math, random модульдеріне рұқсат (document сияқты модульдер бетті өзгерте алмауы үшін).
  var ALLOWED = /^src\/(builtin|lib)\/(sys|math|random)(\.js|\/__init__\.js)$/;

  function runPython(code, input) {
    var lines = String(input).split('\n'), li = 0, out = '';
    Sk.configure({
      output: function (s) { if (out.length < OUT_LIMIT) out += s; },
      read: function (f) {
        if (!ALLOWED.test(f) || !Sk.builtinFiles || Sk.builtinFiles.files[f] === undefined) throw new Sk.builtin.ImportError('module not available');
        return Sk.builtinFiles.files[f];
      },
      inputfun: function () { return li < lines.length ? lines[li++] : ''; },
      inputfunTakesPrompt: true,
      execLimit: RUN_LIMIT_MS,
      yieldLimit: 100,
      __future__: Sk.python3
    });
    ['jseval', 'jsmillis', 'open', 'quit', 'exit'].forEach(function (k) { delete Sk.builtins[k]; });
    return Sk.misceval.asyncToPromise(function () { return Sk.importMainWithBody('<stdin>', false, code, true); })
      .then(function () { return { out: out }; }, function (e) {
        var msg = String(e && e.toString ? e.toString() : e);
        return { out: out, error: /TimeLimitError/.test(msg) ? t('timeout') : msg, timeout: /TimeLimitError/.test(msg) };
      });
  }

  // Бір есептің барлық тестін тексеру; уақыттан асса, қалған тестілер орындалмайды.
  function checkTask(i) {
    var task = tasks[i], code = state.code[i] || '', res = { passed: 0, total: task.tests.length, details: [] };
    if (!code.trim()) return Promise.resolve(res);
    var k = 0;
    var step = function () {
      if (k >= task.tests.length) return res;
      var tc = task.tests[k];
      return runTest(code, tc.input, tc.output, TASKS.sameOutput).then(function (x) {
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
  function exitFullscreen() {
    var ex = document.exitFullscreen || document.webkitExitFullscreen;
    if (fsElement() && ex) { try { ex.call(document); } catch (e) {} }
  }
  function violation(key) {
    if (!running()) return;
    setTimeout(function () { if (running()) finish(t(key)); }, 300);
  }
  function onFullscreenChange() {
    if (fsElement()) { fsActive = true; ignoreUntil = Date.now() + 1500; return; }
    if (fsActive) { fsActive = false; violation('rFs'); }
  }
  function onVisibility() { if (document.visibilityState === 'hidden') violation('rTab'); }
  function onBlur() {
    if (!running() || Date.now() < ignoreUntil) return;
    setTimeout(function () { if (!document.hasFocus() && document.visibilityState === 'visible') violation('rWin'); }, 400);
  }
  function warn(text) {
    $('warn-text').textContent = text;
    $('warn').hidden = false;
    clearTimeout(warn.t);
    warn.t = setTimeout(function () { $('warn').hidden = true; }, 5000);
  }
  function onKey(e) {
    if (!running()) return;
    if (e.key === 'Escape') { warn(t('wEsc')); e.preventDefault(); }
    var k = (e.key || '').toLowerCase();
    if (e.key === 'F5' || e.key === 'F11' || ((e.ctrlKey || e.metaKey) && ['r', 'p', 's', 'f', 'o', 'n', 't', 'w', 'l'].indexOf(k) >= 0) ||
        (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight'))) {
      e.preventDefault();
      warn(t('wKey'));
    }
  }
  // Бет жабылса немесе қайта жүктелсе — жұмыс аяқталады (келесі ашылғанда балл есептеледі).
  function onPageHide() {
    if (!running()) return;
    state.closedAt = Date.now();
    save();
  }
  function onBeforeUnload(e) {
    if (!running()) return;
    e.preventDefault();
    e.returnValue = '';
    return '';
  }

  // ---------- Редактор ----------

  function setupEditor(ta) {
    ta.addEventListener('keydown', function (e) {
      var v = ta.value, s = ta.selectionStart, en = ta.selectionEnd;
      var lineStart = v.lastIndexOf('\n', s - 1) + 1;
      if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        ta.setRangeText('    ', s, en, 'end');
        ta.dispatchEvent(new Event('input'));
      } else if (e.key === 'Tab' && e.shiftKey) {
        e.preventDefault();
        var lead = /^ {1,4}/.exec(v.slice(lineStart));
        if (lead) { ta.setRangeText('', lineStart, lineStart + lead[0].length, 'preserve'); ta.dispatchEvent(new Event('input')); }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        var line = v.slice(lineStart, s), ind = /^ */.exec(line)[0];
        if (/:\s*$/.test(line)) ind += '    ';
        ta.setRangeText('\n' + ind, s, en, 'end');
        ta.dispatchEvent(new Event('input'));
      } else if (e.key === 'Backspace' && s === en && s > lineStart && /^ +$/.test(v.slice(lineStart, s)) && (s - lineStart) % 4 === 0) {
        e.preventDefault();
        ta.setRangeText('', s - 4, s, 'end');
        ta.dispatchEvent(new Event('input'));
      }
    });
  }

  // ---------- Есепті көрсету ----------

  function navClass(i) {
    var c = state.checks[i];
    if (c && c.passed === c.total) return ' ok';
    if (c) return ' bad';
    return (state.code[i] || '').trim() ? ' written' : '';
  }
  function renderNav() {
    var box = $('t-nav');
    box.innerHTML = '';
    tasks.forEach(function (tk, i) {
      var b = el('button', 'nav-btn' + navClass(i) + (i === state.cur ? ' cur' : ''), String(i + 1));
      b.type = 'button';
      b.addEventListener('click', function () { goTo(i); });
      box.appendChild(b);
    });
  }
  function renderTask() {
    var i = state.cur, tk = tasks[i];
    $('t-num').textContent = t('taskN', { n: i + 1, total: tasks.length }) + ' · ' + t('topic' + tk.topic.charAt(0).toUpperCase() + tk.topic.slice(1));
    $('t-title').textContent = tk.title[LANG];
    $('t-text').textContent = tk.text[LANG];
    $('t-in').textContent = tk.input[LANG];
    $('t-out').textContent = tk.output[LANG];
    var ex = $('t-ex');
    ex.innerHTML = '';
    tk.tests.slice(0, 2).forEach(function (tc) {
      var tr = el('tr');
      tr.appendChild(el('td', null, tc.input));
      tr.appendChild(el('td', null, tc.output));
      ex.appendChild(tr);
    });
    $('t-code').value = state.code[i] || '';
    $('t-stdin').value = state.stdin[i] != null ? state.stdin[i] : tk.tests[0].input;
    $('t-result').hidden = true;
    $('m-confirm').hidden = true;
    $('b-prev').disabled = i === 0;
    $('b-next').disabled = i === tasks.length - 1;
    renderNav();
    show('s-test');
    tick();
  }
  function goTo(i) {
    if (!running() || busy || i < 0 || i >= tasks.length) return;
    state.cur = i;
    save();
    renderTask();
    window.scrollTo(0, 0);
  }

  function showRun(r) {
    var box = $('t-result');
    box.innerHTML = '';
    box.appendChild(el('b', null, t('output')));
    box.appendChild(el('pre', null, r.out || t('noOutput')));
    if (r.error) { box.appendChild(el('b', 'bad', t('error'))); box.appendChild(el('pre', 'bad', r.error));  if (/invalid literal for int/.test(r.error)) box.appendChild(el('p', 'hint', t('inputHint'))); }
    box.hidden = false;
  }
  function doRun() {
    if (busy) return;
    var i = state.cur;
    if (!(state.code[i] || '').trim()) { $('t-result').hidden = false; $('t-result').textContent = t('emptyCode'); return; }
    setBusy(true);
    $('t-result').hidden = false;
    $('t-result').textContent = t('running');
    runPython(state.code[i], $('t-stdin').value).then(function (r) { setBusy(false); if (running() && state.cur === i) showRun(r); });
  }
  function doCheck() {
    if (busy) return;
    var i = state.cur;
    if (!(state.code[i] || '').trim()) { $('t-result').hidden = false; $('t-result').textContent = t('emptyCode'); return; }
    setBusy(true);
    $('t-result').hidden = false;
    $('t-result').textContent = t('running');
    checkTask(i).then(function (res) {
      setBusy(false);
      if (!running()) return;
      state.checks[i] = { passed: res.passed, total: res.total };
      save();
      renderNav();
      if (state.cur !== i) return;
      var box = $('t-result');
      box.innerHTML = '';
      box.appendChild(el('p', res.passed === res.total ? 'ok' : 'bad', res.passed === res.total ? t('allPassed') : t('testsPassed', { p: res.passed, t: res.total })));
      box.appendChild(el('b', null, t('examples')));
      res.details.slice(0, 2).forEach(function (d, k) {
        var p = el('p', d.ok ? 'ok' : 'bad', (d.ok ? '✓ ' : '✗ ') + t('exampleN', { n: k + 1 }));
        box.appendChild(p);
        if (!d.ok && !d.skipped) {
          box.appendChild(el('pre', null, t('expected') + ' ' + tasks[i].tests[k].output + '\n' + t('got') + ' ' + (d.out || t('noOutput'))));
          if (d.error) box.appendChild(el('pre', 'bad', d.error));
        }
      });
    });
  }
  function setBusy(v) {
    busy = v;
    ['b-run', 'b-check', 'b-prev', 'b-next', 'b-finish'].forEach(function (id) { $(id).disabled = v || (id === 'b-prev' && state.cur === 0) || (id === 'b-next' && state.cur === tasks.length - 1); });
  }

  // ---------- Аяқтау және тексеру ----------

  function finish(reason) {
    if (!running()) return;
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
    var results = [], i = 0;
    var next = function () {
      $('e-progress').textContent = t('evalProgress', { n: i, total: tasks.length });
      if (i >= tasks.length) {
        state.results = results;
        state.status = 'finished';
        save();
        renderResult();
        return;
      }
      checkTask(i).then(function (res) { results.push({ passed: res.passed, total: res.total, fail: res.fail, details: res.details.map(function (d) { return { ok: d.ok, out: (d.out || '').slice(0, 500), error: d.error || null }; }) }); i++; setTimeout(next, 0); });
    };
    next();
  }

  function fmt(ms) {
    var s = Math.max(0, Math.ceil(ms / 1000));
    return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
  }
  function tick() {
    if (!running()) return;
    var left = state.endsAt - Date.now();
    if (left <= 0) { finish(t('rTime', { min: window.TOTAL_MIN || 40 })); return; }
    $('tm-total').textContent = fmt(left);
    $('tm-total-box').classList.toggle('low', left <= 60000);
    $('tm-bar').style.width = (100 * left / TOTAL_MS) + '%';
  }

  function renderResult() {
    var res = state.results, n = tasks.length;
    var score = res.filter(function (r) { return r.passed === r.total; }).length;
    $('r-score-num').textContent = score + ' / ' + n;
    $('r-count').textContent = t('count', { s: score, n: n });
    $('r-reason').textContent = state.reason || '';
    $('r-reason').hidden = !state.reason;
    var box = $('r-time');
    box.innerHTML = '';
    var left = 1000 * Math.floor(Math.max(0, state.endsAt - state.finishedAt) / 1000);
    var line = function (label, value) { var p = el('p'); p.appendChild(document.createTextNode(label + ' ')); p.appendChild(el('b', null, value)); box.appendChild(p); };
    line(t('timeUsed'), fmt(TOTAL_MS - left) + ' / ' + fmt(TOTAL_MS));
    line(t('timeRest'), fmt(left));
    if (left >= 1000) box.appendChild(el('p', 'small', t('early')));

    var list = $('r-list');
    list.innerHTML = '';
    tasks.forEach(function (tk, i) {
      var r = res[i], ok = r.passed === r.total;
      var card = el('article', 'rv ' + (ok ? 'ok' : 'bad'));
      var head = el('div', 'rv-head');
      head.appendChild(el('span', 'rv-num', t('taskN', { n: i + 1, total: n }) + ' — ' + tk.title[LANG]));
      head.appendChild(el('span', 'rv-badge', (ok ? t('solved') : t('notSolved')) + ' · ' + r.passed + '/' + r.total));
      card.appendChild(head);
      card.appendChild(el('p', 'rv-q', tk.text[LANG]));
      var cols = el('div', 'rv-cols');
      var c1 = el('div'); c1.appendChild(el('b', null, t('yourSol'))); c1.appendChild(el('pre', 'code', (state.code[i] || '').trim() ? state.code[i] : t('noCode')));
      var c2 = el('div'); c2.appendChild(el('b', null, t('sampleSol'))); c2.appendChild(el('pre', 'code', tk.solution));
      cols.appendChild(c1); cols.appendChild(c2);
      card.appendChild(cols);
      if (!ok && r.fail != null && (state.code[i] || '').trim()) {
        var tc = tk.tests[r.fail], d = r.details[r.fail] || {};
        card.appendChild(el('p', 'rv-err', t('firstFail') + '\n' + t('exIn') + ': ' + tc.input + '\n' + t('expected') + ' ' + tc.output + '\n' + t('got') + ' ' + (d.out || t('noOutput')) + (d.error ? '\n' + d.error : '')));
      }
      list.appendChild(card);
    });
    show('s-result');
    scheduleLock();
  }
  function scheduleLock() {
    clearInterval(hideTimer);
    var update = function () {
      var left = state.finishedAt + RESULT_MS - Date.now();
      if (left <= 0) {
        clearInterval(hideTimer);
        $('l-pin').value = '';
        $('l-pin-msg').textContent = '';
        show('s-locked');
        return;
      }
      $('r-hide').textContent = t('hideIn', { t: fmt(left) });
      $('r-hide').hidden = false;
    };
    update();
    hideTimer = setInterval(update, 1000);
  }

  // ---------- Іске қосу ----------

  function newSeed() {
    var a = new Uint32Array(1);
    (window.crypto || window.msCrypto).getRandomValues(a);
    return a[0] || 1;
  }
  function begin() {
    $('b-start').disabled = true;
    var fs = enterFullscreen();
    var seed = newSeed();
    tasks = TASKS.generate(seed);
    state = { v: 1, seed: seed, status: 'running', startedAt: Date.now(), endsAt: Date.now() + TOTAL_MS, cur: 0,
      code: tasks.map(function () { return ''; }), stdin: tasks.map(function () { return null; }), checks: tasks.map(function () { return null; }) };
    save();
    fs.then(function () { ticker = setInterval(tick, 250); renderTask(); });
  }

  function applyTexts() {
    document.documentElement.lang = LANG === 'ru' ? 'ru' : 'kk';
    document.querySelectorAll('[data-t]').forEach(function (e) { e.textContent = t(e.getAttribute('data-t')); });
    document.title = t('title');
    var ul = $('i-rules');
    ul.innerHTML = '';
    L[LANG].rules.forEach(function (r) {
      var li = el('li', r.charAt(0) === '!' ? 'important' : null);
      li.innerHTML = r.replace(/^!/, '').split('{min}').join(String(window.TOTAL_MIN || 40));   // мәтін осы файлдағы тұрақты жолдардан
      ul.appendChild(li);
    });
    ['r-pin', 'l-pin'].forEach(function (id) { $(id).placeholder = t('pin'); $(id).setAttribute('aria-label', t('pin')); });
    $('tm-total').textContent = fmt(TOTAL_MS);
  }

  function init() {
    applyTexts();
    $('b-start').addEventListener('click', begin);
    $('b-run').addEventListener('click', doRun);
    $('b-check').addEventListener('click', doCheck);
    $('b-prev').addEventListener('click', function () { goTo(state.cur - 1); });
    $('b-next').addEventListener('click', function () { goTo(state.cur + 1); });
    $('b-finish').addEventListener('click', function () { $('m-confirm').hidden = false; });
    $('b-finish-yes').addEventListener('click', function () { finish(null); });
    $('b-finish-no').addEventListener('click', function () { $('m-confirm').hidden = true; });
    $('warn').addEventListener('click', function () { $('warn').hidden = true; });
    var code = $('t-code');
    setupEditor(code);
    code.addEventListener('input', function () {
      if (!running()) return;
      state.code[state.cur] = code.value;
      state.checks[state.cur] = null;      // код өзгерді — бұрынғы тексеру ескірді
      save();
      renderNav();
    });
    $('t-stdin').addEventListener('input', function () { if (running()) { state.stdin[state.cur] = $('t-stdin').value; save(); } });

    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('beforeunload', onBeforeUnload);
    window.addEventListener('pagehide', onPageHide);
    document.addEventListener('contextmenu', function (e) { if (running()) e.preventDefault(); });
    history.pushState(null, '', location.href);
    window.addEventListener('popstate', function () { if (running()) { history.pushState(null, '', location.href); warn(t('wBack')); } });

    $('b-teacher').addEventListener('click', function () { $('r-teacher-form').hidden = false; $('r-pin').focus(); });
    [['b-restart', 'r-pin', 'r-pin-msg'], ['b-unlock', 'l-pin', 'l-pin-msg']].forEach(function (ids) {
      var go = function () {
        if ($(ids[1]).value.trim() !== String(window.TEACHER_PIN)) { $(ids[2]).textContent = t('badPin'); return; }
        try { localStorage.removeItem(STORE); } catch (e) {}
        location.reload();
      };
      $(ids[0]).addEventListener('click', go);
      $(ids[1]).addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
    });

    state = load();
    if (state && state.seed) tasks = TASKS.generate(state.seed); else state = null;
    if (state && state.status === 'running') {
      // Бет жабылған/қайта жүктелген немесе уақыт біткен — жұмыс аяқталады
      finish(state.endsAt <= Date.now() && !state.closedAt ? t('rTime', { min: window.TOTAL_MIN || 40 }) : t('rClosed'));
      return;
    }
    if (state && state.status === 'evaluating') { evaluateAll(); return; }
    if (state && state.status === 'finished') { renderResult(); return; }
    state = null;
    if (!fsSupported()) { var p = el('p', 'note', t('noFs')); $('s-intro').insertBefore(p, $('b-start')); }
    show('s-intro');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
