#!/usr/bin/env node
/* Собирает один файл standalone/break-continue-8.1.4.5.html: страница, задачи и Python-интерпретатор Skulpt
 * (MIT, vendor/LICENSE). Интернет и сервер не нужны. Запуск: node tools/build-standalone.js */
'use strict';
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(dir, f), 'utf8');
const inline = (js) => '<script>\n' + js.replace(/<\/script/gi, '<\\/script') + '\n</script>';
const scripts = [
  inline(read('config.js')),
  inline('/* Skulpt — Python in the browser. Copyright (c) 2009-2016 Scott Graham and contributors. MIT License. */\n' + read('vendor/skulpt.min.js')),
  inline(read('vendor/skulpt-stdlib.js')),
  inline(read('tasks.js')), inline(read('app.js')),
].join('\n');
let page = read('index.html')
  .replace('<link rel="stylesheet" href="style.css">', () => '<style>\n' + read('style.css') + '</style>')
  .replace(/  <script src="config\.js"><\/script>[\s\S]*<script src="app\.js"><\/script>/, () => scripts);
page = page.replace('</body>', () => '<script type="text/plain" id="gs-src">\n' + read('server/Code.gs').replace(/<\/script/gi, '<\\/script') + '\n</script>\n</body>');
if (/<script src=|<link rel="stylesheet"/.test(page)) throw new Error('остались внешние файлы');
fs.mkdirSync(path.join(dir, 'standalone'), { recursive: true });
fs.writeFileSync(path.join(dir, 'standalone', 'break-continue-8.1.4.5.html'), page);
console.log('standalone/break-continue-8.1.4.5.html', Math.round(page.length / 1024) + ' КБ');
