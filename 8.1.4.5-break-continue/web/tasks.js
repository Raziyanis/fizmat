/* 10 олимпиадалық есеп / 10 олимпиадных задач: 8.1.4.5 — break, continue, else (циклді басқару нұсқаулары).
 * Уровни: A (1–4), B (5–7), C (8–10) — от простого к сложному.
 * CODE.generate(seed, lang) → 10 задач. Варианты, числа и тесты зависят от seed — у каждого ученика свои.
 * В каждой задаче 8 тестов: 2 примера (видны ученику) + 6 скрытых. Ожидаемый ответ считает JS,
 * а tools/check.py сверяет его с образцом решения (solution), выполненным настоящим Python.
 * need — какие инструкции обязательно должны быть в программе: 'break', 'continue', 'else' (else цикла for/while).
 * Без них задача не засчитывается, даже если все тесты пройдены: цель урока — научиться ими пользоваться. */
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
    var nz = function (a, b) { var v = 0; while (v === 0) v = ri(a, b); return v; };
    var T = [];

    // ---------- A1. Нөлге дейін енгізу / Ввод до нуля — while True + break ----------
    var v1 = pick(['sum', 'even']);
    T.push({ level: 'A', need: ['break'],
      title: L('Нөлге дейін', 'До нуля'),
      text: L('Бүтін сандар әрқайсысы жаңа жолдан енгізіледі. Енгізу 0 санымен аяқталады (0-дің өзі есептелмейді). ' +
          (v1 === 'sum' ? 'Енгізілген сандардың қосындысын табыңыз.' : 'Енгізілген сандардың ішінде неше жұп сан бар екенін табыңыз.') +
          ' 0 келгенде циклды break арқылы тоқтатыңыз.',
        'Вводятся целые числа, каждое с новой строки. Ввод заканчивается числом 0 (сам 0 не учитывается). ' +
          (v1 === 'sum' ? 'Найдите сумму введённых чисел.' : 'Найдите, сколько среди введённых чисел чётных.') +
          ' Когда встретится 0, остановите цикл инструкцией break.'),
      input: L('Бірнеше жол, әр жолда бір бүтін сан (|x| ≤ 100); соңғы сан — 0. Сандар саны 0-ді қоспағанда 0-ден 20-ға дейін.',
        'Несколько строк, в каждой одно целое число (|x| ≤ 100); последнее число — 0. Чисел до нуля — от 0 до 20.'),
      output: L('Бір сан.', 'Одно число.'),
      tests: tests(function (i) {
        var a = [], n = i === 7 ? 0 : ri(1, 10);
        for (var k = 0; k < n; k++) a.push(nz(-50, 99));
        return { input: a.concat([0]).join('\n'), output: String(v1 === 'sum' ? sum(a) : a.filter(function (x) { return x % 2 === 0; }).length) };
      }),
      solution: 's = 0\nwhile True:\n    x = int(input())\n    if x == 0:\n        break\n' +
        (v1 === 'sum' ? '    s = s + x\n' : '    if x % 2 == 0:\n        s = s + 1\n') + 'print(s)' });

    // ---------- A2. Өткізіп жіберу / Пропуск чисел — continue ----------
    var v2 = pick(['mult', 'end']);
    T.push({ level: 'A', need: ['continue'],
      title: v2 === 'mult' ? L('k-ға еселіктерсіз', 'Без кратных k') : L('k цифрымен аяқталатындарсыз', 'Без оканчивающихся на k'),
      text: L('n және k сандары берілген. 1-ден n-ге дейінгі барлық сандарды бір жолға бос орын арқылы шығарыңыз, тек ' +
          (v2 === 'mult' ? 'k-ға бөлінетін' : 'k цифрымен аяқталатын') + ' сандарды өткізіп жіберіңіз. Ондай санды continue арқылы өткізіңіз.',
        'Даны числа n и k. Выведите в одну строку через пробел все числа от 1 до n, кроме чисел, ' +
          (v2 === 'mult' ? 'которые делятся на k' : 'которые оканчиваются цифрой k') + '. Такие числа пропускайте инструкцией continue.'),
      input: L('Бір жолда бос орын арқылы n және k (10 ≤ n ≤ 100, ' + (v2 === 'mult' ? '2 ≤ k ≤ 9' : '0 ≤ k ≤ 9') + ').',
        'В одной строке через пробел n и k (10 ≤ n ≤ 100, ' + (v2 === 'mult' ? '2 ≤ k ≤ 9' : '0 ≤ k ≤ 9') + ').'),
      output: L('Сандар бір жолда, бос орын арқылы.', 'Числа в одной строке через пробел.'),
      tests: tests(function () {
        var n = ri(10, 40), k = v2 === 'mult' ? ri(2, 9) : ri(0, 9), o = [];
        for (var x = 1; x <= n; x++) if (!(v2 === 'mult' ? x % k === 0 : x % 10 === k)) o.push(x);
        return { input: n + ' ' + k, output: o.join(' ') };
      }),
      solution: 'n, k = map(int, input().split())\nfor i in range(1, n + 1):\n    if ' + (v2 === 'mult' ? 'i % k == 0' : 'i % 10 == k') +
        ':\n        continue\n    print(i, end=" ")' });

    // ---------- A3. Бірінші … / Первое … — for + break + else ----------
    var v3 = pick(['neg', 'even']);
    var w3 = L(v3 === 'neg' ? 'теріс' : 'жұп', v3 === 'neg' ? 'отрицательное' : 'чётное');
    T.push({ level: 'A', need: ['break', 'else'],
      title: L('Бірінші ' + w3 + ' сан', 'Первое ' + w3 + ' число'),
      text: L('n бүтін сан берілген. Олардың ішіндегі бірінші ' + w3 + ' санды шығарыңыз. Ондай сан жоқ болса, NO сөзін шығарыңыз. ' +
          'Санды тапқанда циклды break арқылы тоқтатыңыз, ал «табылмады» жағдайын циклдың else бөлігінде жазыңыз (for … else).',
        'Даны n целых чисел. Выведите первое ' + w3 + ' число среди них. Если такого числа нет, выведите слово NO. ' +
          'Найдя число, остановите цикл инструкцией break, а случай «не найдено» запишите в части else цикла (for … else).'),
      input: L('Бірінші жолда n (1 ≤ n ≤ 20). Екінші жолда бос орын арқылы n бүтін сан (|x| ≤ 100).',
        'В первой строке n (1 ≤ n ≤ 20). Во второй строке через пробел n целых чисел (|x| ≤ 100).'),
      output: L('Бір сан немесе NO сөзі.', 'Одно число или слово NO.'),
      tests: tests(function (i) {
        var good = function (x) { return v3 === 'neg' ? x < 0 : x % 2 === 0; };
        var n = i === 7 ? 1 : ri(3, 12), a = [], none = i === 1 || i === 5 || (i === 7 && r() < 0.5);
        for (var k = 0; k < n; k++) {
          var x = nz(-30, 30);
          if (none) x = v3 === 'neg' ? Math.abs(x) : (Math.abs(x) % 2 === 0 ? x + 1 : x);
          a.push(x);
        }
        if (!none) { var p = ri(0, n - 1); a[p] = v3 === 'neg' ? -ri(1, 30) : 2 * nz(-15, 15); }
        var f = a.filter(good);
        return { input: n + '\n' + a.join(' '), output: f.length ? String(f[0]) : 'NO' };
      }),
      solution: 'n = int(input())\na = list(map(int, input().split()))\nfor x in a:\n    if ' + (v3 === 'neg' ? 'x < 0' : 'x % 2 == 0') +
        ':\n        print(x)\n        break\nelse:\n    print("NO")' });

    // ---------- A4. Жай сан / Простое число — for + break + else ----------
    T.push({ level: 'A', need: ['break', 'else'],
      title: L('Жай сан ба?', 'Простое ли число?'),
      text: L('Натурал n саны берілген. n жай сан болса (тек 1-ге және өзіне бөлінсе), YES, әйтпесе NO шығарыңыз. ' +
          'Бөлгіш табылғанда циклды break арқылы тоқтатыңыз; бөлгіш табылмаса, YES циклдың else бөлігінде шығарылады.',
        'Дано натуральное число n. Выведите YES, если n — простое число (делится только на 1 и на себя), иначе NO. ' +
          'Найдя делитель, остановите цикл инструкцией break; если делитель не найден, YES выводится в части else цикла.'),
      input: L('Бір натурал сан n (2 ≤ n ≤ 10000).', 'Одно натуральное число n (2 ≤ n ≤ 10000).'),
      output: L('YES немесе NO.', 'YES или NO.'),
      tests: tests(function (i) {
        var n;
        if (i === 0 || i === 6) { do n = ri(10, 10000); while (!isPrime(n)); }
        else if (i === 1) { do n = ri(10, 10000); while (isPrime(n)); }
        else if (i === 2) n = 2;
        else if (i === 3) n = pick([49, 121, 169, 289, 361, 529, 841, 961, 1369, 9409]);
        else if (i === 7) n = pick([9973, 9967, 9949, 7919, 8191]);
        else n = ri(2, 10000);
        return { input: String(n), output: isPrime(n) ? 'YES' : 'NO' };
      }),
      solution: 'n = int(input())\nfor d in range(2, n):\n    if n % d == 0:\n        print("NO")\n        break\nelse:\n    print("YES")' });

    // ---------- B5. Сатып алу / Покупки — break ----------
    T.push({ level: 'B', need: ['break'],
      title: L('Сатып алу', 'Покупки'),
      text: L('Сатып алушыда S теңге бар. Тізімде n тауар, олардың бағалары ретімен берілген. Ол тауарларды тек ретімен сатып алады: ' +
          'кезекті тауардың бағасы қалған ақшадан көп болса, сатып алуды тоқтатады (келесі тауарлар қарастырылмайды). ' +
          'Сатып алынған тауарлар санын және қалған ақшаны шығарыңыз.',
        'У покупателя S тенге. В списке n товаров, их цены даны по порядку. Он покупает товары строго по порядку: ' +
          'как только очередной товар стоит больше, чем осталось денег, покупки прекращаются (следующие товары не рассматриваются). ' +
          'Выведите количество купленных товаров и оставшиеся деньги.'),
      input: L('Бірінші жолда S және n (1 ≤ S ≤ 1000, 1 ≤ n ≤ 20). Екінші жолда бос орын арқылы n баға (1-ден 200-ге дейін).',
        'В первой строке S и n (1 ≤ S ≤ 1000, 1 ≤ n ≤ 20). Во второй строке через пробел n цен (от 1 до 200).'),
      output: L('Екі сан бос орын арқылы: тауарлар саны және қалған ақша.', 'Два числа через пробел: количество товаров и остаток денег.'),
      tests: tests(function (i) {
        var s = ri(50, 500), n = ri(3, 10), a = [];
        for (var k = 0; k < n; k++) a.push(ri(5, 120));
        if (i === 2) a[0] = s + ri(1, 50);                                    // первый товар уже не по карману
        if (i === 6) { s = sum(a) + ri(0, 30); }                               // хватает на всё
        if (i === 1 || i === 4) {                                                  // после «стоп» идёт дешёвый товар: его покупать уже нельзя
          var c = 0, m = 0; while (m < n && c + a[m] <= s) { c += a[m]; m++; }
          if (m < n - 1) a[m + 1] = 1;
        }
        var left = s, cnt = 0;
        for (var j = 0; j < n; j++) { if (a[j] > left) break; left -= a[j]; cnt++; }
        return { input: s + ' ' + n + '\n' + a.join(' '), output: cnt + ' ' + left };
      }),
      solution: 's, n = map(int, input().split())\na = list(map(int, input().split()))\nk = 0\nfor p in a:\n    if p > s:\n        break\n    s = s - p\n    k = k + 1\nprint(k, s)' });

    // ---------- B6. Датчик — continue + break ----------
    T.push({ level: 'B', need: ['continue', 'break'],
      title: L('Датчик көрсеткіштері', 'Показания датчика'),
      text: L('Датчик көрсеткіштерді жібереді — бүтін сандар, әрқайсысы жаңа жолдан. Жіберу 0 санымен аяқталады. ' +
          'Теріс сандар — датчиктің ақауы, оларды continue арқылы өткізіп жіберіңіз. Оң сандардың санын және қосындысын шығарыңыз.',
        'Датчик передаёт показания — целые числа, каждое с новой строки. Передача заканчивается числом 0. ' +
          'Отрицательные числа — это сбой датчика, пропускайте их инструкцией continue. Выведите количество и сумму положительных чисел.'),
      input: L('Бірнеше жол, әр жолда бір бүтін сан (|x| ≤ 100); соңғы сан — 0.', 'Несколько строк, в каждой одно целое число (|x| ≤ 100); последнее число — 0.'),
      output: L('Екі сан бос орын арқылы: оң сандардың саны және қосындысы.', 'Два числа через пробел: количество и сумма положительных чисел.'),
      tests: tests(function (i) {
        var n = ri(2, 12), a = [];
        for (var k = 0; k < n; k++) a.push(i === 7 ? -ri(1, 40) : nz(-40, 60));
        if (i === 0) a[0] = -ri(1, 40);
        var pos = a.filter(function (x) { return x > 0; });
        return { input: a.concat([0]).join('\n'), output: pos.length + ' ' + sum(pos) };
      }),
      solution: 'k = 0\ns = 0\nwhile True:\n    x = int(input())\n    if x == 0:\n        break\n    if x < 0:\n        continue\n    k = k + 1\n    s = s + x\nprint(k, s)' });

    // ---------- B7. PIN-код — for + break + else ----------
    T.push({ level: 'B', need: ['break', 'else'],
      title: L('PIN-код', 'PIN-код'),
      text: L('Банкомат PIN-кодты тексереді. Пайдаланушы кодтарды бір-бірден енгізеді. Код дұрыс болса, банкомат әрекеттің нөмірін шығарады ' +
          'және қалған кодтарды тексермейді (break). n әрекеттің ешқайсысы дұрыс болмаса, карта бұғатталады — BLOCKED шығарыңыз (циклдың else бөлігі).',
        'Банкомат проверяет PIN-код. Пользователь вводит коды по одному. Если код верный, банкомат выводит номер попытки ' +
          'и остальные коды не проверяет (break). Если ни одна из n попыток не верна, карта блокируется — выведите BLOCKED (часть else цикла).'),
      input: L('Бірінші жолда — дұрыс PIN-код (төрт таңбалы сан). Екінші жолда — әрекеттер саны n (1 ≤ n ≤ 5). Әрі қарай n жол — пайдаланушы енгізген кодтар.',
        'В первой строке — верный PIN-код (четырёхзначное число). Во второй — число попыток n (1 ≤ n ≤ 5). Далее n строк — коды, которые ввёл пользователь.'),
      output: L('Бірінші дұрыс әрекеттің нөмірі немесе BLOCKED сөзі.', 'Номер первой верной попытки или слово BLOCKED.'),
      tests: tests(function (i) {
        var pin = ri(1000, 9999), n = i === 7 ? 1 : ri(2, 5), a = [];
        for (var k = 0; k < n; k++) { var x; do x = ri(1000, 9999); while (x === pin); a.push(x); }
        var ok = !(i === 1 || i === 4);
        if (ok) { var p = i === 7 ? 0 : ri(0, n - 1); a[p] = pin; if (i === 3 && p < n - 1) a[n - 1] = pin; }
        var at = a.indexOf(pin);
        return { input: pin + '\n' + n + '\n' + a.join('\n'), output: at >= 0 ? String(at + 1) : 'BLOCKED' };
      }),
      solution: 'pin = int(input())\nn = int(input())\nfor i in range(1, n + 1):\n    x = int(input())\n    if x == pin:\n        print(i)\n        break\nelse:\n    print("BLOCKED")' });

    // ---------- C8. d цифрынсыз / Без цифры d — continue ----------
    T.push({ level: 'C', need: ['continue'],
      title: L('d цифрынсыз сандар', 'Числа без цифры d'),
      text: L('a, b сандары және d цифры берілген. a-дан b-ге дейінгі (екеуін де қоса) сандардың ішінен жазылуында d цифры жоқ сандарды ' +
          'бір жолға бос орын арқылы шығарыңыз. d цифры бар санды continue арқылы өткізіп жіберіңіз.',
        'Даны числа a, b и цифра d. Выведите в одну строку через пробел все числа от a до b включительно, в записи которых нет цифры d. ' +
          'Число, в котором есть цифра d, пропускайте инструкцией continue.'),
      input: L('Бір жолда бос орын арқылы a, b, d (1 ≤ a ≤ b ≤ 500, b − a ≤ 60, 0 ≤ d ≤ 9).', 'В одной строке через пробел a, b, d (1 ≤ a ≤ b ≤ 500, b − a ≤ 60, 0 ≤ d ≤ 9).'),
      output: L('Сандар бір жолда, бос орын арқылы (кемінде бір сан бар).', 'Числа в одной строке через пробел (хотя бы одно число есть).'),
      tests: tests(function (i) {
        for (;;) {
          var a = ri(1, 430), b = a + ri(8, 60), d = i === 2 ? 0 : ri(0, 9), o = [], skipped = 0;
          for (var x = a; x <= b; x++) { if (String(x).indexOf(String(d)) >= 0) skipped++; else o.push(x); }
          if (o.length && skipped) return { input: a + ' ' + b + ' ' + d, output: o.join(' ') };
        }
      }),
      solution: 'a, b, d = map(int, input().split())\nfor i in range(a, b + 1):\n    x = i\n    has = False\n    while x > 0:\n        if x % 10 == d:\n            has = True\n        x = x // 10\n    if has:\n        continue\n    print(i, end=" ")' });

    // ---------- C9. Жақын жай сан / Ближайшее простое — while True + for … else + break ----------
    var up = r() < 0.5;
    T.push({ level: 'C', need: ['break', 'else'],
      title: up ? L('n-нен кіші емес жай сан', 'Простое не меньше n') : L('n-нен үлкен емес жай сан', 'Простое не больше n'),
      text: L('Натурал n саны берілген. ' + (up ? 'n-нен кіші емес ең кіші' : 'n-нен үлкен емес ең үлкен') + ' жай санды табыңыз. ' +
          'Кеңес: сыртқы цикл сандарды кезекпен қарайды, ішкі for циклы бөлгіш іздейді (табылса — break); бөлгіш табылмаса, ' +
          'ішкі циклдың else бөлігінде жауапты шығарып, сыртқы циклды да break арқылы тоқтатыңыз.',
        'Дано натуральное число n. Найдите ' + (up ? 'наименьшее простое число, не меньшее n' : 'наибольшее простое число, не большее n') + '. ' +
          'Подсказка: внешний цикл перебирает числа, внутренний for ищет делитель (нашёл — break); если делителя нет, ' +
          'в части else внутреннего цикла выведите ответ и остановите внешний цикл тоже инструкцией break.'),
      input: L('Бір натурал сан n (' + (up ? '1' : '2') + ' ≤ n ≤ 10000).', 'Одно натуральное число n (' + (up ? '1' : '2') + ' ≤ n ≤ 10000).'),
      output: L('Бір сан.', 'Одно число.'),
      tests: tests(function (i) {
        var n;
        if (i === 7) n = up ? 1 : 2;
        else if (i === 2) { do n = ri(100, 10000); while (!isPrime(n)); }
        else if (i === 5) n = up ? pick([9974, 9990, 9999, 10000]) : pick([9999, 10000, 9990]);
        else n = ri(4, 10000);
        var x = Math.max(n, 2);
        while (!isPrime(x)) x += up ? 1 : -1;
        return { input: String(n), output: String(x) };
      }),
      solution: 'n = int(input())\nx = n\n' + (up ? 'if x < 2:\n    x = 2\n' : '') +
        'while True:\n    for d in range(2, x):\n        if x % d == 0:\n            break\n    else:\n        print(x)\n        break\n    x = x ' + (up ? '+' : '-') + ' 1' });

    // ---------- C10. Қосындысы S жұп / Пара с суммой S — вложенные циклы + break ----------
    T.push({ level: 'C', need: ['break'],
      title: L('Қосындысы S болатын жұп', 'Пара с суммой S'),
      text: L('n саннан тұратын тізім және S саны берілген. Қосындысы S-ке тең, нөмірлері i < j болатын екі санды табыңыз. ' +
          'Ондай жұп бірнешеу болса, i ең кіші жұпты, i бірдей болса — j ең кішісін шығарыңыз. Нөмірлеу 1-ден басталады. Жұп жоқ болса, NO шығарыңыз. ' +
          'Жұп табылғанда екі циклды да break арқылы тоқтатыңыз.',
        'Дан список из n чисел и число S. Найдите два числа с номерами i < j, сумма которых равна S. ' +
          'Если таких пар несколько, выведите пару с наименьшим i, а при равных i — с наименьшим j. Нумерация с 1. Если пары нет, выведите NO. ' +
          'Найдя пару, остановите оба цикла инструкцией break.'),
      input: L('Бірінші жолда n және S (2 ≤ n ≤ 20, 2 ≤ S ≤ 200). Екінші жолда бос орын арқылы n натурал сан (100-ден аспайды).',
        'В первой строке n и S (2 ≤ n ≤ 20, 2 ≤ S ≤ 200). Во второй строке через пробел n натуральных чисел (не больше 100).'),
      output: L('i және j нөмірлері бос орын арқылы немесе NO сөзі.', 'Номера i и j через пробел или слово NO.'),
      tests: tests(function (i) {
        var n = i === 7 ? 2 : ri(4, 12), a = [], k;
        for (k = 0; k < n; k++) a.push(ri(1, 50));
        var find = function (s) { for (var x = 0; x < n; x++) for (var y = x + 1; y < n; y++) if (a[x] + a[y] === s) return [x + 1, y + 1]; return null; };
        var s;
        if (i === 1 || i === 5) { var tries = 0; do s = ri(2, 100); while (find(s) && ++tries < 300); if (find(s)) s = ri(101, 200); }
        else { var p = ri(0, n - 2), q = ri(p + 1, n - 1); s = a[p] + a[q]; }
        var f = find(s);
        return { input: n + ' ' + s + '\n' + a.join(' '), output: f ? f.join(' ') : 'NO' };
      }),
      solution: 'n, s = map(int, input().split())\na = list(map(int, input().split()))\nfound = False\nfor i in range(n):\n    for j in range(i + 1, n):\n        if a[i] + a[j] == s:\n            print(i + 1, j + 1)\n            found = True\n            break\n    if found:\n        break\nif not found:\n    print("NO")' });

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
