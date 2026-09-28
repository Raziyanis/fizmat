/* Собирает раздаточный лист «10 задач acmp.ru» (с ключом для учителя) и краткосрочный план урока 8.1.4.4.
 * Данные задач — tools/data.json (готовит make-data.py). Запуск: NODE_PATH=<папка с пакетом docx> node tools/build-docs.js */
'use strict';
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle,
  AlignmentType, ShadingType, PageOrientation, PageBreak,
} = require('docx');

const DATA = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8'));
const OUT = path.join(__dirname, '..');
const FONT = 'Times New Roman';
const MONO = 'Courier New';

function runs(text, o = {}) {
  const out = [];
  String(text).split(/(\*\*[^*]+\*\*)/).forEach((part) => {
    if (!part) return;
    const bold = /^\*\*.*\*\*$/.test(part);
    out.push(new TextRun({ text: bold ? part.slice(2, -2) : part, bold: bold || o.bold, italics: o.italics, size: o.size || 24, font: o.mono ? MONO : FONT, color: o.color }));
  });
  return out;
}
const P = (text, o = {}) => new Paragraph({ children: runs(text, o), alignment: o.align, spacing: { before: o.before || 0, after: o.after ?? 80 }, keepNext: o.keepNext });
const codeLines = (text, o = {}) => String(text).replace(/\s+$/, '').split('\n').map((l) => new Paragraph({ children: [new TextRun({ text: l || ' ', font: MONO, size: o.size || 20 })], spacing: { after: 0 } }));
const pageBreak = () => new Paragraph({ children: [new PageBreak()] });

const THIN = { style: BorderStyle.SINGLE, size: 4, color: '808080' };
const BORDERS = { top: THIN, bottom: THIN, left: THIN, right: THIN, insideHorizontal: THIN, insideVertical: THIN };
function cell(children, width, o = {}) {
  return new TableCell({
    children: Array.isArray(children) ? children : [P(children, o)],
    width: { size: width, type: WidthType.DXA },
    shading: o.fill ? { type: ShadingType.CLEAR, color: 'auto', fill: o.fill } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
  });
}
function table(widths, rows, o = {}) {
  return new Table({
    width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA }, columnWidths: widths, borders: BORDERS,
    rows: rows.map((r, i) => new TableRow({ tableHeader: o.header && i === 0, cantSplit: true,
      children: r.map((c, j) => (c instanceof TableCell ? c : cell(c, widths[j], { bold: o.header && i === 0, fill: o.header && i === 0 ? 'E8EEF7' : undefined, size: o.size }))) })),
  });
}

const A4 = { width: 11906, height: 16838 };
const M = 850;
const W = A4.width - 2 * M;
const LEVEL = { A: 'A — базовый', B: 'B — средний', C: 'C — повышенный' };

// ---------------------------------------------------------------- Раздаточный лист

function taskBlock(t, n) {
  const ex = [['Входные данные', 'Выходные данные']].concat(t.examples);
  return [
    P(`**Задача ${n}. ${t.title}** (acmp.ru, № ${t.id}; уровень ${t.level})`, { size: 26, before: 160, after: 60, keepNext: true }),
    P(t.text + (t.short ? ' (Условие приведено сокращённо.)' : ''), { size: 22, after: 60 }),
    ...(t.official ? [P('Примеры — с сайта acmp.ru.', { size: 20, italics: true, after: 40 })] : []),
    P('**Входные данные:** ' + t.input, { size: 22, after: 40 }),
    P('**Выходные данные:** ' + t.output, { size: 22, after: 60 }),
    table([W / 2, W / 2], ex.map((r, i) => (i === 0 ? r : r.map((v) => new TableCell({ children: codeLines(v), width: { size: W / 2, type: WidthType.DXA }, margins: { top: 60, bottom: 60, left: 100, right: 100 } })))), { header: true, size: 22 }),
  ];
}

function handoutPages() {
  const out = [
    P('Практическая работа. Циклические алгоритмы на языке Python', { bold: true, size: 30, align: AlignmentType.CENTER, after: 40 }),
    P('Цель обучения 8.1.4.4: записывать циклические алгоритмы на языке Python', { italics: true, size: 22, align: AlignmentType.CENTER, after: 120 }),
    table([6200, 4006], [[cell('Фамилия, имя: ______________________________', 6200), cell('Класс: 8 ____', 4006)]]),
    P('', { after: 60 }),
    table([W], [[cell([
      P('**Как работать.** Откройте сайт acmp.ru, войдите в свою учётную запись, найдите задачу по номеру (раздел «Задачи»), напишите программу на Python и отправьте её на проверку. Решение принято, если сайт показал, что все тесты пройдены.', { size: 22, after: 40 }),
      P('**Ввод и вывод:** читайте данные с помощью input(), выводите ответ с помощью print(). Несколько чисел в одной строке: a, b = map(int, input().split()).', { size: 22, after: 40 }),
      P('**Порядок:** сначала задачи уровня A, затем B и C. Перед отправкой проверьте программу на примерах из листа.', { size: 22, after: 0 }),
    ], W, { fill: 'F3F6FA' })]]),
    P('Примеры в таблицах составлены учителем; ответы к ним получены проверенным решением. Полное условие и примеры сайта — на странице задачи на acmp.ru.', { italics: true, size: 20, before: 80, after: 40 }),
  ];
  DATA.forEach((t, i) => out.push(...taskBlock(t, i + 1)));
  out.push(P('**Самооценка.** Отметьте решённые задачи:  1 ☐  2 ☐  3 ☐  4 ☐  5 ☐  6 ☐  7 ☐  8 ☐  9 ☐  10 ☐', { size: 22, before: 240 }));
  return out;
}

function keyPages() {
  const out = [
    P('Ключ для учителя (не раздавать)', { bold: true, size: 30, align: AlignmentType.CENTER, after: 60 }),
    P('Решения проверены: на 3000 случайных тестах их ответы совпали с ответами независимых переборных решений; время работы на наибольших входных данных — меньше 0,1 с. На самом сайте acmp.ru решения не отправлялись.', { italics: true, size: 20, align: AlignmentType.CENTER, after: 120 }),
    table([1100, 3300, 1500, 4306], [['№', 'Задача (acmp.ru)', 'Уровень', 'Что тренирует']].concat(
      DATA.map((t, i) => [String(i + 1), `${t.title} (№ ${t.id})`, t.level, t.skill])), { header: true, size: 22 }),
    P('Внимание (задача 447): в Python 3.11 и новее строку из числа длиннее 4300 цифр получить нельзя (str(9999!) вызовет ошибку). Поэтому нули в конце отбрасываются циклом while f % 10 == 0, а не через строку.', { size: 22, before: 160 }),
  ];
  DATA.forEach((t, i) => {
    out.push(P(`**${i + 1}. ${t.title} (№ ${t.id})**`, { size: 24, before: 200, after: 40, keepNext: true }));
    out.push(P('Решение ученика: ввод через input(), ответ через print(result). Ниже — вычислительная часть (функция из tools/solutions.py, text — входные данные).', { size: 18, italics: true, after: 40 }));
    out.push(...codeLines(t.code, { size: 18 }));
  });
  return out;
}

const handout = new Document({
  creator: 'Учитель информатики', title: 'Практическая работа 8.1.4.4',
  styles: { default: { document: { run: { font: FONT, size: 24 } } } },
  sections: [
    { properties: { page: { size: A4, margin: { top: M, bottom: M, left: M, right: M } } }, children: handoutPages() },
    { properties: { page: { size: A4, margin: { top: M, bottom: M, left: M, right: M } } }, children: keyPages() },
  ],
});

// ---------------------------------------------------------------- Краткосрочный план

const LW = 16838 - 2 * 850;
const kv = (k, v) => new TableRow({ cantSplit: true, children: [cell(k, 4000, { bold: true, fill: 'F3F6FA' }), cell(Array.isArray(v) ? v.map((x) => P(x, { after: 20 })) : v, LW - 4000)] });
const S = (a, b) => (b ? `слайды ${a}–${b}` : `слайд ${a}`);
const stages = [
  ['Организационный момент\n0–2 мин', ['Приветствие. Сообщает план спаренного урока: формативная работа по прошлой теме, новая тема «Циклы», решение задач на acmp.ru.'], ['Готовятся к уроку, включают компьютеры.'], ['—'], [S(1, 2)]],
  ['Формативная работа 8.1.4.2\n2–25 мин', [
    'Раздаёт файл formativ-8.1.4.2.html (открыть в браузере). Напоминает правила: 20 заданий, 20 минут, работа в полноэкранном режиме; выход из него или переключение окна завершает работу.',
    'Во время работы следит за классом. По окончании просматривает балл и отчёт на экране каждого ученика (результат виден 5 минут, затем скрывается; новая работа — по паролю 2026).',
  ], ['Выполняют 20 заданий: сопоставление, «что выведет программа», заполнение пропуска, выбор ответа, порядок строк.'],
  ['Формативное оценивание (цель 8.1.4.2): автоматическая проверка, балл из 20 и отчёт по заданиям'], [S(3) + '; файл formativ-8.1.4.2.html']],
  ['Итоги формативной работы. Физминутка\n25–28 мин', ['Коротко разбирает задания, в которых ошиблись многие. Проводит физминутку (гимнастика для глаз).'], ['Задают вопросы, выполняют упражнения.'], ['Устная обратная связь'], [S(3)]],
  ['Актуализация и целеполагание\n28–32 мин', [
    'Проблемный вопрос: «Как вывести на экран числа от 1 до 100? Писать 100 строк print?» Связывает с формативной работой: в линейном алгоритме и ветвлении каждая команда выполняется не больше одного раза.',
    'Вместе с учащимися формулирует цель урока, знакомит с критериями успеха.',
  ], ['Предлагают способы, формулируют цель урока.'], ['Устная обратная связь'], [S(4, 5)]],
  ['Изучение нового материала\n32–46 мин', [
    'Вводит понятия «цикл», «тело цикла», «итерация». Объясняет цикл for и функцию range() в трёх формах: range(n), range(a, b), range(a, b, шаг); подчёркивает, что конец диапазона не входит.',
    'Показывает накопление суммы, произведения и счётчика. Объясняет цикл while на примере разбора числа на цифры. Сравнивает for и while.',
  ], ['Записывают конспект, отвечают на вопросы, запускают примеры в редакторе Python.'],
  ['Вопросы по ходу объяснения'], [S(6, 11) + '; редактор Python']],
  ['Первичное закрепление\n46–53 мин', [
    'Трассировка двух программ (слайд 12): учащиеся сначала отвечают устно, затем проверяют запуском. Разбирает типичные ошибки: конец range, бесконечный цикл, отступ (слайд 13).',
  ], ['Выполняют трассировку в тетради, проверяют в редакторе, находят ошибки.'], ['Трассировка «что выведет программа», взаимопроверка в парах'], [S(12, 13) + '; редактор Python']],
  ['Инструктаж по работе на acmp.ru\n53–55 мин', [
    'Раздаёт лист с 10 задачами. Показывает, как найти задачу на сайте, выбрать язык Python, отправить решение и понять результат проверки.',
  ], ['Входят в свои учётные записи на acmp.ru.'], ['—'], [S(14, 15) + '; раздаточный лист']],
  ['Практическая работа\n55–75 мин', [
    'Задачи расположены от простой к сложной. Задачи 1–4 (уровень A) решают все, 5–8 (B) и 9–10 (C) — по мере готовности. Оказывает индивидуальную помощь, отмечает решённые задачи.',
  ], ['Пишут программы, проверяют их на примерах из листа, отправляют на acmp.ru, исправляют ошибки.'],
  ['Автоматическая проверка на acmp.ru; самооценка'], ['компьютеры, acmp.ru, раздаточный лист']],
  ['Конец урока. Рефлексия\n75–80 мин', [
    'Подводит итог: сколько задач решено. Рефлексия «3 – 2 – 1». Домашнее задание: дорешать задачи с листа (все задачи уровня A и не менее двух задач уровня B).',
  ], ['Называют 3 новых понятия, 2 вида цикла, 1 вопрос. Записывают домашнее задание.'], ['Самооценка'], [S(16)]],
];

function stageTable() {
  const w = [2400, 4838, 3400, 2500, 2000];
  const head = ['Этап урока / время', 'Действия педагога', 'Действия учащихся', 'Оценивание', 'Ресурсы'].map((h, i) => cell(h, w[i], { bold: true, fill: 'E8EEF7' }));
  const rows = [new TableRow({ tableHeader: true, children: head })];
  stages.forEach(([name, t, s, a, r]) => rows.push(new TableRow({ cantSplit: true, children: [
    cell(name.split('\n').map((x, i) => P(x, { bold: i === 0, size: 22, after: 20 })), w[0]),
    cell(t.map((x) => P(x, { size: 22, after: 60 })), w[1]),
    cell(s.map((x) => P(x, { size: 22, after: 60 })), w[2]),
    cell(a.map((x) => P(x, { size: 22 })), w[3]),
    cell(r.map((x) => P(x, { size: 22 })), w[4]),
  ] })));
  return new Table({ width: { size: LW, type: WidthType.DXA }, columnWidths: w, borders: BORDERS, rows });
}

const TEACHER_TASKS = ["Сумма", "Факториал", "Список квадратов", "Список степеней двойки", "Минимальный делитель", "Арбузы", "Загадка", "Нули", "Домашнее задание", "Гипотеза Гольдбаха"];
const SOL = path.join(__dirname, 'teacher', 'sol');
function keyAppendix() {
  const out = [new Paragraph({ children: [new PageBreak()] }),
    P('Приложение. Ключ к раздаточному листу (решения задач 1–10)', { bold: true, size: 28, after: 60 }),
    P('Каждое решение запущено на всех примерах листа и на случайных тестах (tools/teacher/run-solutions.py), ответы совпали. На самом сайте acmp.ru решения не отправлялись.', { italics: true, size: 20, after: 120 })];
  TEACHER_TASKS.forEach((t, i) => {
    out.push(P(`**${i + 1}. ${t}** (уровень ${i < 4 ? 'A' : i < 8 ? 'B' : 'C'})`, { size: 22, before: 120, after: 40, keepNext: true }));
    out.push(...codeLines(fs.readFileSync(path.join(SOL, String(i + 1).padStart(2, '0') + '.py'), 'utf8'), { size: 18 }));
  });
  return out;
}

const plan = new Document({
  creator: 'Учитель информатики', title: 'Краткосрочный план урока 8.1.4.4',
  styles: { default: { document: { run: { font: FONT, size: 24 } } } },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838, orientation: PageOrientation.LANDSCAPE }, margin: { top: 850, bottom: 850, left: 850, right: 850 } } },
    children: [
      P('Краткосрочный план урока (спаренный урок, 80 минут)', { bold: true, size: 32, align: AlignmentType.CENTER, after: 120 }),
      new Table({ width: { size: LW, type: WidthType.DXA }, columnWidths: [4000, LW - 4000], borders: BORDERS, rows: [
        kv('Раздел', '[укажите раздел по учебной программе]'),
        kv('ФИО педагога', '[ ]'),
        kv('Дата', '[ ]'),
        kv('Класс', '8 [  ]      Количество присутствующих: [  ]      Отсутствующих: [  ]'),
        kv('Тема урока', 'Разработка циклического алгоритма'),
        kv('Цели обучения, которые достигаются на данном уроке', ['8.1.4.4 — записывать циклические алгоритмы на языке Python.', '8.1.4.2 — разрабатывать линейные алгоритмы и алгоритмы с ветвлением (формативная работа в начале урока).']),
        kv('Цели урока', [
          '**Все учащиеся смогут:** записывать цикл for с функцией range() и находить сумму, произведение и количество с помощью цикла (задачи уровня A).',
          '**Большинство учащихся смогут:** использовать цикл while, выбирать подходящий вид цикла, решать задачи уровня B.',
          '**Некоторые учащиеся смогут:** применять вложенные циклы и перебор, решать задачи уровня C.',
          '**Формативная работа:** все учащиеся выполняют 20 заданий по теме 8.1.4.2 за 20 минут.',
        ]),
        kv('Критерии оценивания', ['Записывает цикл for с range() для заданного диапазона.', 'Записывает цикл while с условием продолжения.', 'Использует переменные-накопители (сумма, произведение, счётчик).', 'Составляет программу с циклом и проверяет её на тестах.']),
        kv('Языковые цели', ['Ключевые слова: цикл, тело цикла, итерация, счётчик цикла, условие продолжения, накопитель, бесконечный цикл.', 'Полезные фразы: «Тело цикла выполняется, пока условие истинно»; «range(a, b) перебирает числа от a до b − 1».']),
        kv('Привитие ценностей', 'Академическая честность при решении задач, настойчивость в поиске ошибок, взаимопомощь.'),
        kv('Межпредметные связи', 'Математика: сумма натуральных чисел, факториал, квадраты и степени числа, делители, простые числа (гипотеза Гольдбаха).'),
        kv('Предварительные знания', 'Линейные алгоритмы и ветвление (8.1.4.2); ввод и вывод данных, операции // и % в Python.'),
      ] }),
      P('Ход урока', { bold: true, size: 28, before: 200, after: 100 }),
      stageTable(),
      P('', { after: 100 }),
      table([5046, 5046, 5046], [
        ['Дифференциация', 'Оценивание', 'Здоровье и соблюдение техники безопасности'],
        [cell([P('Задачи расположены от простой к сложной: A (1–4) — для всех, B (5–8) — средний, C (9–10) — повышенный. Индивидуальная помощь при разборе ошибок; сильные учащиеся помогают соседям после решения задач уровня C.', { size: 22 })], 5046),
         cell([P('Формативная работа 8.1.4.2 (балл из 20 и отчёт по заданиям), трассировка на слайде 12, автоматическая проверка решений на acmp.ru, рефлексия «3 – 2 – 1».', { size: 22 })], 5046),
         cell([P('Соблюдение правил работы за компьютером; физминутка после формативной работы (25–28 мин); смена деятельности: тест → объяснение → работа в редакторе → практическая работа.', { size: 22 })], 5046)],
      ], { header: true, size: 22 }),
      P('Рефлексия по уроку (заполняет учитель после урока): были ли цели урока реалистичными? Что узнали учащиеся? Как прошла дифференциация? Выдержан ли хронометраж?', { size: 22, italics: true, before: 160 }),
      P('Перед уроком: скопируйте formativ-8.1.4.2.html на компьютеры учащихся; проверьте, что у учащихся есть учётные записи на acmp.ru и что сайт доступен из кабинета; найдите задачи листа на сайте и сверьте условия.', { size: 22, italics: true, before: 60 }),
      ...keyAppendix(),
    ],
  }],
});

Promise.all([
  // Лист в папке урока — редакция учителя; первоначальный вариант листа с ключом сохраняется отдельно.
  Packer.toBuffer(handout).then((b) => fs.writeFileSync(path.join(__dirname, 'zadachi-acmp-pervonachalnyi.docx'), b)),
  Packer.toBuffer(plan).then((b) => fs.writeFileSync(path.join(OUT, 'plan-uroka-8.1.4.4.docx'), b)),
]).then(() => console.log('tools/zadachi-acmp-pervonachalnyi.docx, plan-uroka-8.1.4.4.docx готовы'));
