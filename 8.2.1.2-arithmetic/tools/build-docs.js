/* Собирает раздаточный лист (2 варианта + ключ) и краткосрочный план урока 8.2.1.2 в .docx.
 * Запуск: NODE_PATH=<папка с node_modules/docx> node tools/build-docs.js */
'use strict';
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle,
  AlignmentType, ShadingType, PageOrientation, HeightRule, VerticalAlign, PageBreak,
} = require('docx');
const { VARIANTS } = require('./tasks');

const OUT = path.join(__dirname, '..');
const FONT = 'Times New Roman';
const SUBS = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9' };

/** Текст → runs; цифры-индексы (₂ ₈ ₁₆) превращаются в настоящий нижний индекс Word. «**…**» — жирный. */
function runs(text, o = {}) {
  const out = [];
  String(text).split(/(\*\*[^*]+\*\*)/).forEach((part) => {
    if (!part) return;
    const bold = /^\*\*.*\*\*$/.test(part);
    const t = bold ? part.slice(2, -2) : part;
    t.split(/([₀-₉]+)/).forEach((seg) => {
      if (!seg) return;
      const isSub = /^[₀-₉]+$/.test(seg);
      out.push(new TextRun({
        text: isSub ? seg.replace(/./g, (c) => SUBS[c]) : seg,
        subScript: isSub, bold: bold || o.bold, italics: o.italics,
        size: o.size || 24, font: o.mono && !isSub ? 'Courier New' : FONT, color: o.color,
      }));
    });
  });
  return out;
}
const P = (text, o = {}) => new Paragraph({
  children: runs(text, o), alignment: o.align, spacing: { before: o.before || 0, after: o.after ?? 80, line: o.line },
  keepNext: o.keepNext,
});
const pageBreak = () => new Paragraph({ children: [new PageBreak()] });

const NONE = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const NO_BORDERS = { top: NONE, bottom: NONE, left: NONE, right: NONE, insideHorizontal: NONE, insideVertical: NONE };
const THIN = { style: BorderStyle.SINGLE, size: 4, color: '808080' };
const BORDERS = { top: THIN, bottom: THIN, left: THIN, right: THIN, insideHorizontal: THIN, insideVertical: THIN };

function cell(children, width, o = {}) {
  return new TableCell({
    children: Array.isArray(children) ? children : [P(children, o)],
    width: { size: width, type: WidthType.DXA },
    shading: o.fill ? { type: ShadingType.CLEAR, color: 'auto', fill: o.fill } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    verticalAlign: o.vAlign,
    columnSpan: o.span,
  });
}
function table(widths, rows, o = {}) {
  return new Table({
    width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths: widths,
    borders: o.borders || BORDERS,
    rows: rows.map((r, i) => new TableRow({
      tableHeader: o.header && i === 0,
      cantSplit: true,
      children: r.map((c, j) => (c instanceof TableCell ? c : cell(c, widths[j], { bold: o.header && i === 0, fill: o.header && i === 0 ? 'E8EEF7' : undefined, size: o.size }))),
    })),
  });
}

/** Сетка «в клетку» для решения в столбик. */
function grid(cols, rowsN) {
  const CELL = 280;
  const g = { style: BorderStyle.SINGLE, size: 2, color: 'B8C4D6' };
  return new Table({
    width: { size: cols * CELL, type: WidthType.DXA },
    columnWidths: Array(cols).fill(CELL),
    borders: { top: g, bottom: g, left: g, right: g, insideHorizontal: g, insideVertical: g },
    rows: Array.from({ length: rowsN }, () => new TableRow({
      height: { value: CELL, rule: HeightRule.EXACT },
      children: Array.from({ length: cols }, () => new TableCell({ children: [new Paragraph({ children: [] })], width: { size: CELL, type: WidthType.DXA } })),
    })),
  });
}

// ---------------------------------------------------------------- Раздаточный лист

const A4 = { width: 11906, height: 16838 };
const M = 850;                     // поля 1,5 см
const W = A4.width - 2 * M;        // 10206
const HALF = W / 2;

function taskBox(n, title, expr, pts) {
  return new TableCell({
    width: { size: HALF, type: WidthType.DXA },
    margins: { top: 80, bottom: 120, left: 80, right: 160 },
    children: [
      P(`**${n}.** ${title} (${pts} б.)`, { after: 40 }),
      P(expr + ' = ?', { mono: true, size: 28, bold: true, after: 80 }),
      grid(16, 6),
      P('Ответ: ______________________', { before: 100, after: 0 }),
    ],
  });
}

function variantPages(V) {
  const kind = (t) => `Выполните ${t.op === '+' ? 'сложение' : 'вычитание'} в ${t.sys} системе счисления.`;
  const boxes = V.core.map((t, i) => taskBox(i + 1, kind(t), t.text, 1));
  const pairs = [0, 2, 4].map((i) => new TableRow({ cantSplit: true, children: [boxes[i], boxes[i + 1]] }));
  const [g1, g2, g3] = V.gaps;
  const col = (s) => s.split('').join(' ');
  return [
    P('Практическая работа. Сложение и вычитание в позиционных системах счисления', { bold: true, size: 28, align: AlignmentType.CENTER, after: 40 }),
    P('Цель обучения 8.2.1.2: выполнять арифметические действия (сложение, вычитание) с натуральными числами в позиционных системах счисления', { size: 20, italics: true, align: AlignmentType.CENTER, after: 120 }),
    table([6200, 2200, 1806], [[
      cell('Фамилия, имя: ______________________________', 6200),
      cell('Класс: 8 ____', 2200),
      cell(`**Вариант ${V.v}**`, 1806, { fill: 'FFF4D6' }),
    ]]),
    P('', { after: 60 }),
    table([W], [[cell([
      P('**Памятка.** Основание системы q: двоичная q = 2, восьмеричная q = 8, шестнадцатеричная q = 16 (A = 10, B = 11, C = 12, D = 13, E = 14, F = 15).', { size: 22, after: 40 }),
      P('**Сложение:** в каждом разряде S = цифра + цифра + перенос. Если S < q — пишем S. Если S ≥ q — пишем S − q, а 1 переносим в следующий разряд.', { size: 22, after: 40 }),
      P('**Вычитание:** если верхняя цифра меньше нижней, занимаем 1 у соседнего слева разряда (он уменьшается на 1), а к текущей цифре прибавляем q.', { size: 22, after: 0 }),
    ], W, { fill: 'F3F6FA' })]]),
    P('**Уровень A.** Решите в столбик в клетках под заданием. Проверить себя можно переводом чисел в десятичную систему.', { before: 120, after: 60 }),
    new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [HALF, HALF], borders: NO_BORDERS, rows: pairs }),
    pageBreak(),
    P(`Вариант ${V.v} (продолжение)`, { bold: true, align: AlignmentType.RIGHT, size: 22 }),
    P('**Уровень B.**', { after: 60 }),
    P(`**7.** Ученик вычислил в столбик: **${V.err.a}₈ − ${V.err.b}₈ = ${V.err.wrong}₈** (2 б.)`, { after: 40 }),
    P(`а) Проверьте его ответ сложением: ${V.err.wrong}₈ + ${V.err.b}₈. Получилось ли ${V.err.a}₈?`, { after: 20 }),
    P('б) Найдите ошибку и объясните, в чём она.', { after: 20 }),
    P('в) Запишите правильный ответ.', { after: 80 }),
    grid(34, 6),
    P('Ошибка: ________________________________________________________________________', { before: 120, after: 60 }),
    P('________________________________________________________________________________', { after: 60 }),
    P('Правильный ответ: ______________________', { after: 200 }),
    P('**8.** Восстановите пропущенные цифры (*) в сложении восьмеричных чисел. Запишите пример полностью. (2 б.)', { after: 80 }),
    table([500, 2400], [
      ['', col(g1)], ['+', col(g2)], ['', col(g3)],
    ].map((r, i) => r.map((txt, j) => cell([P(txt, { mono: true, bold: true, size: 32, align: j ? AlignmentType.RIGHT : AlignmentType.CENTER, after: 0 })], [500, 2400][j]))),
    { borders: { top: NONE, left: NONE, right: NONE, insideVertical: NONE, bottom: NONE, insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' } } }),
    P('(все числа записаны в восьмеричной системе счисления)', { size: 20, italics: true, after: 80 }),
    P('Ответ: ______₈ + ______₈ = ______₈', { before: 60, after: 200 }),
    P('**Критерий оценивания:** выполняет сложение и вычитание натуральных чисел в позиционных системах счисления.', { size: 22, after: 20 }),
    P('**Уровень мыслительных навыков:** применение (задания 1–6), навыки высокого порядка (задания 7–8).', { size: 22, after: 80 }),
    table([5600, 1200, 1100, 2306], [
      ['Дескриптор. Обучающийся:', '№ задания', 'Балл', 'Самооценка (+ / −)'],
      ['складывает числа в двоичной системе с переносом', '1', '1', ''],
      ['вычитает числа в двоичной системе с заёмом', '2', '1', ''],
      ['складывает числа в восьмеричной системе', '3', '1', ''],
      ['вычитает числа в восьмеричной системе, в том числе с заёмом через 0', '4', '1', ''],
      ['складывает числа в шестнадцатеричной системе', '5', '1', ''],
      ['вычитает числа в шестнадцатеричной системе, в том числе с заёмом через 0', '6', '1', ''],
      ['находит ошибку в чужом решении и объясняет её', '7', '1', ''],
      ['записывает правильный ответ', '7', '1', ''],
      ['восстанавливает пропущенные цифры (1 балл — если верно 2 цифры из 3)', '8', '2', ''],
      ['**Всего**', '', '**10**', ''],
    ], { header: true, size: 22 }),
  ];
}

function keyPage() {
  const rows = [['№', 'Вариант 1', 'Вариант 2']];
  const [V1, V2] = VARIANTS;
  for (let i = 0; i < 6; i++) {
    const c = (t) => `${t.text} = **${t.answer}**  (проверка: ${t.dec})`;
    rows.push([String(i + 1), c(V1.core[i]), c(V2.core[i])]);
  }
  const e = (V) => `${V.err.wrong}₈ + ${V.err.b}₈ = ${V.err.check}₈ ≠ ${V.err.a}₈. Ошибка: заняв 1 у соседнего разряда, ученик не уменьшил его цифру (во 2-м и 3-м разрядах). Правильно: **${V.err.answer}₈**`;
  rows.push(['7', e(V1), e(V2)]);
  const g = (V) => `**${V.gapAnswer[0]}₈ + ${V.gapAnswer[1]}₈ = ${V.gapAnswer[2]}₈**  (${V.gaps.join(', ')} → звёздочки: ${V.gaps.join('').split('').map((ch, i) => (ch === '*' ? V.gapAnswer.join('')[i] : null)).filter((x) => x !== null).join(', ')}). Решение единственное.`;
  rows.push(['8', g(V1), g(V2)]);
  return [
    P('Ключ для учителя (не раздавать)', { bold: true, size: 28, align: AlignmentType.CENTER, after: 60 }),
    P('Все ответы вычислены программой и проверены переводом в десятичную систему. Для задания 8 перебором подтверждено, что решение единственное.', { size: 20, italics: true, align: AlignmentType.CENTER, after: 120 }),
    table([600, 4803, 4803], rows, { header: true, size: 22 }),
  ];
}

const handout = new Document({
  creator: 'Учитель информатики',
  title: 'Раздаточный лист 8.2.1.2',
  styles: { default: { document: { run: { font: FONT, size: 24 } } } },
  sections: [
    ...VARIANTS.map((V) => ({ properties: { page: { size: A4, margin: { top: M, bottom: M, left: M, right: M } } }, children: variantPages(V) })),
    { properties: { page: { size: A4, margin: { top: M, bottom: M, left: M, right: M } } }, children: keyPage() },
  ],
});

// ---------------------------------------------------------------- Краткосрочный план

const LW = 16838 - 2 * 850; // альбомная ориентация, ширина текста 15138
const kv = (k, v) => [cell(k, 4000, { bold: true, fill: 'F3F6FA' }), cell(Array.isArray(v) ? v.map((x) => P(x, { after: 20 })) : v, LW - 4000)];

const S = (n) => `слайд ${n}`;
const stages = [
  ['Начало урока\n0–2 мин', [
    'Приветствие. Объявляет план урока: формативная работа по прошлой теме (15 минут), затем новая тема и практическая работа.',
  ], ['Готовятся к уроку, включают компьютеры, открывают файл формативной работы.'], ['—'], [S(1) + ', ' + S(2)]],
  ['Формативное оценивание по теме 8.2.1.1\n2–17 мин', [
    'Даёт инструкцию: открыть файл «proverochnaya-8.2.1.1.html», прочитать инструкцию, нажать «Начать». Работа идёт 15 минут в полноэкранном режиме; выход из него завершает работу.',
    'Обходит класс, фиксирует баллы с итоговых экранов (результат виден 5 минут, затем скрывается и требует пароль учителя).',
  ], ['Выполняют 10 заданий на перевод чисел из десятичной системы в двоичную, восьмеричную, шестнадцатеричную и обратно. Могут пропускать задания и возвращаться к ним.'],
  ['Автоматическая проверка, 1 балл за задание, максимум 10. Отчёт с правильными ответами на экране ученика.'], [S(3) + '; компьютеры, файл формативной работы']],
  ['Актуализация и целеполагание\n17–20 мин', [
    'Предлагает сложить в столбик 27 + 15 и задаёт вопрос: «Откуда берётся единица на уме? Что будет, если складывать в двоичной системе?»',
    'Вместе с учащимися формулирует цель урока и знакомит с критериями успеха.',
  ], ['Решают пример, выдвигают предположения, формулируют цель урока.'], ['Устная обратная связь'], [S(4) + ', ' + S(5)]],
  ['Изучение нового материала\n20–30 мин', [
    'Объясняет понятия «разряд» и «основание системы». Выводит правило сложения: если сумма в разряде S ≥ q, пишем S − q и переносим 1. Показывает, почему перенос всегда равен 0 или 1: S ≤ 2q − 1.',
    'Разбирает примеры: 1011₂ + 111₂ = 10010₂; 657₈ + 246₈ = 1125₈; 3AF₁₆ + 1C9₁₆ = 578₁₆. Вводит правило вычитания (заём = +q) на примере 503₈ − 267₈ = 214₈. Обращает внимание на частые ошибки.',
    'Можно использовать интерактивную страницу «Единица на уме» (тренажёр с пошаговым решением).',
  ], ['Записывают правила и примеры в тетрадь, решают вместе с учителем, отвечают на вопросы, проверяют результат переводом в десятичную систему.'],
  ['Вопросы по ходу объяснения; приём «Светофор» после каждого примера'], [`слайды 6–12; страница «Единица на уме»`]],
  ['Практическая работа\n30–40 мин', [
    'Раздаёт листы: вариант 1 и вариант 2 (соседи по парте получают разные варианты). Задания 1–6 (уровень A) выполняют все, задания 7–8 (уровень B) — те, кто справился с уровнем A.',
    'Оказывает индивидуальную помощь, наблюдает за типичными ошибками.',
  ], ['Решают задания в столбик в клетках листа, проверяют ответы переводом в десятичную систему.'], ['Дескрипторы на листе; самооценка по дескрипторам'], [S(13) + '; раздаточный лист']],
  ['Взаимопроверка\n40–42 мин', [
    'Показывает ответы обоих вариантов. Организует взаимопроверку в парах.',
  ], ['Обмениваются листами, проверяют ответы по слайду, отмечают выполненные дескрипторы.'], ['Взаимооценивание по дескрипторам'], [S(14)]],
  ['Конец урока. Рефлексия\n42–45 мин', [
    'Проводит рефлексию «3 – 2 – 1». Объясняет домашнее задание: страница «Единица на уме», раздел «Задания для самопроверки» (ответы проверяются на странице); в тетради — решение в столбик.',
  ], ['Называют 3 понятия урока, 2 правила, 1 вопрос, который остался. Записывают домашнее задание.'], ['Самооценка'], [S(15)]],
];

function stageRows() {
  const w = [2400, 4838, 3400, 2500, 2000];
  const head = ['Этап урока / время', 'Действия педагога', 'Действия учащихся', 'Оценивание', 'Ресурсы'];
  const rows = [head.map((h, i) => cell(h, w[i], { bold: true, fill: 'E8EEF7' }))];
  stages.forEach(([name, t, s, a, r]) => {
    rows.push([
      cell(name.split('\n').map((x, i) => P(x, { bold: i === 0, size: 22, after: 20 })), w[0]),
      cell(t.map((x) => P(x, { size: 22, after: 60 })), w[1]),
      cell(s.map((x) => P(x, { size: 22, after: 60 })), w[2]),
      cell(a.map((x) => P(x, { size: 22 })), w[3]),
      cell(r.map((x) => P(x, { size: 22 })), w[4]),
    ]);
  });
  return new Table({ width: { size: LW, type: WidthType.DXA }, columnWidths: w, borders: BORDERS, rows: rows.map((r, i) => new TableRow({ tableHeader: i === 0, cantSplit: true, children: r })) });
}

const plan = new Document({
  creator: 'Учитель информатики',
  title: 'Краткосрочный план урока 8.2.1.2',
  styles: { default: { document: { run: { font: FONT, size: 24 } } } },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838, orientation: PageOrientation.LANDSCAPE }, margin: { top: 850, bottom: 850, left: 850, right: 850 } } },
    children: [
      P('Краткосрочный план урока', { bold: true, size: 32, align: AlignmentType.CENTER, after: 120 }),
      new Table({
        width: { size: LW, type: WidthType.DXA }, columnWidths: [4000, LW - 4000], borders: BORDERS,
        rows: [
          kv('Раздел', '[укажите раздел по учебной программе]'),
          kv('ФИО педагога', '[ ]'),
          kv('Дата', '[ ]'),
          kv('Класс', '8 [  ]      Количество присутствующих: [  ]      Отсутствующих: [  ]'),
          kv('Тема урока', 'Сложение и вычитание натуральных чисел в позиционных системах счисления'),
          kv('Цели обучения, которые достигаются на данном уроке', [
            '8.2.1.2 — выполнять арифметические действия (сложение, вычитание) с натуральными числами в позиционных системах счисления.',
            'Формативное оценивание по цели 8.2.1.1 — перевод натуральных чисел из десятичной системы счисления в двоичную, восьмеричную, шестнадцатеричную и обратно.',
          ]),
          kv('Цели урока', [
            '**Все учащиеся смогут:** складывать и вычитать натуральные числа в двоичной системе счисления в столбик.',
            '**Большинство учащихся смогут:** складывать и вычитать числа в восьмеричной и шестнадцатеричной системах, в том числе с заёмом через 0; проверять результат переводом в десятичную систему.',
            '**Некоторые учащиеся смогут:** находить и объяснять ошибки в чужом решении, восстанавливать пропущенные цифры в записи сложения.',
          ]),
          kv('Критерии оценивания', 'Выполняет сложение и вычитание натуральных чисел в позиционных системах счисления.'),
          kv('Языковые цели', [
            'Ключевые слова: разряд, основание системы счисления, перенос («единица на уме»), заём, столбик.',
            'Полезные фразы: «Сумма в разряде больше или равна основанию, поэтому пишем …, а единицу переносим»; «Занимаем единицу у старшего разряда, к цифре прибавляем основание».',
          ]),
          kv('Привитие ценностей', 'Академическая честность (самостоятельное выполнение формативной работы), сотрудничество при взаимопроверке, ответственность за результат.'),
          kv('Межпредметные связи', 'Математика: сложение и вычитание в столбик, разрядный состав числа.'),
          kv('Предварительные знания', 'Позиционные системы счисления; перевод чисел между десятичной, двоичной, восьмеричной и шестнадцатеричной системами (цель 8.2.1.1).'),
        ].map((c) => new TableRow({ cantSplit: true, children: c })),
      }),
      P('Ход урока', { bold: true, size: 28, before: 200, after: 100 }),
      stageRows(),
      P('', { after: 100 }),
      new Table({
        width: { size: LW, type: WidthType.DXA }, columnWidths: [5046, 5046, 5046], borders: BORDERS,
        rows: [
          new TableRow({ tableHeader: true, children: ['Дифференциация', 'Оценивание', 'Здоровье и соблюдение техники безопасности'].map((h) => cell(h, 5046, { bold: true, fill: 'E8EEF7' })) }),
          new TableRow({ children: [
            cell([
              P('Практическая работа разделена на уровни: A (задания 1–6) — для всех, B (задания 7–8) — для тех, кто справился быстрее.', { size: 22, after: 60 }),
              P('Памятка с правилами сложения и вычитания на раздаточном листе. Пошаговый тренажёр на странице «Единица на уме» для тех, кому нужна поддержка.', { size: 22 }),
            ], 5046),
            cell([
              P('Формативная работа 8.2.1.1 с автоматической проверкой (10 баллов).', { size: 22, after: 60 }),
              P('Самооценка и взаимооценивание по дескрипторам практической работы (10 баллов). Устная обратная связь, «Светофор», рефлексия «3 – 2 – 1».', { size: 22 }),
            ], 5046),
            cell([
              P('Соблюдение правил работы за компьютером во время формативной работы. Смена вида деятельности: работа за компьютером → объяснение → работа в тетради.', { size: 22 }),
            ], 5046),
          ] }),
        ],
      }),
      P('Рефлексия по уроку (заполняет учитель после урока): были ли цели урока реалистичными? Что узнали учащиеся? Как прошла дифференциация? Выдержан ли хронометраж?', { size: 22, italics: true, before: 160 }),
      P('Хронометраж рассчитан на урок 45 минут. Если урок короче, сократите изучение нового материала (слайды 11–12) и перенесите задания 7–8 в домашнее задание.', { size: 22, italics: true, before: 60 }),
    ],
  }],
});

Promise.all([
  Packer.toBuffer(handout).then((b) => fs.writeFileSync(path.join(OUT, 'razdatka-8.2.1.2.docx'), b)),
  Packer.toBuffer(plan).then((b) => fs.writeFileSync(path.join(OUT, 'plan-uroka-8.2.1.2.docx'), b)),
]).then(() => console.log('razdatka-8.2.1.2.docx, plan-uroka-8.2.1.2.docx готовы'));
