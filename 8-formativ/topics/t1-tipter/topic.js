/* Тема 1. Повторение: переменные, типы данных, ввод/вывод, f-строка, map (8.1.1.2). */
window.TOPIC = {
  id: 't1-tipter', file: 'formativ-1-ainymaly-tipter.html',
  title: { kz: 'Айнымалылар, деректер типтері, енгізу/шығару', ru: 'Переменные, типы данных, ввод/вывод' },
  goal: { kz: '8.1.1.2 — қайталау: айнымалылар, деректер типтері, енгізу/шығару, f-жол, map', ru: '8.1.1.2 — повторение: переменные, типы данных, ввод/вывод, f-строка, map' },
  generate: function (seed, lang, H) {
    var L = H.L, ri = H.ri, pick = H.pick, T = [];

    // ---------- Тест ----------
    var tv = pick([['17', 'int'], ['3.5', 'float'], ["'25'", 'str'], ['True', 'bool'], ['"7.0"', 'str'], ['10 / 2', 'float']]);
    T.push(H.quiz({ level: 'A', title: L('Деректер типі', 'Тип данных'), text: L('Программа не шығарады?', 'Что выведет программа?'),
      code: 'x = ' + tv[0] + '\nprint(type(x))', check: { code: 'x = ' + tv[0] + '\nprint(type(x))' } },
      "<class '" + tv[1] + "'>", ["<class 'int'>", "<class 'float'>", "<class 'str'>", "<class 'bool'>"]));

    var d2 = ri(2, 9), k2 = ri(2, 4);
    T.push(H.quiz({ level: 'A', title: L('Жол және сан', 'Строка и число'), text: L('Программа не шығарады?', 'Что выведет программа?'),
      code: 'a = "' + d2 + '"\nb = ' + k2 + '\nprint(a * b)', check: { code: 'a = "' + d2 + '"\nb = ' + k2 + '\nprint(a * b)' } },
      String(d2).repeat(k2), [String(d2 * k2), String(d2 + k2), String(d2) + ' ' + String(d2), L('Қате (TypeError)', 'Ошибка (TypeError)')]));

    var a3 = ri(3, 19), b3 = ri(2, 9);
    T.push(H.quiz({ level: 'A', title: L('f-жол', 'f-строка'), text: L('Программа не шығарады?', 'Что выведет программа?'),
      code: 'a = ' + a3 + '\nb = ' + b3 + '\nprint(f"{a} + {b} = {a + b}")', check: { code: 'a = ' + a3 + '\nb = ' + b3 + '\nprint(f"{a} + {b} = {a + b}")' } },
      a3 + ' + ' + b3 + ' = ' + (a3 + b3), ['{a} + {b} = {a + b}', a3 + ' + ' + b3 + ' = ' + a3 + b3, 'a + b = ' + (a3 + b3)]));

    var x4 = ri(2, 9), y4 = ri(2, 9);
    T.push(H.quiz({ level: 'B', title: L('map және input', 'map и input'), text: L('Пернетақтадан «' + x4 + ' ' + y4 + '» енгізілді. Программа не шығарады?', 'С клавиатуры введено «' + x4 + ' ' + y4 + '». Что выведет программа?'),
      code: 'a, b = map(int, input().split())\nprint(a + b)', check: { code: 'a, b = map(int, input().split())\nprint(a + b)', input: x4 + ' ' + y4 } },
      String(x4 + y4), [String(x4) + String(y4), x4 + ' ' + y4, String(x4 * y4), L('Қате (TypeError)', 'Ошибка (TypeError)')]));

    var p5 = ri(5, 19), q5 = pick([2, 4]);
    T.push(H.quiz({ level: 'B', title: L('Бөлу және типтер', 'Деление и типы'), text: L('Программа не шығарады?', 'Что выведет программа?'),
      code: 'a = ' + p5 + '\nb = ' + q5 + '\nprint(a / b, int(a / b))', check: { code: 'a = ' + p5 + '\nb = ' + q5 + '\nprint(a / b, int(a / b))' } },
      (p5 / q5) + (p5 % q5 ? '' : '.0') + ' ' + Math.floor(p5 / q5),
      [Math.floor(p5 / q5) + ' ' + Math.floor(p5 / q5), (p5 / q5) + (p5 % q5 ? '' : '.0') + ' ' + ((p5 / q5) + (p5 % q5 ? '' : '.0')), Math.floor(p5 / q5) + ' ' + Math.round(p5 / q5 + 0.5)]));

    // ---------- Программа ----------
    T.push({ level: 'A', title: L('Қосынды және көбейтінді', 'Сумма и произведение'),
      text: L('Бір жолда бос орын арқылы екі бүтін сан a және b берілген. Олардың қосындысын және көбейтіндісін бір жолға бос орын арқылы шығарыңыз.', 'В одной строке через пробел даны два целых числа a и b. Выведите в одну строку через пробел их сумму и произведение.'),
      input: L('Бір жолда a және b (|a|, |b| ≤ 1000).', 'В одной строке a и b (|a|, |b| ≤ 1000).'), output: L('Екі сан бос орын арқылы.', 'Два числа через пробел.'),
      tests: H.tests(function () { var a = ri(-100, 1000), b = ri(-100, 1000); return { input: a + ' ' + b, output: (a + b) + ' ' + (a * b) }; }),
      solution: 'a, b = map(int, input().split())\nprint(a + b, a * b)' });

    T.push({ level: 'A', title: L('Сәлемдесу (f-жол)', 'Приветствие (f-строка)'),
      text: L('Бірінші жолда оқушының аты (латын әріптерімен), екінші жолда жасы берілген. f-жол арқылы дәл осындай жолды шығарыңыз: Name: <аты>, next year: <жасы + 1>',
        'В первой строке дано имя ученика (латиницей), во второй — его возраст. С помощью f-строки выведите строку ровно такого вида: Name: <имя>, next year: <возраст + 1>'),
      input: L('Бірінші жолда аты, екінші жолда жасы (бүтін сан).', 'В первой строке имя, во второй — возраст (целое число).'), output: L('Бір жол: Name: Aru, next year: 15', 'Одна строка: Name: Aru, next year: 15'),
      tests: H.tests(function () { var n = pick(['Aru', 'Dias', 'Alikhan', 'Aisha', 'Timur', 'Dana', 'Nursultan', 'Aigerim', 'Erlan', 'Zhanna']), a = ri(10, 17); return { input: n + '\n' + a, output: 'Name: ' + n + ', next year: ' + (a + 1) }; }),
      solution: 'name = input()\nage = int(input())\nprint(f"Name: {name}, next year: {age + 1}")' });

    T.push({ level: 'B', title: L('Орташа мән', 'Среднее значение'),
      text: L('Бір жолда үш бүтін сан берілген. Олардың орташа мәнін үтірден кейін дәл 2 цифрмен шығарыңыз. Кеңес: f"{x:.2f}".', 'В одной строке даны три целых числа. Выведите их среднее значение ровно с 2 знаками после точки. Подсказка: f"{x:.2f}".'),
      input: L('Бір жолда үш бүтін сан (0-ден 100-ге дейін).', 'В одной строке три целых числа (от 0 до 100).'), output: L('Бір сан, мысалы 4.33', 'Одно число, например 4.33'),
      tests: H.tests(function () { var a = ri(0, 100), b = ri(0, 100), c = ri(0, 100); return { input: a + ' ' + b + ' ' + c, output: fix2((a + b + c) / 3) }; }),
      solution: 'a, b, c = map(int, input().split())\nprint(f"{(a + b + c) / 3:.2f}")' });

    T.push({ level: 'B', title: L('Тіктөртбұрыш', 'Прямоугольник'),
      text: L('Тіктөртбұрыштың ұзындығы a және ені b берілген. Бірінші жолға периметрін, екінші жолға ауданын шығарыңыз.', 'Даны длина a и ширина b прямоугольника. В первой строке выведите периметр, во второй — площадь.'),
      input: L('Бір жолда a және b (1-ден 1000-ға дейінгі бүтін сандар).', 'В одной строке a и b (целые числа от 1 до 1000).'), output: L('Екі сан, әрқайсысы жаңа жолда.', 'Два числа, каждое с новой строки.'),
      tests: H.tests(function () { var a = ri(1, 1000), b = ri(1, 1000); return { input: a + ' ' + b, output: 2 * (a + b) + '\n' + a * b }; }),
      solution: 'a, b = map(int, input().split())\nprint(2 * (a + b))\nprint(a * b)' });

    T.push({ level: 'C', title: L('Сандар жолы', 'Строка чисел'),
      text: L('Бір жолда бос орын арқылы бірнеше бүтін сан берілген (саны белгісіз). Олардың санын, қосындысын және ең үлкенін бір жолға бос орын арқылы шығарыңыз. Кеңес: a = list(map(int, input().split())), len(a), sum(a), max(a).',
        'В одной строке через пробел дано несколько целых чисел (сколько — неизвестно). Выведите в одну строку через пробел их количество, сумму и наибольшее. Подсказка: a = list(map(int, input().split())), len(a), sum(a), max(a).'),
      input: L('Бір жолда 1-ден 20-ға дейін бүтін сан (|x| ≤ 100).', 'В одной строке от 1 до 20 целых чисел (|x| ≤ 100).'), output: L('Үш сан бос орын арқылы.', 'Три числа через пробел.'),
      tests: H.tests(function (i) { var n = i === 7 ? 1 : ri(2, 15), a = []; for (var k = 0; k < n; k++) a.push(ri(-100, 100)); return { input: a.join(' '), output: n + ' ' + a.reduce(function (p, q) { return p + q; }, 0) + ' ' + Math.max.apply(null, a) }; }),
      solution: 'a = list(map(int, input().split()))\nprint(len(a), sum(a), max(a))' });
    return T;

    function fix2(x) {   // Python f"{x:.2f}" (округление половин к чётному здесь не встречается: x = k/3)
      return (Math.round(x * 100 + 1e-9) / 100).toFixed(2);
    }
  }
};
