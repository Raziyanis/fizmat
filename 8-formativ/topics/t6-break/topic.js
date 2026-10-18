/* Тема 6. Управление циклом: continue, break, else (8.1.4.5). */
window.TOPIC = {
  id: 't6-break', file: 'formativ-6-break-continue-else.html',
  title: { kz: 'Циклді басқару: continue, break, else', ru: 'Управление циклом: continue, break, else' },
  goal: { kz: '8.1.4.5 — циклді басқару нұсқауларын қолдану (continue, break, else)', ru: '8.1.4.5 — использовать инструкции управления циклом (continue, break, else)' },
  generate: function (seed, lang, H) {
    var L = H.L, ri = H.ri, pick = H.pick, T = [];
    var Q = L('Программа не шығарады?', 'Что выведет программа?');
    var isPrime = function (n) { if (n < 2) return false; for (var d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; };
    var rng = function (a, b) { var o = []; for (var x = a; x < b; x++) o.push(x); return o; };

    var s1 = ri(3, 7), c1 = 'for i in range(1, 10):\n    if i == ' + s1 + ':\n        break\n    print(i, end=" ")';
    T.push(H.quiz({ level: 'A', title: 'break', text: Q, code: c1, check: { code: c1 } },
      rng(1, s1).join(' '), [rng(1, s1 + 1).join(' '), rng(1, 10).filter(function (x) { return x !== s1; }).join(' '), rng(s1, 10).join(' ')]));

    var k2 = ri(2, 4), n2 = ri(7, 10), c2 = 'for i in range(1, ' + n2 + '):\n    if i % ' + k2 + ' == 0:\n        continue\n    print(i, end=" ")';
    T.push(H.quiz({ level: 'A', title: 'continue', text: Q, code: c2, check: { code: c2 } },
      rng(1, n2).filter(function (x) { return x % k2; }).join(' '), [rng(1, n2).filter(function (x) { return x % k2 === 0; }).join(' '), rng(1, k2).join(' '), rng(1, n2).join(' ')]));

    var arr3 = H.shuffle([3, 7, 11, ri(13, 19) | 1]), has = H.r() < 0.5; if (has) arr3[ri(1, 3)] = 2 * ri(2, 9);
    var c3 = 'for x in [' + arr3.join(', ') + ']:\n    if x % 2 == 0:\n        print("even", x)\n        break\nelse:\n    print("all odd")';
    var ev3 = arr3.filter(function (x) { return x % 2 === 0; });
    T.push(H.quiz({ level: 'B', title: 'for … else', text: Q, code: c3, check: { code: c3 } },
      has ? 'even ' + ev3[0] : 'all odd', has ? ['all odd', 'even ' + ev3[0] + '\nall odd', 'even ' + arr3[0]] : ['even ' + arr3[0], 'all odd\nall odd', L('ештеңе шықпайды', 'ничего не выведет')]));

    var n4 = ri(9, 16), d4 = 3, c4 = 'n = ' + n4 + '\nwhile n > 0:\n    n = n - ' + d4 + '\n    if n == 4:\n        break\nelse:\n    print("end")\nprint(n)';
    var v4 = n4, br = false; while (v4 > 0) { v4 -= d4; if (v4 === 4) { br = true; break; } }
    T.push(H.quiz({ level: 'B', title: 'while … else', text: Q, code: c4, check: { code: c4 } },
      (br ? '' : 'end\n') + v4, br ? ['end\n4', '1', '0'] : [String(v4), '4', 'end\n4']));

    T.push(H.quiz({ level: 'A', title: L('Қай нұсқау?', 'Какая инструкция?'), text: L('Циклдың ағымдағы қадамының қалғанын өткізіп, келесі қадамға өтетін нұсқау қайсы?', 'Какая инструкция пропускает остаток текущего шага цикла и переходит к следующему шагу?') },
      'continue', ['break', 'else', 'pass']));

    // ---------- Программа ----------
    T.push({ level: 'A', need: ['break'], title: L('Нөлге дейінгі қосынды', 'Сумма до нуля'),
      text: L('Бүтін сандар әрқайсысы жаңа жолдан енгізіледі, соңғысы — 0. Сандардың қосындысын шығарыңыз (0 есептелмейді). 0 келгенде циклды break арқылы тоқтатыңыз.', 'Вводятся целые числа, каждое с новой строки, последнее — 0. Выведите их сумму (0 не учитывается). Когда придёт 0, остановите цикл через break.'),
      input: L('Бірнеше жол, әрқайсысында бір бүтін сан; соңғысы — 0.', 'Несколько строк по одному целому числу; последнее — 0.'), output: L('Бір сан.', 'Одно число.'),
      tests: H.tests(function (i) { var n = i === 7 ? 0 : ri(1, 10), a = []; for (var k = 0; k < n; k++) { var v = 0; while (!v) v = ri(-50, 99); a.push(v); } return { input: a.concat([0]).join('\n'), output: String(a.reduce(function (p, q) { return p + q; }, 0)) }; }),
      solution: 's = 0\nwhile True:\n    x = int(input())\n    if x == 0:\n        break\n    s = s + x\nprint(s)' });

    var k6 = ri(2, 9);
    T.push({ level: 'A', need: ['continue'], title: L('Еселіктерді өткізу', 'Пропуск кратных'),
      text: L('Натурал n және k берілген. 1-ден n-ге дейінгі сандарды бір жолға шығарыңыз, тек k-ға бөлінетіндерін continue арқылы өткізіп жіберіңіз.', 'Даны натуральные n и k. Выведите в одну строку числа от 1 до n, пропуская через continue числа, делящиеся на k.'),
      input: L('Бір жолда n және k (10 ≤ n ≤ 100, 2 ≤ k ≤ 9).', 'В одной строке n и k (10 ≤ n ≤ 100, 2 ≤ k ≤ 9).'), output: L('Сандар бір жолда.', 'Числа в одной строке.'),
      tests: H.tests(function () { var n = ri(10, 40), k = ri(2, 9); return { input: n + ' ' + k, output: rng(1, n + 1).filter(function (x) { return x % k; }).join(' ') }; }),
      solution: 'n, k = map(int, input().split())\nfor i in range(1, n + 1):\n    if i % k == 0:\n        continue\n    print(i, end=" ")' });

    T.push({ level: 'B', need: ['break', 'else'], title: L('Жай сан ба?', 'Простое ли число?'),
      text: L('Натурал n (2 ≤ n ≤ 10000) берілген. Жай сан болса YES, әйтпесе NO шығарыңыз. Бөлгіш табылса — break; бөлгіш болмаса, YES циклдың else бөлігінде.', 'Дано натуральное n (2 ≤ n ≤ 10000). Выведите YES, если оно простое, иначе NO. Нашли делитель — break; если делителя нет, YES в части else цикла.'),
      input: L('Бір натурал сан n.', 'Одно натуральное число n.'), output: L('YES немесе NO.', 'YES или NO.'),
      tests: H.tests(function (i) { var n; if (i === 0 || i === 6) { do n = ri(10, 10000); while (!isPrime(n)); } else if (i === 2) n = 2; else if (i === 3) n = pick([49, 121, 169, 289, 9409]); else n = ri(2, 10000); return { input: String(n), output: isPrime(n) ? 'YES' : 'NO' }; }),
      solution: 'n = int(input())\nfor d in range(2, n):\n    if n % d == 0:\n        print("NO")\n        break\nelse:\n    print("YES")' });

    T.push({ level: 'B', need: ['continue', 'break'], title: L('Датчик көрсеткіштері', 'Показания датчика'),
      text: L('Сандар әрқайсысы жаңа жолдан енгізіледі, соңғысы — 0. Теріс сандарды continue арқылы өткізіп, оң сандардың санын және қосындысын шығарыңыз. 0 келгенде — break.', 'Числа вводятся с новой строки, последнее — 0. Пропуская отрицательные через continue, выведите количество и сумму положительных. На 0 — break.'),
      input: L('Бірнеше жол, әрқайсысында бір бүтін сан; соңғысы — 0.', 'Несколько строк по одному целому числу; последнее — 0.'), output: L('Екі сан: саны және қосындысы.', 'Два числа: количество и сумма.'),
      tests: H.tests(function (i) { var n = ri(2, 12), a = []; for (var k = 0; k < n; k++) { var v = 0; while (!v) v = i === 7 ? -ri(1, 40) : ri(-40, 60); a.push(v); } var p = a.filter(function (x) { return x > 0; }); return { input: a.concat([0]).join('\n'), output: p.length + ' ' + p.reduce(function (s, x) { return s + x; }, 0) }; }),
      solution: 'k = 0\ns = 0\nwhile True:\n    x = int(input())\n    if x == 0:\n        break\n    if x < 0:\n        continue\n    k = k + 1\n    s = s + x\nprint(k, s)' });

    T.push({ level: 'C', need: ['break', 'else'], title: L('PIN-код', 'PIN-код'),
      text: L('Бірінші жолда дұрыс PIN-код, екінші жолда әрекеттер саны n, әрі қарай n жолда енгізілген кодтар. Бірінші дұрыс әрекеттің нөмірін шығарыңыз (break); дұрыс код болмаса — BLOCKED (циклдың else бөлігі).', 'В первой строке верный PIN, во второй — число попыток n, далее n строк с введёнными кодами. Выведите номер первой верной попытки (break); если верного кода нет — BLOCKED (часть else цикла).'),
      input: L('PIN (төрт таңбалы), n (1 ≤ n ≤ 5), әрі қарай n код.', 'PIN (четырёхзначный), n (1 ≤ n ≤ 5), далее n кодов.'), output: L('Нөмір немесе BLOCKED.', 'Номер или BLOCKED.'),
      tests: H.tests(function (i) { var pin = ri(1000, 9999), n = i === 7 ? 1 : ri(2, 5), a = []; for (var k = 0; k < n; k++) { var x; do x = ri(1000, 9999); while (x === pin); a.push(x); } if (!(i === 1 || i === 4)) a[i === 7 ? 0 : ri(0, n - 1)] = pin; var at = a.indexOf(pin); return { input: pin + '\n' + n + '\n' + a.join('\n'), output: at >= 0 ? String(at + 1) : 'BLOCKED' }; }),
      solution: 'pin = int(input())\nn = int(input())\nfor i in range(1, n + 1):\n    x = int(input())\n    if x == pin:\n        print(i)\n        break\nelse:\n    print("BLOCKED")' });
    return T;
  }
};
