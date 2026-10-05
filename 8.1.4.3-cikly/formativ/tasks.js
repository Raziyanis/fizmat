/* Задания формативной работы 8.1.4.3 «Цикл for, функция range(), цикл while» (Python).
 * TASKS.generate(seed) → 20 заданий. Числа зависят от seed, поэтому у каждого ученика свой вариант.
 * Типы: input — ввести ответ; choice — выбрать ответ; match — сопоставить; order — расставить строки.
 * Ключ проверяется настоящим Python: tools/check-tasks.py. */
(function () {
  'use strict';

  function rng(seed) {
    var s = seed >>> 0;
    return function () {
      s = (s + 0x6d2b79f5) >>> 0;
      var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function py(a) { return '[' + a.join(', ') + ']'; }
  // Числа, которые даёт range(a, b, s) — как в Python
  function range(a, b, s) {
    if (b === undefined) { b = a; a = 0; }
    s = s || 1;
    var out = [];
    for (var x = a; s > 0 ? x < b : x > b; x += s) out.push(x);
    return out;
  }
  var rstr = function (a, b, s) { return 'range(' + a + (b !== undefined ? ', ' + b : '') + (s !== undefined ? ', ' + s : '') + ')'; };

  var LIST_HINT = 'Запишите список так, как его выведет Python, например: [1, 2, 3]';
  var ROW_HINT = 'Запишите числа через пробел, как их выведет программа.';

  function generate(seed) {
    var r = rng(seed);
    var ri = function (a, b) { return a + Math.floor(r() * (b - a + 1)); };
    var pick = function (a) { return a[Math.floor(r() * a.length)]; };
    var shuffle = function (a) {
      a = a.slice();
      for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; }
      return a;
    };
    var nums = function (n, lo, hi) { var o = []; while (o.length < n) { var v = ri(lo, hi); if (o.indexOf(v) < 0) o.push(v); } return o; };
    var T = [];
    var OUT = 'Что выведет программа?';
    var num = function (title, code, ans, text) { return { type: 'input', title: title, text: text || OUT, code: code, accept: [String(ans)], answerShown: String(ans), numeric: true }; };
    var row = function (title, code, arr) { return { type: 'input', title: title, text: OUT, code: code, accept: [arr.join(' ')], answerShown: arr.join(' '), hint: ROW_HINT }; };

    // 1. Сопоставление: запись range → числа
    var k1 = ri(3, 6), a1 = ri(1, 4), b1 = a1 + ri(3, 5), s1 = ri(2, 3), c1 = a1 + s1 * ri(3, 4) + 1, d1 = ri(8, 12), e1 = pick([2, 3]);
    var items1 = shuffle([[rstr(k1)], [rstr(a1, b1)], [rstr(a1, c1, s1)], [rstr(d1, 0, -e1)]].map(function (x, i) {
      var arr = [range(k1), range(a1, b1), range(a1, c1, s1), range(d1, 0, -e1)][i];
      return { code: x[0], ans: arr.join(' ') };
    }));
    T.push({ type: 'match', title: 'range() и числа', text: 'Сопоставьте запись range() с числами, которые она даёт.',
      items: items1.map(function (m) { return { code: m.code, name: m.code }; }),
      options: shuffle(items1.map(function (m) { return m.ans; })), answer: items1.map(function (m) { return m.ans; }) });

    // 2. Выбор: итерация
    T.push({ type: 'choice', title: 'Итерация', text: 'Что называется итерацией цикла?',
      options: shuffle(['одно выполнение тела цикла', 'условие продолжения цикла', 'переменная цикла', 'команды до начала цикла']),
      answer: 'одно выполнение тела цикла' });

    // 3. Выбор: какой цикл
    T.push({ type: 'choice', title: 'for или while', text: 'Какой цикл удобнее, если количество повторений заранее неизвестно (например, «повторять, пока пользователь не введёт 0»)?',
      options: shuffle(['while', 'for с range()', 'любой цикл здесь не подходит', 'for x in список']), answer: 'while' });

    // 4. Сколько раз выполнится тело
    var a4 = ri(1, 9), b4 = a4 + ri(4, 12);
    T.push(num('Сколько повторений', 'for i in range(' + a4 + ', ' + b4 + '):\n    print("Привет")', b4 - a4,
      'Сколько раз программа напечатает слово «Привет»?'));

    // 5. Количество чисел при шаге
    var a5 = ri(0, 5), s5 = ri(2, 4), b5 = a5 + s5 * ri(3, 6) + ri(0, s5 - 1) + 1;
    T.push(num('range() с шагом', 'k = 0\nfor i in range(' + a5 + ', ' + b5 + ', ' + s5 + '):\n    k = k + 1\nprint(k)', range(a5, b5, s5).length));

    // 6. Вывод range с шагом
    var a6 = ri(1, 6), s6 = ri(2, 5), b6 = a6 + s6 * ri(3, 4) + ri(1, s6);
    T.push(row('Вывод в одну строку', 'for i in range(' + a6 + ', ' + b6 + ', ' + s6 + '):\n    print(i, end=" ")', range(a6, b6, s6)));

    // 7. Отрицательный шаг
    var a7 = ri(12, 20), s7 = ri(2, 4), b7 = ri(0, 4);
    T.push(row('Обратный отсчёт', 'for i in range(' + a7 + ', ' + b7 + ', -' + s7 + '):\n    print(i, end=" ")', range(a7, b7, -s7)));

    // 8. Сумма
    var a8 = ri(1, 5), b8 = a8 + ri(3, 7), s8 = range(a8, b8 + 1).reduce(function (p, q) { return p + q; }, 0);
    T.push(num('Накопление суммы', 's = 0\nfor i in range(' + a8 + ', ' + (b8 + 1) + '):\n    s = s + i\nprint(s)', s8));

    // 9. Произведение
    var k9 = ri(3, 6), p9 = range(1, k9 + 1).reduce(function (p, q) { return p * q; }, 1);
    T.push(num('Накопление произведения', 'p = 1\nfor i in range(1, ' + (k9 + 1) + '):\n    p = p * i\nprint(p)', p9));

    // 10. Счётчик
    var n10 = ri(20, 50), d10 = ri(3, 7);
    T.push(num('Счётчик', 'k = 0\nfor x in range(1, ' + (n10 + 1) + '):\n    if x % ' + d10 + ' == 0:\n        k = k + 1\nprint(k)', Math.floor(n10 / d10)));

    // 11. for x in список
    var a11 = nums(5, 1, 20), t11 = ri(6, 12), s11 = a11.filter(function (x) { return x > t11; }).reduce(function (p, q) { return p + q; }, 0);
    T.push(num('for x in список', 'a = ' + py(a11) + '\ns = 0\nfor x in a:\n    if x > ' + t11 + ':\n        s = s + x\nprint(s)', s11));

    // 12. for i in range(len(a)) — изменение списка
    var a12 = nums(3, 1, 9), m12 = ri(2, 5);
    T.push({ type: 'input', title: 'for i in range(len(a))', text: OUT,
      code: 'a = ' + py(a12) + '\nfor i in range(len(a)):\n    a[i] = a[i] * ' + m12 + '\nprint(a)',
      accept: [py(a12.map(function (x) { return x * m12; }))], answerShown: py(a12.map(function (x) { return x * m12; })), hint: LIST_HINT });

    // 13. for x in a не меняет список
    var a13 = nums(3, 1, 9), m13 = ri(2, 5);
    T.push({ type: 'input', title: 'Изменение x в цикле', text: OUT,
      code: 'a = ' + py(a13) + '\nfor x in a:\n    x = x * ' + m13 + '\nprint(a)', accept: [py(a13)], answerShown: py(a13), hint: LIST_HINT });

    // 14. while со счётчиком: значение после цикла
    var a14 = ri(1, 5), s14 = ri(2, 4), b14 = a14 + ri(8, 15), i14 = a14;
    while (i14 <= b14) i14 += s14;
    T.push(num('while: значение после цикла', 'i = ' + a14 + '\nwhile i <= ' + b14 + ':\n    i = i + ' + s14 + '\nprint(i)', i14));

    // 15. while: цифры числа
    var n15 = ri(1000, 99999), v15 = r() < 0.5;
    var ds = String(n15).split('').map(Number);
    T.push(num(v15 ? 'while: сумма цифр' : 'while: количество цифр',
      'n = ' + n15 + '\nk = 0\nwhile n > 0:\n    k = k + ' + (v15 ? 'n % 10' : '1') + '\n    n = n // 10\nprint(k)',
      v15 ? ds.reduce(function (p, q) { return p + q; }, 0) : ds.length));

    // 16. while: удвоение
    var lim = ri(30, 300), st = pick([1, 3, 5]), x16 = st, c16 = 0;
    while (x16 < lim) { x16 *= 2; c16++; }
    var cnt16 = r() < 0.5;
    T.push(num(cnt16 ? 'while: сколько итераций' : 'while: удвоение',
      'x = ' + st + '\nk = 0\nwhile x < ' + lim + ':\n    x = x * 2\n    k = k + 1\nprint(' + (cnt16 ? 'k' : 'x') + ')', cnt16 ? c16 : x16));

    // 17. Пропуск: конец range
    var FILL = 'Что нужно написать вместо ___? Запишите только пропущенную часть.';
    var a17 = ri(1, 5), b17 = a17 + ri(5, 15);
    T.push({ type: 'input', title: 'Пропуск: конец range', text: 'Программа должна вывести все числа от ' + a17 + ' до ' + b17 + ' включительно. ' + FILL,
      code: 'for i in range(' + a17 + ', ___):\n    print(i)', accept: [String(b17 + 1)], answerShown: String(b17 + 1), numeric: true });

    // 18. Пропуск: условие while
    var b18 = ri(5, 12);
    T.push({ type: 'input', title: 'Пропуск: условие while', text: 'Программа должна вывести числа от 1 до ' + b18 + ' включительно. ' + FILL,
      code: 'i = 1\nwhile i ___ ' + b18 + ':\n    print(i)\n    i = i + 1', accept: ['<='], answerShown: '<=', symbol: true, hint: 'Запишите только знак сравнения.' });

    // 19. Выбор: бесконечный цикл
    var v19 = ri(3, 8);
    T.push({ type: 'choice', title: 'Бесконечный цикл', text: 'Какая программа выполняется бесконечно?', mono: true,
      options: shuffle([
        'i = 1\nwhile i < ' + v19 + ':\n    print(i)',
        'i = 1\nwhile i < ' + v19 + ':\n    print(i)\n    i = i + 1',
        'for i in range(' + v19 + '):\n    print(i)',
        'i = ' + v19 + '\nwhile i > 0:\n    i = i - 1'
      ]), answer: 'i = 1\nwhile i < ' + v19 + ':\n    print(i)' });

    // 20. Порядок строк
    var n20 = ri(5, 15);
    var lines20 = ['s = 0', 'for i in range(1, ' + (n20 + 1) + '):', '    s = s + i', 'print(s)'];
    var shown20;
    do { shown20 = shuffle(lines20); } while (shown20.join() === lines20.join());
    T.push({ type: 'order', title: 'Порядок строк программы',
      text: 'Расставьте строки так, чтобы программа вывела одно число — сумму чисел от 1 до ' + n20 + '. Перемещайте строки кнопками ↑ и ↓.',
      lines: shown20, answer: lines20 });

    return T;
  }

  // ---------- Проверка и отображение ответа ----------

  function norm(s) {
    return String(s == null ? '' : s).trim().replace(/\s+/g, ' ').replace(/\s*,\s*/g, ' ').replace(/\[\s+/g, '[').replace(/\s+\]/g, ']').toLowerCase();
  }
  function normSymbol(s) { return String(s == null ? '' : s).replace(/\s+/g, ''); }

  function isComplete(t, given) {
    if (t.type === 'input') return norm(given) !== '';
    if (t.type === 'choice') return !!given;
    if (t.type === 'match') return Array.isArray(given) && given.length === t.items.length && given.every(Boolean);
    if (t.type === 'order') return Array.isArray(given) && given.length === t.answer.length;
    return false;
  }

  function isCorrect(t, given) {
    if (!isComplete(t, given)) return false;
    if (t.type === 'input') {
      var g = t.symbol ? normSymbol(given) : norm(given);
      return t.accept.some(function (a) { return (t.symbol ? normSymbol(a) : norm(a)) === g; });
    }
    if (t.type === 'choice') return given === t.answer;
    return given.join('\n') === t.answer.join('\n');
  }

  function showGiven(t, given) {
    if (given == null || given === '' || (Array.isArray(given) && !given.length)) return '—';
    if (t.type === 'match') return t.items.map(function (it, i) { return it.name + ' → ' + (given[i] || '—'); }).join('; ');
    if (t.type === 'order') return given.join(' | ');
    return String(given);
  }

  function showAnswer(t) {
    if (t.type === 'match') return t.items.map(function (it, i) { return it.name + ' → ' + t.answer[i]; }).join('; ');
    if (t.type === 'order') return t.answer.join(' | ');
    if (t.type === 'input') return t.answerShown;
    return t.answer;
  }

  window.TASKS = { generate: generate, isComplete: isComplete, isCorrect: isCorrect, showGiven: showGiven, showAnswer: showAnswer, norm: norm };
})();
