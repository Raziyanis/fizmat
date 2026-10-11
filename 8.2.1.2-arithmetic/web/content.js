/* 8.2.1.2 «Позициялық санау жүйелерінде қосу және азайту»: теория, тапсырмаларды жасау (seed бойынша), тексеру.
 * Барлық жауап есептеледі, қолмен жазылмайды. K(kz, ru) — екі тілдегі мәтін. */
(function () {
  'use strict';
  function K(kz, ru) { return { kz: kz, ru: ru }; }
  var SUBD = '₀₁₂₃₄₅₆₇₈₉';
  function sub(q) { return String(q).split('').map(function (d) { return SUBD[+d]; }).join(''); }
  function B(n, q) { return n.toString(q).toUpperCase(); }
  function V(s, q) { return parseInt(s, q); }
  function N(s, q) { return s + sub(q); }                       // 1011₂
  function dv(c) { return parseInt(c, 36); }                    // цифрдың мәні (A = 10)
  function dname(c) { var v = dv(c); return v >= 10 ? c + '(' + v + ')' : c; }

  // ---------- Бағанмен қосу/азайту: кесте және қадамдар ----------
  function columnData(a, b, q, op) {
    var A = B(a, q), Bs = B(b, q), R = B(op === '+' ? a + b : a - b, q);
    var w = Math.max(A.length, Bs.length, R.length);
    var pad = function (s) { while (s.length < w) s = ' ' + s; return s; };
    var Ap = pad(A), Bp = pad(Bs), Rp = pad(R), marks = [], steps = [], c = 0;
    for (var k = 0; k < w; k++) marks.push(' ');
    for (var i = w - 1, n = 1; i >= 0; i--, n++) {
      var da = Ap[i] === ' ' ? 0 : dv(Ap[i]), db = Bp[i] === ' ' ? 0 : dv(Bp[i]);
      if (Ap[i] === ' ' && Bp[i] === ' ' && c === 0) break;
      if (op === '+') {
        var s = da + db + c, parts = [dname(Ap[i] === ' ' ? '0' : Ap[i]), dname(Bp[i] === ' ' ? '0' : Bp[i])];
        if (c) parts.push('1');
        if (Ap[i] === ' ' && Bp[i] === ' ') {
          steps.push(K(n + '-разряд: ойдағы 1-ді жазамыз.', n + '-й разряд: записываем единицу из «в уме».'));
          break;
        }
        var lhs = parts.join(' + ') + ' = ' + s;
        if (s >= q) {
          steps.push(K(n + '-разряд: ' + lhs + ' ≥ ' + q + ' → ' + s + ' − ' + q + ' = ' + (s - q) + ', ' + B(s - q, q) + ' жазамыз, 1 ойда',
                       n + '-й разряд: ' + lhs + ' ≥ ' + q + ' → ' + s + ' − ' + q + ' = ' + (s - q) + ', пишем ' + B(s - q, q) + ', 1 в уме'));
          if (i > 0) marks[i - 1] = '1';
          c = 1;
        } else {
          steps.push(K(n + '-разряд: ' + lhs + ' < ' + q + ' → ' + B(s, q) + ' жазамыз', n + '-й разряд: ' + lhs + ' < ' + q + ' → пишем ' + B(s, q)));
          c = 0;
        }
      } else {
        if (Ap[i] === ' ') break;
        var Bd = dname(Bp[i] === ' ' ? '0' : Bp[i]), x = da - c, top = dname(Ap[i]) + (c ? ' − 1' : '');
        if (x < db) {
          var d = da + q - c - db, ex = da + ' + ' + q + (c ? ' − 1' : '') + ' − ' + db + ' = ' + d;
          steps.push(K(n + '-разряд: ' + top + ' < ' + Bd + ' → сол жақтан 1 қарызға аламыз: ' + ex + ' → ' + B(d, q),
                       n + '-й разряд: ' + top + ' < ' + Bd + ' → занимаем 1 слева: ' + ex + ' → ' + B(d, q)));
          if (i > 0) marks[i - 1] = '•';
          c = 1;
        } else {
          var e2 = top + ' − ' + Bd + ' = ' + (x - db);
          steps.push(K(n + '-разряд: ' + e2 + ' → ' + B(x - db, q), n + '-й разряд: ' + e2 + ' → ' + B(x - db, q)));
          c = 0;
        }
      }
    }
    return { a: Ap, b: Bp, r: Rp, marks: marks.join(''), op: op, q: q, steps: steps, R: R };
  }
  // HTML: бағанмен жазу (ойдағы бір / қарызға алу белгілері жоғарыда)
  function columnHTML(a, b, q, op) {
    var d = columnData(a, b, q, op), w = d.a.length;
    var row = function (cls, first, s) {
      var h = '<tr class="' + cls + '"><td class="op">' + first + '</td>';
      for (var i = 0; i < w; i++) h += '<td>' + (s[i] === ' ' ? '' : s[i]) + '</td>';
      return h + '<td class="q">' + sub(q) + '</td></tr>';
    };
    var marks = row('marks', '', d.marks).replace('<td class="q">' + sub(q) + '</td>', '<td class="q"></td>');
    return '<table class="colcalc">' + marks + row('', '', d.a) + row('', op === '+' ? '+' : '−', d.b) + row('res', '', d.r) + '</table>';
  }
  function stepsHTML(a, b, q, op, lang) {
    return '<ol class="steps-list">' + columnData(a, b, q, op).steps.map(function (s) { return '<li>' + s[lang] + '</li>'; }).join('') + '</ol>';
  }
  function decCheck(a, b, q, op, lang) {
    var r = op === '+' ? a + b : a - b;
    return (lang === 'kz' ? 'Тексеру: ' : 'Проверка: ') + N(B(a, q), q) + ' = ' + a + ', ' + N(B(b, q), q) + ' = ' + b + '; ' + a + ' ' + (op === '+' ? '+' : '−') + ' ' + b + ' = ' + r + ' = ' + N(B(r, q), q) + ' ✔';
  }

  // ---------- Теория ----------
  function example(lang, title, a, b, q, op) {
    return '<div class="example"><p class="ex-title">' + title + ': ' + N(B(a, q), q) + ' ' + (op === '+' ? '+' : '−') + ' ' + N(B(b, q), q) + '</p>' +
      '<div class="ex-body">' + columnHTML(a, b, q, op) + stepsHTML(a, b, q, op, lang) + '</div><p class="check">' + decCheck(a, b, q, op, lang) + '</p></div>';
  }
  function table16() {
    var h = '<table class="t-table num16"><tr><th>10</th><th>2</th><th>8</th><th>16</th></tr>';
    for (var n = 0; n <= 16; n++) h += '<tr><td>' + n + '</td><td>' + B(n, 2) + '</td><td>' + B(n, 8) + '</td><td>' + B(n, 16) + '</td></tr>';
    return h + '</table>';
  }
  function theory(lang) {
    var kz = lang === 'kz', t = function (a, b) { return kz ? a : b; };
    var h = [];
    h.push('<h1 class="t-title">' + t('Позициялық санау жүйелерінде қосу және азайту', 'Сложение и вычитание в позиционных системах счисления') + '</h1>');
    h.push('<p class="t-sub">8.2.1.2 — ' + t('екілік, сегіздік және он алтылық санау жүйелерінде арифметикалық амалдарды орындау', 'выполнять арифметические операции в двоичной, восьмеричной и шестнадцатеричной системах счисления') + '</p>');

    h.push('<h2 class="t-h1">1. ' + t('Еске түсірейік', 'Вспомним') + '</h2>');
    h.push('<p>' + t('Санау жүйесінің <b>негізі q</b> — қолданылатын цифрлар саны. Цифрлар: 0-ден q − 1-ге дейін. Екілік жүйеде — 0 және 1, сегіздікте — 0…7, он алтылықта — 0…9 және A = 10, B = 11, C = 12, D = 13, E = 14, F = 15.',
      '<b>Основание q</b> системы счисления — количество используемых цифр. Цифры: от 0 до q − 1. В двоичной — 0 и 1, в восьмеричной — 0…7, в шестнадцатеричной — 0…9 и A = 10, B = 11, C = 12, D = 13, E = 14, F = 15.') + '</p>');
    h.push('<div class="t-row">' + table16() + '<div><p>' + t('Санның негізі оның оң жағында төменгі индекспен жазылады: 1011₂, 657₈, 3AF₁₆.', 'Основание записывают нижним индексом справа от числа: 1011₂, 657₈, 3AF₁₆.') + '</p>' +
      '<p>' + t('Ондық жүйеге аудару: әр цифрды негіздің дәрежесіне көбейтіп қосамыз. Мысалы, 657₈ = 6·64 + 5·8 + 7 = 431.', 'Перевод в десятичную: каждую цифру умножаем на степень основания и складываем. Например, 657₈ = 6·64 + 5·8 + 7 = 431.') + '</p>' +
      '<p>' + t('Екілік ↔ сегіздік: әр сегіздік цифр — 3 екілік цифр (триада). Екілік ↔ он алтылық: әр он алтылық цифр — 4 екілік цифр (тетрада). Мысалы, 3A₁₆ = 0011 1010₂ = 111010₂.', 'Двоичная ↔ восьмеричная: каждая восьмеричная цифра — 3 двоичные (триада). Двоичная ↔ шестнадцатеричная: каждая шестнадцатеричная цифра — 4 двоичные (тетрада). Например, 3A₁₆ = 0011 1010₂ = 111010₂.') + '</p></div></div>');

    h.push('<h2 class="t-h1">2. ' + t('Бағанмен қосу', 'Сложение столбиком') + '</h2>');
    h.push('<p>' + t('Ондық жүйедегідей оң жақтан бастап разряд бойынша қосамыз. Әр разрядта екі цифрды және ойдағы санды қосып, S қосындысын (ондық жүйеде) табамыз:', 'Как в десятичной системе, складываем по разрядам, начиная справа. В каждом разряде складываем две цифры и число «в уме», получаем сумму S (считаем в десятичной):') + '</p>');
    h.push('<ul class="rule"><li>' + t('<b>S &lt; q</b> — S-ті жазамыз, ештеңе көшпейді;', '<b>S &lt; q</b> — пишем S, ничего не переносим;') + '</li><li>' + t('<b>S ≥ q</b> — S − q жазамыз, ал <b>1-ді</b> келесі разрядқа көшіреміз («1 ойда»).', '<b>S ≥ q</b> — пишем S − q, а <b>1</b> переносим в следующий разряд («1 в уме»).') + '</li></ul>');
    h.push('<p class="note">' + t('Көшіру шегі — 10 емес, санау жүйесінің негізі q: екілікте 2, сегіздікте 8, он алтылықта 16.', 'Порог переноса — не 10, а основание q: в двоичной 2, в восьмеричной 8, в шестнадцатеричной 16.') + '</p>');
    h.push('<p>' + t('Екілік қосу кестесі: 0 + 0 = 0, 0 + 1 = 1, 1 + 1 = 10₂ («бір-нөл»), 1 + 1 + 1 = 11₂.', 'Таблица двоичного сложения: 0 + 0 = 0, 0 + 1 = 1, 1 + 1 = 10₂ («один-ноль»), 1 + 1 + 1 = 11₂.') + '</p>');
    h.push(example(lang, t('1-мысал', 'Пример 1'), 11, 7, 2, '+'));
    h.push(example(lang, t('2-мысал', 'Пример 2'), 431, 166, 8, '+'));
    h.push(example(lang, t('3-мысал', 'Пример 3'), 943, 457, 16, '+'));
    h.push('<p class="muted small">' + t('Жоғарыдағы кішкентай «1» — келесі разрядқа көшкен ойдағы бір.', 'Маленькая «1» сверху — единица «в уме», перенесённая в следующий разряд.') + '</p>');

    h.push('<h2 class="t-h1">3. ' + t('Бағанмен азайту', 'Вычитание столбиком') + '</h2>');
    h.push('<p>' + t('Оң жақтан бастап разряд бойынша азайтамыз. Жоғарғы цифр төменгі цифрдан кіші болса, сол жақтағы көршіден <b>1 қарызға аламыз</b>: көрші 1-ге кемиді, ал ағымдағы цифрға <b>q</b> қосылады (10 емес!).',
      'Вычитаем по разрядам, начиная справа. Если верхняя цифра меньше нижней, <b>занимаем 1</b> у соседа слева: сосед уменьшается на 1, а к текущей цифре прибавляется <b>q</b> (не 10!).') + '</p>');
    h.push('<p class="note">' + t('Жиі қате: қарызға алды, бірақ сол жақтағы цифрды 1-ге кемітуді ұмытты.', 'Частая ошибка: заняли, но забыли уменьшить цифру слева на 1.') + '</p>');
    h.push(example(lang, t('4-мысал', 'Пример 4'), 50, 11, 2, '−'));
    h.push(example(lang, t('5-мысал', 'Пример 5'), 323, 183, 8, '−'));
    h.push(example(lang, t('6-мысал', 'Пример 6'), 2820, 1737, 16, '−'));
    h.push('<p class="muted small">' + t('Жоғарыдағы «•» — 1 қарызға берген разряд (ол 1-ге кемиді).', '«•» сверху — разряд, у которого заняли 1 (он уменьшается на 1).') + '</p>');

    h.push('<h2 class="t-h1">4. ' + t('Әр түрлі жүйедегі сандар', 'Числа в разных системах') + '</h2>');
    h.push('<p>' + t('Сандар әр түрлі санау жүйесінде берілсе, алдымен оларды <b>бір жүйеге</b> (көбінесе ондық жүйеге) аударамыз, амалды орындаймыз, содан кейін жауапты қажетті жүйеге аударамыз.',
      'Если числа даны в разных системах, сначала переводим их в <b>одну систему</b> (чаще всего в десятичную), выполняем действие, затем переводим ответ в нужную систему.') + '</p>');
    h.push('<div class="example"><p class="ex-title">' + t('7-мысал', 'Пример 7') + ': 11010₂ + 27₈ + 1C₁₆ = ?₁₀</p><p>11010₂ = 16 + 8 + 2 = 26; 27₈ = 2·8 + 7 = 23; 1C₁₆ = 16 + 12 = 28.</p><p>26 + 23 + 28 = <b>77</b>.</p></div>');
    h.push('<div class="example"><p class="ex-title">' + t('8-мысал', 'Пример 8') + ': X + 1101₂ = 2A₁₆. ' + t('X-ті сегіздік жүйеде табыңыз.', 'Найдите X в восьмеричной системе.') + '</p><p>1101₂ = 13; 2A₁₆ = 2·16 + 10 = 42.</p><p>X = 42 − 13 = 29 = 3·8 + 5 = <b>35₈</b>.</p></div>');
    h.push('<div class="example"><p class="ex-title">' + t('9-мысал', 'Пример 9') + ': 110011₂ − 1110₂ ' + t('және', 'и') + ' 33₈ + 12₈ — ' + t('салыстырыңыз', 'сравните') + '.</p><p>110011₂ − 1110₂ = 51 − 14 = 37; 33₈ + 12₈ = 27 + 10 = 37.</p><p>37 = 37, ' + t('демек', 'значит') + ' <b>110011₂ − 1110₂ = 33₈ + 12₈</b>.</p></div>');

    h.push('<p>' + t('Екілік, сегіздік және он алтылық сандарды ондық жүйеге аудармай-ақ бір жүйеге келтіруге болады: сегіздік цифр — 3 екілік цифр, он алтылық цифр — 4 екілік цифр. Содан кейін бағанмен есептейміз.', 'Двоичные, восьмеричные и шестнадцатеричные числа можно привести к одной системе без перевода в десятичную: восьмеричная цифра — 3 двоичные, шестнадцатеричная — 4 двоичные. Затем считаем столбиком.') + '</p>');
    h.push('<p class="conv">' + convText(29, 8, 2, lang) + '</p>');
    h.push(example(lang, t('10-мысал', 'Пример 10'), 13, 29, 2, '+'));
    h.push('<p class="conv">' + convText(45, 2, 16, lang) + '</p>');
    h.push(example(lang, t('11-мысал', 'Пример 11'), 709, 45, 16, '−'));
    h.push('<h2 class="t-h1">5. ' + t('Өзіңді тексер', 'Проверь себя') + '</h2>');
    h.push('<ul><li>' + t('Жауапты ондық жүйе арқылы тексеріңіз: сандарды ондыққа аударып, амалды орындап, нәтижені салыстырыңыз.', 'Проверяйте ответ через десятичную систему: переведите числа в десятичную, выполните действие и сравните.') + '</li>' +
      '<li>' + t('Азайтуды қосу арқылы тексеруге болады: айырма + азайтқыш = азайғыш.', 'Вычитание можно проверить сложением: разность + вычитаемое = уменьшаемое.') + '</li>' +
      '<li>' + t('Жауапта жүйеде жоқ цифр болмауы керек: сегіздік санда 8 және 9 болмайды, екілікте — тек 0 мен 1.', 'В ответе не должно быть «чужих» цифр: в восьмеричном числе нет 8 и 9, в двоичном — только 0 и 1.') + '</li></ul>');
    return h.join('\n');
  }

  // ---------- Кездейсоқ сандар ----------
  function rng(seed) {
    var a = seed >>> 0;
    return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function ri(r, lo, hi) { return lo + Math.floor(r() * (hi - lo + 1)); }
  function carries(a, b, q) { var c = 0, n = 0; while (a || b || c) { var s = a % q + b % q + c; c = s >= q ? 1 : 0; n += c; a = Math.floor(a / q); b = Math.floor(b / q); } return n; }
  function borrows(a, b, q) { var c = 0, n = 0; while (a) { var x = a % q - c - b % q; c = x < 0 ? 1 : 0; n += c; a = Math.floor(a / q); b = Math.floor(b / q); } return n; }
  function hasLetter(n) { return /[A-F]/.test(B(n, 16)); }
  function pickAdd(r, q, lo, hi, minC, cond) {
    for (var k = 0; k < 500; k++) { var a = ri(r, lo, hi), b = ri(r, lo, hi); if (carries(a, b, q) >= minC && (!cond || cond(a, b))) return [a, b]; }
    return [lo + 7, lo + 9];
  }
  function pickSub(r, q, alo, ahi, blo, bhi, minB, cond) {
    for (var k = 0; k < 500; k++) { var a = ri(r, alo, ahi), b = ri(r, blo, Math.min(bhi, a - 1)); if (b > 0 && borrows(a, b, q) >= minB && (!cond || cond(a, b))) return [a, b]; }
    return [ahi, blo];
  }
  function shuffle(arr, r) { for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; }
  var QN = { 2: K('екілік', 'двоичной'), 8: K('сегіздік', 'восьмеричной'), 10: K('ондық', 'десятичной'), 16: K('он алтылық', 'шестнадцатеричной') };

  // ---------- Тапсырмалар ----------
  function colTask(r, q, op, title) {
    var p = op === '+'
      ? (q === 2 ? pickAdd(r, 2, 16, 63, 3) : q === 8 ? pickAdd(r, 8, 64, 511, 2) : pickAdd(r, 16, 256, 4095, 2, function (a, b) { return hasLetter(a) && hasLetter(b); }))
      : (q === 2 ? pickSub(r, 2, 40, 63, 7, 31, 2) : q === 8 ? pickSub(r, 8, 256, 511, 64, 255, 2) : pickSub(r, 16, 2048, 4095, 256, 2047, 2, function (a, b) { return hasLetter(a) || hasLetter(b); }));
    var a = p[0], b = p[1], res = op === '+' ? a + b : a - b;
    return { type: 'input', kind: 'col', title: title, q: q, op: op, a: a, b: b, expr: N(B(a, q), q) + ' ' + (op === '+' ? '+' : '−') + ' ' + N(B(b, q), q),
      prompt: K('Есептеңіз. Жауапты ' + QN[q].kz + ' жүйеде жазыңыз.', 'Вычислите. Ответ запишите в ' + QN[q].ru + ' системе.'),
      fields: [{ q: q, key: B(res, q), label: K('Жауабы', 'Ответ') }], max: 1, layout: null };
  }
  // Бағанның макеті (app.js салады): rows — carry (ойдағы сан), digits (s: цифрлар, «*» — оқушы толтыратын ұяшық), cells (оқушы толтыратын қатар)
  function padL(x, w) { while (x.length < w) x = ' ' + x; return x; }
  function colLayout(it) {
    var q = it.q, A = B(it.a, q), Bs = B(it.b, q), R = B(it.op === '+' ? it.a + it.b : it.a - it.b, q), sg = it.op === '+' ? '+' : '−';
    var w = Math.max(A.length, Bs.length, R.length);
    return { w: w, rows: [{ t: 'carry' }, { t: 'digits', s: padL(A, w) }, { t: 'digits', s: padL(Bs, w), op: sg }, { t: 'cells', role: 'res', line: true }] };
  }
  // 7. Жасырын цифрлар: A + B = C, A-да бір цифр, B-да бір цифр жасырылған (әр түрлі разрядта — шешімі біреу)
  function starsTask(r, q) {
    for (var t = 0; t < 300; t++) {
      var p = q === 8 ? pickAdd(r, 8, 64, 511, 2) : pickAdd(r, 16, 256, 4095, 1, function (a, b) { return hasLetter(a) || hasLetter(b); });
      var a = p[0], b = p[1], A = B(a, q), Bs = B(b, q), C2 = B(a + b, q), w = C2.length;
      var pa = ri(r, 0, A.length - 1), pb = ri(r, 0, Bs.length - 1);
      if (A.length - pa === Bs.length - pb) continue;                     // әр түрлі разряд
      var As = A.slice(0, pa) + '*' + A.slice(pa + 1), Bstar = Bs.slice(0, pb) + '*' + Bs.slice(pb + 1);
      return { type: 'input', kind: 'stars', title: K('Жасырын цифрларды табыңыз', 'Найдите скрытые цифры'), q: q, op: '+', a: a, b: b,
        expr: N(As, q) + ' + ' + N(Bstar, q) + ' = ' + N(C2, q),
        prompt: K('Жұлдызшалардың (*) орнына қай цифрлар тұруы керек? Бос ұяшықтарға жазыңыз.', 'Какие цифры стоят на месте звёздочек (*)? Впишите их в пустые клетки.'),
        layout: { w: w, rows: [{ t: 'carry' }, { t: 'digits', s: padL(As, w) }, { t: 'digits', s: padL(Bstar, w), op: '+' }, { t: 'digits', s: padL(C2, w), line: true }] },
        fields: [{ q: q, key: A[pa] + Bs[pb], label: K('Жасырын цифрлар', 'Скрытые цифры') }], max: 1 };
    }
  }
  // 8. Қатені тап: оқушының жауабында жиі қате бар — дұрыс жауапты бағанмен жазу
  function noCarry(a, b, q) { var s = '', x = a, y = b; while (x || y) { s = B((x % q + y % q) % q, q) + s; x = Math.floor(x / q); y = Math.floor(y / q); } return s.replace(/^0+(?=.)/, ''); }
  function tenCarry(a, b, q) { var s = '', x = a, y = b, c = 0; while (x || y || c) { var t = x % q + y % q + c; s = String(t >= 10 ? t - 10 : t) + s; c = t >= 10 ? 1 : 0; x = Math.floor(x / q); y = Math.floor(y / q); } return s; }   // «10-нан кейін көшіру» қатесі
  function noDec(a, b, q) { var s = '', x = a, y = b; while (x) { var da = x % q, db = y % q; s = B(da < db ? da + q - db : da - db, q) + s; x = Math.floor(x / q); y = Math.floor(y / q); } return s.replace(/^0+(?=.)/, ''); }   // қарызға алды, бірақ кемітпеді
  var ERRS = {
    ten: K('Қате: көшіру 10-нан кейін жасалған, ал көшіру шегі — жүйенің негізі ', 'Ошибка: перенос сделан после 10, а порог переноса — основание '),
    nocarry: K('Қате: ойдағы бір келесі разрядқа қосылмаған.', 'Ошибка: единица «в уме» не прибавлена к следующему разряду.'),
    nodec: K('Қате: қарызға алынды, бірақ сол жақтағы цифр 1-ге кемітілмеген.', 'Ошибка: заняли, но не уменьшили цифру слева на 1.'),
  };
  function fixTask(r, q, err) {
    for (var t = 0; t < 400; t++) {
      var op = err === 'nodec' ? '−' : '+';
      var p = op === '+' ? (q === 8 ? pickAdd(r, 8, 64, 511, 2) : pickAdd(r, 16, 256, 4095, 2)) : (q === 8 ? pickSub(r, 8, 256, 511, 64, 255, 1) : pickSub(r, 16, 2048, 4095, 256, 2047, 1));
      var a = p[0], b = p[1], right = B(op === '+' ? a + b : a - b, q);
      var wrong = err === 'ten' ? tenCarry(a, b, q) : err === 'nocarry' ? noCarry(a, b, q) : noDec(a, b, q);
      if (!wrong || wrong === right || wrong[0] === '0') continue;
      if (err === 'ten' && !/[89]/.test(wrong) && q === 8) continue;    // қате көрініп тұрсын
      var w = Math.max(B(a, q).length, B(b, q).length, right.length, wrong.length);
      return { type: 'input', kind: 'fix', title: K('Қатені тауып, түзетіңіз', 'Найдите и исправьте ошибку'), q: q, op: op, a: a, b: b, wrong: wrong, err: err,
        expr: N(B(a, q), q) + ' ' + op + ' ' + N(B(b, q), q) + ' = ' + N(wrong, q) + ' ✗',
        prompt: K('Оқушы мысалды қате шығарды. Дұрыс жауапты төменгі ұяшықтарға бағанмен жазыңыз.', 'Ученик решил пример с ошибкой. Запишите верный ответ столбиком в нижние клетки.'),
        layout: { w: w, rows: [{ t: 'carry' }, { t: 'digits', s: padL(B(a, q), w) }, { t: 'digits', s: padL(B(b, q), w), op: op }, { t: 'digits', s: padL(wrong, w), line: true, cls: 'wrong', side: K('оқушының жауабы', 'ответ ученика') }, { t: 'cells', role: 'res', side: K('дұрыс жауап', 'верный ответ') }] },
        fields: [{ q: q, key: right, label: K('Дұрыс жауап', 'Верный ответ') }], max: 1 };
    }
  }
  // 9–10. Әр түрлі жүйедегі сандар: екінші санды бірінші санның жүйесіне аударып (триада/тетрада), бағанмен есептеу
  function convTask(r, q, bq, op) {
    for (var t = 0; t < 400; t++) {
      var a, b;
      if (q === 2) { a = ri(r, 20, 63); b = ri(r, 9, 63); }            // a₂ ± b₈ → екілік
      else { a = ri(r, 300, 4095); b = ri(r, 33, 255); }                // a₁₆ ± b₂ → он алтылық
      if (op === '−' && b >= a) continue;
      if (op === '+' ? carries(a, b, q) < 1 : borrows(a, b, q) < 1) continue;
      var res = op === '+' ? a + b : a - b, A = B(a, q), R = B(res, q), Bq = B(b, q), w = Math.max(A.length, Bq.length, R.length);
      return { type: 'input', kind: 'conv', title: q === 2 ? K('Екілік жүйеге аударып есептеңіз', 'Переведите в двоичную и вычислите') : K('Он алтылық жүйеге аударып есептеңіз', 'Переведите в шестнадцатеричную и вычислите'),
        q: q, bq: bq, op: op, a: a, b: b,
        expr: N(A, q) + ' ' + op + ' ' + N(B(b, bq), bq) + ' = ?' + sub(q),
        prompt: q === 2 ? K('Сегіздік санды екілік жүйеге аударыңыз (әр цифр — 3 екілік цифр), содан кейін бағанмен есептеңіз. Жауап — екілік жүйеде.', 'Переведите восьмеричное число в двоичную (каждая цифра — 3 двоичные цифры), затем вычислите столбиком. Ответ — в двоичной системе.')
          : K('Екілік санды он алтылық жүйеге аударыңыз (оңнан бастап 4 цифрдан топтаңыз), содан кейін бағанмен есептеңіз. Жауап — он алтылық жүйеде.', 'Переведите двоичное число в шестнадцатеричную (группы по 4 цифры справа), затем вычислите столбиком. Ответ — в шестнадцатеричной системе.'),
        layout: { w: w, rows: [{ t: 'carry' }, { t: 'digits', s: padL(A, w) }, { t: 'cells', role: 'help', op: op, side: K(N(B(b, bq), bq) + ' = ?' + sub(q), N(B(b, bq), bq) + ' = ?' + sub(q)) }, { t: 'cells', role: 'res', line: true }] },
        fields: [{ q: q, key: R, label: K('Жауабы', 'Ответ') }], max: 1 };
    }
  }
  function convText(b, bq, q, lang) {
    var src = B(b, bq);
    if (bq === 8) return N(src, 8) + ' = ' + src.split('').map(function (d) { return ('00' + B(dv(d), 2)).slice(-3); }).join(' ') + ' = ' + N(B(b, 2), 2) + (lang === 'kz' ? ' (әр цифр — 3 екілік цифр)' : ' (каждая цифра — 3 двоичные)');
    var bits = src; while (bits.length % 4) bits = '0' + bits;
    var groups = bits.match(/.{4}/g);
    return N(src, 2) + ' = ' + groups.join(' ') + ' = ' + groups.map(function (g) { return B(parseInt(g, 2), 16); }).join('') + sub(16) + (lang === 'kz' ? ' (оңнан 4 цифрдан)' : ' (по 4 цифры справа)');
  }
  // ★1. Теңдеу: X + a₂ = b₁₆ → X ондық және сегіздік
  function eqTask(r) {
    var a = ri(r, 9, 31), x = ri(r, 12, 60), b = x + a;
    return { type: 'input', kind: 'eq', star: true, title: K('★ Теңдеуді шешіңіз', '★ Решите уравнение'), a: a, b: b, x: x,
      expr: 'X + ' + N(B(a, 2), 2) + ' = ' + N(B(b, 16), 16),
      prompt: K('X-тің мәнін табыңыз: алдымен ондық жүйеде, содан кейін сегіздік жүйеде жазыңыз.', 'Найдите X: сначала запишите его в десятичной системе, затем в восьмеричной.'),
      fields: [{ q: 10, key: String(x), label: K('X ондық жүйеде', 'X в десятичной') }, { q: 8, key: B(x, 8), label: K('X сегіздік жүйеде', 'X в восьмеричной') }], max: 2 };
  }
  // ★2. Өрнектің мәні: ондық, содан кейін екілік
  function exprTask(r) {
    var a = ri(r, 33, 127), b = ri(r, 10, 63), c = ri(r, 17, 80);
    if (a + b - c < 8) c = a + b - ri(r, 8, 30);
    var res = a + b - c;
    return { type: 'input', kind: 'expr', star: true, title: K('★ Өрнектің мәнін табыңыз', '★ Найдите значение выражения'), vals: [a, b, c],
      expr: N(B(a, 8), 8) + ' + ' + N(B(b, 16), 16) + ' − ' + N(B(c, 2), 2),
      prompt: K('Өрнектің мәнін алдымен ондық жүйеде, содан кейін екілік жүйеде жазыңыз.', 'Запишите значение выражения сначала в десятичной системе, затем в двоичной.'),
      fields: [{ q: 10, key: String(res), label: K('Ондық жүйеде', 'В десятичной') }, { q: 2, key: B(res, 2), label: K('Екілік жүйеде', 'В двоичной') }], max: 2 };
  }
  // ★3. Негізді табу: x_q + y_q = z_q, q = ?; сол жүйеде u_q + v_q = ?
  function baseSols(xs, ys, zs) {
    var mx = Math.max.apply(null, (xs + ys + zs).split('').map(dv)), out = [];
    for (var q = Math.max(2, mx + 1); q <= 16; q++) if (V(xs, q) + V(ys, q) === V(zs, q)) out.push(q);
    return out;
  }
  function baseTask(r) {
    for (var k = 0; k < 1000; k++) {
      var q = ri(r, 5, 9), x = ri(r, q + 1, q * q - 1), y = ri(r, q + 1, q * q - 1);
      if (x + y >= q * q || carries(x, y, q) < 1) continue;
      var xs = B(x, q), ys = B(y, q), zs = B(x + y, q), s = baseSols(xs, ys, zs);
      if (s.length !== 1 || s[0] !== q) continue;
      var u = ri(r, q + 1, q * q - 1), v = ri(r, q + 1, q * q - 1);
      if (carries(u, v, q) < 1) continue;
      return { type: 'input', kind: 'base', star: true, title: K('★ Санау жүйесінің негізін табыңыз', '★ Найдите основание системы счисления'), bq: q, x: x, y: y, u: u, v: v,
        expr: xs + '<sub>q</sub> + ' + ys + '<sub>q</sub> = ' + zs + '<sub>q</sub>', html: true,
        prompt: K('Теңдік q негізді жүйеде жазылған. q-ды табыңыз. Содан кейін сол жүйеде ' + B(u, q) + '<sub>q</sub> + ' + B(v, q) + '<sub>q</sub> қосындысын есептеңіз.',
                  'Равенство записано в системе с основанием q. Найдите q. Затем в этой же системе вычислите ' + B(u, q) + '<sub>q</sub> + ' + B(v, q) + '<sub>q</sub>.'),
        fields: [{ q: 10, key: String(q), label: K('q (ондық жүйеде)', 'q (в десятичной)') }, { q: q, inputQ: 16, subText: 'q', key: B(u + v, q), label: K(B(u, q) + '<sub>q</sub> + ' + B(v, q) + '<sub>q</sub> =', B(u, q) + '<sub>q</sub> + ' + B(v, q) + '<sub>q</sub> =') }], max: 2 };
    }
  }
  // Бір тапсырма — бірнеше мысал (негізгі тапсырмаларда 4 мысал, әрқайсысы 0,25 балл)
  function group(items, per) {
    var units = items.reduce(function (n, it) { return n + (it.type === 'input' ? it.fields.length : 1); }, 0);
    return { type: 'group', title: items[0].title, prompt: items[0].prompt, star: !!items[0].star, items: items, per: per, units: units, max: units * per };
  }
  function four(make) {   // 4 әр түрлі мысал
    var out = [], seen = {};
    for (var k = 0; out.length < 4 && k < 200; k++) {
      var it = make(out.length), id = it.expr || (it.left + '|' + it.right);
      if (!seen[id]) { seen[id] = 1; out.push(it); }
    }
    return out;
  }
  var PER = 0.25;
  function generate(seed) {
    var r = rng(seed), T = [];
    var col = function (q, op, title) { return group(four(function () { return colTask(r, q, op, title); }), PER); };
    T.push(col(2, '+', K('Екілік жүйеде қосу', 'Сложение в двоичной системе')));
    T.push(col(2, '−', K('Екілік жүйеде азайту', 'Вычитание в двоичной системе')));
    T.push(col(8, '+', K('Сегіздік жүйеде қосу', 'Сложение в восьмеричной системе')));
    T.push(col(8, '−', K('Сегіздік жүйеде азайту', 'Вычитание в восьмеричной системе')));
    T.push(col(16, '+', K('Он алтылық жүйеде қосу', 'Сложение в шестнадцатеричной системе')));
    T.push(col(16, '−', K('Он алтылық жүйеде азайту', 'Вычитание в шестнадцатеричной системе')));
    var sq = shuffle([8, 8, 16, 16], r);
    T.push(group(four(function (n) { return starsTask(r, sq[n]); }), PER));
    var fx = shuffle([[8, 'ten'], [16, 'nocarry'], [8, 'nodec'], [16, 'nodec']], r);
    T.push(group(four(function (n) { return fixTask(r, fx[n][0], fx[n][1]); }), PER));
    var o9 = shuffle(['+', '+', '−', '+'], r), o10 = shuffle(['+', '−', '−', '+'], r);
    T.push(group(four(function (n) { return convTask(r, 2, 8, o9[n]); }), PER));
    T.push(group(four(function (n) { return convTask(r, 16, 2, o10[n]); }), PER));
    T.push(group([eqTask(r)], 1));
    T.push(group([exprTask(r)], 1));
    T.push(group([baseTask(r)], 1));
    return T;
  }

  // ---------- Тексеру ----------
  function norm(s) {   // бос орын, индекс, алдыңғы нөлдер алынады; әріптер — бас әріп
    s = String(s == null ? '' : s).toUpperCase().replace(/[\s₀-₉]/g, '');
    s = s.replace(/^0+(?=.)/, '');
    return s;
  }
  function fieldOk(f, v) { return norm(v) !== '' && norm(v) === norm(f.key); }
  // Бір мысал (item): input — жауап өрістері, choice/cmp — таңдалған нөмір
  function iEmpty(it) { return it.type === 'input' ? it.fields.map(function () { return ''; }) : null; }
  function iUnits(it, a) {   // дұрыс жауаптар саны
    if (it.type === 'input') return it.fields.reduce(function (s, f, i) { return s + (a && fieldOk(f, a[i]) ? 1 : 0); }, 0);
    return a === it.key ? 1 : 0;
  }
  function iTouched(it, a) { return it.type === 'input' ? !!a && a.some(function (v) { return norm(v) !== ''; }) : a !== null && a !== undefined; }
  function iComplete(it, a) { return it.type === 'input' ? !!a && a.every(function (v) { return norm(v) !== ''; }) : a !== null && a !== undefined; }
  // Тапсырма (бірнеше мысал)
  function empty(t) { return t.items.map(iEmpty); }
  function score(t, a) { return t.per * t.items.reduce(function (s, it, k) { return s + iUnits(it, a && a[k]); }, 0); }
  function touched(t, a) { return t.items.some(function (it, k) { return iTouched(it, a && a[k]); }); }
  function complete(t, a) { return t.items.every(function (it, k) { return iComplete(it, a && a[k]); }); }
  // Талдаудағы түсіндірме (HTML)
  function solution(t, lang) {
    var kz = lang === 'kz', tr = function (a, b) { return kz ? a : b; };
    switch (t.kind || t.type) {
      case 'col': return columnHTML(t.a, t.b, t.q, t.op) + stepsHTML(t.a, t.b, t.q, t.op, lang) + '<p class="check">' + decCheck(t.a, t.b, t.q, t.op, lang) + '</p>';
      case 'stars': return '<p>' + tr('Жасырын цифрлар: ', 'Скрытые цифры: ') + '<b>' + t.fields[0].key.split('').join(tr(' және ', ' и ')) + '</b>. ' + tr('Толық жазылуы:', 'Полная запись:') + '</p>' + columnHTML(t.a, t.b, t.q, '+') + '<p class="check">' + decCheck(t.a, t.b, t.q, '+', lang) + '</p>';
      case 'fix': return '<p class="err">' + ERRS[t.err][lang] + (t.err === 'ten' ? t.q + '.' : '') + '</p>' + columnHTML(t.a, t.b, t.q, t.op) + stepsHTML(t.a, t.b, t.q, t.op, lang) + '<p class="check">' + decCheck(t.a, t.b, t.q, t.op, lang) + '</p>';
      case 'conv': return '<p>' + convText(t.b, t.bq, t.q, lang) + '</p>' + columnHTML(t.a, t.b, t.q, t.op) + stepsHTML(t.a, t.b, t.q, t.op, lang) + '<p class="check">' + decCheck(t.a, t.b, t.q, t.op, lang) + '</p>';
      case 'eq': { var o = B(t.x, 8); return '<p>' + N(B(t.a, 2), 2) + ' = ' + t.a + '; ' + N(B(t.b, 16), 16) + ' = ' + t.b + '.</p><p>X = ' + t.b + ' − ' + t.a + ' = <b>' + t.x + '</b>; ' + t.x + ' = ' + o[0] + '·8 + ' + o[1] + ' → <b>' + N(o, 8) + '</b>.</p>'; }
      case 'expr': return '<p>' + N(B(t.vals[0], 8), 8) + ' = ' + t.vals[0] + '; ' + N(B(t.vals[1], 16), 16) + ' = ' + t.vals[1] + '; ' + N(B(t.vals[2], 2), 2) + ' = ' + t.vals[2] + '.</p><p>' + t.vals[0] + ' + ' + t.vals[1] + ' − ' + t.vals[2] + ' = <b>' + t.fields[0].key + '</b> = <b>' + N(t.fields[1].key, 2) + '</b>.</p>';
      case 'base': {
        var q = t.bq, xs = B(t.x, q), ys = B(t.y, q);
        return '<p>' + tr('Цифрлар бойынша жазамыз: ', 'Распишем по цифрам: ') + xs[0] + '·q + ' + xs[1] + ' + ' + ys[0] + '·q + ' + ys[1] + ' = ' + B(t.x + t.y, q)[0] + '·q + ' + B(t.x + t.y, q)[1] + '. ' + tr('Осыдан ', 'Отсюда ') + '<b>q = ' + q + '</b> (' + tr('тексеру', 'проверка') + ': ' + t.x + ' + ' + t.y + ' = ' + (t.x + t.y) + ').</p>' +
          '<p>' + tr('Енді ', 'Теперь ') + q + tr('-лік жүйеде қосамыз:', '-ичной системе складываем:') + '</p>' + columnHTML(t.u, t.v, q, '+') + stepsHTML(t.u, t.v, q, '+', lang);
      }
    }
    return '';
  }

  window.CONTENT = { K: K, theory: theory, generate: generate, empty: empty, score: score, touched: touched, complete: complete, norm: norm, fieldOk: fieldOk, iUnits: iUnits, iComplete: iComplete,
    solution: solution, sub: sub, B: B, colLayout: colLayout, columnData: columnData, baseSols: baseSols, carries: carries, borrows: borrows };
})();
