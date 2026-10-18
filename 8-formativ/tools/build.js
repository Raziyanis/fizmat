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
const ALL_FILE = 'formativ-8-synyp.html';   // все темы в одном файле
fs.mkdirSync(outDir, { recursive: true });
const all = [];
for (const id of topics) {
  const src = read(`topics/${id}/topic.js`), ctx = { window: {} };
  vm.runInNewContext(src, ctx);
  const t = ctx.window.TOPIC;
  all.push({ id, src, t, theory: read(`topics/${id}/theory.html`) });
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

// ---------- Один общий файл: сначала выбор темы, затем класс и фамилия ----------
{
  const shell = (s) => s.replace(/<\/script/gi, '<\\/script');
  const chooser = '    <section id="s-topics" hidden>\n' +
    '      <h1><span class="lang-kz">Информатика, 8-сынып — формативтік жұмыстар</span><span class="lang-ru">Информатика, 8 класс — формативные работы</span></h1>\n' +
    '      <p class="topic"><span class="lang-kz">Мұғалім айтқан тақырыпты таңдаңыз. Содан кейін сыныбыңызды және аты-жөніңізді таңдайсыз.</span><span class="lang-ru">Выберите тему, которую назвал учитель. Затем выберете класс и фамилию.</span></p>\n' +
    '      <div class="topic-list">\n' +
    all.map((x, i) => `        <button type="button" class="topic-btn" data-topic="${x.id}"><span class="tn">${i + 1}</span><span class="tt"><span class="lang-kz">${esc(x.t.title.kz)}</span><span class="lang-ru">${esc(x.t.title.ru)}</span><small class="lang-kz">${esc(x.t.goal.kz)}</small><small class="lang-ru">${esc(x.t.goal.ru)}</small></span></button>\n`).join('') +
    '      </div>\n    </section>\n';
  const templates = all.map((x) => `<template id="th-${x.id}">\n${x.theory}</template>`).join('\n');
  const boot = `(function () {
  // Тақырыпты таңдау: адрестегі #id; бастаған (аяқталмаған) жұмыс болса — сол тақырып ашылады
  var T = window.TOPICS, ids = Object.keys(T), id = decodeURIComponent(location.hash.slice(1)), i, s;
  for (i = 0; i < ids.length; i++) { try { s = JSON.parse(localStorage.getItem('ff-' + ids[i] + '-state')); if (s && s.status) { id = ids[i]; break; } } catch (e) {} }
  if (!T[id]) { window.CHOOSE_TOPIC = true; id = ids[0]; }
  var t = window.TOPIC = T[id]; t.file = ${JSON.stringify(ALL_FILE)};
  var th = document.getElementById('th-' + id); document.getElementById('theory').appendChild(th.content.cloneNode(true));
  var put = { h1kz: t.title.kz, h1ru: t.title.ru, goalkz: t.goal.kz, goalru: t.goal.ru };
  Array.prototype.forEach.call(document.querySelectorAll('[data-t]'), function (e) { e.textContent = put[e.getAttribute('data-t')]; });
  function go(h) { try { history.replaceState(null, '', location.pathname + location.search + (h ? '#' + h : '')); } catch (e) { location.hash = h; } location.reload(); }
  Array.prototype.forEach.call(document.querySelectorAll('.topic-btn'), function (b) { b.addEventListener('click', function () { go(b.getAttribute('data-topic')); }); });
  document.getElementById('b-topics').addEventListener('click', function () { go(''); });
})();`;
  const scripts = [
    inline(config),
    inline('/* Skulpt — Python in the browser. Copyright (c) 2009-2016 Scott Graham and contributors. MIT License. */\n' + read('engine/vendor/skulpt.min.js')),
    inline(read('engine/vendor/skulpt-stdlib.js')),
    inline('window.TOPICS = {};\n' + all.map((x) => x.src + `\nwindow.TOPICS[${JSON.stringify(x.id)}] = window.TOPIC;`).join('\n') + '\nwindow.TOPIC = null;'),
    inline(boot), inline(read('engine/common.js')), inline(read('engine/app.js')),
  ].join('\n');
  let page = read('engine/index.html')
    .replace('{{TITLE}}', 'Информатика, 8-сынып — формативтік жұмыстар / формативные работы')
    .replace(/\{\{H1_KZ\}\}/g, '<i data-t="h1kz"></i>').replace(/\{\{H1_RU\}\}/g, '<i data-t="h1ru"></i>')
    .replace(/\{\{GOAL_KZ\}\}/g, '<i data-t="goalkz"></i>').replace(/\{\{GOAL_RU\}\}/g, '<i data-t="goalru"></i>')
    .replace(/<!--THEORY-->[\s\S]*?<!--\/THEORY-->/, '')
    .replace('    <section id="s-gate" hidden>\n', () => chooser + '    <section id="s-gate" hidden>\n      <p class="back-topics"><button id="b-topics" class="link" type="button">← <span class="lang-kz">Басқа тақырыпты таңдау</span><span class="lang-ru">Выбрать другую тему</span></button></p>\n')
    .replace('<link rel="stylesheet" href="style.css">', () => '<style>\n' + read('engine/style.css') + '</style>')
    .replace(/  <script src="config\.js"><\/script>[\s\S]*<script src="app\.js"><\/script>/, () => templates + '\n' + scripts)
    .replace('</body>', () => '<script type="text/plain" id="gs-src">\n' + shell(read('engine/server/Code.gs')) + '\n</script>\n</body>');
  if (/<script src=|<link rel="stylesheet"|\{\{(TITLE|H1_|GOAL_)|id="s-topics"[\s\S]*id="s-topics"/.test(page) || !page.includes('id="b-topics"')) throw new Error('общий файл: ошибка сборки');
  fs.writeFileSync(path.join(outDir, ALL_FILE), page);
  console.log(path.relative(process.cwd(), path.join(outDir, ALL_FILE)), Math.round(page.length / 1024) + ' КБ — все темы');
}
