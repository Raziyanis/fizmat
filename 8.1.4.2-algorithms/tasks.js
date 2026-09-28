/* Задания формативной работы 8.1.4.2 «Линейные алгоритмы и алгоритмы с ветвлением» (Python).
 * TASKS.generate(seed) → 20 заданий. Числа зависят от seed, поэтому у каждого ученика свой вариант.
 * Типы: input — ввести ответ; choice — выбрать один ответ; match — сопоставить; order — расставить строки. */
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

  // ---------- Рисунки блок-схем (SVG строится только из чисел и фиксированного текста) ----------

  var STROKE = 'stroke="#1c2430" stroke-width="2" fill="#ffffff"';
  var SHAPES = {
    oval: '<svg viewBox="0 0 120 60" width="120" height="60" aria-label="овал"><rect x="4" y="12" width="112" height="36" rx="18" ' + STROKE + '/></svg>',
    para: '<svg viewBox="0 0 120 60" width="120" height="60" aria-label="параллелограмм"><polygon points="24,12 116,12 96,48 4,48" ' + STROKE + '/></svg>',
    rect: '<svg viewBox="0 0 120 60" width="120" height="60" aria-label="прямоугольник"><rect x="10" y="12" width="100" height="36" ' + STROKE + '/></svg>',
    diamond: '<svg viewBox="0 0 120 60" width="120" height="60" aria-label="ромб"><polygon points="60,4 116,30 60,56 4,30" ' + STROKE + '/></svg>'
  };

  function flowchart(k, yesExpr, noExpr) {
    var t = function (x, y, s, w) { return '<text x="' + x + '" y="' + y + '" text-anchor="middle" font-size="15" font-weight="' + (w || 400) + '" font-family="Consolas, monospace" fill="#1c2430">' + s + '</text>'; };
    var line = function (x1, y1, x2, y2) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="#1c2430" stroke-width="2" marker-end="url(#ar)"/>'; };
    var seg = function (x1, y1, x2, y2) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="#1c2430" stroke-width="2"/>'; };
    return '<svg viewBox="0 0 420 470" width="420" height="470" aria-label="Блок-схема алгоритма с ветвлением">' +
      '<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#1c2430"/></marker></defs>' +
      '<rect x="150" y="10" width="120" height="36" rx="18" ' + STROKE + '/>' + t(210, 33, 'начало') +
      line(210, 46, 210, 70) +
      '<polygon points="170,70 270,70 250,106 150,106" ' + STROKE + '/>' + t(210, 93, 'ввод x') +
      line(210, 106, 210, 130) +
      '<polygon points="210,130 290,170 210,210 130,170" ' + STROKE + '/>' + t(210, 175, 'x &gt; ' + k, 700) +
      t(105, 162, 'да') + t(315, 162, 'нет') +
      seg(130, 170, 80, 170) + line(80, 170, 80, 240) +
      seg(290, 170, 340, 170) + line(340, 170, 340, 240) +
      '<rect x="10" y="240" width="140" height="40" ' + STROKE + '/>' + t(80, 265, yesExpr) +
      '<rect x="270" y="240" width="140" height="40" ' + STROKE + '/>' + t(340, 265, noExpr) +
      seg(80, 280, 80, 310) + seg(340, 280, 340, 310) + seg(80, 310, 340, 310) + line(210, 310, 210, 340) +
      '<polygon points="170,340 270,340 250,376 150,376" ' + STROKE + '/>' + t(210, 363, 'вывод y') +
      line(210, 376, 210, 410) +
      '<rect x="150" y="410" width="120" height="36" rx="18" ' + STROKE + '/>' + t(210, 433, 'конец') +
      '</svg>';
  }

  // ---------- Генератор ----------

  function generate(seed) {
    var r = rng(seed);
    var ri = function (a, b) { return a + Math.floor(r() * (b - a + 1)); };
    var pick = function (a) { return a[Math.floor(r() * a.length)]; };
    var shuffle = function (a) {
      a = a.slice();
      for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; }
      return a;
    };
    var distinct = function (a, b, avoid) { var v; do { v = ri(a, b); } while (avoid.indexOf(v) >= 0); return v; };
    var T = [];
    var OUT = 'Что выведет программа?';

    // 1. Сопоставление: блоки блок-схемы
    var blocks = shuffle([
      { svg: SHAPES.oval, name: 'овал', ans: 'начало или конец алгоритма' },
      { svg: SHAPES.para, name: 'параллелограмм', ans: 'ввод или вывод данных' },
      { svg: SHAPES.rect, name: 'прямоугольник', ans: 'действие (вычисление, присваивание)' },
      { svg: SHAPES.diamond, name: 'ромб', ans: 'проверка условия' }
    ]);
    T.push({ type: 'match', title: 'Блоки блок-схемы', text: 'Сопоставьте каждый блок блок-схемы с его назначением.',
      items: blocks.map(function (b) { return { svg: b.svg, name: b.name }; }),
      options: shuffle(blocks.map(function (b) { return b.ans; })),
      answer: blocks.map(function (b) { return b.ans; }) });

    // 2. Выбор: определение линейного алгоритма
    T.push({ type: 'choice', title: 'Линейный алгоритм', text: 'Какой алгоритм называется линейным?',
      options: shuffle([
        'команды выполняются последовательно, одна за другой, каждая ровно один раз',
        'в зависимости от условия выполняется одна из нескольких групп команд',
        'группа команд повторяется несколько раз',
        'команды выполняются в случайном порядке'
      ]),
      answer: 'команды выполняются последовательно, одна за другой, каждая ровно один раз' });

    // 3. Выбор: сколько ветвей выполняется
    T.push({ type: 'choice', title: 'Полное ветвление', text: 'Сколько ветвей выполняется при одном выполнении полного ветвления if … else?',
      options: shuffle(['ровно одна', 'обе ветви', 'ни одной', 'зависит от количества команд в ветвях']),
      answer: 'ровно одна' });

    // 4. Сопоставление: операторы Python
    var ops = shuffle([
      { code: '==', ans: 'равно' }, { code: '!=', ans: 'не равно' }, { code: '>=', ans: 'больше или равно' },
      { code: '%', ans: 'остаток от деления' }, { code: '//', ans: 'целочисленное деление' }
    ]);
    T.push({ type: 'match', title: 'Операторы Python', text: 'Сопоставьте оператор Python с его значением.',
      items: ops.map(function (o) { return { code: o.code, name: o.code }; }),
      options: shuffle(ops.map(function (o) { return o.ans; })),
      answer: ops.map(function (o) { return o.ans; }) });

    // 5. Блок-схема с ветвлением
    var k5 = ri(6, 15), m5 = ri(2, 3), x5 = pick([distinct(k5 + 1, k5 + 9, []), distinct(2, k5 - 1, [])]);
    var y5 = x5 > k5 ? x5 * m5 : x5 + k5;
    T.push({ type: 'input', title: 'Блок-схема: x = ' + x5, text: 'Дана блок-схема. Какое значение y будет выведено, если ввести x = ' + x5 + '?',
      svg: flowchart(k5, 'y = x * ' + m5, 'y = x + ' + k5), accept: [String(y5)], answerShown: String(y5), numeric: true });

    // 6. Линейная программа: обмен через сумму
    var a6 = ri(3, 9), b6 = distinct(2, 9, [a6]);
    T.push({ type: 'input', title: 'Линейная программа (a, b)', text: OUT,
      code: 'a = ' + a6 + '\nb = ' + b6 + '\na = a + b\nb = a - b\nprint(a, b)',
      accept: [(a6 + b6) + ' ' + a6], answerShown: (a6 + b6) + ' ' + a6, multi: true });

    // 7. Линейная программа: // и %
    var n7 = ri(1, 9) * 100 + ri(0, 9) * 10 + ri(1, 9);
    T.push({ type: 'input', title: 'Линейная программа (// и %)', text: OUT,
      code: 'n = ' + n7 + '\na = n // 100\nb = n % 10\nprint(a + b)',
      accept: [String(Math.floor(n7 / 100) + n7 % 10)], answerShown: String(Math.floor(n7 / 100) + n7 % 10), numeric: true });

    // 8. if … else
    var x8 = ri(10, 40), y8 = distinct(10, 40, [x8]);
    T.push({ type: 'input', title: 'Ветвление if … else', text: OUT,
      code: 'x = ' + x8 + '\ny = ' + y8 + '\nif x > y:\n    print(x - y)\nelse:\n    print(y - x)',
      accept: [String(Math.abs(x8 - y8))], answerShown: String(Math.abs(x8 - y8)), numeric: true });

    // 9. Неполное ветвление
    var a9 = pick([ri(1, 5), ri(6, 12)]);
    T.push({ type: 'input', title: 'Неполное ветвление', text: OUT,
      code: 's = 10\na = ' + a9 + '\nif a > 5:\n    s = s + a\nprint(s)',
      accept: [String(a9 > 5 ? 10 + a9 : 10)], answerShown: String(a9 > 5 ? 10 + a9 : 10), numeric: true });

    // 10. if … elif … else
    var b10 = pick([ri(86, 100), ri(65, 84), ri(40, 64), ri(10, 39)]);
    var g10 = b10 >= 85 ? 5 : b10 >= 65 ? 4 : b10 >= 40 ? 3 : 2;
    T.push({ type: 'input', title: 'Ветвление if … elif … else', text: OUT,
      code: 'b = ' + b10 + '\nif b >= 85:\n    print(5)\nelif b >= 65:\n    print(4)\nelif b >= 40:\n    print(3)\nelse:\n    print(2)',
      accept: [String(g10)], answerShown: String(g10), numeric: true });

    // 11. Составное условие and
    var a11 = ri(-5, 9), b11 = ri(-5, 9);
    if (r() < 0.5) { a11 = ri(1, 9); b11 = ri(1, 9); }
    var v11 = a11 > 0 && b11 > 0 ? a11 * b11 : a11 + b11;
    T.push({ type: 'input', title: 'Составное условие (and)', text: OUT,
      code: 'a = ' + a11 + '\nb = ' + b11 + '\nif a > 0 and b > 0:\n    print(a * b)\nelse:\n    print(a + b)',
      accept: [String(v11)], answerShown: String(v11), numeric: true });

    // 12. Наибольшее из трёх
    var a12 = ri(1, 50), b12 = distinct(1, 50, [a12]), c12 = distinct(1, 50, [a12, b12]);
    T.push({ type: 'input', title: 'Два ветвления подряд', text: OUT,
      code: 'a = ' + a12 + '\nb = ' + b12 + '\nc = ' + c12 + '\nm = a\nif b > m:\n    m = b\nif c > m:\n    m = c\nprint(m)',
      accept: [String(Math.max(a12, b12, c12))], answerShown: String(Math.max(a12, b12, c12)), numeric: true });

    // 13–16. Заполните пропуск
    var FILL = 'Что нужно написать вместо ___? Запишите только пропущенную часть.';
    var big = r() < 0.5;
    T.push({ type: 'input', title: 'Пропуск: ' + (big ? 'большее' : 'меньшее') + ' из двух чисел', text: 'Программа должна выводить ' + (big ? 'большее' : 'меньшее') + ' из двух чисел a и b. ' + FILL,
      code: 'if a ___ b:\n    print(a)\nelse:\n    print(b)', accept: big ? ['>', '>='] : ['<', '<='], answerShown: big ? '> (или >=)' : '< (или <=)', symbol: true });
    var d14 = pick([2, 3, 5]);
    T.push({ type: 'input', title: 'Пропуск: проверка делимости на ' + d14, text: 'Программа должна выводить «да», если x делится на ' + d14 + ' без остатка. ' + FILL,
      code: 'if x % ' + d14 + ' ___ 0:\n    print("да")\nelse:\n    print("нет")', accept: ['=='], answerShown: '==', symbol: true });
    T.push({ type: 'input', title: 'Пропуск: третий случай', text: 'Программа определяет, какое число: положительное, ноль или отрицательное. ' + FILL,
      code: 'if x > 0:\n    print("положительное")\n___ x == 0:\n    print("ноль")\nelse:\n    print("отрицательное")', accept: ['elif'], answerShown: 'elif' });
    T.push({ type: 'input', title: 'Пропуск: ввод целого числа', text: 'Программа вводит целое число и выводит его удвоенное значение. ' + FILL,
      code: 'a = ___(input())\nb = a * 2\nprint(b)', accept: ['int'], answerShown: 'int' });

    // 17. Порядок строк
    var k17 = ri(2, 9), m17 = ri(1, 9);
    var lines17 = ['x = int(input())', 'y = x * ' + k17, 'z = y + ' + m17, 'print(z)'];
    var shown17;
    do { shown17 = shuffle(lines17); } while (shown17.join() === lines17.join());
    T.push({ type: 'order', title: 'Порядок строк программы', text: 'Расставьте строки так, чтобы программа ввела число x и вывела значение ' + k17 + '·x + ' + m17 + '. Перемещайте строки кнопками ↑ и ↓.',
      lines: shown17, answer: lines17 });

    // 18. Правильная запись условия
    var v18 = ri(2, 9);
    T.push({ type: 'choice', title: 'Запись условия в Python', text: 'Какая строка — правильное начало ветвления в Python?', mono: true,
      options: shuffle(['if x == ' + v18 + ':', 'if x = ' + v18 + ':', 'if x == ' + v18, 'If x == ' + v18 + ':']),
      answer: 'if x == ' + v18 + ':' });

    // 19. Сколько раз выведет «да»
    var d19 = pick([3, 4]), nums19, cnt19;
    do {
      nums19 = []; while (nums19.length < 6) { var q = ri(5, 40); if (nums19.indexOf(q) < 0) nums19.push(q); }
      cnt19 = nums19.filter(function (x) { return x % d19 === 0 && x > 10; }).length;
    } while (cnt19 < 1 || cnt19 > 4);
    T.push({ type: 'input', title: 'Сколько раз «да»', text: 'Программу запустили 6 раз и вводили числа: ' + nums19.join(', ') + '. Сколько раз программа вывела «да»?',
      code: 'x = int(input())\nif x % ' + d19 + ' == 0 and x > 10:\n    print("да")\nelse:\n    print("нет")', accept: [String(cnt19)], answerShown: String(cnt19), numeric: true });

    // 20. Сопоставление: истина или ложь
    var a20 = ri(2, 9), b20 = distinct(2, 9, [a20]);
    var exprs = shuffle([
      ['a > b', a20 > b20], ['a != b', true], ['a % 2 == 0', a20 % 2 === 0],
      ['a + b > 10', a20 + b20 > 10], ['b - a < 0', b20 - a20 < 0], ['a * 2 == b', a20 * 2 === b20]
    ]).slice(0, 4);
    T.push({ type: 'match', title: 'Истина или ложь (a = ' + a20 + ', b = ' + b20 + ')', text: 'Пусть a = ' + a20 + ', b = ' + b20 + '. Для каждого условия выберите его значение.',
      items: exprs.map(function (e) { return { code: e[0], name: e[0] }; }), options: ['True', 'False'],
      answer: exprs.map(function (e) { return e[1] ? 'True' : 'False'; }) });

    return T;
  }

  // ---------- Проверка и отображение ответа ----------

  function norm(s) {
    return String(s == null ? '' : s).trim().replace(/\s+/g, ' ').replace(/\s*,\s*/g, ' ').toLowerCase();
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
