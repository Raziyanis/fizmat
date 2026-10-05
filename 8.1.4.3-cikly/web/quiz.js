/* 10 тестовых вопросов по теме 8.1.4.3: выбор ответа (A, B, C, D) и сопоставление.
 * QUIZ.generate(seed) → 10 вопросов; числа зависят от seed. Ключ проверяется Python: tools/check.py. */
(function () {
  'use strict';

  function rng(seed) {
    var s = (seed ^ 0x5bd1e995) >>> 0;
    return function () {
      s = (s + 0x6d2b79f5) >>> 0;
      var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function range(a, b, s) {
    if (b === undefined) { b = a; a = 0; }
    s = s || 1;
    var o = [];
    for (var x = a; s > 0 ? x < b : x > b; x += s) o.push(x);
    return o;
  }
  var rs = function (a, b, s) { return 'range(' + a + (b !== undefined ? ', ' + b : '') + (s !== undefined ? ', ' + s : '') + ')'; };

  // variant — номер попытки (0, 1, 2…): вопросы 5–7 в каждой попытке берут другую формулировку;
  // base — общий seed ученика, чтобы у разных учеников порядок формулировок был разным.
  function generate(seed, variant, base) {
    variant = variant || 0;
    var bankShift = ((base == null ? seed : base) >>> 0) % 4;
    var r = rng(seed);
    var ri = function (a, b) { return a + Math.floor(r() * (b - a + 1)); };
    var pick = function (a) { return a[Math.floor(r() * a.length)]; };
    var shuffle = function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; } return a; };
    // 4 разных варианта: правильный + отвлекающие (без повторов)
    var choice = function (title, text, code, right, wrong, mono) {
      var opts = [String(right)];
      wrong.map(String).forEach(function (w) { if (opts.length < 4 && opts.indexOf(w) < 0) opts.push(w); });
      var k = 1;
      while (opts.length < 4) { var v = String(Number(right) + k * 10); if (opts.indexOf(v) < 0) opts.push(v); k++; }
      return { type: 'choice', title: title, text: text, code: code, options: shuffle(opts), answer: String(right), mono: !!mono };
    };
    var Q = [];

    // 1. Сопоставление range → числа
    var k1 = ri(3, 6), a1 = ri(1, 4), b1 = a1 + ri(3, 5), s1 = ri(2, 3), c1 = a1 + s1 * ri(3, 4) + 1, d1 = ri(8, 12), e1 = pick([2, 3]);
    var m1 = shuffle([[rs(k1), range(k1)], [rs(a1, b1), range(a1, b1)], [rs(a1, c1, s1), range(a1, c1, s1)], [rs(d1, 0, -e1), range(d1, 0, -e1)]]);
    Q.push({ type: 'match', title: 'range() и числа', text: 'Сопоставьте запись range() с числами, которые она даёт.',
      items: m1.map(function (m) { return { code: m[0], name: m[0] }; }), options: shuffle(m1.map(function (m) { return m[1].join(' '); })),
      answer: m1.map(function (m) { return m[1].join(' '); }) });

    // 2. Что выведет for с range(a, b)
    var a2 = ri(1, 5), b2 = a2 + ri(3, 5);
    Q.push(choice('Вывод цикла for', 'Что выведет программа?', 'for i in range(' + a2 + ', ' + b2 + '):\n    print(i, end=" ")',
      range(a2, b2).join(' '), [range(a2, b2 + 1).join(' '), range(a2 + 1, b2 + 1).join(' '), range(0, b2).join(' ')]));

    // 3. Сколько раз выполнится тело (с шагом)
    var a3 = ri(0, 4), s3 = ri(2, 4), b3 = a3 + s3 * ri(3, 6) + ri(1, s3);
    var n3 = range(a3, b3, s3).length;
    Q.push(choice('Число повторений', 'Сколько раз выполнится тело цикла?', 'for i in range(' + a3 + ', ' + b3 + ', ' + s3 + '):\n    print(i)',
      n3, [n3 + 1, n3 - 1, b3 - a3]));

    // 4. Сумма в цикле
    var n4 = ri(5, 25), s4 = n4 * (n4 + 1) / 2;
    Q.push(choice('Накопление суммы', 'Что выведет программа?', 's = 0\nfor i in range(1, ' + (n4 + 1) + '):\n    s = s + i\nprint(s)',
      s4, [s4 - n4, s4 + n4 + 1, n4 * n4]));

    // 5–7. Вопросы без чисел: у каждого 4 формулировки, в каждой попытке берётся следующая
    var V = function (bank) { return bank[(variant + bankShift) % bank.length]; };

    // 5. for или while
    Q.push(V([
      function () { return choice('for или while', 'Какой цикл лучше использовать, если количество повторений заранее неизвестно (например, «повторять, пока не введут 0»)?', null,
        'while', ['for i in range(10)', 'for x in список', 'цикл здесь не нужен']); },
      function () { return choice('Цикл while', 'Цикл while повторяет тело цикла…', null,
        'пока условие истинно', ['пока условие ложно', 'ровно 10 раз', 'только один раз']); },
      function () { return choice('Когда удобен for', 'В каком случае удобнее всего цикл for с range()?', null,
        'число повторений известно заранее', ['повторять, пока пользователь не введёт 0', 'повторять, пока сумма меньше 100', 'разбирать число на цифры, пока оно больше 0']); },
      function () { return choice('for и while', 'Чем цикл for с range() отличается от цикла while?', null,
        'в for переменная цикла меняется сама, в while её меняем в теле цикла', ['цикл for всегда бесконечный', 'в цикле while нельзя писать условие', 'внутри цикла for нельзя использовать print()']); }
    ])());

    // 6. Итерация и тело цикла
    var n6 = ri(3, 9);
    Q.push(V([
      function () { return choice('Итерация', 'Что называется итерацией цикла?', null,
        'одно выполнение тела цикла', ['условие продолжения цикла', 'переменная цикла', 'команды до начала цикла']); },
      function () { var q = choice('Число итераций', 'Сколько итераций сделает цикл?', 'for i in range(' + n6 + '):\n    print(i)', n6, [n6 - 1, n6 + 1, 1]); q.count = true; return q; },
      function () { return choice('Итерация', 'Цикл сделал 5 итераций. Что это значит?', null,
        'тело цикла выполнилось 5 раз', ['в теле цикла 5 строк', 'переменная цикла равна 5', 'цикл записан в программе 5 раз']); },
      function () { return choice('Тело цикла', 'Что такое тело цикла?', null,
        'команды, которые повторяются (записаны с отступом)', ['строка с for или while', 'условие после while', 'команды, которые записаны после цикла']); }
    ])());

    // 7. Перебор списка
    var a7 = [ri(1, 9), ri(1, 9), ri(1, 9)], k7 = ri(2, 5);
    var py7 = function (a) { return '[' + a.join(', ') + ']'; };
    Q.push(V([
      function () { var q = choice('Изменение списка', 'Нужно умножить каждый элемент списка a на 2 так, чтобы изменился сам список. Какой цикл подходит?', null,
        'for i in range(len(a)):\n    a[i] = a[i] * 2', ['for x in a:\n    x = x * 2', 'for i in a:\n    a = a * 2', 'while a:\n    a = a * 2'], true); q.kind = 'mod-list'; return q; },
      function () { return choice('for x in a', 'Что выведет программа?', 'a = ' + py7(a7) + '\nfor x in a:\n    x = x * ' + k7 + '\nprint(a)',
        py7(a7), [py7(a7.map(function (x) { return x * k7; })), '[]', py7([a7[0] * k7, a7[1], a7[2]])]); },
      function () { return choice('for i in range(len(a))', 'Что выведет программа?', 'a = ' + py7(a7) + '\nfor i in range(len(a)):\n    a[i] = a[i] + ' + k7 + '\nprint(a)',
        py7(a7.map(function (x) { return x + k7; })), [py7(a7), py7(a7.map(function (x, i) { return i + k7; })), py7(a7.concat([k7]))]); },
      function () { return choice('Переменная в for x in a', 'Какие значения по очереди принимает x в цикле for x in a, если a — список?', null,
        'значения элементов списка', ['индексы элементов: 0, 1, 2, …', 'длину списка', 'только первый элемент списка']); }
    ])());

    // 8. Значение после while
    var a8 = ri(1, 5), s8 = ri(2, 4), b8 = a8 + ri(8, 15), i8 = a8;
    while (i8 <= b8) i8 += s8;
    Q.push(choice('Цикл while', 'Что выведет программа?', 'i = ' + a8 + '\nwhile i <= ' + b8 + ':\n    i = i + ' + s8 + '\nprint(i)',
      i8, [i8 - s8, b8, b8 + 1]));

    // 9. Бесконечный цикл
    var v9 = ri(3, 8);
    var q9 = choice('Бесконечный цикл', 'Какая программа выполняется бесконечно?', null,
      'i = 1\nwhile i < ' + v9 + ':\n    print(i)',
      ['i = 1\nwhile i < ' + v9 + ':\n    print(i)\n    i = i + 1', 'for i in range(' + v9 + '):\n    print(i)', 'i = ' + v9 + '\nwhile i > 0:\n    i = i - 1'], true);
    q9.kind = 'infinite';
    Q.push(q9);

    // 10. Сопоставление: понятие → определение
    var terms = shuffle([
      ['тело цикла', 'команды, которые повторяются (пишутся с отступом)'],
      ['итерация', 'одно выполнение тела цикла'],
      ['накопитель', 'переменная, в которой собирают сумму или произведение'],
      ['условие продолжения', 'то, что проверяет while перед каждой итерацией'],
      ['шаг range', 'на сколько меняется переменная цикла за итерацию']
    ]).slice(0, 4);
    Q.push({ type: 'match', title: 'Понятия', text: 'Сопоставьте понятие с его определением.',
      items: terms.map(function (m) { return { code: m[0], name: m[0], word: true }; }), options: shuffle(terms.map(function (m) { return m[1]; })),
      answer: terms.map(function (m) { return m[1]; }) });

    // Какой раздел теории повторить, если ответ неверный
    var THEORY = ['2.2 «Функция range()»', '2.2 «Функция range()»', '2.2 «Сводная таблица range»', '2.5 «Накопители»',
      '3.1 «Как записывается цикл while» и 4 «for или while — что выбрать»', '1 «Что такое цикл» и 2.2 «Функция range()»', '2.4 «for i in range(...) и for x in список»', '3.2 «Три шага цикла while»',
      '3.4 «Бесконечный цикл»', '1 «Что такое цикл», 2.5 и 3.1'];
    Q.forEach(function (q, i) { q.theory = THEORY[i]; });
    return Q;
  }

  function isComplete(q, g) {
    if (q.type === 'choice') return !!g;
    return Array.isArray(g) && g.length === q.items.length && g.every(Boolean);
  }
  function isCorrect(q, g) {
    if (!isComplete(q, g)) return false;
    return q.type === 'choice' ? g === q.answer : g.join('\n') === q.answer.join('\n');
  }

  window.QUIZ = { generate: generate, isComplete: isComplete, isCorrect: isCorrect };
})();
