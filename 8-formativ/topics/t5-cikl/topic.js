/* Тема 5. Линейный алгоритм, ветвление, циклы while и for (8.1.4.2, 8.1.4.4). */
window.TOPIC = {
  id: 't5-cikl', file: 'formativ-5-algoritm-cikl.html',
  title: { kz: 'Сызықтық, тармақталған және циклдік алгоритмдер: while, for', ru: 'Линейные, разветвлённые и циклические алгоритмы: while, for' },
  goal: { kz: '8.1.4.2 — сызықтық және тармақталған алгоритмдерді құру; 8.1.4.4 — циклдік алгоритмдерді Python-да жазу (while, for)', ru: '8.1.4.2 — проектировать линейные и разветвлённые алгоритмы; 8.1.4.4 — записывать циклические алгоритмы на Python (while, for)' },
  generate: function (seed, lang, H) {
    var L = H.L, ri = H.ri, pick = H.pick, T = [];
    var Q = L('Программа не шығарады?', 'Что выведет программа?');
    var seq = function (a, b, s) { var o = []; for (var x = a; s > 0 ? x < b : x > b; x += s) o.push(x); return o; };

    var a1 = ri(1, 5), s1 = ri(2, 3), b1 = a1 + s1 * ri(3, 5) + ri(0, 1), c1 = 'for i in range(' + a1 + ', ' + b1 + ', ' + s1 + '):\n    print(i, end=" ")';
    var r1 = seq(a1, b1, s1);
    T.push(H.quiz({ level: 'A', title: L('range()', 'range()'), text: Q, code: c1, check: { code: c1 } },
      r1.join(' '), [seq(a1, b1 + 1, s1).join(' ') === r1.join(' ') ? r1.concat([r1[r1.length - 1] + s1]).join(' ') : seq(a1, b1 + 1, s1).join(' '), seq(a1 + 1, b1, s1).join(' '), seq(a1, b1, 1).join(' ')]));

    var n2 = ri(20, 100), c2 = 'i = 1\nwhile i < ' + n2 + ':\n    i = i * 2\nprint(i)', v2 = 1; while (v2 < n2) v2 *= 2;
    T.push(H.quiz({ level: 'A', title: L('while циклы', 'Цикл while'), text: Q, code: c2, check: { code: c2 } },
      String(v2), [String(v2 / 2), String(v2 * 2), String(n2), String(v2 / 4)]));

    var n3 = ri(4, 9), c3 = 's = 0\nfor k in range(1, ' + n3 + '):\n    s = s + k\nprint(s)';
    T.push(H.quiz({ level: 'B', title: L('Жинақтаушы айнымалы', 'Накопитель'), text: Q, code: c3, check: { code: c3 } },
      String(n3 * (n3 - 1) / 2), [String(n3 * (n3 + 1) / 2), String(n3 - 1), String((n3 - 1) * (n3 - 2) / 2), String(n3 * (n3 - 1)), String(n3)]));

    var a4 = ri(2, 6), b4 = a4 + ri(4, 12), c4 = 'c = 0\nfor i in range(' + a4 + ', ' + b4 + '):\n    c = c + 1\nprint(c)';
    T.push(H.quiz({ level: 'B', title: L('Цикл неше рет орындалады?', 'Сколько раз выполнится цикл?'), text: Q, code: c4, check: { code: c4 } },
      String(b4 - a4), [String(b4 - a4 + 1), String(b4), String(b4 - a4 - 1)]));

    T.push(H.quiz({ level: 'A', title: L('Алгоритм түрлері', 'Виды алгоритмов'), text: L('Әрекеттер шартқа байланысты қайталанатын алгоритм қалай аталады?', 'Как называется алгоритм, в котором действия повторяются в зависимости от условия?') },
      L('Циклдік', 'Циклический'), [L('Сызықтық', 'Линейный'), L('Тармақталған', 'Разветвлённый'), L('Көмекші', 'Вспомогательный')]));

    // ---------- Программа ----------
    T.push({ level: 'A', title: L('1-ден n-ге дейінгі сандар', 'Числа от 1 до n'),
      text: L('Натурал n саны берілген. 1-ден n-ге дейінгі сандарды бір жолға бос орын арқылы шығарыңыз.', 'Дано натуральное число n. Выведите числа от 1 до n в одну строку через пробел.'),
      input: L('Бір натурал сан n (n ≤ 100).', 'Одно натуральное число n (n ≤ 100).'), output: L('Сандар бір жолда.', 'Числа в одной строке.'),
      tests: H.tests(function (i) { var n = i === 7 ? 1 : ri(2, 100); return { input: String(n), output: seq(1, n + 1, 1).join(' ') }; }),
      solution: 'n = int(input())\nfor i in range(1, n + 1):\n    print(i, end=" ")' });

    var ev = r2();
    function r2() { return H.r() < 0.5; }
    T.push({ level: 'A', title: ev ? L('Жұп сандардың қосындысы', 'Сумма чётных чисел') : L('Тақ сандардың қосындысы', 'Сумма нечётных чисел'),
      text: L('Натурал n саны берілген. 1-ден n-ге дейінгі ' + (ev ? 'жұп' : 'тақ') + ' сандардың қосындысын шығарыңыз.', 'Дано натуральное число n. Выведите сумму ' + (ev ? 'чётных' : 'нечётных') + ' чисел от 1 до n.'),
      input: L('Бір натурал сан n (n ≤ 10000).', 'Одно натуральное число n (n ≤ 10000).'), output: L('Бір сан.', 'Одно число.'),
      tests: H.tests(function (i) { var n = i === 7 ? 1 : ri(2, 10000), s = 0; for (var k = 1; k <= n; k++) if ((k % 2 === 0) === ev) s += k; return { input: String(n), output: String(s) }; }),
      solution: 'n = int(input())\ns = 0\nfor i in range(' + (ev ? '2' : '1') + ', n + 1, 2):\n    s = s + i\nprint(s)' });

    T.push({ level: 'B', title: L('Факториал', 'Факториал'),
      text: L('Натурал n саны берілген. n! = 1 · 2 · … · n мәнін шығарыңыз.', 'Дано натуральное число n. Выведите n! = 1 · 2 · … · n.'),
      input: L('Бір натурал сан n (n ≤ 20).', 'Одно натуральное число n (n ≤ 20).'), output: L('Бір сан.', 'Одно число.'),
      tests: H.tests(function (i) { var n = i === 7 ? 1 : ri(2, 20), f = 1n; for (var k = 2; k <= n; k++) f *= BigInt(k); return { input: String(n), output: f.toString() }; }),
      solution: 'n = int(input())\np = 1\nfor i in range(2, n + 1):\n    p = p * i\nprint(p)' });

    T.push({ level: 'B', title: L('Цифрлар саны', 'Количество цифр'),
      text: L('Натурал n саны берілген. while циклы арқылы оның цифрларының санын табыңыз (n-ді 10-ға бөле беріңіз).', 'Дано натуральное число n. С помощью цикла while найдите количество его цифр (делите n на 10, пока оно не станет 0).'),
      input: L('Бір натурал сан n (n ≤ 10¹⁸).', 'Одно натуральное число n (n ≤ 10¹⁸).'), output: L('Бір сан.', 'Одно число.'),
      tests: H.tests(function (i) { var d = i === 7 ? 1 : ri(1, 18), s = String(ri(1, 9)); while (s.length < d) s += ri(0, 9); return { input: s, output: String(s.length) }; }),
      solution: 'n = int(input())\nk = 0\nwhile n > 0:\n    n = n // 10\n    k = k + 1\nprint(k)' });

    T.push({ level: 'C', title: L('Ең үлкен сан', 'Наибольшее число'),
      text: L('Бірінші жолда n, содан кейін n жолда бір-бір бүтін сан берілген. Олардың ең үлкенін және оның нөмірін (1-ден бастап, бірінші кездескені) шығарыңыз.', 'В первой строке n, затем в n строках по одному целому числу. Выведите наибольшее из них и его номер (с 1, первое встретившееся).'),
      input: L('Бірінші жолда n (1 ≤ n ≤ 100), әрі қарай n бүтін сан (|x| ≤ 1000), әрқайсысы жаңа жолда.', 'В первой строке n (1 ≤ n ≤ 100), далее n целых чисел (|x| ≤ 1000), каждое с новой строки.'), output: L('Екі сан: ең үлкені және оның нөмірі.', 'Два числа: наибольшее и его номер.'),
      tests: H.tests(function (i) {
        var n = i === 7 ? 1 : ri(2, 12), a = []; for (var k = 0; k < n; k++) a.push(ri(-100, 100));
        if (i === 1 && n > 2) { a[0] = 500; a[n - 1] = 500; }
        var m = a[0], p = 1; for (k = 1; k < n; k++) if (a[k] > m) { m = a[k]; p = k + 1; }
        return { input: n + '\n' + a.join('\n'), output: m + ' ' + p };
      }),
      solution: 'n = int(input())\nm = int(input())\np = 1\nfor i in range(2, n + 1):\n    x = int(input())\n    if x > m:\n        m = x\n        p = i\nprint(m, p)' });
    return T;
  }
};
