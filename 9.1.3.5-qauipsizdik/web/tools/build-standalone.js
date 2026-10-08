#!/usr/bin/env node
/* Собирает один файл standalone/qauipsizdik-9.1.3.5.html (интернет и сервер не нужны).
 * Запуск: node tools/build-standalone.js */
'use strict';
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(dir, f), 'utf8');
const inline = (js) => '<script>\n' + js.replace(/<\/script/gi, '<\\/script') + '\n</script>';
let page = read('index.html')
  .replace('<link rel="stylesheet" href="style.css">', () => '<style>\n' + read('style.css') + '</style>')
  .replace('<script src="config.js"></script>', () => inline(read('config.js')))
  .replace(/  <script src="content\.js"><\/script>[\s\S]*<script src="app\.js"><\/script>/, () => [read('content.js'), read('ai.js'), read('app.js')].map(inline).join('\n'));
if (/<script src=|<link rel="stylesheet"/.test(page)) throw new Error('остались внешние файлы');
fs.mkdirSync(path.join(dir, 'standalone'), { recursive: true });
fs.writeFileSync(path.join(dir, 'standalone', 'qauipsizdik-9.1.3.5.html'), page);
console.log('standalone/qauipsizdik-9.1.3.5.html', Math.round(page.length / 1024) + ' КБ');
