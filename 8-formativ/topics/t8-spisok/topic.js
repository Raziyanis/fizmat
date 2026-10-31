/* Тема 8. Одномерный массив — список (8.2.1.2).
 * Тестовые задания 1–5: каждый неверный вариант соответствует одной типичной ошибке (коды ошибок — в комментариях),
 * чтобы по выбранным вариантам можно было увидеть, как рассуждает ученик. */
window.TOPIC = {
  id: 't8-spisok', file: 'formativ-8-spisok.html',
  title: { kz: 'Бір өлшемді массив. Тізім', ru: 'Одномерный массив. Список' },
  goal: { kz: '8.2.1.2 — Python тілінде бір өлшемді массивтерді қолданып программалар құру; тізіммен жұмыс істеу әдістерін қолдану', ru: '8.2.1.2 — создавать программы на Python с использованием одномерных массивов; применять методы работы со списками' },
  generate: function (seed, lang, H) {
    var L = H.L, ri = H.ri, T = [];
    var Q = L('Программа не шығарады?', 'Что выведет программа?');
    var lst = function (a) { return '[' + a.join(', ') + ']'; };
    // n разных чисел от 10 до 99
    var uniq = function (n) { var o = []; while (o.length < n) { var x = ri(10, 99); if (o.indexOf(x) < 0) o.push(x); } return o; };

    // 1. Индекс с нуля. Ошибки: счёт с 1 (a[k-1]); соседний элемент (a[k+1]); индекс вместо элемента (k).
    var a1 = uniq(6), k1 = ri(1, 4), c1 = 'a = ' + lst(a1) + '\nprint(a[' + k1 + '])';
    T.push(H.quiz({ level: 'A', title: L('Индекс', 'Индекс'), text: Q, code: c1, check: { code: c1 } },
      a1[k1], [a1[k1 - 1], a1[k1 + 1], k1]));

    // 2. Отрицательный индекс (8 элементов, k = 2 или 3 — так все четыре варианта разные).
    //    Ошибки: минус не учтён (a[k]); -1 принят за предпоследний (a[n-k-1]); счёт с конца начат с нуля (a[n-k+1]).
    var a2 = uniq(8), k2 = ri(2, 3), c2 = 'a = ' + lst(a2) + '\nprint(a[-' + k2 + '])';
    T.push(H.quiz({ level: 'A', title: L('Теріс индекс', 'Отрицательный индекс'), text: Q, code: c2, check: { code: c2 } },
      a2[8 - k2], [a2[k2], a2[8 - k2 - 1], a2[8 - k2 + 1]]));

    // 3. Срез. Ошибки: конец включён (a[i:j+1]); счёт с 1 (a[i-1:j-1]); начало сдвинуто (a[i-1:j]).
    var a3 = uniq(7), i3 = ri(1, 3), j3 = i3 + ri(2, 3), c3 = 'a = ' + lst(a3) + '\nprint(a[' + i3 + ':' + j3 + '])';
    T.push(H.quiz({ level: 'B', title: L('Кесінді', 'Срез'), text: Q, code: c3, check: { code: c3 } },
      lst(a3.slice(i3, j3)), [lst(a3.slice(i3, j3 + 1)), lst(a3.slice(i3 - 1, j3 - 1)), lst(a3.slice(i3 - 1, j3))]));

    // 4. append и pop(i). Ошибки: pop(1) удаляет a[0] (счёт с 1); pop удаляет последний; append добавляет в начало.
    var a4 = uniq(4), x4 = ri(1, 9), c4 = 'a = ' + lst(a4) + '\na.append(' + x4 + ')\na.pop(1)\nprint(a)';
    var full4 = a4.concat([x4]);
    var rm = function (arr, i) { return arr.slice(0, i).concat(arr.slice(i + 1)); };
    T.push(H.quiz({ level: 'B', title: L('append және pop', 'append и pop'), text: Q, code: c4, check: { code: c4 } },
      lst(rm(full4, 1)), [lst(rm(full4, 0)), lst(full4.slice(0, -1)), lst(rm([x4].concat(a4), 1))]));

    // 5. b = a — та же самая ссылка. Ошибки: b — копия (a не меняется); append в начало; append заменяет последний.
    var a5 = uniq(3), x5 = ri(1, 9), c5 = 'a = ' + lst(a5) + '\nb = a\nb.append(' + x5 + ')\nprint(a)';
    T.push(H.quiz({ level: 'B', title: L('b = a', 'b = a'), text: Q, code: c5, check: { code: c5 } },
      lst(a5.concat([x5])), [lst(a5), lst([x5].concat(a5)), lst(a5.slice(0, -1).concat([x5]))]));

    // ---------- Программа ----------
    var nums = function (n, lo, hi) { var o = []; for (var k = 0; k < n; k++) o.push(ri(lo, hi)); return o; };
    var inp = function (a) { return a.length + '\n' + a.join(' '); };
    var INP = L('Бірінші жолда n (1 ≤ n ≤ 100), екінші жолда n бүтін сан бос орын арқылы.', 'В первой строке n (1 ≤ n ≤ 100), во второй — n целых чисел через пробел.');

    T.push({ level: 'A', title: L('Бірінші және соңғы', 'Первый и последний'),
      text: L('n сан берілген. Тізімнің бірінші және соңғы элементтерін бос орын арқылы шығарыңыз.', 'Даны n чисел. Выведите через пробел первый и последний элементы списка.'),
      input: INP, output: L('Екі сан.', 'Два числа.'),
      tests: H.tests(function (i) { var a = nums(i === 7 ? 1 : ri(2, 10), -50, 99); return { input: inp(a), output: a[0] + ' ' + a[a.length - 1] }; }),
      solution: 'n = int(input())\na = list(map(int, input().split()))\nprint(a[0], a[-1])' });

    T.push({ level: 'A', title: L('Кері ретпен', 'В обратном порядке'),
      text: L('n сан берілген. Оларды кері ретпен бос орын арқылы шығарыңыз.', 'Даны n чисел. Выведите их в обратном порядке через пробел.'),
      input: INP, output: L('n сан.', 'n чисел.'),
      tests: H.tests(function (i) { var a = nums(i === 7 ? 1 : ri(2, 12), -20, 99); return { input: inp(a), output: a.slice().reverse().join(' ') }; }),
      solution: 'n = int(input())\na = list(map(int, input().split()))\na.reverse()\nprint(*a)' });

    T.push({ level: 'B', title: L('Орташадан үлкен', 'Больше среднего'),
      text: L('n сан берілген. Олардың арифметикалық ортасынан қатаң үлкен элементтер санын шығарыңыз.', 'Даны n чисел. Выведите, сколько элементов строго больше их среднего арифметического.'),
      input: INP, output: L('Бір сан.', 'Одно число.'),
      tests: H.tests(function (i) { var a = nums(i === 7 ? 1 : ri(2, 15), 1, 50), s = a.reduce(function (p, q) { return p + q; }, 0); return { input: inp(a), output: String(a.filter(function (x) { return x * a.length > s; }).length) }; }),
      solution: 'n = int(input())\na = list(map(int, input().split()))\navg = sum(a) / len(a)\nc = 0\nfor x in a:\n    if x > avg:\n        c = c + 1\nprint(c)' });

    T.push({ level: 'B', title: L('x санын өшіру', 'Удалить число x'),
      text: L('n сан және x саны берілген. Тізімнен x-ке тең барлық элементтерді өшіріп, қалғанын бос орын арқылы шығарыңыз. Ештеңе қалмаса, EMPTY деп шығарыңыз.', 'Даны n чисел и число x. Удалите из списка все элементы, равные x, и выведите остальные через пробел. Если ничего не осталось, выведите EMPTY.'),
      input: L('Бірінші жолда n, екінші жолда n сан, үшінші жолда x.', 'В первой строке n, во второй — n чисел, в третьей — x.'), output: L('Қалған сандар немесе EMPTY.', 'Оставшиеся числа или EMPTY.'),
      tests: H.tests(function (i) {
        var n = i === 7 ? 2 : ri(3, 12), x = ri(1, 5), a = nums(n, 1, 6);
        if (i === 7) a = [x, x];
        else if (a.indexOf(x) < 0) a[ri(0, n - 1)] = x;
        var r = a.filter(function (v) { return v !== x; });
        return { input: inp(a) + '\n' + x, output: r.length ? r.join(' ') : 'EMPTY' };
      }),
      solution: 'n = int(input())\na = list(map(int, input().split()))\nx = int(input())\nwhile x in a:\n    a.remove(x)\nif a:\n    print(*a)\nelse:\n    print("EMPTY")' });

    T.push({ level: 'C', title: L('Циклдік ығысу', 'Циклический сдвиг'),
      text: L('n сан және k саны берілген. Тізімді оңға қарай k орынға циклдік түрде ығыстырыңыз: соңғы элемент басына шығады. Нәтижені бос орын арқылы шығарыңыз.', 'Даны n чисел и число k. Сдвиньте список циклически вправо на k позиций: последний элемент переходит в начало. Выведите результат через пробел.'),
      input: L('Бірінші жолда n, екінші жолда n сан, үшінші жолда k (0 ≤ k ≤ 1000).', 'В первой строке n, во второй — n чисел, в третьей — k (0 ≤ k ≤ 1000).'), output: L('n сан.', 'n чисел.'),
      tests: H.tests(function (i) {
        var a = nums(i === 7 ? 1 : ri(2, 10), 1, 99), k = i === 6 ? ri(11, 1000) : ri(0, 9), s = k % a.length;
        var r = s ? a.slice(a.length - s).concat(a.slice(0, a.length - s)) : a.slice();
        return { input: inp(a) + '\n' + k, output: r.join(' ') };
      }),
      solution: 'n = int(input())\na = list(map(int, input().split()))\nk = int(input()) % n\na = a[n - k:] + a[:n - k]\nprint(*a)' });
    return T;
  }
};
