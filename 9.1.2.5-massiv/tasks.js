/* 9.1.2.5 формативтік жұмысының тапсырмалары «Бір өлшемді массив: Python тізімдері» (9-сынып).
 * TASKS.generate(seed) → 20 тапсырма. Сандар seed-ке байланысты, сондықтан әр оқушының нұсқасы әртүрлі.
 * Түрлері: input — жауапты жазу; choice — бір жауапты таңдау; match — сәйкестендіру; order — жолдарды ретімен қою.
 * Кілт tools/check-tasks.py арқылы нағыз Python-да тексеріледі. */
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

  // Python тізімді дәл осылай шығарады: [3, 15, 7]
  function py(a) { return '[' + a.join(', ') + ']'; }

  var LIST_HINT = 'Тізімді Python шығаратындай етіп жазыңыз, мысалы: [1, 2, 3]';

  function generate(seed) {
    var r = rng(seed);
    var ri = function (a, b) { return a + Math.floor(r() * (b - a + 1)); };
    var pick = function (a) { return a[Math.floor(r() * a.length)]; };
    var shuffle = function (a) {
      a = a.slice();
      for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; }
      return a;
    };
    // n әртүрлі сан [lo; hi] аралығынан
    var nums = function (n, lo, hi) {
      var out = [];
      while (out.length < n) { var v = ri(lo, hi); if (out.indexOf(v) < 0) out.push(v); }
      return out;
    };
    var T = [];
    var OUT = 'Бағдарлама не шығарады?';
    var num = function (title, code, ans) { return { type: 'input', title: title, text: OUT, code: code, accept: [String(ans)], answerShown: String(ans), numeric: true }; };
    var lst = function (title, code, arr) { return { type: 'input', title: title, text: OUT, code: code, accept: [py(arr)], answerShown: py(arr), hint: LIST_HINT }; };

    // 1. Сәйкестендіру: тізім әдістері
    var methods = shuffle([
      { code: 'append(x)', ans: 'x мәнін тізімнің соңына қосады' },
      { code: 'insert(i, x)', ans: 'x мәнін i индексіне қосады' },
      { code: 'remove(x)', ans: 'x мәні бар бірінші элементті өшіреді' },
      { code: 'pop(i)', ans: 'i индексіндегі элементті өшіреді' },
      { code: 'sort()', ans: 'тізімді өсу ретімен сұрыптайды' },
      { code: 'count(x)', ans: 'x мәнінің неше рет кездесетінін санайды' },
      { code: 'clear()', ans: 'тізімнің барлық элементін өшіреді' }
    ]).slice(0, 5);
    T.push({ type: 'match', title: 'Тізім әдістері', text: 'Тізім әдісін оның қызметімен сәйкестендіріңіз.',
      items: methods.map(function (m) { return { code: m.code, name: m.code }; }),
      options: shuffle(methods.map(function (m) { return m.ans; })),
      answer: methods.map(function (m) { return m.ans; }) });

    // 2. Таңдау: бірінші элементтің индексі
    T.push({ type: 'choice', title: 'Бірінші элементтің индексі', text: 'Python тізіміндегі бірінші элементтің индексі қандай?',
      options: shuffle(['0', '1', '-1', 'тізімнің ұзындығына байланысты']), answer: '0' });

    // 3. Таңдау: тізімді дұрыс құру
    var c3 = nums(3, 1, 9);
    T.push({ type: 'choice', title: 'Тізім құру', text: 'Қай жол Python тілінде тізімді дұрыс құрады?', mono: true,
      options: shuffle(['a = [' + c3.join(', ') + ']', 'a = (' + c3.join(', ') + ')', 'a = {' + c3.join(', ') + '}', 'a = [' + c3.join('; ') + ']']),
      answer: 'a = [' + c3.join(', ') + ']' });

    // 4. Индекс бойынша оқу
    var a4 = nums(5, 10, 99), k4 = ri(1, 4);
    T.push(num('Индекс бойынша оқу', 'a = ' + py(a4) + '\nprint(a[' + k4 + '])', a4[k4]));

    // 5. Теріс индекс
    var fr = shuffle(['алма', 'алмұрт', 'шие', 'өрік', 'жүзім', 'қарбыз']).slice(0, 4), k5 = pick([1, 2]);
    T.push({ type: 'input', title: 'Теріс индекс', text: OUT,
      code: 'fruits = ["' + fr.join('", "') + '"]\nprint(fruits[-' + k5 + '])',
      accept: [fr[4 - k5]], answerShown: fr[4 - k5], hint: 'Тек шығатын сөзді жазыңыз (тырнақшасыз).' });

    // 6. Қиынды (срез)
    var a6 = nums(6, 1, 30), s6 = ri(1, 2), e6 = s6 + ri(2, 3);
    T.push(lst('Тізім қиындысы', 'a = ' + py(a6) + '\nprint(a[' + s6 + ':' + e6 + '])', a6.slice(s6, e6)));

    // 7. Элементті өзгерту
    var a7 = nums(4, 1, 20), k7 = ri(0, 3), v7 = ri(40, 60), b7 = a7.slice(); b7[k7] = v7;
    T.push(lst('Элементті өзгерту', 'a = ' + py(a7) + '\na[' + k7 + '] = ' + v7 + '\nprint(a)', b7));

    // 8. append
    var a8 = nums(3, 1, 20), v8 = ri(21, 50);
    T.push(lst('append()', 'a = ' + py(a8) + '\na.append(' + v8 + ')\nprint(a)', a8.concat([v8])));

    // 9. insert
    var a9 = nums(3, 1, 20), k9 = ri(0, 2), v9 = ri(21, 50), b9 = a9.slice(); b9.splice(k9, 0, v9);
    T.push(lst('insert()', 'a = ' + py(a9) + '\na.insert(' + k9 + ', ' + v9 + ')\nprint(a)', b9));

    // 10. remove: бірінші кездескенін ғана өшіреді
    var u10 = nums(3, 1, 9), x10 = u10[0];
    var a10 = shuffle([x10, u10[1], x10, u10[2]]), b10 = a10.slice(); b10.splice(b10.indexOf(x10), 1);
    T.push(lst('remove()', 'a = ' + py(a10) + '\na.remove(' + x10 + ')\nprint(a)', b10));

    // 11. pop(i) қайтаратын мән
    var a11 = nums(5, 10, 60), k11 = ri(0, 4);
    T.push(num('pop()', 'a = ' + py(a11) + '\nx = a.pop(' + k11 + ')\nprint(x)', a11[k11]));

    // 12. len: append және pop-тан кейін
    var n12 = ri(3, 6), a12 = nums(n12, 1, 30), app12 = ri(1, 3), pop12 = ri(1, 2);
    var code12 = 'a = ' + py(a12);
    for (var i = 0; i < app12; i++) code12 += '\na.append(' + ri(31, 60) + ')';
    for (i = 0; i < pop12; i++) code12 += '\na.pop()';
    T.push(num('len()', code12 + '\nprint(len(a))', n12 + app12 - pop12));

    // 13. count
    var x13 = ri(1, 5), c13 = ri(2, 3), other13 = nums(6 - c13, 6, 9), a13 = shuffle(other13.concat(Array(c13).fill(x13)));
    T.push(num('count()', 'a = ' + py(a13) + '\nprint(a.count(' + x13 + '))', c13));

    // 14. index: бірінші кездесуі
    var u14 = nums(4, 1, 9), x14 = u14[0], a14 = shuffle([u14[1], u14[2], u14[3]]);
    var p14 = ri(0, 3); a14.splice(p14, 0, x14); a14.push(x14);
    T.push(num('index()', 'a = ' + py(a14) + '\nprint(a.index(' + x14 + '))', p14));

    // 15. sort(reverse=True)
    var a15 = nums(5, 1, 40), rev = r() < 0.5;
    var b15 = a15.slice().sort(function (p, q) { return rev ? q - p : p - q; });
    T.push(lst(rev ? 'sort(reverse=True)' : 'sort()', 'a = ' + py(a15) + '\na.sort(' + (rev ? 'reverse=True' : '') + ')\nprint(a)', b15));

    // 16. Бірнеше әдіс қатарынан (слайдтағы «Жылдам тапсырма» сияқты)
    var u16 = nums(3, 1, 9), x16 = u16[0], y16 = ri(10, 20);
    var a16 = [x16, u16[1], x16, u16[2]], b16 = a16.concat([y16]);
    b16.splice(b16.indexOf(x16), 1); b16.sort(function (p, q) { return p - q; });
    T.push(lst('append, remove, sort', 'a = ' + py(a16) + '\na.append(' + y16 + ')\na.remove(' + x16 + ')\na.sort()\nprint(a)', b16));

    // 17. Бос орын: соңына қосу
    var FILL = '___ орнына не жазу керек? Тек түсіп қалған бөлігін жазыңыз.';
    var v17 = ri(10, 99);
    T.push({ type: 'input', title: 'Бос орын: соңына қосу', text: 'Бағдарлама ' + v17 + ' санын тізімнің соңына қосуы керек. ' + FILL,
      code: 'a = [1, 2, 3]\na.___(' + v17 + ')\nprint(a)', accept: ['append'], answerShown: 'append', hint: 'Тек әдістің атын жазыңыз.' });

    // 18. Бос орын: элементтер саны
    T.push({ type: 'input', title: 'Бос орын: элементтер саны', text: 'Бағдарлама тізімдегі элементтер санын шығаруы керек. ' + FILL,
      code: 'a = ' + py(nums(ri(4, 7), 1, 50)) + '\nprint(___(a))', accept: ['len'], answerShown: 'len', hint: 'Тек функцияның атын жазыңыз.' });

    // 19. for циклімен тізімді қарап шығу
    var a19 = nums(6, 1, 30), k19 = ri(8, 20), s19 = 0;
    a19.forEach(function (x) { if (x > k19) s19 += x; });
    if (s19 === 0) { a19[0] = k19 + 5; s19 = a19.filter(function (x) { return x > k19; }).reduce(function (p, q) { return p + q; }, 0); }
    T.push(num('for циклі және тізім', 'a = ' + py(a19) + '\ns = 0\nfor x in a:\n    if x > ' + k19 + ':\n        s = s + x\nprint(s)', s19));

    // 20. Жолдардың реті
    var a20 = nums(3, 1, 30), v20 = ri(31, 60);
    var lines20 = ['a = ' + py(a20), 'a.append(' + v20 + ')', 'a.sort(reverse=True)', 'print(a)'];
    var shown20;
    do { shown20 = shuffle(lines20); } while (shown20.join() === lines20.join());
    T.push({ type: 'order', title: 'Бағдарлама жолдарының реті',
      text: 'Бағдарлама алдымен тізім құрып, оның соңына ' + v20 + ' санын қосып, тізімді кему ретімен сұрыптап, экранға шығаратындай етіп жолдарды орналастырыңыз. Жолдарды ↑ және ↓ батырмаларымен жылжытыңыз.',
      lines: shown20, answer: lines20 });

    return T;
  }

  // ---------- Жауапты тексеру және көрсету ----------

  function norm(s) {
    return String(s == null ? '' : s).trim().replace(/\s+/g, ' ').replace(/\s*,\s*/g, ' ').replace(/\[\s+/g, '[').replace(/\s+\]/g, ']').toLowerCase();
  }
  function normSymbol(s) { return String(s == null ? '' : s).replace(/\s+/g, ''); }

  function isComplete(t, given) {
    if (t.type === 'input') return norm(given) !== '';
    if (t.type === 'choice') return !!given;
    if (t.type === 'match') return Array.isArray(given) && given.length === t.items.length && given.every(Boolean);
    if (t.type === 'order') return Array.isArray(given) && given.length === t.answer.length;
    return false;
  }

  function isCorrect(t, given) {
    if (!isComplete(t, given)) return false;
    if (t.type === 'input') {
      var g = t.symbol ? normSymbol(given) : norm(given);
      return t.accept.some(function (a) { return (t.symbol ? normSymbol(a) : norm(a)) === g; });
    }
    if (t.type === 'choice') return given === t.answer;
    return given.join('\n') === t.answer.join('\n');
  }

  function showGiven(t, given) {
    if (given == null || given === '' || (Array.isArray(given) && !given.length)) return '—';
    if (t.type === 'match') return t.items.map(function (it, i) { return it.name + ' → ' + (given[i] || '—'); }).join('; ');
    if (t.type === 'order') return given.join(' | ');
    return String(given);
  }

  function showAnswer(t) {
    if (t.type === 'match') return t.items.map(function (it, i) { return it.name + ' → ' + t.answer[i]; }).join('; ');
    if (t.type === 'order') return t.answer.join(' | ');
    if (t.type === 'input') return t.answerShown;
    return t.answer;
  }

  window.TASKS = { generate: generate, isComplete: isComplete, isCorrect: isCorrect, showGiven: showGiven, showAnswer: showAnswer, norm: norm };
})();
