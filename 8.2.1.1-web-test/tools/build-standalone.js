#!/usr/bin/env node
/**
 * Собирает один автономный HTML-файл без сервера: standalone/proverochnaya-8.2.1.1.html
 * Вариант выбирается случайно на каждом устройстве (варианты у разных учеников могут совпасть).
 * Запуск: node tools/build-standalone.js   (из папки 8.2.1.1-web-test)
 */
'use strict';
const fs = require('fs');
const path = require('path');

const TEACHER_PIN = '1234'; // PIN для кнопки «Начать заново» на итоговом экране — замените на свой

const dir = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(dir, f), 'utf8');
let html = read('index.html');

const settings = '/* Настройки автономной версии. PIN можно поменять здесь (в Блокноте). */\n' +
  'window.STANDALONE = true;\nwindow.TEACHER_PIN = ' + JSON.stringify(TEACHER_PIN) + ';\n';
const scripts = [settings, read('variants.js'), read('common.js'), read('app.js')]
  .map((s) => '<script>\n' + s.replace(/<\/script/gi, '<\\/script') + '\n</script>').join('\n');

html = html
  .replace('<link rel="stylesheet" href="style.css">', '<style>\n' + read('style.css') + '</style>')
  .replace(/  <script src="config\.js"><\/script>[\s\S]*<script src="app\.js"><\/script>/, () => scripts);
if (/src="|href="/.test(html)) throw new Error('остались внешние файлы');

fs.mkdirSync(path.join(dir, 'standalone'), { recursive: true });
fs.writeFileSync(path.join(dir, 'standalone', 'proverochnaya-8.2.1.1.html'), html);
console.log('standalone/proverochnaya-8.2.1.1.html готов');
