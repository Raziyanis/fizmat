/* 9.1.3.5–9.1.3.6: веб-ресурстағы 14 тапсырманың қағаз нұсқасы (қазақша) — 4 нұсқа және жауап кілті.
 * Тапсырмалар web/content.js-тегі generate(seed) арқылы жасалады — веб-ресурстағы тапсырмалармен бірдей банктерден.
 * Іске қосу: NODE_PATH=<docx пакеті> node tools/build-paper.js */
'use strict';
const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, ShadingType, PageBreak } = require('docx');

const ROOT = path.join(__dirname, '..');
global.window = {};
require(path.join(ROOT, 'web', 'content.js'));
const C = global.window.CONTENT;

const SEEDS = [1101, 2207, 3313, 4419];   // 4 нұсқа (сандарын өзгертсе — басқа тапсырмалар шығады)
const FONT = 'Times New Roman';
const W = 11906 - 2 * 850;
const k = (o) => (o && typeof o === 'object' && 'kz' in o ? o.kz : String(o));
const LET = ['А', 'Ә', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З'];
const LOW = ['а', 'ә', 'б', 'в', 'г', 'д'];

function runs(text, o = {}) {
  return String(text).split(/(\*\*[^*]+\*\*)/).filter(Boolean).map((p) => /^\*\*.*\*\*$/.test(p)
    ? new TextRun({ text: p.slice(2, -2), bold: true, size: o.size || 24, font: o.font || FONT })
    : new TextRun({ text: p, bold: o.bold, italics: o.italics, size: o.size || 24, font: o.font || FONT }));
}
const P = (t, o = {}) => new Paragraph({ children: runs(t, o), alignment: o.align, spacing: { before: o.before || 0, after: o.after ?? 60 }, keepNext: o.keepNext, indent: o.indent ? { left: o.indent } : undefined });
const THIN = { style: BorderStyle.SINGLE, size: 4, color: '808080' };
const BORDERS = { top: THIN, bottom: THIN, left: THIN, right: THIN, insideHorizontal: THIN, insideVertical: THIN };
function cell(children, width, o = {}) {
  if (!Array.isArray(children)) children = [P(children, Object.assign({ after: 0, size: 22 }, o))];
  return new TableCell({ children, width: { size: width, type: WidthType.DXA }, margins: { top: 50, bottom: 50, left: 90, right: 90 },
    shading: o.fill ? { type: ShadingType.CLEAR, color: 'auto', fill: o.fill } : undefined });
}
function table(widths, rows, o = {}) {
  return new Table({
    width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA }, columnWidths: widths, borders: BORDERS,
    rows: rows.map((r, i) => new TableRow({ cantSplit: true, height: o.height && i > 0 ? { value: o.height, rule: 'atLeast' } : undefined,
      children: r.map((c, j) => (c instanceof TableCell ? c : cell(c, widths[j], { bold: o.head !== false && i === 0, fill: o.head !== false && i === 0 ? 'E8EEF7' : undefined, font: o.mono && i > 0 && j === o.mono - 1 ? 'Consolas' : undefined }))) })),
  });
}
const lines = (n) => Array.from({ length: n }, () => P('____________________________________________________________________________', { size: 22, after: 40 }));
const head = (n, t) => P(`${n}-тапсырма. ${k(t.title)}`, { bold: true, size: 25, before: 200, after: 60, keepNext: true }) ;
const pts = (t) => P(`(${t.max} балл)`, { italics: true, size: 20, after: 60, keepNext: true });

/* ---------- Оқушы парағы ---------- */
function taskBlock(t, n) {
  const c = [head(n, t), pts(t)];
  switch (t.type) {
    case 'match':
      c.push(P('Әр терминге сәйкес анықтаманың әрпін жазыңыз.', { size: 22, keepNext: true }));
      c.push(table([2800, W - 2800], [['Термин', 'Анықтама']].concat(t.left.map((l, i) => [`${i + 1}. ${k(l)}`, `${LET[i]}. ${k(t.right[i])}`]))));
      c.push(P('Жауабы: ' + t.left.map((_, i) => `${i + 1} – ___`).join(';   '), { before: 80 }));
      break;
    case 'fill': {
      c.push(P('Мәтінді оқып, әр бос орынға сәйкес сөзді таңдаңыз (әрпін дөңгелектеңіз).', { size: 22 }));
      c.push(P(k(t.text).map((x) => (typeof x === 'string' ? x : ` (${x.b + 1}) ________ `)).join(''), { before: 40, after: 100 }));
      t.blanks.forEach((b, i) => c.push(P(`(${i + 1})   ` + b.opts.map((o, j) => `${LOW[j]}) ${k(o)}`).join('      '), { size: 22, after: 30 })));
      break;
    }
    case 'tf':
      c.push(P('Әр тұжырымның жанына «А» (ақиқат) немесе «Ж» (жалған) деп жазыңыз.', { size: 22 }));
      c.push(table([600, W - 1500, 900], [['№', 'Тұжырым', 'А / Ж']].concat(t.items.map((x, i) => [String(i + 1), k(x.s), '']))));
      break;
    case 'hot':
      if (t.style === 'mail') {
        c.push(P(`Хатта алаяқтықтың **${t.nBad}** белгісі бар. Сол бөліктердің нөмірін дөңгелектеңіз. Артық белгі балды азайтады.`, { size: 22 }));
        c.push(P(k(t.head), { bold: true, size: 22, after: 30 }));
        c.push(table([600, W - 600], t.parts.map((p, i) => [String(i + 1), k(p.text)]), { head: false }));
      } else {
        c.push(P(`Чатта **${t.nBad}** хабарлама этикетке сай емес. Олардың нөмірін дөңгелектеңіз. Артық белгі балды азайтады.`, { size: 22 }));
        c.push(P(k(t.head), { bold: true, size: 22, after: 30 }));
        c.push(table([600, 1700, W - 2300], [['№', 'Кім', 'Хабарлама']].concat(t.parts.map((p, i) => [String(i + 1), `${k(p.who)} (${p.time})`, k(p.text)]))));
      }
      break;
    case 'sort':
      c.push(P(k(t.lead).replace(/\s*Жылжыту.*$/, '') + ' Тиісті бағанға ✓ қойыңыз.', { size: 22 }));
      c.push(table([600, W - 600 - 2 * 1700, 1700, 1700], [['№', t.mono ? 'Сілтеме' : 'Әрекет', k(t.bins[0]), k(t.bins[1])]].concat(t.items.map((x, i) => [String(i + 1), k(x.t), '', ''])), { mono: t.mono ? 2 : 0 }));
      break;
    case 'order':
      c.push(P('Құпиясөздерді ең әлсізінен ең күштісіне қарай реттеп, әріптерін жазыңыз.', { size: 22 }));
      c.push(table([800, W - 800], t.start.map((ix, i) => [LET[i], t.items[ix]]), { head: false, mono: 2 }));
      c.push(P('Ең әлсізі → ең күштісі:   ___  →  ___  →  ___  →  ___', { before: 80 }));
      break;
    case 'chat':
      c.push(P(`Сізге ${k(t.who).toLowerCase()} жазып жатыр. Әр хабарламаға ең дұрыс жауапты таңдаңыз (әрпін дөңгелектеңіз).`, { size: 22 }));
      t.steps.forEach((s, i) => {
        c.push(P(`${i + 1}) ${k(t.who)}: «${k(s.msg)}»`, { size: 22, before: 60, after: 20, keepNext: true }));
        s.opts.forEach((o, j) => c.push(P(`${LOW[j]}) ${k(o)}`, { size: 22, after: 10, indent: 400 })));
      });
      break;
    case 'read':
      c.push(P('Мәтінді мұқият оқып, сұрақтарға жауап беріңіз (әрпін дөңгелектеңіз).', { size: 22 }));
      c.push(table([W], [[k(t.text)]], { head: false }));
      t.qs.forEach((q, i) => {
        c.push(P(`${i + 1}) [${k(q.lv)}] ${k(q.q)}`, { size: 22, before: 60, after: 20, keepNext: true }));
        q.opts.forEach((o, j) => c.push(P(`${LOW[j]}) ${k(o)}`, { size: 22, after: 10, indent: 400 })));
      });
      break;
    case 'multi':
      c.push(P(k(t.text), { size: 22, italics: true }));
      c.push(P(k(t.q) + ` (дұрыс жауап саны — ${t.nOk}; артық белгі балды азайтады)`, { size: 22, keepNext: true }));
      t.opts.forEach((o, j) => c.push(P(`☐  ${LOW[j]}) ${k(o.t)}`, { size: 22, after: 20, indent: 200 })));
      break;
    case 'text':
      c.push(P(k(t.ctx), { size: 22, italics: true }));
      if (t.kind === 'rewrite') {
        c.push(table([W], [[`«${k(t.rude)}»`]], { head: false }));
        c.push(P('Осы хабарламаны этикетке сай, сыпайы етіп қайта жазыңыз. Негізгі мағынасы сақталсын.', { size: 22, before: 60 }));
        c.push(...lines(3));
      } else {
        c.push(P(k(t.q), { size: 22 }));
        c.push(...lines(6));
      }
      c.push(P('Бағалау критерийлері (әрқайсысы 1 балл): ' + t.crit.map((x, i) => `${i + 1}) ${k(x)}`).join('; ') + '.', { size: 20, italics: true }));
      break;
  }
  return c;
}

/* ---------- Жауап кілті ---------- */
function answer(t) {
  switch (t.type) {
    case 'match': return t.key.map((r, i) => `${i + 1} – ${LET[r]}`).join(';  ');
    case 'fill': return t.blanks.map((b, i) => `(${i + 1}) ${LOW[b.key]}) ${k(b.opts[b.key])}`).join(';  ');
    case 'tf': return t.items.map((x, i) => `${i + 1} – ${x.v ? 'А' : 'Ж'}`).join(';  ');
    case 'hot': return 'Белгілеу керек: ' + t.parts.map((p, i) => (p.bad ? i + 1 : null)).filter(Boolean).join(', ') + '. Әр дұрыс белгі +1, әр артық белгі −1 (0-ден төмен емес).';
    case 'sort': return t.items.map((x, i) => `${i + 1} – ${x.bin === 0 ? k(t.bins[0]).toLowerCase() : k(t.bins[1]).toLowerCase()}`).join(';  ');
    case 'order': return t.items.map((_, r) => LET[t.start.indexOf(r)]).join(' → ') + '. Әр дұрыс орын — 1 балл.';
    case 'chat': return t.steps.map((s, i) => `${i + 1} – ${LOW[s.key]}`).join(';  ');
    case 'read': return t.qs.map((q, i) => `${i + 1} – ${LOW[q.key]}`).join(';  ');
    case 'multi': return 'Дұрыс: ' + t.opts.map((o, j) => (o.ok ? LOW[j] : null)).filter(Boolean).join(', ') + '. Әр дұрыс белгі +1, әр артық белгі −1 (0-ден төмен емес).';
    case 'text': return (t.kind === 'rewrite' ? 'Үлгі мазмұн: ' + k(t.gist) + '. ' : '') + 'Критерийлер: ' + t.crit.map((x, i) => `${i + 1}) ${k(x)}`).join('; ') + '.';
  }
  return '';
}
function scaleRows(max) {
  const rows = {};
  for (let g = 0; g <= max; g++) { const m = Math.round(10 * g / max); rows[m] = rows[m] || [g, g]; rows[m][1] = g; }
  const out = [['Балл', 'Баға (10 балдық)']];
  for (let m = 10; m >= 0; m--) if (rows[m]) out.push([rows[m][0] === rows[m][1] ? String(rows[m][0]) : `${rows[m][0]}–${rows[m][1]}`, String(m)]);
  return out;
}

function docFor(children, title) {
  return new Document({ creator: 'Информатика мұғалімі', title, styles: { default: { document: { run: { font: FONT, size: 24 } } } },
    sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 850, bottom: 850, left: 850, right: 850 } } }, children }] });
}

(async () => {
  const outDir = path.join(ROOT, 'qagaz');
  fs.mkdirSync(outDir, { recursive: true });
  const keyDoc = [P('Жауап кілті: «Желідегі қауіпсіздік. Желілік этикет» — қағаз нұсқасы', { bold: true, size: 30, align: AlignmentType.CENTER }),
    P('9 сынып · 9.1.3.5, 9.1.3.6 · 4 нұсқа', { size: 22, align: AlignmentType.CENTER, after: 120 }),
    P('Бағалау веб-ресурстағыдай: әр дұрыс тармақ — 1 балл. «Белгілеу» тапсырмаларында (хат, чат, жағдаят) артық белгі балды азайтады, бірақ тапсырма балы 0-ден төмен түспейді. Жазбаша жауаптарды (13, 14) мұғалім критерийлер бойынша тексереді. Қорытынды баға 10 балдық шкалаға ауыстырылады: жинаған балл × 10 : максимал балл, бүтін санға дөңгелектенеді.', { size: 22, after: 120 })];
  for (let v = 0; v < SEEDS.length; v++) {
    const tasks = C.generate(SEEDS[v]), max = tasks.reduce((s, t) => s + t.max, 0);
    const c = [];
    c.push(P(`Формативтік жұмыс: желідегі қауіпсіздік және желілік этикет — ${v + 1}-нұсқа`, { bold: true, size: 28, align: AlignmentType.CENTER, after: 40 }));
    c.push(P('9 сынып · 9.1.3.5 — желідегі қауіпсіздік ережелерін сақтау; 9.1.3.6 — нормаларды бұзудың салдарын пайымдау', { size: 20, align: AlignmentType.CENTER, after: 100 }));
    c.push(P('Аты-жөні: _________________________________     Сынып: ______     Күні: __________', { after: 80 }));
    c.push(P(`Уақыты — 40 минут. Ең жоғары балл — **${max}**. Барлық тапсырмаға жауап беріңіз.`, { size: 22, after: 60 }));
    tasks.forEach((t, i) => c.push(...taskBlock(t, i + 1)));
    c.push(P('', { before: 200 }));
    c.push(table([2400, 2400, 2400, W - 7200], [['Жинаған балл', 'Ең жоғары балл', 'Баға (10 балдық)', 'Мұғалім қолы'], ['', String(max), '', '']], { height: 500 }));
    fs.writeFileSync(path.join(outDir, `qagaz-tapsyrma-9.1.3.5-${v + 1}-nuska.docx`), await Packer.toBuffer(docFor(c, `Қағаз нұсқасы ${v + 1}`)));
    console.log(`${v + 1}-нұсқа: ${tasks.length} тапсырма, ${max} балл`);

    if (v) keyDoc.push(new Paragraph({ children: [new PageBreak()] }));
    keyDoc.push(P(`${v + 1}-нұсқа (ең жоғары балл — ${max})`, { bold: true, size: 28, before: 120, after: 80 }));
    keyDoc.push(table([600, 2600, 700, W - 3900], [['№', 'Тапсырма', 'Балл', 'Жауабы']].concat(tasks.map((t, i) => [String(i + 1), k(t.title), String(t.max), answer(t)]))));
    keyDoc.push(P(`Балдық шкала (${max} → 10)`, { bold: true, size: 22, before: 120, after: 40, keepNext: true }));
    keyDoc.push(table([2000, 2400], scaleRows(max)));
  }
  fs.writeFileSync(path.join(outDir, 'qagaz-tapsyrma-9.1.3.5-zhauap-kilti.docx'), await Packer.toBuffer(docFor(keyDoc, 'Жауап кілті')));
  console.log('жауап кілті дайын');
})();
