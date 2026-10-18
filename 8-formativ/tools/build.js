#!/usr/bin/env node
/* Собирает 7 офлайн-файлов standalone/formativ-*.html: общий движок (engine/) + тема (topics/<id>/topic.js, theory.html)
 * + Python-интерпретатор Skulpt (MIT, engine/vendor/LICENSE). Запуск: python3 tools/build-theory.py && node tools/build.js
 * Необязательно: node tools/build.js <config.js> <папка> — собрать с другими настройками (классы, ссылка на скрипт). */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const inline = (js) => '<script>\n' + js.replace(/<\/script/gi, '<\\/script') + '\n</script>';
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const config = process.argv[2] ? fs.readFileSync(process.argv[2], 'utf8') : read('engine/config.js');
const outDir = process.argv[3] || path.join(root, 'standalone');
const topics = fs.readdirSync(path.join(root, 'topics')).sort();
fs.mkdirSync(outDir, { recursive: true });
for (const id of topics) {
  const src = read(`topics/${id}/topic.js`), ctx = { window: {} };
  vm.runInNewContext(src, ctx);
  const t = ctx.window.TOPIC;
  const scripts = [
    inline(config),
    inline('/* Skulpt — Python in the browser. Copyright (c) 2009-2016 Scott Graham and contributors. MIT License. */\n' + read('engine/vendor/skulpt.min.js')),
    inline(read('engine/vendor/skulpt-stdlib.js')),
    inline(src), inline(read('engine/common.js')), inline(read('engine/app.js')),
  ].join('\n');
  let page = read('engine/index.html')
    .replace('{{TITLE}}', () => esc(t.title.kz + ' / ' + t.title.ru))
    .replace(/\{\{H1_KZ\}\}/g, () => esc(t.title.kz)).replace(/\{\{H1_RU\}\}/g, () => esc(t.title.ru))
    .replace(/\{\{GOAL_KZ\}\}/g, () => esc(t.goal.kz)).replace(/\{\{GOAL_RU\}\}/g, () => esc(t.goal.ru))
    .replace(/<!--THEORY-->[\s\S]*?<!--\/THEORY-->/, () => '<!--THEORY-->\n' + read(`topics/${id}/theory.html`) + '<!--/THEORY-->')
    .replace('<link rel="stylesheet" href="style.css">', () => '<style>\n' + read('engine/style.css') + '</style>')
    .replace(/  <script src="config\.js"><\/script>[\s\S]*<script src="app\.js"><\/script>/, () => scripts)
    .replace('</body>', () => '<script type="text/plain" id="gs-src">\n' + read('engine/server/Code.gs').replace(/<\/script/gi, '<\\/script') + '\n</script>\n</body>');
  if (/<script src=|<link rel="stylesheet"|\{\{(TITLE|H1_|GOAL_)/.test(page)) throw new Error(id + ': остались внешние файлы или метки');
  fs.writeFileSync(path.join(outDir, t.file), page);
  console.log(path.relative(process.cwd(), path.join(outDir, t.file)), Math.round(page.length / 1024) + ' КБ');
}
