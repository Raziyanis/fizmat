/* 10 олимпиадалық есеп / 10 олимпиадных задач: 9.1.2.7 — екі өлшемді массивтер / двумерные массивы.
 * Уровни: A (1–4), B (5–7), C (8–10) — от простого к сложному.
 * CODE.generate(seed, lang) → 10 задач. Варианты, числа и тесты зависят от seed — у каждого ученика свои.
 * В каждой задаче 8 тестов: 2 примера (видны ученику) + 6 скрытых. Ожидаемый ответ считает JS,
 * а tools/check.py сверяет его с образцом решения (solution), выполненным настоящим Python.
 * need — обязательные инструкции (здесь не используются: need = []). */
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
  var sum = function (a) { return a.reduce(function (p, q) { return p + q; }, 0); };
  function isPrime(n) { if (n < 2) return false; for (var d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; }

  function generate(seed, lang) {
    var L = function (kz, ru) { return lang === 'kz' ? kz : ru; };
    var r = rng(seed);
    var ri = function (a, b) { return a + Math.floor(r() * (b - a + 1)); };
    var pick = function (a) { return a[Math.floor(r() * a.length)]; };
    var tests = function (make) { var o = []; for (var i = 0; i < 8; i++) o.push(make(i)); return o; };
    var mat = function (n, m, lo, hi) { var a = []; for (var i = 0; i < n; i++) { var row = []; for (var j = 0; j < m; j++) row.push(ri(lo, hi)); a.push(row); } return a; };
    var rows = function (a) { return a.map(function (row) { return row.join(' '); }).join('\n'); };
    var inNM = function (a) { return a.length + ' ' + a[0].length + '\n' + rows(a); };
    var inN = function (a) { return a.length + '\n' + rows(a); };
    var size = function (i) { return i === 7 ? [1, 1] : i === 6 ? [1, ri(2, 6)] : i === 5 ? [ri(2, 6), 1] : [ri(2, 6), ri(2, 6)]; };
    var READ = 'n, m = map(int, input().split())\na = [list(map(int, input().split())) for i in range(n)]\n';
    var READN = 'n = int(input())\na = [list(map(int, input().split())) for i in range(n)]\n';
    var IN_NM = L('Бірінші жолда n және m (1 ≤ n, m ≤ 10) — жолдар мен бағандар саны. Әрі қарай n жол, әр жолда бос орын арқылы m бүтін сан (|x| ≤ 100).',
      'В первой строке n и m (1 ≤ n, m ≤ 10) — число строк и столбцов. Далее n строк, в каждой через пробел m целых чисел (|x| ≤ 100).');
    var IN_N = L('Бірінші жолда n (1 ≤ n ≤ 10). Әрі қарай n жол, әр жолда бос орын арқылы n бүтін сан (|x| ≤ 100).',
      'В первой строке n (1 ≤ n ≤ 10). Далее n строк, в каждой через пробел n целых чисел (|x| ≤ 100).');
    var OUT_MAT = function (k1, k2) { return L(k1 + ' жол, әр жолда бос орын арқылы ' + k2 + ' сан.', k1 + ' строк, в каждой через пробел ' + k2 + ' чисел.'); };
    var sum = function (a) { return a.reduce(function (p, q) { return p + q; }, 0); };
    var T = [];

    // ---------- A1. Барлық элементтердің қосындысы ----------
    T.push({ level: 'A', need: [], title: L('Элементтердің қосындысы', 'Сумма элементов'),
      text: L('n жол мен m бағаннан тұратын кесте берілген. Оның барлық элементтерінің қосындысын табыңыз.', 'Дана таблица из n строк и m столбцов. Найдите сумму всех её элементов.'),
      input: IN_NM, output: L('Бір сан.', 'Одно число.'),
      tests: tests(function (i) { var z = size(i), a = mat(z[0], z[1], -50, 99); return { input: inNM(a), output: String(sum(a.map(sum))) }; }),
      solution: READ + 's = 0\nfor row in a:\n    for x in row:\n        s = s + x\nprint(s)' });

    // ---------- A2. Әр жолдың қосындысы ----------
    T.push({ level: 'A', need: [], title: L('Әр жолдың қосындысы', 'Сумма каждой строки'),
      text: L('n жол мен m бағаннан тұратын кесте берілген. Әр жолдың элементтерінің қосындысын шығарыңыз: әр жолдың қосындысы — жаңа жолда.', 'Дана таблица из n строк и m столбцов. Выведите сумму элементов каждой строки: сумму каждой строки — с новой строки.'),
      input: IN_NM, output: L('n сан, әрқайсысы жаңа жолда.', 'n чисел, каждое с новой строки.'),
      tests: tests(function (i) { var z = size(i), a = mat(z[0], z[1], -50, 99); return { input: inNM(a), output: a.map(sum).join('\n') }; }),
      solution: READ + 'for row in a:\n    print(sum(row))' });

    // ---------- A3. Ең үлкен / ең кіші элемент ----------
    var mx3 = r() < 0.5;
    T.push({ level: 'A', need: [], title: mx3 ? L('Ең үлкен элемент', 'Наибольший элемент') : L('Ең кіші элемент', 'Наименьший элемент'),
      text: L('n жол мен m бағаннан тұратын кесте берілген. Оның ' + (mx3 ? 'ең үлкен' : 'ең кіші') + ' элементін табыңыз.', 'Дана таблица из n строк и m столбцов. Найдите её ' + (mx3 ? 'наибольший' : 'наименьший') + ' элемент.'),
      input: IN_NM, output: L('Бір сан.', 'Одно число.'),
      tests: tests(function (i) { var z = size(i), a = mat(z[0], z[1], -100, 100), f = [].concat.apply([], a); return { input: inNM(a), output: String(mx3 ? Math.max.apply(null, f) : Math.min.apply(null, f)) }; }),
      solution: READ + 'mx = a[0][0]\nfor row in a:\n    for x in row:\n        if x ' + (mx3 ? '>' : '<') + ' mx:\n            mx = x\nprint(mx)' });

    // ---------- A4. Диагональ ----------
    var main4 = r() < 0.5;
    T.push({ level: 'A', need: [], title: main4 ? L('Бас диагональ', 'Главная диагональ') : L('Қосалқы диагональ', 'Побочная диагональ'),
      text: L('n × n өлшемді квадрат матрица берілген. Оның ' + (main4 ? 'бас диагоналындағы (a[i][i])' : 'қосалқы диагоналындағы (a[i][n − 1 − i])') + ' элементтердің қосындысын табыңыз.',
        'Дана квадратная матрица n × n. Найдите сумму элементов её ' + (main4 ? 'главной диагонали (a[i][i])' : 'побочной диагонали (a[i][n − 1 − i])') + '.'),
      input: IN_N, output: L('Бір сан.', 'Одно число.'),
      tests: tests(function (i) { var n = i === 7 ? 1 : ri(2, 7), a = mat(n, n, -50, 99), s = 0; for (var k = 0; k < n; k++) s += main4 ? a[k][k] : a[k][n - 1 - k]; return { input: inN(a), output: String(s) }; }),
      solution: READN + 's = 0\nfor i in range(n):\n    s = s + ' + (main4 ? 'a[i][i]' : 'a[i][n - 1 - i]') + '\nprint(s)' });

    // ---------- B5. Әр бағанның қосындысы ----------
    T.push({ level: 'B', need: [], title: L('Әр бағанның қосындысы', 'Сумма каждого столбца'),
      text: L('n жол мен m бағаннан тұратын кесте берілген. Әр бағанның элементтерінің қосындысын бір жолға бос орын арқылы шығарыңыз.', 'Дана таблица из n строк и m столбцов. Выведите в одну строку через пробел сумму элементов каждого столбца.'),
      input: IN_NM, output: L('m сан бір жолда, бос орын арқылы.', 'm чисел в одной строке через пробел.'),
      tests: tests(function (i) { var z = size(i), a = mat(z[0], z[1], -50, 99), o = []; for (var j = 0; j < z[1]; j++) { var s = 0; for (var k = 0; k < z[0]; k++) s += a[k][j]; o.push(s); } return { input: inNM(a), output: o.join(' ') }; }),
      solution: READ + 'for j in range(m):\n    s = 0\n    for i in range(n):\n        s = s + a[i][j]\n    print(s, end=" ")' });

    // ---------- B6. Ең үлкен элемент және оның орны ----------
    T.push({ level: 'B', need: [], title: L('Ең үлкен элементтің орны', 'Место наибольшего элемента'),
      text: L('n жол мен m бағаннан тұратын кесте берілген. Ең үлкен элементті, оның жол нөмірін және баған нөмірін шығарыңыз (нөмірлеу 0-ден). Ең үлкен элемент бірнешеу болса, жолдарды жоғарыдан төмен, әр жолды солдан оңға қарағанда бірінші кездескенін алыңыз.',
        'Дана таблица из n строк и m столбцов. Выведите наибольший элемент, номер его строки и номер столбца (нумерация с 0). Если наибольших несколько, возьмите тот, который встретится первым при просмотре строк сверху вниз, а каждой строки — слева направо.'),
      input: IN_NM, output: L('Үш сан бос орын арқылы: элемент, жол нөмірі, баған нөмірі.', 'Три числа через пробел: элемент, номер строки, номер столбца.'),
      tests: tests(function (i) {
        var z = size(i), a = mat(z[0], z[1], -20, 30);
        if (i === 1 || i === 3) { var v = 99; a[ri(0, z[0] - 1)][ri(0, z[1] - 1)] = v; a[ri(0, z[0] - 1)][ri(0, z[1] - 1)] = v; }
        var bv = a[0][0], bi = 0, bj = 0;
        for (var p = 0; p < z[0]; p++) for (var q = 0; q < z[1]; q++) if (a[p][q] > bv) { bv = a[p][q]; bi = p; bj = q; }
        return { input: inNM(a), output: bv + ' ' + bi + ' ' + bj };
      }),
      solution: READ + 'mx = a[0][0]\nbi, bj = 0, 0\nfor i in range(n):\n    for j in range(m):\n        if a[i][j] > mx:\n            mx = a[i][j]\n            bi, bj = i, j\nprint(mx, bi, bj)' });

    // ---------- B7. Транспонирлеу ----------
    T.push({ level: 'B', need: [], title: L('Кестені бұру (транспонирлеу)', 'Поворот таблицы (транспонирование)'),
      text: L('n жол мен m бағаннан тұратын кесте берілген. Жолдары мен бағандарының орнын ауыстырыңыз: жаңа кестенің i-жолы — бастапқы кестенің i-бағаны. Жаңа кестені шығарыңыз.',
        'Дана таблица из n строк и m столбцов. Поменяйте местами строки и столбцы: строка i новой таблицы — это столбец i исходной. Выведите новую таблицу.'),
      input: IN_NM, output: OUT_MAT('m', 'n'),
      tests: tests(function (i) { var z = size(i), a = mat(z[0], z[1], -50, 99), t = []; for (var j = 0; j < z[1]; j++) { var row = []; for (var k = 0; k < z[0]; k++) row.push(a[k][j]); t.push(row); } return { input: inNM(a), output: rows(t) }; }),
      solution: READ + 'for j in range(m):\n    for i in range(n):\n        print(a[i][j], end=" ")\n    print()' });

    // ---------- C8. Екі жолдың орнын ауыстыру ----------
    T.push({ level: 'C', need: [], title: L('Екі жолдың орнын ауыстыру', 'Перестановка двух строк'),
      text: L('n жол мен m бағаннан тұратын кесте, содан кейін p және q сандары берілген. p және q нөмірлі жолдардың орнын ауыстырып (нөмірлеу 0-ден), кестені шығарыңыз.',
        'Дана таблица из n строк и m столбцов, затем числа p и q. Поменяйте местами строки с номерами p и q (нумерация с 0) и выведите таблицу.'),
      input: L('Бірінші жолда n және m (1 ≤ n, m ≤ 10). Әрі қарай n жол, әр жолда m бүтін сан. Соңғы жолда p және q (0 ≤ p, q < n).', 'В первой строке n и m (1 ≤ n, m ≤ 10). Далее n строк по m целых чисел. В последней строке p и q (0 ≤ p, q < n).'),
      output: OUT_MAT('n', 'm'),
      tests: tests(function (i) {
        var n = i === 7 ? 1 : ri(2, 6), m = ri(1, 6), a = mat(n, m, -50, 99), p = ri(0, n - 1), q = i === 5 ? p : ri(0, n - 1);
        if (i < 5 && n > 1) while (q === p) q = ri(0, n - 1);
        var b = a.map(function (x) { return x.slice(); }), t = b[p]; b[p] = b[q]; b[q] = t;
        return { input: inNM(a) + '\n' + p + ' ' + q, output: rows(b) };
      }),
      solution: READ + 'p, q = map(int, input().split())\na[p], a[q] = a[q], a[p]\nfor row in a:\n    print(*row)' });

    // ---------- C9. Симметриялы матрица ----------
    T.push({ level: 'C', need: [], title: L('Симметриялы матрица', 'Симметричная матрица'),
      text: L('n × n квадрат матрица берілген. Ол бас диагональға қарағанда симметриялы ма, яғни барлық i және j үшін a[i][j] = a[j][i] орындала ма? Иә болса — YES, әйтпесе — NO шығарыңыз.',
        'Дана квадратная матрица n × n. Симметрична ли она относительно главной диагонали, то есть выполняется ли a[i][j] = a[j][i] для всех i и j? Выведите YES, если да, иначе NO.'),
      input: IN_N, output: L('YES немесе NO.', 'YES или NO.'),
      tests: tests(function (i) {
        var n = i === 7 ? 1 : ri(2, 6), a = mat(n, n, -9, 30);
        for (var p = 0; p < n; p++) for (var q = 0; q < p; q++) a[p][q] = a[q][p];
        if ((i === 1 || i === 3 || i === 6) && n > 1) { var x = ri(1, n - 1), y = ri(0, x - 1); a[x][y] = a[y][x] + ri(1, 9); }
        var ok = true; for (p = 0; p < n; p++) for (q = 0; q < n; q++) if (a[p][q] !== a[q][p]) ok = false;
        return { input: inN(a), output: ok ? 'YES' : 'NO' };
      }),
      solution: READN + 'ok = True\nfor i in range(n):\n    for j in range(n):\n        if a[i][j] != a[j][i]:\n            ok = False\nif ok:\n    print("YES")\nelse:\n    print("NO")' });

    // ---------- C10. «Жылан» ----------
    T.push({ level: 'C', need: [], title: L('«Жылан»', '«Змейка»'),
      text: L('n және m сандары берілген. n жол мен m бағаннан тұратын кестені 1-ден n·m-ге дейінгі сандармен «жыланша» толтырыңыз: 0-жол солдан оңға, 1-жол оңнан солға, 2-жол қайтадан солдан оңға және т.с.с. Кестені шығарыңыз. Кеңес: алдымен a = [[0] * m for i in range(n)] кестесін жасаңыз.',
        'Даны числа n и m. Заполните таблицу из n строк и m столбцов числами от 1 до n·m «змейкой»: строка 0 слева направо, строка 1 справа налево, строка 2 снова слева направо и т. д. Выведите таблицу. Подсказка: сначала создайте таблицу a = [[0] * m for i in range(n)].'),
      input: L('Бір жолда n және m (1 ≤ n, m ≤ 10).', 'В одной строке n и m (1 ≤ n, m ≤ 10).'), output: OUT_MAT('n', 'm'),
      tests: tests(function (i) {
        var n = i === 7 ? 1 : i === 6 ? ri(2, 5) : ri(2, 7), m = i === 6 ? 1 : ri(2, 7), a = [], k = 1;
        for (var p = 0; p < n; p++) { var row = []; for (var q = 0; q < m; q++) row.push(k++); if (p % 2) row.reverse(); a.push(row); }
        return { input: n + ' ' + m, output: rows(a) };
      }),
      solution: 'n, m = map(int, input().split())\na = [[0] * m for i in range(n)]\nk = 1\nfor i in range(n):\n    if i % 2 == 0:\n        for j in range(m):\n            a[i][j] = k\n            k = k + 1\n    else:\n        for j in range(m - 1, -1, -1):\n            a[i][j] = k\n            k = k + 1\nfor row in a:\n    print(*row)' });

    return T;
  }

  // Сравнение вывода: скобки, запятые и кавычки не учитываются, пробел и перевод строки равнозначны, регистр букв не важен (YES = yes).
  function tokens(s) { return String(s == null ? '' : s).replace(/[\[\],'"()]/g, ' ').trim().split(/\s+/).filter(Boolean).map(function (x) { return x.toUpperCase(); }); }
  function sameOutput(got, want) { return tokens(got).join(' ') === tokens(want).join(' '); }

  // Есть ли в программе нужные инструкции (комментарии и строки не считаются).
  function clean(src) {
    return String(src || '').replace(/("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')/g, '""').replace(/#.*$/gm, '');
  }
  // else цикла: строка «else:» на том же отступе, что и ближайшая выше строка «for …»/«while …» этого уровня
  function hasLoopElse(code) {
    var lines = code.split('\n');
    for (var i = 0; i < lines.length; i++) {
      var m = /^([ \t]*)else\s*:/.exec(lines[i]);
      if (!m) continue;
      var ind = m[1].replace(/\t/g, '    ').length;
      for (var j = i - 1; j >= 0; j--) {
        if (!lines[j].trim()) continue;
        var li = /^[ \t]*/.exec(lines[j])[0].replace(/\t/g, '    ').length;
        if (li > ind) continue;
        if (li < ind) break;
        if (/^\s*(for|while)\b/.test(lines[j])) return true;
        break;
      }
    }
    return false;
  }
  function missing(src, need) {
    var c = clean(src);
    return (need || []).filter(function (k) { return k === 'else' ? !hasLoopElse(c) : !new RegExp('\\b' + k + '\\b').test(c); });
  }

  window.CODE = { generate: generate, sameOutput: sameOutput, tokens: tokens, missing: missing };
})();
