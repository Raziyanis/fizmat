#!/usr/bin/env node
/* Собирает один файл standalone/cikly-8.1.4.3.html: теория (из ../tools/theory-content.js — тот же текст, что в Word),
 * тест, задачи на код и Python-интерпретатор Skulpt (MIT, vendor/LICENSE). Интернет и сервер не нужны.
 * Запуск: python3 ../tools/examples.py && node tools/build-standalone.js */
'use strict';
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(dir, f), 'utf8');
const { body, EX } = require(path.join(dir, '..', 'tools', 'theory-content.js'));

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const md = (s) => esc(s).split(/(\*\*[^*]+\*\*|`[^`]+`)/).map((p) =>
  /^\*\*.*\*\*$/.test(p) ? '<b>' + p.slice(2, -2) + '</b>' : /^`.*`$/.test(p) ? '<code>' + p.slice(1, -1) + '</code>' : p).join('');
const tbox = (cls, label, text) => `<div class="t-box ${cls}"><div class="lbl">${esc(label)}</div><pre>${esc(text)}</pre></div>`;

let html = '', inList = false;
for (const b of body) {
  if (b[0] !== 'b' && inList) { html += '</ul>'; inList = false; }
  switch (b[0]) {
    case 'title': html += `<h1 class="t-title">${md(b[1])}</h1>`; break;
    case 'subtitle': html += `<p class="t-sub">${md(b[1])}</p>`; break;
    case 'h1': html += `<h2 class="t-h1">${md(b[1])}</h2>`; break;
    case 'h2': html += `<h3 class="t-h2">${md(b[1])}</h3>`; break;
    case 'p': html += `<p${b[2] && b[2].color ? ' style="color:#a52222;font-weight:600"' : ''}>${md(b[1])}</p>`; break;
    case 'b': if (!inList) { html += '<ul>'; inList = true; } html += `<li>${md(b[1])}</li>`; break;
    case 'box': html += tbox('', b[2], b[1].join('\n')); break;
    case 'gap': break;
    case 'ex': {
      const e = EX[b[1]];
      const right = (e.input ? tbox('inp', 'Ввод с клавиатуры', e.input.join('\n')) : '') +
        (b[2] && b[2].noOutput ? '' : tbox('out', 'Вывод на экран', e.output.replace(/ +$/gm, '') || ' '));
      html += `<div class="t-pair">${tbox('', 'Программа', e.code)}<div>${right}</div></div>`;
      break;
    }
    case 'table': {
      html += '<table class="t-table">' + b[2].map((row, i) => '<tr>' + row.map((c) => i === 0 ? `<th>${md(c)}</th>` : `<td>${md(c)}</td>`).join('') + '</tr>').join('') + '</table>';
      break;
    }
    default: throw new Error('неизвестный блок ' + b[0]);
  }
}
if (inList) html += '</ul>';

const inline = (js) => '<script>\n' + js.replace(/<\/script/gi, '<\\/script') + '\n</script>';
const scripts = [
  inline(read('config.js')),
  inline('/* Skulpt — Python in the browser. Copyright (c) 2009-2016 Scott Graham and contributors. MIT License. */\n' + read('vendor/skulpt.min.js')),
  inline(read('vendor/skulpt-stdlib.js')),
  inline(read('quiz.js')), inline(read('tasks.js')), inline(read('app.js')),
].join('\n');
let page = read('index.html')
  .replace('<!--THEORY-->', () => html)
  .replace('<link rel="stylesheet" href="style.css">', () => '<style>\n' + read('style.css') + '</style>')
  .replace(/  <script src="config\.js"><\/script>[\s\S]*<script src="app\.js"><\/script>/, () => scripts);
if (/<script src=|<link rel="stylesheet"/.test(page)) throw new Error('остались внешние файлы');
fs.mkdirSync(path.join(dir, 'standalone'), { recursive: true });
fs.writeFileSync(path.join(dir, 'standalone', 'cikly-8.1.4.3.html'), page);
console.log('standalone/cikly-8.1.4.3.html', Math.round(page.length / 1024) + ' КБ');
