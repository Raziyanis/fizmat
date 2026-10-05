#!/usr/bin/env node
/* Собирает один автономный файл: standalone/formativ-8.1.4.3.html (всё внутри, сервер не нужен).
 * Запуск: node tools/build-standalone.js   (из папки 8.1.4.3-cikly/formativ) */
'use strict';
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(dir, f), 'utf8');
const scripts = ['config.js', 'tasks.js', 'app.js']
  .map((f) => '<script>\n' + read(f).replace(/<\/script/gi, '<\\/script') + '\n</script>').join('\n');
let html = read('index.html')
  .replace('<link rel="stylesheet" href="style.css">', () => '<style>\n' + read('style.css') + '</style>')
  .replace(/  <script src="config\.js"><\/script>[\s\S]*<script src="app\.js"><\/script>/, () => scripts);
if (/ src="|href="/.test(html)) throw new Error('остались внешние файлы');
fs.mkdirSync(path.join(dir, 'standalone'), { recursive: true });
fs.writeFileSync(path.join(dir, 'standalone', 'formativ-8.1.4.3.html'), html);
console.log('standalone/formativ-8.1.4.3.html готов');
