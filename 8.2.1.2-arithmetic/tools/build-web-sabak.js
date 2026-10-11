/* 8.2.1.2: веб-ресурспен өтетін сабаққа (40 минут) — қысқа мерзімді жоспар және үлестірме (қағаз нұсқасы, 2 нұсқа + жауап кілті).
 * Қазақша және орысша. Тапсырмалар web/content.js-тегі generate(seed) арқылы — веб-ресурстағыдай, бағанмен, ұяшықтармен.
 * Іске қосу: NODE_PATH=<docx пакеті> node tools/build-web-sabak.js */
'use strict';
const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, ShadingType, PageBreak, PageOrientation, VerticalAlign } = require('docx');

const ROOT = path.join(__dirname, '..');
global.window = {};
require(path.join(ROOT, 'web', 'content.js'));
const C = global.window.CONTENT;
const SEEDS = [8212, 2128];          // 1- және 2-нұсқа
const OUT = path.join(ROOT, 'web-sabak');
const FONT = 'Times New Roman', MONO = 'Consolas';
let LANG = 'kz';
const T = (kz, ru) => (LANG === 'kz' ? kz : ru);
const L = (o) => (o && typeof o === 'object' ? o[LANG] : String(o));
const plain = (h) => String(h).replace(/<sub>q<\/sub>/g, 'q').replace(/<[^>]+>/g, '');
const LET = () => (LANG === 'kz' ? ['а', 'ә', 'б', 'в'] : ['а', 'б', 'в', 'г']);

function runs(text, o = {}) {
  return String(text).split(/(\*\*[^*]+\*\*)/).filter(Boolean).map((p) => /^\*\*.*\*\*$/.test(p)
    ? new TextRun({ text: p.slice(2, -2), bold: true, size: o.size || 24, font: o.font || FONT })
    : new TextRun({ text: p, bold: o.bold, italics: o.italics, size: o.size || 24, font: o.font || FONT, color: o.color, strike: o.strike }));
}
const P = (t, o = {}) => new Paragraph({ children: runs(t, o), alignment: o.align, spacing: { before: o.before || 0, after: o.after ?? 60 }, keepNext: o.keepNext });
const NONE = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const THIN = { style: BorderStyle.SINGLE, size: 4, color: '808080' };
const NOB = { top: NONE, bottom: NONE, left: NONE, right: NONE, insideHorizontal: NONE, insideVertical: NONE };
const BORDERS = { top: THIN, bottom: THIN, left: THIN, right: THIN, insideHorizontal: THIN, insideVertical: THIN };

/* ---------- Бағанмен жазу (ұяшықтар) ---------- */
const CW = 400;   // бір цифр ұяшығының ені (DXA)
function colTable(it) {
  const lay = it.layout || C.colLayout(it), w = lay.w, q = it.q;
  const box = { style: BorderStyle.SINGLE, size: 8, color: '404040' }, dot = { style: BorderStyle.DOTTED, size: 4, color: 'C08040' }, thick = { style: BorderStyle.SINGLE, size: 18, color: '000000' };
  const cell = (text, o = {}) => new TableCell({
    width: { size: o.w || CW, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER,
    margins: { top: 0, bottom: 0, left: 20, right: 20 },
    borders: o.borders || { top: o.top || NONE, bottom: NONE, left: NONE, right: NONE },
    children: [new Paragraph({ alignment: o.align || AlignmentType.CENTER, spacing: { after: 0 }, children: [new TextRun({ text: text || '', font: o.font || MONO, size: o.size || 28, bold: o.bold, color: o.color, strike: o.strike })] })],
  });
  const rows = lay.rows.map((row) => {
    const cs = [cell(row.op || '', { w: 360, size: 26 })];
    for (let j = 0; j < w; j++) {
      const top = row.line ? thick : NONE;
      if (row.t === 'carry') cs.push(cell('', { size: 16, borders: { top: dot, bottom: dot, left: dot, right: dot } }));
      else if (row.t === 'cells') cs.push(cell('', { borders: { top: row.line ? thick : box, bottom: box, left: box, right: box } }));
      else {
        const ch = row.s[j];
        if (ch === '*') cs.push(cell('', { borders: { top: row.line ? thick : box, bottom: box, left: box, right: box } }));
        else cs.push(cell(ch === ' ' ? '' : ch, { top, bold: true, color: row.cls === 'wrong' ? 'C62828' : undefined, strike: row.cls === 'wrong' }));
      }
    }
    cs.push(cell(row.t === 'carry' ? '' : String(q), { w: 260, size: 14, font: FONT, align: AlignmentType.LEFT }));
    cs.push(cell(row.side ? L(row.side) : '', { w: 1300, size: 18, font: FONT, align: AlignmentType.LEFT, color: row.cls === 'wrong' ? 'C62828' : '555555' }));
    return new TableRow({ height: { value: row.t === 'carry' ? 260 : 440, rule: 'exact' }, children: cs });
  });
  return new Table({ borders: NOB, rows, width: { size: 360 + w * CW + 260 + 1300, type: WidthType.DXA }, columnWidths: [360].concat(Array(w).fill(CW), [260, 1300]) });
}
const W = 11906 - 2 * 850;
function grid4(items, render) {   // 4 мысал: 2 × 2
  const half = W / 2, rows = [];
  for (let r = 0; r < items.length; r += 2) {
    rows.push(new TableRow({ cantSplit: true, children: [0, 1].map((k) => new TableCell({ width: { size: half, type: WidthType.DXA }, borders: { top: NONE, bottom: NONE, left: NONE, right: NONE },
      margins: { top: 60, bottom: 120, left: 60, right: 60 }, children: items[r + k] ? render(items[r + k], r + k) : [P('')] })) }));
  }
  return new Table({ borders: NOB, rows, width: { size: W, type: WidthType.DXA }, columnWidths: [half, half] });
}
function itemBlock(it, k) {
  const head = it.kind === 'col' ? `${LET()[k]})` : `${LET()[k]})  ${plain(it.expr).replace(/ ✗$/, '')}`;
  return [P(head, { bold: true, size: 22, after: 40, keepNext: true }), colTable(it)];
}
const lines = (n) => Array.from({ length: n }, () => P('______________________________________________________________', { size: 22, after: 40 }));

function taskDoc(seed, v) {
  const tasks = C.generate(seed), c = [];
  c.push(P(T(`Санау жүйелерінде қосу және азайту — ${v}-нұсқа`, `Сложение и вычитание в системах счисления — вариант ${v}`), { bold: true, size: 28, align: AlignmentType.CENTER, after: 40 }));
  c.push(P(T('8 сынып · 8.2.1.2 · қағаз нұсқасы', '8 класс · 8.2.1.2 · бумажный вариант'), { size: 20, align: AlignmentType.CENTER, after: 80 }));
  c.push(P(T('Аты-жөні: ________________________________   Сынып: ______   Күні: __________', 'Фамилия, имя: ____________________________   Класс: ______   Дата: __________'), { after: 80 }));
  c.push(P(T('1–10-тапсырмалар — әрқайсысы 1 балл (4 мысал × 0,25). ★ Қосымша тапсырма — 6 балл. Әр ұяшыққа бір цифр жазыңыз; жоғарыдағы нүктелі ұяшықтарға ойдағы санды жазуға болады.',
    'Задания 1–10 — по 1 баллу (4 примера × 0,25). ★ Дополнительное задание — 6 баллов. В каждую клетку — одна цифра; в пунктирные клетки сверху можно записывать число «в уме».'), { size: 21, after: 80 }));
  tasks.forEach((t, i) => {
    const star = t.star;
    c.push(P(`${star ? '★' + (i - 9) : i + 1}. ${L(t.title).replace(/^★ /, '')}  (${String(t.max).replace('.', ',')} ${T('балл', star ? 'балла' : 'балл')})`, { bold: true, size: 24, before: 160, after: 30, keepNext: true }));
    c.push(P(plain(L(t.prompt)), { size: 21, italics: true, after: 60, keepNext: true }));
    if (!star) c.push(grid4(t.items, itemBlock));
    else {
      const it = t.items[0];
      c.push(P(plain(it.expr), { size: 28, font: MONO, bold: true, after: 60 }));
      c.push(...lines(3));
      it.fields.forEach((f) => c.push(P(plain(L(f.label)).replace(/\s*=$/, '') + ' = ____________', { size: 24, after: 60 })));
    }
  });
  c.push(P('', { before: 160 }));
  c.push(new Table({ borders: BORDERS, width: { size: W, type: WidthType.DXA }, columnWidths: [W / 3, W / 3, W / 3], rows: [
    new TableRow({ children: [T('Балл (1–10)', 'Балл (1–10)'), T('★ Қосымша', '★ Доп.'), T('Мұғалім қолы', 'Подпись учителя')].map((x) => new TableCell({ width: { size: W / 3, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, color: 'auto', fill: 'E8EEF7' }, children: [P(x, { bold: true, size: 22, after: 0 })] })) }),
    new TableRow({ height: { value: 500, rule: 'atLeast' }, children: ['____ / 10', '____ / 6', ''].map((x) => new TableCell({ width: { size: W / 3, type: WidthType.DXA }, children: [P(x, { size: 24, after: 0 })] })) }),
  ] }));
  return { c, tasks };
}
function keyRows(tasks) {
  const rows = [[T('№', '№'), T('Тапсырма', 'Задание'), T('Дұрыс жауаптар', 'Верные ответы')]];
  tasks.forEach((t, i) => {
    const ans = t.items.map((it, k) => (t.items.length > 1 ? LET()[k] + ') ' : '') + it.fields.map((f) => (it.fields.length > 1 ? plain(L(f.label)).replace(/\s*=$/, '') + ': ' : '') + f.key).join('; ') + (it.kind === 'stars' ? T(' (жасырын цифрлар)', ' (скрытые цифры)') : '')).join(';   ');
    rows.push([t.star ? '★' + (i - 9) : String(i + 1), L(t.title).replace(/^★ /, ''), ans]);
  });
  return new Table({ borders: BORDERS, width: { size: W, type: WidthType.DXA }, columnWidths: [600, 3000, W - 3600], rows: rows.map((r, i) => new TableRow({ cantSplit: true, children: r.map((x, j) => new TableCell({ width: { size: [600, 3000, W - 3600][j], type: WidthType.DXA }, shading: i === 0 ? { type: ShadingType.CLEAR, color: 'auto', fill: 'E8EEF7' } : undefined, margins: { top: 40, bottom: 40, left: 80, right: 80 }, children: [P(x, { size: 20, bold: i === 0, after: 0, font: j === 2 && i > 0 ? MONO : FONT })] })) })) });
}
const docA4 = (children, title, landscape) => new Document({ creator: T('Информатика мұғалімі', 'Учитель информатики'), title, styles: { default: { document: { run: { font: FONT, size: 24 } } } },
  sections: [{ properties: { page: { size: landscape ? { width: 16838, height: 11906, orientation: PageOrientation.LANDSCAPE } : { width: 11906, height: 16838 }, margin: { top: 850, bottom: 850, left: 850, right: 850 } } }, children }] });

/* ---------- Қысқа мерзімді жоспар (40 минут) ---------- */
const LW = 16838 - 2 * 850;
function cell(children, width, o = {}) {
  if (!Array.isArray(children)) children = [P(children, Object.assign({ size: 22, after: 20 }, o))];
  return new TableCell({ children, width: { size: width, type: WidthType.DXA }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, shading: o.fill ? { type: ShadingType.CLEAR, color: 'auto', fill: o.fill } : undefined });
}
const kv = (k, v) => new TableRow({ cantSplit: true, children: [cell(k, 4000, { bold: true, fill: 'F3F6FA' }), cell(Array.isArray(v) ? v.map((x) => P(x, { size: 22, after: 20 })) : v, LW - 4000)] });
function stages() {
  return [
    [T('Ұйымдастыру кезеңі', 'Организационный момент'), 0, 2,
      [T('Сәлемдесу. Сабақтың мақсатымен және бағалау критерийлерімен таныстырады.', 'Приветствие. Знакомит с целью урока и критериями оценивания.')],
      [T('Сабаққа дайындалады, мақсатты түсінеді.', 'Готовятся к уроку, осознают цель.')], ['—'], [T('Слайд 1–2', 'Слайды 1–2')]],
    [T('Еске түсіру: бағанмен қосу және азайту', 'Актуализация: сложение и вычитание столбиком'), 2, 10,
      [T('**«Ойдағы бір» ережесін** еске түсіртеді: S < q — S жазамыз; S ≥ q — S − q жазамыз, 1 ойда. Екі оқушы тақтада мысал шығарады (екілік және он алтылық), сынып тексереді.', 'Повторяет **правило переноса**: S < q — пишем S; S ≥ q — пишем S − q, 1 в уме. Два ученика решают у доски (двоичный и шестнадцатеричный пример), класс проверяет.'),
        T('**Азайту:** q-ды қарызға алу, сол жақтағы цифр 1-ге кемиді. Жиі қателерді талдайды (10-нан кейін көшіру, кемітуді ұмыту).', '**Вычитание:** занимаем q, цифра слева уменьшается на 1. Разбирает частые ошибки (перенос после 10, забыли уменьшить).')],
      [T('Ережені айтады, тақтада және дәптерде мысал шығарады, бір-бірін тексереді.', 'Проговаривают правило, решают у доски и в тетради, проверяют друг друга.')],
      [T('Ауызша кері байланыс, тақтадағы шешімді сыныппен тексеру', 'Устная обратная связь, проверка решения у доски всем классом')], [T('Слайд 3–9', 'Слайды 3–9')]],
    [T('Әр түрлі жүйедегі сандар', 'Числа в разных системах'), 10, 12,
      [T('Триада (8 ↔ 2) және тетрада (16 ↔ 2) арқылы бір жүйеге келтіруді көрсетеді: 35₈ = 011 101₂, 101101₂ = 0010 1101 = 2D₁₆.', 'Показывает приведение к одной системе через триады (8 ↔ 2) и тетрады (16 ↔ 2): 35₈ = 011 101₂, 101101₂ = 0010 1101 = 2D₁₆.')],
      [T('Аударуды ауызша орындайды.', 'Выполняют перевод устно.')], [T('Ауызша сұрақ-жауап', 'Устный опрос')], [T('Слайд 10', 'Слайд 10')]],
    [T('Нұсқаулық', 'Инструктаж'), 12, 14,
      [T('qosu-azaytu-8.2.1.2.html файлын ашуды сұрайды: сынып пен аты-жөнін тізімнен таңдау → толық экран → теория → тапсырмалар. Ережелерді еске салады: жұмыс кезінде теорияға қайтуға болмайды, толық экраннан шығу — бұзушылық (2 ескерту, 3-інде аяқталады).',
        'Просит открыть файл qosu-azaytu-8.2.1.2.html: выбрать класс и себя из списка → полный экран → теория → задания. Напоминает правила: во время работы к теории вернуться нельзя, выход из полноэкранного режима — нарушение (2 предупреждения, на 3-м работа завершается).')],
      [T('Файлды ашады, сыныбы мен аты-жөнін таңдайды.', 'Открывают файл, выбирают класс и себя.')], ['—'], [T('Слайд 11–12', 'Слайды 11–12')]],
    [T('Формативтік жұмыс', 'Формативная работа'), 14, 37,
      [T('Жұмысты бақылайды. Веб-ресурста: теорияны қысқа оқу (≈3 мин), содан кейін 10 тапсырма (әрқайсысында 4 мысал × 0,25 балл, бағанмен — әр цифр өз ұяшығында) және ★ қосымша тапсырма (6 балл). Компьютер жетпесе — **қағаз нұсқасы** (үлестірме, 1- және 2-нұсқа).',
        'Наблюдает за работой. В веб-ресурсе: краткое чтение теории (≈3 мин), затем 10 заданий (в каждом 4 примера × 0,25 балла, столбиком — каждая цифра в своей клетке) и ★ дополнительное задание (6 баллов). Если не хватает компьютеров — **бумажный вариант** (раздатка, варианты 1 и 2).'),
        T('Уақыт: файлдағы WORK_MIN жолында тапсырмаларға берілетін минут (40 минуттық сабақ үшін 20 минут ұсынылады).', 'Время: в файле в строке WORK_MIN задаётся время на задания (для урока 40 минут рекомендуется 20 минут).')],
      [T('Тапсырмаларды бағанмен орындайды, ойдағы санды жоғарғы ұяшықтарға жазады.', 'Выполняют задания столбиком, число «в уме» записывают в верхние клетки.')],
      [T('Формативтік бағалау: автоматты тексеру (10 балл + ★ 6 балл), нәтиже мен толық есеп мұғалімнің поштасына PDF түрінде келеді', 'Формативное оценивание: автоматическая проверка (10 баллов + ★ 6), результат и подробный отчёт приходят учителю на почту в PDF')],
      ['qosu-azaytu-8.2.1.2.html', T('Үлестірме (қағаз нұсқасы)', 'Раздатка (бумажный вариант)')]],
    [T('Рефлексия', 'Рефлексия'), 37, 40,
      [T('Нәтиже бетіндегі талдауды қарауды сұрайды. «Бағдаршам»: жасыл — бәрін түсіндім, сары — кейде қателесемін, қызыл — көмек керек. Жиі қателерді тағы бір рет атайды.', 'Просит посмотреть разбор на странице результата. «Светофор»: зелёный — всё понятно, жёлтый — иногда ошибаюсь, красный — нужна помощь. Ещё раз называет частые ошибки.')],
      [T('Талдауды қарайды, «бағдаршам» карточкасын көтереді.', 'Смотрят разбор, поднимают карточку «светофора».')], [T('Өзін-өзі бағалау', 'Самооценка')], [T('Слайд 13', 'Слайд 13')]],
  ];
}
function planDoc() {
  const c = [];
  c.push(P(T('Қысқа мерзімді жоспар', 'Краткосрочный план'), { bold: true, size: 30, align: AlignmentType.CENTER, after: 120 }));
  c.push(new Table({ borders: BORDERS, width: { size: LW, type: WidthType.DXA }, columnWidths: [4000, LW - 4000], rows: [
    kv(T('Бөлім', 'Раздел'), T('Санау жүйелері', 'Системы счисления')),
    kv(T('Педагогтің аты-жөні', 'ФИО педагога'), ''),
    kv(T('Күні', 'Дата'), ''),
    kv(T('Сынып', 'Класс'), T('8 ___   Қатысқандар саны: ___   Қатыспағандар саны: ___', '8 ___   Количество присутствующих: ___   отсутствующих: ___')),
    kv(T('Сабақтың тақырыбы', 'Тема урока'), T('Позициялық санау жүйелерінде қосу және азайту (формативтік жұмыс)', 'Сложение и вычитание в позиционных системах счисления (формативная работа)')),
    kv(T('Оқу бағдарламасына сәйкес оқу мақсаты', 'Цель обучения в соответствии с учебной программой'), T('8.2.1.2 — екілік, сегіздік және он алтылық санау жүйелерінде арифметикалық амалдарды орындау', '8.2.1.2 — выполнять арифметические операции в двоичной, восьмеричной и шестнадцатеричной системах счисления')),
    kv(T('Сабақтың мақсаты', 'Цель урока'), [T('Барлық оқушылар: екілік, сегіздік, он алтылық жүйеде бағанмен қосуды және азайтуды орындайды.', 'Все учащиеся: выполняют сложение и вычитание столбиком в двоичной, восьмеричной и шестнадцатеричной системах.'),
      T('Көптеген оқушылар: жасырын цифрды табады, қатені тауып түзетеді, әр түрлі жүйедегі сандармен амал орындайды.', 'Большинство учащихся: находят скрытые цифры, находят и исправляют ошибку, выполняют действия с числами в разных системах.'),
      T('Кейбір оқушылар: теңдеуді шешеді, санау жүйесінің негізін табады (★ қосымша тапсырма).', 'Некоторые учащиеся: решают уравнение, находят основание системы счисления (★ дополнительное задание).')]),
    kv(T('Бағалау критерийлері', 'Критерии оценивания'), [T('— Бағанмен қосуда көшіру шегін (негіз q) дұрыс қолданады;', '— Правильно применяет порог переноса (основание q) при сложении столбиком;'),
      T('— Азайтуда q-ды қарызға алып, сол жақтағы цифрды кемітеді;', '— При вычитании занимает q и уменьшает цифру слева;'),
      T('— Әр түрлі жүйедегі сандарды бір жүйеге келтіріп есептейді.', '— Приводит числа из разных систем к одной и выполняет вычисления.')]),
    kv(T('Құндылықтарды дарыту', 'Привитие ценностей'), T('Академиялық адалдық (өз бетімен орындау), жауапкершілік, ұқыптылық.', 'Академическая честность (самостоятельное выполнение), ответственность, аккуратность.')),
    kv(T('Пәнаралық байланыс', 'Межпредметные связи'), T('Математика: позициялық жазу, дәрежелер.', 'Математика: позиционная запись, степени.')),
    kv(T('Алдыңғы оқу', 'Предварительные знания'), T('8.2.1.1 — сандарды бір жүйеден екінші жүйеге аудару; бағанмен қосу/азайту ережесімен алдыңғы сабақта танысқан.', '8.2.1.1 — перевод чисел из одной системы в другую; правило сложения/вычитания столбиком изучено на прошлом уроке.')),
  ] }));
  c.push(P(T('Сабақтың барысы', 'Ход урока'), { bold: true, size: 26, before: 200, after: 80, align: AlignmentType.CENTER }));
  const ws = [2600, 4900, 3000, 2600, LW - 13100];
  const head = [T('Сабақ кезеңі / уақыты', 'Этап урока / время'), T('Педагогтің әрекеті', 'Деятельность педагога'), T('Оқушылардың әрекеті', 'Деятельность учащихся'), T('Бағалау', 'Оценивание'), T('Ресурстар', 'Ресурсы')];
  const st = stages();
  st.reduce((prev, s) => { if (s[1] !== prev) throw new Error('уақыт үзілді: ' + s[0]); return s[2]; }, 0) === 40 || (() => { throw new Error('40 минут емес'); })();
  const rows = [new TableRow({ tableHeader: true, children: head.map((h, j) => cell(h, ws[j], { bold: true, fill: 'E8EEF7' })) })];
  st.forEach((s) => rows.push(new TableRow({ cantSplit: true, children: [
    cell([P(s[0], { bold: true, size: 22, after: 20 }), P(`${s[1]}–${s[2]} ${T('мин', 'мин')}`, { size: 22 })], ws[0]),
    cell(s[3].map((x) => P(x, { size: 22, after: 60 })), ws[1]), cell(s[4].map((x) => P(x, { size: 22, after: 40 })), ws[2]),
    cell(s[5].map((x) => P(x, { size: 22, after: 40 })), ws[3]), cell(s[6].map((x) => P(x, { size: 22, after: 40 })), ws[4])] })));
  c.push(new Table({ borders: BORDERS, width: { size: LW, type: WidthType.DXA }, columnWidths: ws, rows }));
  c.push(new Table({ borders: BORDERS, width: { size: LW, type: WidthType.DXA }, columnWidths: [LW / 3, LW / 3, LW - 2 * Math.floor(LW / 3)], rows: [
    new TableRow({ children: [T('Саралау', 'Дифференциация'), T('Бағалау', 'Оценивание'), T('Денсаулық және қауіпсіздік', 'Здоровье и безопасность')].map((x, j) => cell(x, [LW / 3, LW / 3, LW - 2 * Math.floor(LW / 3)][j], { bold: true, fill: 'E8EEF7' })) }),
    new TableRow({ children: [
      T('Әр оқушының сандары әртүрлі; ойдағы санға арналған ұяшықтар — қолдау; ерте аяқтағандарға ★ қосымша тапсырма (теңдеу, негізді табу).', 'У каждого ученика свои числа; клетки для числа «в уме» — поддержка; закончившим раньше — ★ дополнительное задание (уравнение, поиск основания).'),
      T('Автоматты бағалау: 1–10 тапсырма — 10 балл, ★ — 6 балл; мұғалімге әр оқушының толық есебі (PDF) поштаға келеді. Өзін-өзі бағалау — «бағдаршам».', 'Автоматическое оценивание: задания 1–10 — 10 баллов, ★ — 6 баллов; учителю на почту приходит полный отчёт каждого ученика (PDF). Самооценка — «светофор».'),
      T('Компьютермен жұмыс ережелері; көзге арналған жаттығу.', 'Правила работы за компьютером; гимнастика для глаз.')].map((x, j) => cell(x, [LW / 3, LW / 3, LW - 2 * Math.floor(LW / 3)][j])) }),
  ] }));
  c.push(P(T('Сабақтан кейінгі рефлексия: мақсатқа жеттік пе? Қай тапсырма түрі (жасырын цифр, қатені түзету, аударма) ең қиын болды? Келесі сабақта нені қайталау керек?', 'Рефлексия после урока: достигнута ли цель? Какой тип заданий (скрытые цифры, исправление ошибки, перевод) оказался самым трудным? Что повторить на следующем уроке?'), { size: 22, italics: true, before: 160 }));
  return docA4(c, T('ҚМЖ 8.2.1.2', 'КСП 8.2.1.2'), true);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  for (const lang of ['kz', 'ru']) {
    LANG = lang;
    const sfx = lang === 'kz' ? 'kz' : 'ru';
    fs.writeFileSync(path.join(OUT, T('qmzh-8.2.1.2-kz.docx', 'ksp-8.2.1.2-ru.docx')), await Packer.toBuffer(planDoc()));
    const key = [P(T('Жауап кілті — қағаз нұсқасы 8.2.1.2', 'Ключ ответов — бумажный вариант 8.2.1.2'), { bold: true, size: 28, align: AlignmentType.CENTER, after: 120 })];
    const body = [];
    SEEDS.forEach((seed, n) => {
      const { c, tasks } = taskDoc(seed, n + 1);
      if (n) body.push(new Paragraph({ children: [new PageBreak()] }));
      body.push(...c);
      key.push(P(T(`${n + 1}-нұсқа`, `Вариант ${n + 1}`), { bold: true, size: 26, before: 160, after: 60 }));
      key.push(keyRows(tasks));
    });
    key.push(P(T('Бағалау: 1–10 тапсырмада әр дұрыс мысал — 0,25 балл (барлығы 10 балл); ★ тапсырмаларда әр жауап — 1 балл (барлығы 6 балл). Жауапта алдыңғы нөлдер есепке алынбайды.', 'Оценивание: в заданиях 1–10 каждый верный пример — 0,25 балла (всего 10); в ★ заданиях каждый ответ — 1 балл (всего 6). Ведущие нули в ответе не учитываются.'), { size: 22, before: 160 }));
    fs.writeFileSync(path.join(OUT, T('ulestirme-8.2.1.2-kz.docx', 'razdatka-8.2.1.2-ru.docx')), await Packer.toBuffer(docA4(body, T('Үлестірме 8.2.1.2', 'Раздатка 8.2.1.2'))));
    fs.writeFileSync(path.join(OUT, T('zhauap-kilti-8.2.1.2-kz.docx', 'otvety-8.2.1.2-ru.docx')), await Packer.toBuffer(docA4(key, T('Жауап кілті', 'Ключ'))));
    console.log(lang, 'дайын', sfx);
  }
})();
