/* Теория 8.1.4.3 «Цикл while, цикл for» → teoriya-8.1.4.3.docx.
 * Код примеров и их вывод берутся из tools/examples.json (готовит tools/examples.py настоящим Python).
 * Запуск: python3 tools/examples.py && NODE_PATH=<папка с пакетом docx> node tools/build-teoriya.js */
'use strict';
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle,
  AlignmentType, ShadingType, HeadingLevel, PageBreak,
} = require('docx');

const EX = JSON.parse(fs.readFileSync(path.join(__dirname, 'examples.json'), 'utf8'));
const FONT = 'Times New Roman', MONO = 'Courier New';
const M = 850, W = 11906 - 2 * M;

// **жирный**, `код`
function runs(text, o = {}) {
  return String(text).split(/(\*\*[^*]+\*\*|`[^`]+`)/).filter(Boolean).map((p) => {
    if (/^\*\*.*\*\*$/.test(p)) return new TextRun({ text: p.slice(2, -2), bold: true, size: o.size || 24, font: FONT, italics: o.italics });
    if (/^`.*`$/.test(p)) return new TextRun({ text: p.slice(1, -1), size: (o.size || 24) - 2, font: MONO, bold: o.bold, shading: { type: ShadingType.CLEAR, color: 'auto', fill: 'EEF1F5' } });
    return new TextRun({ text: p, bold: o.bold, italics: o.italics, size: o.size || 24, font: FONT, color: o.color });
  });
}
const P = (t, o = {}) => new Paragraph({ children: runs(t, o), alignment: o.align, spacing: { before: o.before || 0, after: o.after ?? 100 }, keepNext: o.keepNext, indent: o.indent ? { left: o.indent } : undefined });
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: t, bold: true, size: 32, font: FONT, color: '1F3B73' })], spacing: { before: 280, after: 120 }, keepNext: true });
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: t, bold: true, size: 27, font: FONT, color: '1F3B73' })], spacing: { before: 220, after: 80 }, keepNext: true });
const B = (t) => new Paragraph({ children: runs(t), bullet: { level: 0 }, spacing: { after: 60 } });

const NONE = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const THIN = { style: BorderStyle.SINGLE, size: 4, color: '9AA5B4' };
const BORDERS = { top: THIN, bottom: THIN, left: THIN, right: THIN, insideHorizontal: THIN, insideVertical: THIN };

function box(lines, fill, label, labelColor) {
  const children = [];
  if (label) children.push(new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 20, font: FONT, color: labelColor })], spacing: { after: 40 }, keepNext: true }));
  lines.forEach((l, i) => children.push(new Paragraph({ keepNext: i < lines.length - 1, spacing: { after: 0 }, children: [new TextRun({ text: l || ' ', font: MONO, size: 22 })] })));
  return new Table({
    width: { size: W, type: WidthType.DXA }, columnWidths: [W],
    borders: { top: NONE, bottom: NONE, left: { style: BorderStyle.SINGLE, size: 24, color: labelColor }, right: NONE, insideHorizontal: NONE, insideVertical: NONE },
    rows: [new TableRow({ cantSplit: true, children: [new TableCell({ children, width: { size: W, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, color: 'auto', fill }, margins: { top: 80, bottom: 80, left: 160, right: 120 } })] })],
  });
}
const gap = () => new Paragraph({ children: [], spacing: { after: 60 } });
// Пример: код + вывод (вывод получен запуском Python)
function ex(key, o = {}) {
  const e = EX[key];
  const out = [box(e.code.split('\n'), 'F3F6FA', 'Программа', '2452C0')];
  if (e.input) out.push(gap(), box(e.input, 'FFF8E6', 'Ввод с клавиатуры', 'B5520F'));
  if (!o.noOutput) out.push(gap(), box((e.output.replace(/ +$/gm, '') || ' ').split('\n'), 'EAF6EE', 'Вывод на экран', '1A7F37'));
  out.push(gap());
  return out;
}

function table(widths, rows, o = {}) {
  return new Table({
    width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA }, columnWidths: widths, borders: BORDERS,
    rows: rows.map((r, i) => new TableRow({ tableHeader: i === 0, cantSplit: true, children: r.map((c, j) => new TableCell({
      width: { size: widths[j], type: WidthType.DXA }, margins: { top: 50, bottom: 50, left: 100, right: 100 },
      shading: i === 0 ? { type: ShadingType.CLEAR, color: 'auto', fill: 'E3EAF6' } : undefined,
      children: String(c).split('\n').map((line) => new Paragraph({ spacing: { after: 0 }, children: runs(line, { bold: i === 0, size: o.size || 22 }).map((r) => r) })),
    })) })),
  });
}
const mono = (s) => '`' + s + '`';

const body = [
  P('Цикл while и цикл for', { bold: true, size: 36, align: AlignmentType.CENTER, after: 40 }),
  P('Теория для учащихся. Цель обучения 8.1.4.3: использовать оператор цикла while, использовать оператор цикла for', { italics: true, size: 22, align: AlignmentType.CENTER, after: 200 }),

  H1('1. Что такое цикл'),
  P('**Цикл** — это команда, которая повторяет одни и те же действия несколько раз. Вместо того чтобы писать `print()` сто раз, мы пишем его один раз внутри цикла.'),
  B('**Тело цикла** — команды, которые повторяются. В Python они пишутся **с отступом** — 4 пробела (или клавиша Tab).'),
  B('**Итерация** — одно выполнение тела цикла. «Цикл сделал 5 итераций» = тело выполнилось 5 раз.'),
  B('Строка с `for` или `while` всегда заканчивается **двоеточием** `:`.'),
  B('В Python два вида цикла: `for` — когда известно, **сколько раз** повторять; `while` — когда повторяем, **пока выполняется условие**.'),
  ...ex('hello3'),

  H1('2. Цикл for'),
  H2('2.1. Как записывается цикл for'),
  box(['for переменная in последовательность:', '    тело цикла'], 'F3F6FA', 'Общий вид', '2452C0'), gap(),
  P('Переменная цикла (обычно её называют `i`) по очереди принимает каждое значение из последовательности, и для каждого значения выполняется тело цикла. Последовательностью может быть `range(...)`, список или строка.'),

  H2('2.2. Функция range() — три способа записи'),
  P('`range` создаёт последовательность целых чисел. У неё три параметра: **начало**, **конец** и **шаг**.'),
  table([2600, 3000, 4706], [
    ['Запись', 'Что означает', 'Главное'],
    ['range(конец)', 'числа от 0 до конец − 1', 'начало = 0, шаг = 1'],
    ['range(начало, конец)', 'числа от начало до конец − 1', 'шаг = 1'],
    ['range(начало, конец, шаг)', 'от начало с шагом, пока не дойдём до конца', 'шаг может быть отрицательным'],
  ]),
  P('**Главное правило: конец в range никогда не входит.** `range(1, 6)` — это 1, 2, 3, 4, 5 (без 6).', { before: 100, color: 'A52222' }),

  H2('Способ 1. range(конец) — начинаем с нуля'),
  P('Указываем только конец. Начало — 0, шаг — 1. `range(5)` даёт 5 чисел: 0, 1, 2, 3, 4.'),
  ...ex('r_stop'),
  P('Удобно, когда нужно просто повторить действие n раз: `for i in range(n):` выполнит тело ровно n раз.'),

  H2('Способ 2. range(начало, конец) — своё начальное значение'),
  P('Указываем начальное и конечное значение. Чтобы **включить** последнее число, к концу прибавляем 1.'),
  ...ex('r_start'),
  P('Если конец вводит пользователь, пишем `range(1, n + 1)`:'),
  ...ex('n_input'),

  H2('Способ 3. range(начало, конец, шаг) — свой шаг'),
  P('**Шаг** — на сколько изменяется переменная после каждой итерации. Шаг 2 — через одно число, шаг 5 — через пять.'),
  ...ex('r_step'),
  ...ex('r_step5'),

  H2('Обратный отсчёт — отрицательный шаг'),
  P('Если шаг отрицательный, числа **уменьшаются**. Тогда начало должно быть **больше** конца, а конец по-прежнему не входит.'),
  ...ex('r_back1'),
  ...ex('r_back3'),

  H2('Когда цикл не выполняется ни разу'),
  P('Если начало уже «за» концом (при положительном шаге начало ≥ конец), последовательность пустая и тело не выполнится ни разу.'),
  ...ex('r_empty'),

  H2('Сводная таблица range'),
  P('Все числа в таблице получены запуском Python. Количество повторений при шаге 1 = конец − начало.'),
  table([3000, 5306, 2000], [['Запись', 'Какие числа', 'Сколько раз']].concat(EX._ranges.map((r) => [mono(r[0]), r[1], r[2]]))),

  H2('2.3. Переменная цикла и вывод в одну строку'),
  P('Переменную цикла можно использовать в теле — например, в вычислениях:'),
  ...ex('use_i'),
  P('По умолчанию `print` переходит на новую строку. Чтобы вывести числа **в одну строку** через пробел, пишем `end=" "`. После цикла пустой `print()` переводит строку.'),
  ...ex('end_demo'),
  P('Менять `i` внутри тела бесполезно: на следующей итерации `for` всё равно возьмёт следующее значение из range.'),
  ...ex('i_change'),

  H2('2.4. for i in range(...) и for x in список — в чём разница'),
  P('Цикл `for` умеет перебирать не только числа из range, но и **элементы списка** или **символы строки**.'),
  P('**Способ А: перебор значений** — `for x in список:`. Переменная `x` сразу равна элементу.'),
  ...ex('for_list'),
  ...ex('for_str'),
  P('**Способ Б: перебор индексов** — `for i in range(len(список)):`. Переменная `i` — номер элемента (индекс), сам элемент — `список[i]`. `len(список)` — количество элементов.'),
  ...ex('for_index'),
  table([2700, 3800, 3806], [
    ['', 'for x in a:', 'for i in range(len(a)):'],
    ['Что в переменной', 'сам элемент (значение)', 'номер элемента (индекс 0, 1, 2, …)'],
    ['Когда использовать', 'нужны только значения: сумма, поиск, подсчёт, вывод', 'нужен номер элемента или нужно изменить элементы списка'],
    ['Пример задачи', 'сумма всех оценок', 'умножить каждый элемент на 10; вывести номер позиции'],
  ]),
  P('Чтобы **изменить** элементы списка, нужен индекс. Изменение `x` не меняет список:', { before: 120 }),
  ...ex('change_list'),
  ...ex('change_wrong'),

  H2('2.5. Накопители: сумма, произведение, счётчик'),
  P('Очень часто в цикле что-то накапливают. Переменную-накопитель создают **до** цикла:'),
  table([2500, 3000, 4806], [
    ['Накопитель', 'Начальное значение', 'В теле цикла'],
    ['сумма s', 's = 0', 's = s + i'],
    ['произведение p', 'p = 1 (не 0!)', 'p = p * i'],
    ['счётчик k', 'k = 0', 'if условие: k = k + 1'],
  ]),
  gap(),
  ...ex('sum'),
  P('**Трассировка** — таблица, в которой записываем значения переменных после каждой итерации:', { keepNext: true }),
  table([2400, 3500, 4406], [['Итерация', 'i', 's после итерации']].concat(EX._trace_sum)),
  gap(),
  ...ex('prod'),
  ...ex('count'),

  H1('3. Цикл while'),
  H2('3.1. Как записывается цикл while'),
  box(['while условие:', '    тело цикла'], 'F3F6FA', 'Общий вид', '2452C0'), gap(),
  P('`while` означает «пока». Перед **каждой** итерацией Python проверяет условие:'),
  B('если условие **истинно** (True) — выполняется тело, затем снова проверка;'),
  B('если условие **ложно** (False) — цикл заканчивается, программа идёт дальше.'),
  P('Чтобы цикл когда-нибудь закончился, **в теле должна меняться переменная из условия**.'),

  H2('3.2. Три шага цикла while со счётчиком'),
  P('1) задать начальное значение до цикла; 2) записать условие продолжения; 3) изменить переменную в теле. Этот цикл делает то же, что `for i in range(1, 6)`:'),
  ...ex('w_count'),

  H2('3.3. Когда while удобнее: число повторений заранее неизвестно'),
  P('**Разбор числа на цифры.** `n % 10` — последняя цифра, `n // 10` — число без последней цифры. Сколько цифр в числе — заранее неизвестно, поэтому повторяем, **пока** n > 0.'),
  ...ex('w_digits'),
  table([1300, 1400, 2300, 1700, 1500, 2106], [['Шаг', 'n', 'Проверка', 'n % 10', 's', 'новое n']].concat(EX._trace_digits)),
  gap(),
  P('**Удваиваем, пока число меньше 100.** Сколько раз удвоится — заранее неизвестно:'),
  ...ex('w_double'),
  P('**Ввод чисел до нуля.** Пользователь вводит числа, 0 означает конец ввода. Программа находит сумму введённых чисел:'),
  ...ex('w_input'),
  P('Если условие ложно с самого начала, тело while **не выполнится ни разу**:'),
  ...ex('w_never'),

  H2('3.4. Бесконечный цикл'),
  P('Если в теле не менять переменную из условия, условие всегда будет истинным и программа «зависнет». Например, если в примере 3.2 забыть строку `i = i + 1`, будет печататься 1 бесконечно. Остановить программу: **Ctrl + C** или кнопка «Стоп».'),

  H2('3.5. Команды break и continue (дополнительно)'),
  P('`break` — немедленно выйти из цикла. `continue` — пропустить остаток тела и перейти к следующей итерации. Работают и в for, и в while.'),
  ...ex('w_break'),
  ...ex('continue'),

  H1('4. for или while — что выбрать'),
  table([2400, 3900, 4006], [
    ['', 'for', 'while'],
    ['Когда', 'число повторений известно заранее (или перебираем список/строку)', 'повторяем, пока выполняется условие; число повторений заранее неизвестно'],
    ['Счётчик', 'меняется автоматически', 'меняем сами в теле цикла'],
    ['Опасность', 'забыть, что конец range не входит', 'бесконечный цикл, если забыть изменить переменную'],
    ['Примеры задач', 'вывести числа от 1 до n; сумма n чисел; перебрать список', 'цифры числа; ввод до нуля; «пока сумма меньше 100»'],
  ]),
  P('Любой цикл `for` с range можно переписать через `while` — результат одинаковый:', { before: 120 }),
  ...ex('for_as_while_for'),
  ...ex('for_as_while_while'),

  H1('5. Частые ошибки'),
  table([3300, 3300, 3706], [
    ['Ошибка', 'Неправильно', 'Правильно'],
    ['нет двоеточия', 'for i in range(5)', 'for i in range(5):'],
    ['нет отступа у тела', 'for i in range(5):\nprint(i)', 'for i in range(5):\n    print(i)'],
    ['конец range не входит', 'range(1, n)  # без n', 'range(1, n + 1)'],
    ['произведение с нуля', 'p = 0', 'p = 1'],
    ['накопитель внутри цикла', 'for ...:\n    s = 0\n    s = s + i', 's = 0\nfor ...:\n    s = s + i'],
    ['print внутри цикла вместо после', 'for ...:\n    s = s + i\n    print(s)', 'for ...:\n    s = s + i\nprint(s)'],
    ['бесконечный while', 'while i <= 5:\n    print(i)', 'while i <= 5:\n    print(i)\n    i = i + 1'],
  ], { size: 20 }),

  H1('6. Шпаргалка'),
  box([
    'for i in range(n):               # 0, 1, …, n-1   (n раз)',
    'for i in range(a, b):            # a, a+1, …, b-1',
    'for i in range(a, b + 1):        # a, a+1, …, b   (b включительно)',
    'for i in range(a, b, step):      # a, a+step, …   (b не входит)',
    'for i in range(b, a - 1, -1):    # b, b-1, …, a   (обратно)',
    'for x in a:                      # элементы списка a',
    'for i in range(len(a)):          # индексы списка a, элемент — a[i]',
    'for ch in s:                     # символы строки s',
    '',
    'i = 1                            # 1) начальное значение',
    'while i <= n:                    # 2) условие продолжения',
    '    ...',
    '    i = i + 1                    # 3) изменение переменной',
  ], 'F3F6FA', 'Запомни', '2452C0'),
];

const doc = new Document({
  creator: 'Учитель информатики', title: 'Теория 8.1.4.3: цикл while, цикл for',
  styles: { default: { document: { run: { font: FONT, size: 24 } } } },
  sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: M, bottom: M, left: M, right: M } } }, children: body }],
});
Packer.toBuffer(doc).then((b) => { fs.writeFileSync(path.join(__dirname, '..', 'teoriya-8.1.4.3.docx'), b); console.log('teoriya-8.1.4.3.docx готов'); });
