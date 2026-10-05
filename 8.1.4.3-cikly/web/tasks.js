/* 10 задач на код по теме 8.1.4.3 «Цикл for, цикл while». Уровни: A (1–4), B (5–7), C (8–10).
 * CODE.generate(seed) → 10 задач. Вариант, числа и тесты зависят от seed — у каждого ученика свои.
 * В каждой задаче 8 тестов: 2 примера (ученик их видит) + 6 скрытых. Ожидаемый ответ считает JS,
 * а tools/check.py сверяет его с образцом решения (solution), выполненным настоящим Python.
 * Решать можно и через for, и через while: проверяется только вывод программы. */
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
  var seq = function (a, b, s) { var o = []; for (var x = a; s > 0 ? x <= b : x >= b; x += s) o.push(x); return o; };

  // lang = 'kz' | 'ru' (по умолчанию 'ru'): меняется только текст, числа и тесты одинаковые
  function generate(seed, lang) {
    var L = function (kz, ru) { return lang === 'kz' ? kz : ru; };
    var r = rng(seed);
    var ri = function (a, b) { return a + Math.floor(r() * (b - a + 1)); };
    var pick = function (a) { return a[Math.floor(r() * a.length)]; };
    var tests = function (make) { var o = []; for (var i = 0; i < 8; i++) o.push(make(i)); return o; };
    var ONE = L('Бір сан.', 'Одно число.'), ROW = L('Сандар бір жолда, бос орын арқылы.', 'Числа в одной строке через пробел.');
    var T = [];

    // A1. Числа от a до b (с шагом d)
    var d1 = pick([1, 2, 3]);
    T.push({ level: 'A', title: d1 === 1 ? L('a-дан b-ге дейінгі сандар', 'Числа от a до b') : L('a-дан b-ге дейінгі сандар, қадамы ' + d1, 'Числа от a до b с шагом ' + d1),
      text: L('Екі бүтін сан a және b берілген (a < b). Бір жолға бос орын арқылы ' + (d1 === 1 ? 'a-дан b-ге дейінгі (b-ні қоса) барлық бүтін сандарды шығарыңыз.' : 'b-дан аспайтын a, a + ' + d1 + ', a + ' + (2 * d1) + ', … сандарын шығарыңыз.'),
        'Даны два целых числа a и b (a < b). Выведите в одну строку через пробел ' + (d1 === 1 ? 'все целые числа от a до b включительно.' : 'числа a, a + ' + d1 + ', a + ' + (2 * d1) + ', … не больше b.')),
      input: L('Бір жолда бос орын арқылы екі бүтін сан a және b.', 'В одной строке через пробел два целых числа a и b.'), output: ROW,
      tests: tests(function () { var a = ri(-10, 20), b = a + ri(d1 + 1, 15); return { input: a + ' ' + b, output: seq(a, b, d1).join(' ') }; }),
      solution: 'a, b = map(int, input().split())\nfor i in range(a, b + 1' + (d1 === 1 ? '' : ', ' + d1) + '):\n    print(i, end=" ")',
      alt: 'a = int(input())\nb = int(input())\ni = a\nwhile i <= b:\n    print(i, end=" ")\n    i = i + ' + d1 });

    // A2. Сумма от 1 до n (или сумма квадратов)
    var sq = r() < 0.4;
    T.push({ level: 'A', title: sq ? L('Квадраттардың қосындысы', 'Сумма квадратов') : L('1-ден n-ге дейінгі қосынды', 'Сумма от 1 до n'),
      text: sq ? L('Натурал n саны берілген. 1² + 2² + … + n² квадраттарының қосындысын табыңыз.', 'Дано натуральное число n. Найдите сумму квадратов 1² + 2² + … + n².')
                : L('Натурал n саны берілген. 1-ден n-ге дейінгі (n-ді қоса) барлық сандардың қосындысын табыңыз.', 'Дано натуральное число n. Найдите сумму всех чисел от 1 до n включительно.'),
      input: L('Бір натурал сан n (n ≤ 1000).', 'Одно натуральное число n (n ≤ 1000).'), output: ONE,
      tests: tests(function (i) { var n = i === 7 ? 1 : ri(2, 200 * (i + 1) > 1000 ? 1000 : 200 * (i + 1)); return { input: String(n), output: String(sum(seq(1, n, 1).map(function (x) { return sq ? x * x : x; }))) }; }),
      solution: 'n = int(input())\ns = 0\nfor i in range(1, n + 1):\n    s = s + ' + (sq ? 'i * i' : 'i') + '\nprint(s)',
      alt: 'n = int(input())\ns = 0\ni = 1\nwhile i <= n:\n    s = s + ' + (sq ? 'i * i' : 'i') + '\n    i = i + 1\nprint(s)' });

    // A3. Таблица умножения
    var m3 = pick([5, 10]);
    T.push({ level: 'A', title: L('Көбейту кестесі', 'Таблица умножения'),
      text: L('Натурал k саны берілген. Бір жолға бос орын арқылы k · 1, k · 2, …, k · ' + m3 + ' көбейтінділерін шығарыңыз.', 'Дано натуральное число k. Выведите в одну строку через пробел произведения k · 1, k · 2, …, k · ' + m3 + '.'),
      input: L('Бір натурал сан k (k ≤ 100).', 'Одно натуральное число k (k ≤ 100).'), output: ROW,
      tests: tests(function () { var k = ri(2, 99); return { input: String(k), output: seq(1, m3, 1).map(function (x) { return k * x; }).join(' ') }; }),
      solution: 'k = int(input())\nfor i in range(1, ' + (m3 + 1) + '):\n    print(k * i, end=" ")',
      alt: 'k = int(input())\ni = 1\nwhile i <= ' + m3 + ':\n    print(k * i, end=" ")\n    i = i + 1' });

    // A4. Обратный отсчёт
    var d4 = pick([1, 2]);
    T.push({ level: 'A', title: L('Кері санау', 'Обратный отсчёт'),
      text: d4 === 1 ? L('Натурал n саны берілген. Бір жолға бос орын арқылы n-нен 1-ге дейінгі сандарды (кему ретімен) шығарыңыз.', 'Дано натуральное число n. Выведите в одну строку через пробел числа от n до 1 (по убыванию).')
                     : L('Натурал n саны берілген. Бір жолға бос орын арқылы 0-ден үлкен n, n − 2, n − 4, … сандарын шығарыңыз.', 'Дано натуральное число n. Выведите в одну строку через пробел числа n, n − 2, n − 4, … , которые больше 0.'),
      input: L('Бір натурал сан n (n ≤ 100).', 'Одно натуральное число n (n ≤ 100).'), output: ROW,
      tests: tests(function (i) { var n = i === 7 ? 1 : ri(2, 40); return { input: String(n), output: seq(n, 1, -d4).join(' ') }; }),
      solution: 'n = int(input())\nfor i in range(n, 0, -' + d4 + '):\n    print(i, end=" ")',
      alt: 'n = int(input())\nwhile n > 0:\n    print(n, end=" ")\n    n = n - ' + d4 });

    // B5. Факториал / степень
    var pw = r() < 0.5;
    T.push({ level: 'B', title: pw ? L('Санның дәрежесі', 'Степень числа') : L('Факториал', 'Факториал'),
      text: pw ? L('a және n натурал сандары берілген. aⁿ мәнін (a-ның n-дәрежесін) ** амалын қолданбай, цикл арқылы есептеңіз.', 'Даны натуральные числа a и n. Вычислите aⁿ (a в степени n) с помощью цикла, без операции **.')
                : L('Натурал n саны берілген. n! = 1 · 2 · 3 · … · n мәнін есептеңіз.', 'Дано натуральное число n. Вычислите n! = 1 · 2 · 3 · … · n.'),
      input: pw ? L('Бір жолда бос орын арқылы a және n (a ≤ 10, n ≤ 15).', 'В одной строке через пробел a и n (a ≤ 10, n ≤ 15).') : L('Бір натурал сан n (n ≤ 15).', 'Одно натуральное число n (n ≤ 15).'), output: ONE,
      tests: tests(function (i) {
        if (pw) { var a = ri(2, 10), n = i === 7 ? 1 : ri(2, 15), p = 1; for (var k = 0; k < n; k++) p *= a; return { input: a + ' ' + n, output: String(p) }; }
        var m = i === 7 ? 1 : ri(2, 15), f = 1; for (var j = 2; j <= m; j++) f *= j; return { input: String(m), output: String(f) };
      }),
      solution: pw ? 'a, n = map(int, input().split())\np = 1\nfor i in range(n):\n    p = p * a\nprint(p)' : 'n = int(input())\np = 1\nfor i in range(1, n + 1):\n    p = p * i\nprint(p)',
      alt: pw ? 'a = int(input())\nn = int(input())\np = 1\nwhile n > 0:\n    p = p * a\n    n = n - 1\nprint(p)' : 'n = int(input())\np = 1\ni = 1\nwhile i <= n:\n    p = p * i\n    i = i + 1\nprint(p)' });

    // B6. Делители
    var cnt6 = r() < 0.5;
    T.push({ level: 'B', title: cnt6 ? L('Бөлгіштер саны', 'Количество делителей') : L('Бөлгіштердің қосындысы', 'Сумма делителей'),
      text: L('Натурал n саны берілген. Оның барлық натурал бөлгіштерінің (1 мен n-нің өзін қоса) ' + (cnt6 ? 'санын' : 'қосындысын') + ' табыңыз.', 'Дано натуральное число n. Найдите ' + (cnt6 ? 'количество' : 'сумму') + ' всех его натуральных делителей (включая 1 и само n).'),
      input: L('Бір натурал сан n (n ≤ 10000).', 'Одно натуральное число n (n ≤ 10000).'), output: ONE,
      tests: tests(function (i) {
        var n = [1, 12, 13, 36, 97, 100][i] || ri(2, 10000), c = 0, s = 0;
        if (i === 1 || i === 3) n = [12, 36][i === 1 ? 0 : 1] * ri(1, 50);
        for (var d = 1; d <= n; d++) if (n % d === 0) { c++; s += d; }
        return { input: String(n), output: String(cnt6 ? c : s) };
      }),
      solution: 'n = int(input())\nk = 0\nfor d in range(1, n + 1):\n    if n % d == 0:\n        k = k + ' + (cnt6 ? '1' : 'd') + '\nprint(k)',
      alt: 'n = int(input())\nk = 0\nd = 1\nwhile d <= n:\n    if n % d == 0:\n        k = k + ' + (cnt6 ? '1' : 'd') + '\n    d = d + 1\nprint(k)' });

    // B7. Цифры числа (while)
    var v7 = pick(['sum', 'even', 'max']);
    var t7 = L({ sum: 'цифрларының қосындысын', even: 'жазылуындағы жұп цифрлардың санын', max: 'жазылуындағы ең үлкен цифрды' }, { sum: 'сумму его цифр', even: 'количество чётных цифр в его записи', max: 'наибольшую цифру в его записи' })[v7];
    T.push({ level: 'B', title: L('Санның цифрлары', 'Цифры числа'),
      text: L('Натурал n саны берілген. Оның ' + t7 + ' табыңыз. (Кеңес: n % 10 — соңғы цифр, n // 10 — соңғы цифрсыз сан.)', 'Дано натуральное число n. Найдите ' + t7 + '. (Подсказка: n % 10 — последняя цифра, n // 10 — число без последней цифры.)'),
      input: L('Бір натурал сан n (n ≤ 10⁹).', 'Одно натуральное число n (n ≤ 10⁹).'), output: ONE,
      tests: tests(function (i) {
        var n = i === 7 ? ri(1, 9) : ri(10, [999, 99999, 9999999, 999999999][i % 4]);
        var ds = String(n).split('').map(Number);
        var ans = v7 === 'sum' ? sum(ds) : v7 === 'even' ? ds.filter(function (x) { return x % 2 === 0; }).length : Math.max.apply(null, ds);
        return { input: String(n), output: String(ans) };
      }),
      solution: {
        sum: 'n = int(input())\ns = 0\nwhile n > 0:\n    s = s + n % 10\n    n = n // 10\nprint(s)',
        even: 'n = int(input())\nk = 0\nwhile n > 0:\n    if n % 10 % 2 == 0:\n        k = k + 1\n    n = n // 10\nprint(k)',
        max: 'n = int(input())\nm = 0\nwhile n > 0:\n    if n % 10 > m:\n        m = n % 10\n    n = n // 10\nprint(m)'
      }[v7],
      alt: {   // через for: перебираем цифры как символы строки
        sum: 's = 0\nfor c in input():\n    s = s + int(c)\nprint(s)',
        even: 'k = 0\nfor c in input():\n    if int(c) % 2 == 0:\n        k = k + 1\nprint(k)',
        max: 'm = 0\nfor c in input():\n    if int(c) > m:\n        m = int(c)\nprint(m)'
      }[v7] });

    // C8. Числа Фибоначчи
    var last8 = r() < 0.5;
    var fib = function (n) { var a = [1, 1]; while (a.length < n) a.push(a[a.length - 1] + a[a.length - 2]); return a.slice(0, n); };
    T.push({ level: 'C', title: L('Фибоначчи сандары', 'Числа Фибоначчи'),
      text: L('Фибоначчи сандары: алғашқы екеуі 1-ге тең, әр келесісі алдыңғы екеуінің қосындысына тең: 1, 1, 2, 3, 5, 8, … n берілген. ' +
        (last8 ? 'n-ші Фибоначчи санын шығарыңыз.' : 'Алғашқы n Фибоначчи санын бір жолға бос орын арқылы шығарыңыз.'),
        'Числа Фибоначчи: первые два равны 1, каждое следующее равно сумме двух предыдущих: 1, 1, 2, 3, 5, 8, … Дано n. ' +
        (last8 ? 'Выведите n-е число Фибоначчи.' : 'Выведите первые n чисел Фибоначчи в одну строку через пробел.')),
      input: L('Бір натурал сан n (n ≤ 40).', 'Одно натуральное число n (n ≤ 40).'), output: last8 ? ONE : ROW,
      tests: tests(function (i) { var n = [1, 2][i - 6] || ri(3, 40); var f = fib(n); return { input: String(n), output: last8 ? String(f[n - 1]) : f.join(' ') }; }),
      solution: last8 ? 'n = int(input())\na = 1\nb = 1\nfor i in range(n - 1):\n    a, b = b, a + b\nprint(a)'
                      : 'n = int(input())\na = 1\nb = 1\nfor i in range(n):\n    print(a, end=" ")\n    a, b = b, a + b',
      alt: last8 ? 'n = int(input())\na = 1\nb = 1\nk = 1\nwhile k < n:\n    c = a + b\n    a = b\n    b = c\n    k = k + 1\nprint(a)'
                 : 'n = int(input())\na = 1\nb = 1\nk = 0\nwhile k < n:\n    print(a, end=" ")\n    c = a + b\n    a = b\n    b = c\n    k = k + 1' });

    // C9. Ввод до нуля (while)
    var v9 = pick(['sum', 'max', 'count']);
    var t9 = L({ sum: 'Енгізілген сандардың қосындысын', max: 'Енгізілген сандардың ең үлкенін', count: 'Енгізілген сандардың ішіндегі жұп сандардың санын' }, { sum: 'сумму', max: 'наибольшее из', count: 'количество чётных среди' })[v9];
    T.push({ level: 'C', title: L('Нөлге дейін енгізу', 'Ввод до нуля'),
      text: L('Бүтін сандар әрқайсысы жаңа жолдан енгізіледі. Енгізу 0 санымен аяқталады (0-дің өзі есептелмейді). ' + t9 + ' табыңыз (нөлге дейін кемінде бір сан бар).', 'Вводятся целые числа, каждое с новой строки. Ввод заканчивается числом 0 (сам 0 не учитывается). Найдите ' + t9 + ' введённых чисел (до нуля есть хотя бы одно число).'),
      input: L('Бірнеше жол, әр жолда бір бүтін сан; соңғы сан — 0.', 'Несколько строк, в каждой одно целое число; последнее число — 0.'), output: ONE,
      tests: tests(function (i) {
        var a = []; var n = i === 7 ? 1 : ri(2, 10);
        for (var k = 0; k < n; k++) { var v = ri(-50, 99); if (v === 0) v = 7; a.push(v); }
        var ans = v9 === 'sum' ? sum(a) : v9 === 'max' ? Math.max.apply(null, a) : a.filter(function (x) { return x % 2 === 0; }).length;
        return { input: a.concat([0]).join('\n'), output: String(ans) };
      }),
      solution: {
        sum: 's = 0\nx = int(input())\nwhile x != 0:\n    s = s + x\n    x = int(input())\nprint(s)',
        max: 'x = int(input())\nm = x\nwhile x != 0:\n    if x > m:\n        m = x\n    x = int(input())\nprint(m)',
        count: 'k = 0\nx = int(input())\nwhile x != 0:\n    if x % 2 == 0:\n        k = k + 1\n    x = int(input())\nprint(k)'
      }[v9],
      alt: {   // while True + break: проверка на 0 внутри цикла
        sum: 's = 0\nwhile True:\n    x = int(input())\n    if x == 0:\n        break\n    s = s + x\nprint(s)',
        max: 'm = None\nwhile True:\n    x = int(input())\n    if x == 0:\n        break\n    if m == None or x > m:\n        m = x\nprint(m)',
        count: 'k = 0\nwhile True:\n    x = int(input())\n    if x == 0:\n        break\n    if x % 2 == 0:\n        k = k + 1\nprint(k)'
      }[v9] });

    // C10. Пока сумма не превысит n (while)
    var st10 = pick([1, 2]);
    T.push({ level: 'C', title: L('Қосынды n-нен қашан асады', 'Когда сумма превысит n'),
      text: L((st10 === 1 ? '1 + 2 + 3 + …' : '2 + 4 + 6 + …') + ' сандарын ретімен қосамыз. Натурал n саны берілген. Қосынды алғаш рет n-нен үлкен болуы үшін неше қосылғыш алу керек екенін табыңыз.', 'Складываем числа ' + (st10 === 1 ? '1 + 2 + 3 + …' : '2 + 4 + 6 + …') + ' по порядку. Дано натуральное число n. Найдите, сколько слагаемых нужно взять, чтобы сумма впервые стала больше n.'),
      input: L('Бір натурал сан n (n ≤ 10⁶).', 'Одно натуральное число n (n ≤ 10⁶).'), output: ONE,
      tests: tests(function (i) {
        var n = i === 7 ? 1 : ri(2, [50, 1000, 100000, 1000000][i % 4]), s = 0, k = 0;
        while (s <= n) { k++; s += st10 * k; }
        return { input: String(n), output: String(k) };
      }),
      solution: 'n = int(input())\ns = 0\nk = 0\nwhile s <= n:\n    k = k + 1\n    s = s + ' + (st10 === 1 ? 'k' : '2 * k') + '\nprint(k)',
      alt: 'n = int(input())\ns = 0\nfor k in range(1, n + 2):\n    s = s + ' + (st10 === 1 ? 'k' : '2 * k') + '\n    if s > n:\n        print(k)\n        break' });

    return T;
  }

  // Сравнение вывода: скобки, запятые и кавычки не учитываются, пробел и перевод строки равнозначны.
  function tokens(s) { return String(s == null ? '' : s).replace(/[\[\],'"()]/g, ' ').trim().split(/\s+/).filter(Boolean); }
  function sameOutput(got, want) { return tokens(got).join(' ') === tokens(want).join(' '); }

  window.CODE = { generate: generate, sameOutput: sameOutput, tokens: tokens };
})();
