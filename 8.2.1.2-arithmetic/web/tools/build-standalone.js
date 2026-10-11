#!/usr/bin/env node
/* Бір файл жинайды: standalone/qosu-azaytu-8.2.1.2.html (интернет пен сервер керек емес).
 * Іске қосу: node tools/build-standalone.js */
'use strict';
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(dir, f), 'utf8');
const inline = (js) => '<script>\n' + js.replace(/<\/script/gi, '<\\/script') + '\n</script>';
let page = read('index.html')
  .replace('<link rel="stylesheet" href="style.css">', () => '<style>\n' + read('style.css') + '</style>')
  .replace('<script src="config.js"></script>', () => inline(read('config.js')))
  .replace(/  <script src="content\.js"><\/script>\s*<script src="app\.js"><\/script>/, () => [read('content.js'), read('app.js')].map(inline).join('\n'));
// Мұғалімге арналған Apps Script мәтіні — сол файлдың ішінде (бір файл)
page = page.replace('</body>', () => '<script type="text/plain" id="gs-src">\n' + read('server/Code.gs').replace(/<\/script/gi, '<\\/script') + '\n</script>\n</body>');
if (/<script src=|<link rel="stylesheet"/.test(page)) throw new Error('сыртқы файлдар қалды');
fs.mkdirSync(path.join(dir, 'standalone'), { recursive: true });
fs.writeFileSync(path.join(dir, 'standalone', 'qosu-azaytu-8.2.1.2.html'), page);
console.log('standalone/qosu-azaytu-8.2.1.2.html', Math.round(page.length / 1024) + ' КБ');
