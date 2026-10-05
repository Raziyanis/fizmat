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

const { body: BLOCKS, EX } = require('./theory-content');
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

// Преобразование блоков theory-content.js в элементы Word
const DOCX_BLOCK = {
  title: (b) => P(b[1], { bold: true, size: 36, align: AlignmentType.CENTER, after: 40 }),
  subtitle: (b) => P(b[1], { italics: true, size: 22, align: AlignmentType.CENTER, after: 200 }),
  h1: (b) => H1(b[1]), h2: (b) => H2(b[1]), p: (b) => P(b[1], b[2]), b: (b) => B(b[1]),
  box: (b) => box(b[1], 'F3F6FA', b[2], b[3]), gap: () => gap(), table: (b) => table(b[1], b[2], b[3]),
};
const body = [];
BLOCKS.forEach((b) => { if (b[0] === 'ex') body.push(...ex(b[1], b[2])); else body.push(DOCX_BLOCK[b[0]](b)); });

const doc = new Document({
  creator: 'Учитель информатики', title: 'Теория 8.1.4.3: цикл while, цикл for',
  styles: { default: { document: { run: { font: FONT, size: 24 } } } },
  sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: M, bottom: M, left: M, right: M } } }, children: body }],
});
Packer.toBuffer(doc).then((b) => { fs.writeFileSync(path.join(__dirname, '..', 'teoriya-8.1.4.3.docx'), b); console.log('teoriya-8.1.4.3.docx готов'); });
