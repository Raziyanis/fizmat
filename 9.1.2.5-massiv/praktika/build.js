/* 9.1.2.5 практикалық тапсырмалары (A, B, C деңгейлері) → praktika-9.1.2.5-kz.docx (оқушыға)
 * және praktika-9.1.2.5-kz-zhauaptary.docx (соңында мұғалімге жауаптар).
 * Мысалдар — examples.json, шешімдер — sol/*.py (тексеру: python3 check.py).
 * Іске қосу: NODE_PATH=<docx пакеті> node build.js */
'use strict';
const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, ShadingType, PageBreak } = require('docx');

const EX = JSON.parse(fs.readFileSync(path.join(__dirname, 'examples.json'), 'utf8'));
const FONT = 'Times New Roman', MONO = 'Courier New';
const runs = (text, o = {}) => String(text).split(/(\*\*[^*]+\*\*)/).filter(Boolean).map((p) => {
  const b = /^\*\*.*\*\*$/.test(p);
  return new TextRun({ text: b ? p.slice(2, -2) : p, bold: b || o.bold, italics: o.italics, size: o.size || 24, font: o.mono ? MONO : FONT });
});
const P = (t, o = {}) => new Paragraph({ children: runs(t, o), alignment: o.align, spacing: { before: o.before || 0, after: o.after ?? 80 }, keepNext: o.keepNext });
const code = (t, size = 20) => String(t).replace(/\s+$/, '').split('\n').map((l, i, a) => new Paragraph({ keepNext: i < a.length - 1, spacing: { after: 0 }, children: [new TextRun({ text: l || ' ', font: MONO, size })] }));
const THIN = { style: BorderStyle.SINGLE, size: 4, color: '808080' };
const BORDERS = { top: THIN, bottom: THIN, left: THIN, right: THIN, insideHorizontal: THIN, insideVertical: THIN };
const M = 850, W = 11906 - 2 * M;
const cell = (children, w, fill) => new TableCell({ children, width: { size: w, type: WidthType.DXA }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, shading: fill ? { type: ShadingType.CLEAR, color: 'auto', fill } : undefined });

const TASKS = [
  ['A', 'A1', 'Бірінші, соңғы және саны', 'Бос орын арқылы бүтін сандар енгізіледі. Тізімнің бірінші элементін, соңғы элементін және элементтер санын шығарыңыз.', 'индекс 0 және −1, len()'],
  ['A', 'A2', 'Басына және соңына қосу', 'Бос орын арқылы бүтін сандар енгізіледі. Тізімнің соңына 100 санын, басына 0 санын қосып, тізімді print(a) арқылы шығарыңыз.', 'append(), insert()'],
  ['A', 'A3', 'Сұрыптау және қосынды', 'Бос орын арқылы бүтін сандар енгізіледі. Тізімді өсу ретімен сұрыптап шығарыңыз, келесі жолға сандардың қосындысын шығарыңыз.', 'sort(), sum()'],
  ['B', 'B1', 'Жұп сандар', 'Бос орын арқылы бүтін сандар енгізіледі. Тізімдегі жұп сандардың санын және олардың қосындысын шығарыңыз.', 'for циклі, шарт, санауыш'],
  ['B', 'B2', 'Барлығын өшіру', 'Бірінші жолда тізім, екінші жолда x саны енгізіледі. Тізімнен x мәніне тең барлық элементті өшіріп, тізімді шығарыңыз. (remove() бір рет қолданылғанда тек біріншісін өшіретінін ескеріңіз.)', 'while циклі, in, remove()'],
  ['B', 'B3', 'Ең үлкен элемент және оның орны', 'Бос орын арқылы бүтін сандар енгізіледі. Ең үлкен элементті және оның алғаш кездескен индексін шығарыңыз.', 'max(), index()'],
  ['C', 'C1', 'Қайталанбайтын элементтер', 'Бос орын арқылы бүтін сандар енгізіледі. Әр мәнді бір рет қана қалдырып (алғаш кездескен ретімен), жаңа тізімді шығарыңыз.', 'жаңа тізім, not in, append()'],
  ['C', 'C2', 'Кері ретпен', 'Бос орын арқылы бүтін сандар енгізіледі. reverse(), sort() және [::-1] қолданбай, элементтері кері ретпен тұрған жаңа тізімді шығарыңыз.', 'индекс бойынша цикл'],
  ['C', 'C3', 'Ортақ элементтер', 'Екі жолда екі тізім енгізіледі. Екі тізімде де бар сандарды бірінші тізімдегі ретімен, әрқайсысын бір рет шығарыңыз.', 'in, not in, append()'],
];
const LEVEL = { A: 'A деңгейі — барлығына', B: 'B деңгейі — орта', C: 'C деңгейі — жоғары' };

function exTable(k) {
  const w = [W / 2, W / 2];
  const head = new TableRow({ tableHeader: true, children: ['Кіріс', 'Шығыс'].map((h, i) => cell([P(h, { bold: true, size: 22, after: 0 })], w[i], 'E8EEF7')) });
  return new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: w, borders: BORDERS,
    rows: [head].concat(EX[k].map(([i, o]) => new TableRow({ cantSplit: true, children: [cell(code(i), w[0]), cell(code(o), w[1])] }))) });
}

function tasks() {
  const out = [
    P('Практикалық жұмыс. Бір өлшемді массив: Python тізімдері', { bold: true, size: 30, align: AlignmentType.CENTER, after: 40 }),
    P('Оқу мақсаты 9.1.2.5: бір өлшемді массивтерді қолданып бағдарлама жасау және тізім әдістерін қолдану', { italics: true, size: 22, align: AlignmentType.CENTER, after: 120 }),
    new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [6200, W - 6200], borders: BORDERS, rows: [new TableRow({ children: [cell([P('Аты-жөні: ______________________________', { after: 0 })], 6200), cell([P('Сыныбы: 9 ____', { after: 0 })], W - 6200)] })] }),
    P('', { after: 40 }),
    new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [W], borders: BORDERS, rows: [new TableRow({ children: [cell([
      P('**Қалай орындаймыз.** Бағдарламаны Python редакторында жазып, мысалдармен тексеріңіз. Алдымен A деңгейін, содан кейін B және C деңгейлерін орындаңыз.', { size: 22, after: 40 }),
      P('**Тізімді енгізу:** a = list(map(int, input().split()))   — бір жолдағы сандар тізімге айналады.', { size: 22, after: 0 }),
    ], W, 'F3F6FA')] })] }),
  ];
  let lvl = '';
  TASKS.forEach(([L, k, title, text, skill]) => {
    if (L !== lvl) { lvl = L; out.push(P(LEVEL[L], { bold: true, size: 28, before: 240, after: 60, keepNext: true })); }
    out.push(P(`**${k}. ${title}**`, { size: 24, before: 140, after: 40, keepNext: true }));
    out.push(P(text, { size: 22, after: 60, keepNext: true }));
    out.push(exTable(k));
  });
  out.push(P('**Өзін-өзі бағалау.** Орындалған тапсырмаларды белгілеңіз:  A1 ☐  A2 ☐  A3 ☐  B1 ☐  B2 ☐  B3 ☐  C1 ☐  C2 ☐  C3 ☐', { size: 22, before: 240 }));
  return out;
}

function answers() {
  const out = [new Paragraph({ children: [new PageBreak()] }),
    P('Жауаптар (мұғалімге)', { bold: true, size: 30, align: AlignmentType.CENTER, after: 40 }),
    P('Әр шешім парақтағы мысалдарда және кездейсоқ тестілерде тексерілді (check.py). Басқа дұрыс шешімдер де есептеледі.', { italics: true, size: 20, align: AlignmentType.CENTER, after: 120 })];
  TASKS.forEach(([L, k, title, , skill]) => {
    out.push(P(`**${k}. ${title}** — ${skill}`, { size: 22, before: 140, after: 40, keepNext: true }));
    out.push(...code(fs.readFileSync(path.join(__dirname, 'sol', k + '.py'), 'utf8'), 18));
  });
  return out;
}

const doc = (children) => new Document({ creator: 'Информатика мұғалімі', title: 'Практикалық жұмыс 9.1.2.5',
  styles: { default: { document: { run: { font: FONT, size: 24 } } } },
  sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: M, bottom: M, left: M, right: M } } }, children }] });

const OUT = path.join(__dirname, '..');
Promise.all([
  Packer.toBuffer(doc(tasks())).then((b) => fs.writeFileSync(path.join(OUT, 'praktika-9.1.2.5-kz.docx'), b)),
  Packer.toBuffer(doc(tasks().concat(answers()))).then((b) => fs.writeFileSync(path.join(OUT, 'praktika-9.1.2.5-kz-zhauaptary.docx'), b)),
]).then(() => console.log('praktika-9.1.2.5-kz.docx, praktika-9.1.2.5-kz-zhauaptary.docx дайын'));
