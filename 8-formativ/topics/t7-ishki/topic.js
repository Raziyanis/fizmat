/* Тема 7. Вложенные циклы (8.1.4.6). */
window.TOPIC = {
  id: 't7-ishki', file: 'formativ-7-ishki-cikldar.html',
  title: { kz: 'Кірістірілген (ішкі) циклдар', ru: 'Вложенные циклы' },
  goal: { kz: '8.1.4.6 — күрделі есептерді шешу үшін кірістірілген циклдарды қолдану', ru: '8.1.4.6 — использовать вложенные циклы для решения задач повышенной сложности' },
  generate: function (seed, lang, H) {
    var L = H.L, ri = H.ri, pick = H.pick, T = [];
    var Q = L('Программа не шығарады?', 'Что выведет программа?');
    var isPrime = function (n) { if (n < 2) return false; for (var d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; };

    var a1 = ri(2, 5), b1 = ri(2, 5), c1 = 'c = 0\nfor i in range(' + a1 + '):\n    for j in range(' + b1 + '):\n        c = c + 1\nprint(c)';
    T.push(H.quiz({ level: 'A', title: L('Неше рет?', 'Сколько раз?'), text: Q, code: c1, check: { code: c1 } },
      String(a1 * b1), [String(a1 + b1), String(a1 * b1 + 1), String(Math.max(a1, b1)), String(a1 * b1 - 1)]));

    var n2 = ri(2, 3), c2 = 'for i in range(1, ' + (n2 + 1) + '):\n    for j in range(1, ' + (n2 + 1) + '):\n        print(i * j, end=" ")\n    print()';
    var r2 = [], w2 = []; for (var i = 1; i <= n2; i++) { var row = []; for (var j = 1; j <= n2; j++) row.push(i * j); r2.push(row.join(' ')); w2.push(row.map(function (x, k) { return i + k + 1; }).join(' ')); }
    T.push(H.quiz({ level: 'A', title: L('Көбейту кестесі', 'Таблица умножения'), text: Q, code: c2, check: { code: c2 } }, r2.join('\n'), [w2.join('\n'), r2.join(' '), r2.slice(0, n2 - 1).join('\n')]));
    T[T.length - 1].mono = true;

    var n3 = ri(3, 5), c3 = 'for i in range(1, ' + (n3 + 1) + '):\n    for j in range(i):\n        print("*", end="")\n    print()';
    var tri = []; for (i = 1; i <= n3; i++) tri.push('*'.repeat(i));
    T.push(H.quiz({ level: 'B', title: L('Үшбұрыш', 'Треугольник'), text: L('Программа неше жұлдызша (*) шығарады?', 'Сколько звёздочек (*) выведет программа?'), code: c3, check: { code: c3 + '\n', count: '*' } },
      String(n3 * (n3 + 1) / 2), [String(n3 * n3), String(n3), String(n3 * (n3 - 1) / 2), String(n3 * (n3 + 1)), String(n3 + 1)]));

    var n4 = ri(4, 7), c4 = 'c = 0\nfor i in range(' + n4 + '):\n    for j in range(i):\n        c = c + 1\nprint(c)';
    T.push(H.quiz({ level: 'B', title: L('Ішкі цикл i-ге тәуелді', 'Внутренний цикл зависит от i'), text: Q, code: c4, check: { code: c4 } },
      String(n4 * (n4 - 1) / 2), [String(n4 * n4), String(n4 * (n4 + 1) / 2), String(n4 - 1)]));

    T.push(H.quiz({ level: 'A', title: L('Ішкі цикл қалай орындалады?', 'Как выполняется внутренний цикл?'), text: L('Кірістірілген циклда сыртқы циклдың бір қадамында ішкі цикл қалай орындалады?', 'Как выполняется внутренний цикл за один шаг внешнего цикла?') },
      L('Толығымен, басынан аяғына дейін', 'Полностью, от начала до конца'), [L('Тек бір рет', 'Только один шаг'), L('Мүлдем орындалмайды', 'Не выполняется'), L('Сыртқы цикл аяқталған соң ғана', 'Только после окончания внешнего цикла')]));

    // ---------- Программа ----------
    T.push({ level: 'A', title: L('Жұлдызша тіктөртбұрыш', 'Прямоугольник из звёздочек'),
      text: L('n және m сандары берілген. n жол, әр жолда m жұлдызша (*) бар тіктөртбұрышты шығарыңыз (жұлдызшалар бос орынсыз).', 'Даны числа n и m. Выведите прямоугольник из n строк, в каждой m звёздочек (*) без пробелов.'),
      input: L('Бір жолда n және m (1 ≤ n, m ≤ 20).', 'В одной строке n и m (1 ≤ n, m ≤ 20).'), output: L('n жол, әр жолда m жұлдызша.', 'n строк по m звёздочек.'),
      tests: H.tests(function (i) { var n = i === 7 ? 1 : ri(1, 8), m = ri(1, 10), o = []; for (var k = 0; k < n; k++) o.push('*'.repeat(m)); return { input: n + ' ' + m, output: o.join('\n') }; }),
      solution: 'n, m = map(int, input().split())\nfor i in range(n):\n    for j in range(m):\n        print("*", end="")\n    print()' });

    T.push({ level: 'A', title: L('Көбейту кестесі', 'Таблица умножения'),
      text: L('Натурал n берілген. n × n көбейту кестесін шығарыңыз: i-жолда i·1, i·2, …, i·n сандары бос орын арқылы.', 'Дано натуральное n. Выведите таблицу умножения n × n: в строке i числа i·1, i·2, …, i·n через пробел.'),
      input: L('Бір натурал сан n (n ≤ 10).', 'Одно натуральное число n (n ≤ 10).'), output: L('n жол, әр жолда n сан.', 'n строк по n чисел.'),
      tests: H.tests(function (i) { var n = i === 7 ? 1 : ri(2, 10), o = []; for (var a = 1; a <= n; a++) { var row = []; for (var b = 1; b <= n; b++) row.push(a * b); o.push(row.join(' ')); } return { input: String(n), output: o.join('\n') }; }),
      solution: 'n = int(input())\nfor i in range(1, n + 1):\n    for j in range(1, n + 1):\n        print(i * j, end=" ")\n    print()' });

    T.push({ level: 'B', title: L('Сандар үшбұрышы', 'Треугольник из чисел'),
      text: L('Натурал n берілген. n жол шығарыңыз: i-жолда 1-ден i-ге дейінгі сандар бос орын арқылы.', 'Дано натуральное n. Выведите n строк: в строке i числа от 1 до i через пробел.'),
      input: L('Бір натурал сан n (n ≤ 20).', 'Одно натуральное число n (n ≤ 20).'), output: L('n жол.', 'n строк.'),
      tests: H.tests(function (i) { var n = i === 7 ? 1 : ri(2, 12), o = []; for (var a = 1; a <= n; a++) { var row = []; for (var b = 1; b <= a; b++) row.push(b); o.push(row.join(' ')); } return { input: String(n), output: o.join('\n') }; }),
      solution: 'n = int(input())\nfor i in range(1, n + 1):\n    for j in range(1, i + 1):\n        print(j, end=" ")\n    print()' });

    T.push({ level: 'B', title: L('Жұптар саны', 'Количество пар'),
      text: L('n және k берілген. 1 ≤ i < j ≤ n болатын, i + j қосындысы k-ға бөлінетін неше (i, j) жұбы бар? Санын шығарыңыз.', 'Даны n и k. Сколько существует пар (i, j), где 1 ≤ i < j ≤ n и сумма i + j делится на k? Выведите количество.'),
      input: L('Бір жолда n және k (2 ≤ n ≤ 200, 2 ≤ k ≤ 20).', 'В одной строке n и k (2 ≤ n ≤ 200, 2 ≤ k ≤ 20).'), output: L('Бір сан.', 'Одно число.'),
      tests: H.tests(function () { var n = ri(2, 120), k = ri(2, 20), c = 0; for (var a = 1; a <= n; a++) for (var b = a + 1; b <= n; b++) if ((a + b) % k === 0) c++; return { input: n + ' ' + k, output: String(c) }; }),
      solution: 'n, k = map(int, input().split())\nc = 0\nfor i in range(1, n + 1):\n    for j in range(i + 1, n + 1):\n        if (i + j) % k == 0:\n            c = c + 1\nprint(c)' });

    T.push({ level: 'C', title: L('Жай сандар', 'Простые числа'),
      text: L('Натурал n берілген. 2-ден n-ге дейінгі барлық жай сандарды бір жолға бос орын арқылы шығарыңыз. Сыртқы цикл сандарды, ішкі цикл бөлгіштерді қарайды.', 'Дано натуральное n. Выведите в одну строку через пробел все простые числа от 2 до n. Внешний цикл перебирает числа, внутренний — делители.'),
      input: L('Бір натурал сан n (2 ≤ n ≤ 1000).', 'Одно натуральное число n (2 ≤ n ≤ 1000).'), output: L('Сандар бір жолда.', 'Числа в одной строке.'),
      tests: H.tests(function (i) { var n = i === 7 ? 2 : ri(3, 1000), o = []; for (var x = 2; x <= n; x++) if (isPrime(x)) o.push(x); return { input: String(n), output: o.join(' ') }; }),
      solution: 'n = int(input())\nfor x in range(2, n + 1):\n    prime = True\n    for d in range(2, x):\n        if x % d == 0:\n            prime = False\n            break\n    if prime:\n        print(x, end=" ")' });
    return T;
  }
};
