/* Формативтік жұмыс: оқушы Python-да код жазады. 10 тапсырма (шарт, цикл, тізім, жиын).
 * TASKS.generate(seed) → 10 тапсырма: нұсқасы, сандары және тестілері seed-ке байланысты — әр оқушыда әртүрлі.
 * Әр тапсырмада: 2 мысал (оқушы көреді) + 6 жасырын тест. Күтілетін жауапты JS есептейді,
 * ал tools/check-tasks.py оны нағыз Python-дағы үлгі шешіммен (solution) салыстырады. */
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

  var LIST_IN = { kz: 'Бір жолда бос орын арқылы бүтін сандар берілген.', ru: 'В одной строке через пробел записаны целые числа.' };
  var LIST_READ = 'a = list(map(int, input().split()))';

  function generate(seed) {
    var r = rng(seed);
    var ri = function (a, b) { return a + Math.floor(r() * (b - a + 1)); };
    var pick = function (a) { return a[Math.floor(r() * a.length)]; };
    var list = function (n, lo, hi) { var a = []; for (var i = 0; i < n; i++) a.push(ri(lo, hi)); return a; };
    var sortNum = function (a) { return a.slice().sort(function (p, q) { return p - q; }); };
    var uniq = function (a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); };
    // Тестілер: алғашқы 2 — мысалдар, қалған 6 — жасырын
    var tests = function (n, make) { var out = []; for (var i = 0; i < n; i++) out.push(make(i)); return out; };
    var T = [];

    // 1. Шарт: екі санның үлкені / кішісі
    var big = r() < 0.5;
    T.push({ topic: 'if', title: { kz: 'Екі санның ' + (big ? 'үлкені' : 'кішісі'), ru: (big ? 'Большее' : 'Меньшее') + ' из двух чисел' },
      text: { kz: 'Екі бүтін сан берілген. Олардың ' + (big ? 'үлкенін' : 'кішісін') + ' шығарыңыз. Сандар тең болса, сол санды шығарыңыз.',
              ru: 'Даны два целых числа. Выведите ' + (big ? 'большее' : 'меньшее') + ' из них. Если числа равны, выведите это число.' },
      input: { kz: 'Бір жолда бос орын арқылы екі бүтін сан a және b.', ru: 'В одной строке через пробел два целых числа a и b.' },
      output: { kz: 'Бір сан.', ru: 'Одно число.' },
      tests: tests(8, function (i) {
        var a = ri(-50, 50), b = i === 5 ? a : ri(-50, 50);
        return { input: a + ' ' + b, output: String(big ? Math.max(a, b) : Math.min(a, b)) };
      }),
      solution: 'a, b = map(int, input().split())\nif a ' + (big ? '>' : '<') + ' b:\n    print(a)\nelse:\n    print(b)' });

    // 2. Шарт: бөлінгіштік
    var k2 = ri(3, 7);
    T.push({ topic: 'if', title: { kz: k2 + '-ке бөлінгіштік', ru: 'Делимость на ' + k2 },
      text: { kz: 'Натурал n саны берілген. Егер n саны ' + k2 + '-ке қалдықсыз бөлінсе, n // ' + k2 + ' мәнін, әйтпесе n % ' + k2 + ' қалдығын шығарыңыз.',
              ru: 'Дано натуральное число n. Если n делится на ' + k2 + ' без остатка, выведите n // ' + k2 + ', иначе выведите остаток n % ' + k2 + '.' },
      input: { kz: 'Бір натурал сан n (n ≤ 1000).', ru: 'Одно натуральное число n (n ≤ 1000).' },
      output: { kz: 'Бір сан.', ru: 'Одно число.' },
      tests: tests(8, function (i) {
        var n = i % 2 === 0 ? k2 * ri(1, 90) : ri(1, 600);
        return { input: String(n), output: String(n % k2 === 0 ? n / k2 : n % k2) };
      }),
      solution: 'n = int(input())\nif n % ' + k2 + ' == 0:\n    print(n // ' + k2 + ')\nelse:\n    print(n % ' + k2 + ')' });

    // 3. Шарт: бірнеше тармақ (баға)
    var th = pick([[85, 65, 40], [80, 60, 40], [90, 70, 50]]);
    var grade = function (b) { return b >= th[0] ? 5 : b >= th[1] ? 4 : b >= th[2] ? 3 : 2; };
    T.push({ topic: 'if', title: { kz: 'Балл бойынша баға', ru: 'Оценка по баллам' },
      text: { kz: 'Оқушының балы b берілген (0 ≤ b ≤ 100). Егер b ≥ ' + th[0] + ' болса 5, b ≥ ' + th[1] + ' болса 4, b ≥ ' + th[2] + ' болса 3, әйтпесе 2 шығарыңыз.',
              ru: 'Дан балл ученика b (0 ≤ b ≤ 100). Если b ≥ ' + th[0] + ', выведите 5, если b ≥ ' + th[1] + ' — 4, если b ≥ ' + th[2] + ' — 3, иначе 2.' },
      input: { kz: 'Бір бүтін сан b.', ru: 'Одно целое число b.' },
      output: { kz: 'Бір сан — баға.', ru: 'Одно число — оценка.' },
      tests: tests(8, function (i) {
        var b = [ri(th[0], 100), ri(th[1], th[0] - 1), ri(th[2], th[1] - 1), ri(0, th[2] - 1), th[0], th[1], th[2], th[2] - 1][i];
        return { input: String(b), output: String(grade(b)) };
      }),
      solution: 'b = int(input())\nif b >= ' + th[0] + ':\n    print(5)\nelif b >= ' + th[1] + ':\n    print(4)\nelif b >= ' + th[2] + ':\n    print(3)\nelse:\n    print(2)' });

    // 4. for циклі: еселі сандардың қосындысы
    var k4 = ri(2, 9);
    T.push({ topic: 'for', title: { kz: k4 + '-ке еселі сандар', ru: 'Числа, кратные ' + k4 },
      text: { kz: '1-ден n-ге дейінгі (n-ді қоса) ' + k4 + '-ке еселі барлық сандардың қосындысын табыңыз.',
              ru: 'Найдите сумму всех чисел от 1 до n включительно, которые делятся на ' + k4 + '.' },
      input: { kz: 'Бір натурал сан n (n ≤ 10000).', ru: 'Одно натуральное число n (n ≤ 10000).' },
      output: { kz: 'Бір сан — қосынды.', ru: 'Одно число — сумма.' },
      tests: tests(8, function (i) {
        var n = i === 7 ? 1 : ri(k4, 300 * (i + 1)), s = 0;
        for (var x = 1; x <= n; x++) if (x % k4 === 0) s += x;
        return { input: String(n), output: String(s) };
      }),
      solution: 'n = int(input())\ns = 0\nfor i in range(1, n + 1):\n    if i % ' + k4 + ' == 0:\n        s = s + i\nprint(s)' });

    // 5. for циклі: қадаммен шығару
    var d5 = ri(2, 5), down = r() < 0.5;
    T.push({ topic: 'for', title: { kz: 'Қадамы ' + d5 + ' сандар', ru: 'Числа с шагом ' + d5 },
      text: down
        ? { kz: 'Екі бүтін сан a және b берілген (a > b). a санынан бастап, ' + d5 + ' қадаммен кемитін, b-дан кіші емес барлық сандарды бір жолға бос орын арқылы шығарыңыз.',
            ru: 'Даны два целых числа a и b (a > b). Выведите в одну строку через пробел все числа, начиная с a, с шагом −' + d5 + ', не меньшие b.' }
        : { kz: 'Екі бүтін сан a және b берілген (a < b). a санынан бастап, ' + d5 + ' қадаммен өсетін, b-дан аспайтын барлық сандарды бір жолға бос орын арқылы шығарыңыз.',
            ru: 'Даны два целых числа a и b (a < b). Выведите в одну строку через пробел все числа, начиная с a, с шагом ' + d5 + ', не больше b.' },
      input: { kz: 'Бір жолда бос орын арқылы екі бүтін сан a және b.', ru: 'В одной строке через пробел два целых числа a и b.' },
      output: { kz: 'Сандар бір жолда, бос орын арқылы.', ru: 'Числа в одной строке через пробел.' },
      tests: tests(8, function () {
        var a = ri(-20, 30), b = down ? a - ri(d5, 40) : a + ri(d5, 40), out = [];
        for (var x = a; down ? x >= b : x <= b; x += down ? -d5 : d5) out.push(x);
        return { input: a + ' ' + b, output: out.join(' ') };
      }),
      solution: 'a, b = map(int, input().split())\nfor i in range(a, b ' + (down ? '- 1, -' : '+ 1, ') + d5 + '):\n    print(i, end=\' \')' });

    // 6. while циклі: цифрлар
    var v6 = pick(['sum', 'count', 'digit']), dg = ri(1, 9);
    var digitsOf = function (n) { return String(n).split('').map(Number); };
    var t6 = {
      sum: { kz: 'Натурал n санының цифрларының қосындысын шығарыңыз.', ru: 'Выведите сумму цифр натурального числа n.' },
      count: { kz: 'Натурал n санында неше цифр бар екенін шығарыңыз.', ru: 'Выведите, сколько цифр в натуральном числе n.' },
      digit: { kz: 'Натурал n санының жазылуында ' + dg + ' цифры неше рет кездесетінін шығарыңыз.', ru: 'Выведите, сколько раз цифра ' + dg + ' встречается в записи натурального числа n.' }
    }[v6];
    T.push({ topic: 'while', title: { kz: 'Санның цифрлары', ru: 'Цифры числа' },
      text: { kz: t6.kz + ' (Кеңес: n % 10 — соңғы цифр, n // 10 — соңғы цифрсыз сан.)', ru: t6.ru + ' (Подсказка: n % 10 — последняя цифра, n // 10 — число без последней цифры.)' },
      input: { kz: 'Бір натурал сан n (n ≤ 10⁹).', ru: 'Одно натуральное число n (n ≤ 10⁹).' },
      output: { kz: 'Бір сан.', ru: 'Одно число.' },
      tests: tests(8, function (i) {
        var n = i === 7 ? dg : ri(1, [99, 9999, 999999, 999999999][i % 4]);
        if (v6 === 'digit' && i % 3 === 0) n = Number(String(ri(1, 99999)) + dg + dg);
        var ds = digitsOf(n);
        var ans = v6 === 'sum' ? ds.reduce(function (p, q) { return p + q; }, 0) : v6 === 'count' ? ds.length : ds.filter(function (x) { return x === dg; }).length;
        return { input: String(n), output: String(ans) };
      }),
      solution: {
        sum: 'n = int(input())\ns = 0\nwhile n > 0:\n    s = s + n % 10\n    n = n // 10\nprint(s)',
        count: 'n = int(input())\nk = 0\nwhile n > 0:\n    k = k + 1\n    n = n // 10\nprint(k)',
        digit: 'n = int(input())\nk = 0\nwhile n > 0:\n    if n % 10 == ' + dg + ':\n        k = k + 1\n    n = n // 10\nprint(k)'
      }[v6] });

    // 7. Тізім: шектен үлкендер
    var k7 = ri(-5, 20), sum7 = r() < 0.5;
    T.push({ topic: 'list', title: { kz: k7 + '-ден үлкен элементтер', ru: 'Элементы больше ' + k7 },
      text: { kz: 'Тізімдегі ' + k7 + '-ден үлкен элементтердің ' + (sum7 ? 'қосындысын' : 'санын') + ' шығарыңыз.',
              ru: 'Выведите ' + (sum7 ? 'сумму' : 'количество') + ' элементов списка, которые больше ' + k7 + '.' },
      input: LIST_IN, output: { kz: 'Бір сан.', ru: 'Одно число.' },
      tests: tests(8, function (i) {
        var a = list(ri(1, 12), -30, 50);
        if (i === 7) a = [k7];
        var b = a.filter(function (x) { return x > k7; });
        return { input: a.join(' '), output: String(sum7 ? b.reduce(function (p, q) { return p + q; }, 0) : b.length) };
      }),
      solution: LIST_READ + '\nk = 0\nfor x in a:\n    if x > ' + k7 + ':\n        k = k + ' + (sum7 ? 'x' : '1') + '\nprint(k)' });

    // 8. Тізім: ең үлкен / ең кіші элемент және оның индексі
    var mx = r() < 0.5;
    T.push({ topic: 'list', title: { kz: 'Ең ' + (mx ? 'үлкен' : 'кіші') + ' элемент', ru: (mx ? 'Наибольший' : 'Наименьший') + ' элемент' },
      text: { kz: 'Тізімнің ең ' + (mx ? 'үлкен' : 'кіші') + ' элементін және оның алғаш кездескен индексін (0-ден бастап санағанда) бос орын арқылы шығарыңыз.',
              ru: 'Выведите через пробел ' + (mx ? 'наибольший' : 'наименьший') + ' элемент списка и индекс его первого вхождения (нумерация с 0).' },
      input: LIST_IN, output: { kz: 'Екі сан: элемент және индекс.', ru: 'Два числа: элемент и индекс.' },
      tests: tests(8, function (i) {
        var a = list(ri(1, 10), -40, 40);
        if (i === 1) { var e = mx ? Math.max.apply(null, a) : Math.min.apply(null, a); a.push(e); }
        var m = mx ? Math.max.apply(null, a) : Math.min.apply(null, a);
        return { input: a.join(' '), output: m + ' ' + a.indexOf(m) };
      }),
      solution: LIST_READ + '\nm = ' + (mx ? 'max' : 'min') + '(a)\nprint(m, a.index(m))' });

    // 9. Жиын: қайталанбайтын сандар
    var cnt9 = r() < 0.5;
    T.push({ topic: 'set', title: { kz: 'Әртүрлі сандар', ru: 'Различные числа' },
      text: cnt9
        ? { kz: 'Тізімде неше әртүрлі сан бар екенін шығарыңыз.', ru: 'Выведите, сколько различных чисел в списке.' }
        : { kz: 'Тізімдегі барлық әртүрлі сандарды өсу ретімен, әрқайсысын бір рет, бос орын арқылы шығарыңыз.', ru: 'Выведите через пробел все различные числа списка в порядке возрастания, каждое по одному разу.' },
      input: LIST_IN, output: cnt9 ? { kz: 'Бір сан.', ru: 'Одно число.' } : { kz: 'Сандар бір жолда, бос орын арқылы.', ru: 'Числа в одной строке через пробел.' },
      tests: tests(8, function () {
        var a = list(ri(1, 14), 0, 9), u = sortNum(uniq(a));
        return { input: a.join(' '), output: cnt9 ? String(u.length) : u.join(' ') };
      }),
      solution: LIST_READ + (cnt9 ? '\nprint(len(set(a)))' : '\nprint(*sorted(set(a)))') });

    // 10. Жиын: екі тізім
    var common = r() < 0.5;
    T.push({ topic: 'set', title: { kz: common ? 'Ортақ сандар' : 'Тек бірінші тізімде', ru: common ? 'Общие числа' : 'Только в первом списке' },
      text: common
        ? { kz: 'Екі тізімнің екеуінде де кездесетін сандарды өсу ретімен, әрқайсысын бір рет, бос орын арқылы шығарыңыз. Ондай сан жоқ болса, ештеңе шығармаңыз.',
            ru: 'Выведите через пробел в порядке возрастания числа, которые встречаются в обоих списках, каждое по одному разу. Если таких нет, ничего не выводите.' }
        : { kz: 'Бірінші тізімде бар, ал екінші тізімде жоқ сандарды өсу ретімен, әрқайсысын бір рет, бос орын арқылы шығарыңыз. Ондай сан жоқ болса, ештеңе шығармаңыз.',
            ru: 'Выведите через пробел в порядке возрастания числа, которые есть в первом списке, но отсутствуют во втором, каждое по одному разу. Если таких нет, ничего не выводите.' },
      input: { kz: 'Екі жол: әр жолда бос орын арқылы бүтін сандар (бірінші және екінші тізім).', ru: 'Две строки: в каждой через пробел целые числа (первый и второй список).' },
      output: { kz: 'Сандар бір жолда, бос орын арқылы.', ru: 'Числа в одной строке через пробел.' },
      tests: tests(8, function (i) {
        var a, b, res;
        do {                                   // мысалдарда жауап бос болмайды
          a = list(ri(1, 10), 0, 12); b = list(ri(1, 10), 0, 12);
          if (i === 7) b = a.slice();
          res = sortNum(uniq(a.filter(function (x) { return common ? b.indexOf(x) >= 0 : b.indexOf(x) < 0; })));
        } while (i < 2 && !res.length);
        return { input: a.join(' ') + '\n' + b.join(' '), output: res.join(' ') };
      }),
      solution: 'a = set(map(int, input().split()))\nb = set(map(int, input().split()))\nprint(*sorted(a ' + (common ? '&' : '-') + ' b))' });

    return T;
  }

  // Шығысты салыстыру: жақшалар, үтірлер және тырнақшалар есепке алынбайды, бос орын мен жол ауысуы бірдей.
  // Сондықтан print(a), print(*a) және әр санды жеке жолға шығару бірдей бағаланады.
  function tokens(s) {
    return String(s == null ? '' : s).replace(/[\[\],'"()]/g, ' ').trim().split(/\s+/).filter(Boolean);
  }
  function sameOutput(got, want) { return tokens(got).join(' ') === tokens(want).join(' '); }

  window.TASKS = { generate: generate, sameOutput: sameOutput, tokens: tokens };
})();
