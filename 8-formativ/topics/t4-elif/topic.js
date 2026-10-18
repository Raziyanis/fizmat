/* Тема 4. Множественный выбор: elif (8.1.4.1). */
window.TOPIC = {
  id: 't4-elif', file: 'formativ-4-elif.html',
  title: { kz: 'Көп таңдау: elif операторы', ru: 'Множественный выбор: оператор elif' },
  goal: { kz: '8.1.4.1 — elif құрылымын қолдану; практикалық есептерде бекіту', ru: '8.1.4.1 — применять конструкцию elif; закрепить на практических задачах' },
  generate: function (seed, lang, H) {
    var L = H.L, ri = H.ri, pick = H.pick, T = [];
    var Q = L('Программа не шығарады?', 'Что выведет программа?');
    var grade = function (s) { return s >= 85 ? 5 : s >= 70 ? 4 : s >= 50 ? 3 : 2; };

    var s1 = pick([ri(86, 100), ri(70, 84), ri(50, 69), ri(0, 49)]);
    var c1 = 's = ' + s1 + '\nif s >= 85:\n    print(5)\nelif s >= 70:\n    print(4)\nelif s >= 50:\n    print(3)\nelse:\n    print(2)';
    T.push(H.quiz({ level: 'A', title: L('Баға', 'Оценка'), text: Q, code: c1, check: { code: c1 } }, String(grade(s1)), ['2', '3', '4', '5']));

    var x2 = ri(11, 40), c2 = 'x = ' + x2 + '\nif x > 0:\n    print("A")\nelif x > 10:\n    print("B")\nelse:\n    print("C")';
    T.push(H.quiz({ level: 'B', title: L('Шарттардың реті', 'Порядок условий'), text: Q, code: c2, check: { code: c2 }, why: L('Бірінші ақиқат шарт қана орындалады: x > 0 ақиқат, сондықтан «B» тармағына жетпейді.', 'Выполняется только первое истинное условие: x > 0 истинно, поэтому до ветки «B» дело не доходит.') },
      'A', ['B', 'A B', 'C']));

    T.push(H.quiz({ level: 'A', title: L('Неше тармақ орындалады?', 'Сколько веток выполнится?'), text: L('if … elif … elif … else құрылымында неше тармақ орындалады?', 'Сколько веток выполняется в конструкции if … elif … elif … else?') },
      L('Тек біреуі — бірінші ақиқат шарттағы (немесе else)', 'Ровно одна — с первым истинным условием (или else)'),
      [L('Ақиқат шарттардың бәрі', 'Все ветки с истинными условиями'), L('Әрқашан else тармағы', 'Всегда ветка else'), L('Бірде-біреуі орындалмауы мүмкін, тіпті else болса да', 'Может не выполниться ни одна, даже если есть else')]));

    var t4 = pick([ri(-20, -1), 0, ri(1, 15), ri(16, 40)]);
    var c4 = 't = ' + t4 + '\nif t < 0:\n    print("ice")\nelif t == 0:\n    print("zero")\nelif t < 16:\n    print("cool")\nelse:\n    print("warm")';
    T.push(H.quiz({ level: 'B', title: L('Температура', 'Температура'), text: Q, code: c4, check: { code: c4 } },
      t4 < 0 ? 'ice' : t4 === 0 ? 'zero' : t4 < 16 ? 'cool' : 'warm', ['ice', 'zero', 'cool', 'warm']));

    T.push(H.quiz({ level: 'A', title: L('Кілт сөз', 'Ключевое слово'), text: L('Python-да «әйтпесе, егер» (иначе, если) қалай жазылады?', 'Как в Python записывается «иначе, если»?') },
      'elif', ['else if', 'elseif', 'elsif']));

    // ---------- Программа ----------
    T.push({ level: 'A', title: L('Санның таңбасы', 'Знак числа'),
      text: L('Бүтін n саны берілген. n > 0 болса 1, n < 0 болса -1, n = 0 болса 0 шығарыңыз.', 'Дано целое число n. Выведите 1, если n > 0; -1, если n < 0; 0, если n = 0.'),
      input: L('Бір бүтін сан n (|n| ≤ 10⁹).', 'Одно целое число n (|n| ≤ 10⁹).'), output: L('1, -1 немесе 0.', '1, -1 или 0.'),
      tests: H.tests(function (i) { var n = i === 7 ? 0 : i % 2 ? -ri(1, 1000000000) : ri(1, 1000000000); return { input: String(n), output: String(n > 0 ? 1 : n < 0 ? -1 : 0) }; }),
      solution: 'n = int(input())\nif n > 0:\n    print(1)\nelif n < 0:\n    print(-1)\nelse:\n    print(0)' });

    T.push({ level: 'A', title: L('Балл бойынша баға', 'Оценка по баллам'),
      text: L('Тест балы s берілген (0-ден 100-ге дейін). Баға: 85 және жоғары — 5, 70–84 — 4, 50–69 — 3, 50-ден төмен — 2. Бағаны шығарыңыз.', 'Дан балл за тест s (от 0 до 100). Оценка: 85 и выше — 5, 70–84 — 4, 50–69 — 3, ниже 50 — 2. Выведите оценку.'),
      input: L('Бір бүтін сан s.', 'Одно целое число s.'), output: L('Бір сан: 2, 3, 4 немесе 5.', 'Одно число: 2, 3, 4 или 5.'),
      tests: H.tests(function (i) { var s = [85, 84, 70, 69, 50, 49, 100, 0][i]; if (i < 6 && H.r() < 0.4) s = ri(0, 100); return { input: String(s), output: String(grade(s)) }; }),
      solution: 's = int(input())\nif s >= 85:\n    print(5)\nelif s >= 70:\n    print(4)\nelif s >= 50:\n    print(3)\nelse:\n    print(2)' });

    var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    T.push({ level: 'B', title: L('Апта күні', 'День недели'),
      text: L('Апта күнінің нөмірі d берілген (1 — дүйсенбі). Күннің атын ағылшынша шығарыңыз: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday. d 1-ден 7-ге дейінгі аралықта болмаса, Error шығарыңыз.',
        'Дан номер дня недели d (1 — понедельник). Выведите название дня по-английски: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday. Если d не от 1 до 7, выведите Error.'),
      input: L('Бір бүтін сан d (|d| ≤ 100).', 'Одно целое число d (|d| ≤ 100).'), output: L('Бір сөз.', 'Одно слово.'),
      tests: H.tests(function (i) { var d = i === 6 ? ri(8, 100) : i === 7 ? pick([0, -3]) : ri(1, 7); return { input: String(d), output: d >= 1 && d <= 7 ? days[d - 1] : 'Error' }; }),
      solution: 'd = int(input())\nif d == 1:\n    print("Monday")\nelif d == 2:\n    print("Tuesday")\nelif d == 3:\n    print("Wednesday")\nelif d == 4:\n    print("Thursday")\nelif d == 5:\n    print("Friday")\nelif d == 6:\n    print("Saturday")\nelif d == 7:\n    print("Sunday")\nelse:\n    print("Error")' });

    T.push({ level: 'B', title: L('Жас санаты', 'Возрастная группа'),
      text: L('Адамның жасы a берілген. 0–6 болса child, 7–17 болса student, 18–64 болса adult, 65 және одан жоғары болса senior шығарыңыз.', 'Дан возраст человека a. Выведите child, если 0–6; student, если 7–17; adult, если 18–64; senior, если 65 и больше.'),
      input: L('Бір бүтін сан a (0 ≤ a ≤ 120).', 'Одно целое число a (0 ≤ a ≤ 120).'), output: L('Бір сөз.', 'Одно слово.'),
      tests: H.tests(function (i) { var a = [6, 7, 17, 18, 64, 65][i]; if (a === undefined) a = ri(0, 120); var g = a <= 6 ? 'child' : a <= 17 ? 'student' : a <= 64 ? 'adult' : 'senior'; return { input: String(a), output: g }; }),
      solution: 'a = int(input())\nif a <= 6:\n    print("child")\nelif a <= 17:\n    print("student")\nelif a <= 64:\n    print("adult")\nelse:\n    print("senior")' });

    T.push({ level: 'C', title: L('Калькулятор', 'Калькулятор'),
      text: L('Бір жолда бос орын арқылы бүтін a, амал белгісі (+, -, *, /) және бүтін b берілген. Амалдың нәтижесін шығарыңыз. «/» — бүтін бөлу (//). b = 0 болса және амал «/» болса, Error шығарыңыз.',
        'В одной строке через пробел даны целое a, знак операции (+, -, *, /) и целое b. Выведите результат. «/» — деление нацело (//). Если операция «/» и b = 0, выведите Error.'),
      input: L('Бір жолда: a амал b (|a|, |b| ≤ 1000). Мысалы: 7 * 3', 'В одной строке: a операция b (|a|, |b| ≤ 1000). Например: 7 * 3'), output: L('Бір сан немесе Error.', 'Одно число или Error.'),
      tests: H.tests(function (i) {
        var op = ['+', '-', '*', '/'][i % 4], a = ri(-100, 1000), b = i === 7 ? 0 : ri(1, 100);
        if (i === 7) op = '/';
        var res = op === '+' ? a + b : op === '-' ? a - b : op === '*' ? a * b : b === 0 ? 'Error' : Math.floor(a / b);
        return { input: a + ' ' + op + ' ' + b, output: String(res) };
      }),
      solution: 'a, op, b = input().split()\na = int(a)\nb = int(b)\nif op == "+":\n    print(a + b)\nelif op == "-":\n    print(a - b)\nelif op == "*":\n    print(a * b)\nelif b == 0:\n    print("Error")\nelse:\n    print(a // b)' });
    return T;
  }
};
