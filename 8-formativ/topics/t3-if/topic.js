/* Тема 3. Условный оператор if, вложенный if (8.1.2.4). */
window.TOPIC = {
  id: 't3-if', file: 'formativ-3-shart-operatory.html',
  title: { kz: 'Шартты оператор if, кірістірілген if', ru: 'Условный оператор if, вложенный if' },
  goal: { kz: '8.1.2.4 — программаның логикасын басқару үшін шартты және кірістірілген құрылымдарды қолдану', ru: '8.1.2.4 — использовать условные и вложенные конструкции для управления логикой программы' },
  generate: function (seed, lang, H) {
    var L = H.L, ri = H.ri, pick = H.pick, T = [];
    var Q = L('Программа не шығарады?', 'Что выведет программа?');

    var x1 = ri(1, 20), y1 = ri(1, 20); if (x1 === y1) y1++;
    var c1 = 'x = ' + x1 + '\ny = ' + y1 + '\nif x > y:\n    print(x - y)\nelse:\n    print(y - x)';
    T.push(H.quiz({ level: 'A', title: L('if … else', 'if … else'), text: Q, code: c1, check: { code: c1 } },
      String(Math.abs(x1 - y1)), [String(x1 - y1 === Math.abs(x1 - y1) ? y1 - x1 : x1 - y1), String(x1 + y1), String(Math.max(x1, y1))]));

    var a2 = pick([-6, -3, 0, 4, 7, 10, 15, -8]);
    var c2 = 'a = ' + a2 + '\nif a > 0:\n    if a % 2 == 0:\n        print("P")\n    else:\n        print("Q")\nelse:\n    print("R")';
    T.push(H.quiz({ level: 'A', title: L('Кірістірілген if', 'Вложенный if'), text: Q, code: c2, check: { code: c2 } },
      a2 > 0 ? (a2 % 2 === 0 ? 'P' : 'Q') : 'R', ['P', 'Q', 'R', 'PQ']));

    var x3 = ri(-15, -1), c3 = 'x = ' + x3 + '\nif x < 0:\n    x = -x\nprint(x + 1)';
    T.push(H.quiz({ level: 'B', title: L('else-сіз if', 'if без else'), text: Q, code: c3, check: { code: c3 } },
      String(-x3 + 1), [String(x3 + 1), String(-x3), String(-x3 - 1), String(x3), String(-x3 + 2)]));

    var v4; do v4 = [ri(1, 50), ri(1, 50), ri(1, 50)]; while (v4[0] === v4[1] || v4[1] === v4[2] || v4[0] === v4[2]);
    var c4 = 'a, b, c = ' + v4.join(', ') + '\nm = a\nif b > m:\n    m = b\nif c > m:\n    m = c\nprint(m)';
    var srt = v4.slice().sort(function (p, q) { return p - q; });
    T.push(H.quiz({ level: 'B', title: L('Үш санның ең үлкені', 'Наибольшее из трёх'), text: Q, code: c4, check: { code: c4 } },
      String(srt[2]), [String(v4[0]), String(srt[0]), String(srt[1]), String(v4[2]), String(srt[2] + 1)]));

    T.push(H.quiz({ level: 'A', title: L('Дұрыс жазу', 'Правильная запись'), text: L('Шарт қай жолда дұрыс жазылған?', 'В какой строке условие записано правильно?') },
      'if x == 5:', ['if x = 5:', 'if x == 5', 'if x => 5:']));

    // ---------- Программа ----------
    T.push({ level: 'A', title: L('Екі санның үлкені', 'Большее из двух'),
      text: L('Екі бүтін сан берілген. Олардың үлкенін шығарыңыз (тең болса — сол санды).', 'Даны два целых числа. Выведите большее из них (если равны — это число).'),
      input: L('Бір жолда a және b.', 'В одной строке a и b.'), output: L('Бір сан.', 'Одно число.'),
      tests: H.tests(function (i) { var a = ri(-100, 100), b = i === 7 ? a : ri(-100, 100); return { input: a + ' ' + b, output: String(Math.max(a, b)) }; }),
      solution: 'a, b = map(int, input().split())\nif a > b:\n    print(a)\nelse:\n    print(b)' });

    T.push({ level: 'A', title: L('Жұп па, тақ па?', 'Чётное или нечётное?'),
      text: L('Бүтін n саны берілген. Ол жұп болса EVEN, тақ болса ODD шығарыңыз.', 'Дано целое число n. Выведите EVEN, если оно чётное, и ODD, если нечётное.'),
      input: L('Бір бүтін сан n (|n| ≤ 10⁹).', 'Одно целое число n (|n| ≤ 10⁹).'), output: L('EVEN немесе ODD.', 'EVEN или ODD.'),
      tests: H.tests(function (i) { var n = i === 7 ? 0 : ri(-1000000000, 1000000000); return { input: String(n), output: n % 2 === 0 ? 'EVEN' : 'ODD' }; }),
      solution: 'n = int(input())\nif n % 2 == 0:\n    print("EVEN")\nelse:\n    print("ODD")' });

    T.push({ level: 'B', title: L('Үш санның ең кішісі', 'Наименьшее из трёх'),
      text: L('Үш бүтін сан берілген. Олардың ең кішісін шығарыңыз. min() функциясын қолданбаңыз — if арқылы шығарыңыз.', 'Даны три целых числа. Выведите наименьшее из них. Не используйте min() — решите через if.'),
      input: L('Бір жолда үш бүтін сан.', 'В одной строке три целых числа.'), output: L('Бір сан.', 'Одно число.'),
      tests: H.tests(function () { var a = ri(-50, 50), b = ri(-50, 50), c = ri(-50, 50); return { input: a + ' ' + b + ' ' + c, output: String(Math.min(a, b, c)) }; }),
      solution: 'a, b, c = map(int, input().split())\nm = a\nif b < m:\n    m = b\nif c < m:\n    m = c\nprint(m)' });

    T.push({ level: 'B', title: L('Үшбұрыш', 'Треугольник'),
      text: L('Үш кесіндінің ұзындықтары a, b, c берілген. Олардан үшбұрыш құруға бола ма? Әр қабырға қалған екеуінің қосындысынан кіші болуы керек. Иә болса YES, әйтпесе NO шығарыңыз.', 'Даны длины трёх отрезков a, b, c. Можно ли из них составить треугольник? Каждая сторона должна быть меньше суммы двух других. Выведите YES или NO.'),
      input: L('Бір жолда үш натурал сан (≤ 1000).', 'В одной строке три натуральных числа (≤ 1000).'), output: L('YES немесе NO.', 'YES или NO.'),
      tests: H.tests(function (i) { var a = ri(1, 100), b = ri(1, 100), c = i === 1 ? a + b : i === 3 ? ri(1, 199) : ri(1, 100); return { input: a + ' ' + b + ' ' + c, output: a < b + c && b < a + c && c < a + b ? 'YES' : 'NO' }; }),
      solution: 'a, b, c = map(int, input().split())\nif a < b + c:\n    if b < a + c:\n        if c < a + b:\n            print("YES")\n        else:\n            print("NO")\n    else:\n        print("NO")\nelse:\n    print("NO")' });

    T.push({ level: 'C', title: L('Координаталық ширек', 'Координатная четверть'),
      text: L('Нүктенің x және y координаталары берілген (екеуі де 0-ге тең емес). Нүкте қай ширекте жатыр? 1, 2, 3 немесе 4 санын шығарыңыз. Кірістірілген if қолданыңыз.', 'Даны координаты точки x и y (обе не равны 0). В какой четверти лежит точка? Выведите число 1, 2, 3 или 4. Используйте вложенный if.'),
      input: L('Бір жолда x және y (|x|, |y| ≤ 1000, нөлге тең емес).', 'В одной строке x и y (|x|, |y| ≤ 1000, не равны нулю).'), output: L('Бір сан: 1, 2, 3 немесе 4.', 'Одно число: 1, 2, 3 или 4.'),
      tests: H.tests(function (i) {
        var sx = [1, -1, -1, 1][i % 4], sy = [1, 1, -1, -1][i % 4], x = sx * ri(1, 1000), y = sy * ri(1, 1000);
        return { input: x + ' ' + y, output: String(x > 0 ? (y > 0 ? 1 : 4) : (y > 0 ? 2 : 3)) };
      }),
      solution: 'x, y = map(int, input().split())\nif x > 0:\n    if y > 0:\n        print(1)\n    else:\n        print(4)\nelse:\n    if y > 0:\n        print(2)\n    else:\n        print(3)' });
    return T;
  }
};
