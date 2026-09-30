#!/usr/bin/env node
/* Бір файлға жинайды (интернетсіз, серверсіз): standalone/python-kod-formativ-kz.html және -ru.html.
 * Python интерпретаторы — Skulpt (MIT лицензиясы, vendor/LICENSE), файлдың ішіне кірістірілген.
 * Іске қосу: node tools/build-standalone.js */
'use strict';
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(dir, f), 'utf8');
const inline = (js) => '<script>\n' + js.replace(/<\/script/gi, '<\\/script') + '\n</script>';
fs.mkdirSync(path.join(dir, 'standalone'), { recursive: true });
for (const lang of ['kz', 'ru']) {
  const scripts = [
    inline('window.LANG = "' + lang + '";\n' + read('config.js')),
    inline('/* Skulpt — Python in the browser. Copyright (c) 2009-2016 Scott Graham and contributors. MIT License. */\n' + read('vendor/skulpt.min.js')),
    inline(read('vendor/skulpt-stdlib.js')),
    inline(read('tasks.js')),
    inline(read('app.js')),
  ].join('\n');
  let html = read('index.html')
    .replace('<html lang="kk">', lang === 'ru' ? '<html lang="ru">' : '<html lang="kk">')
    .replace('<link rel="stylesheet" href="style.css">', () => '<style>\n' + read('style.css') + '</style>')
    .replace(/  <script src="config\.js"><\/script>[\s\S]*<script src="app\.js"><\/script>/, () => scripts);
  if (/<script src=|<link rel="stylesheet"/.test(html)) throw new Error('сыртқы файлдар қалды');
  const out = path.join(dir, 'standalone', 'python-kod-formativ-' + lang + '.html');
  fs.writeFileSync(out, html);
  console.log(path.relative(dir, out), Math.round(html.length / 1024) + ' КБ');
}
