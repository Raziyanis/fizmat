/**
 * Собирает вариант «один файл»: code.gs + student.html + teacher.html
 * + списки классов из classes.csv → all-in-one.gs
 *
 * Запуск:  node build-single.js
 *
 * Списки учеников в репозиторий не попадают: classes.csv и all-in-one.gs
 * перечислены в .gitignore. Если classes.csv нет, файл всё равно соберётся,
 * просто без списков — их тогда заполняют вручную на листе «Классы».
 */
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const read = (name) => fs.readFileSync(path.join(DIR, name), 'utf8');

/** HTML кладём в шаблонную строку, поэтому экранируем только то, что ей мешает. */
function asTemplate(html, label) {
  const bad = [];
  if (html.indexOf('`') > -1) bad.push('обратная кавычка `');
  if (html.indexOf('${') > -1) bad.push('подстановка ${');
  if (html.indexOf('\\') > -1) bad.push('обратный слэш \\');
  if (bad.length) {
    console.error(`! ${label}: внутри встретилось ${bad.join(', ')} — экранирую`);
  }
  return html
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');
}

function roster() {
  const file = path.join(DIR, 'classes.csv');
  if (!fs.existsSync(file)) {
    console.log('classes.csv не найден — собираю без списков классов');
    return null;
  }
  const lines = read('classes.csv').replace(/^﻿/, '').trim().split(/\r?\n/).slice(1);
  const rows = lines
    .map((line) => line.split(',').map((x) => x.trim()))
    .filter((parts) => parts.length >= 2 && parts[0] && parts[1]);

  const esc = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const out = [];
  let current = null;
  for (const [klass, name] of rows) {
    if (klass !== current) {
      if (current !== null) out.push('');
      out.push('    // ' + klass);
      current = klass;
    }
    out.push(`    ['${esc(klass)}', '${esc(name)}'],`);
  }
  console.log('учеников в списках:', rows.length);
  return { body: out.join('\n').replace(/,$/, ''), count: rows.length };
}

const code = read('code.gs');

/* версии в коде и в страницах должны совпадать, иначе страница будет
   ругаться на свежий же Код.gs */
{
  const v = (code.match(/var APP_VERSION = '([^']+)'/) || [])[1];
  for (const f of ['student.html', 'teacher.html']) {
    const pv = (read(f).match(/var PAGE_VERSION = '([^']+)'/) || [])[1];
    if (v !== pv) {
      console.error(`! ${f}: PAGE_VERSION «${pv}» не совпадает с APP_VERSION «${v}»`);
      process.exit(1);
    }
  }
  console.log('версия:', v);
}
const student = read('student.html');
const teacher = read('teacher.html');
const list = roster();

const head = `/**
 * Повторение: методы списка (Python) — ВСЁ В ОДНОМ ФАЙЛЕ.
 *
 * Отдельные HTML-файлы создавать не нужно: обе страницы вшиты сюда.
 *
 * Установка:
 *   1. script.google.com → Новый проект.
 *   2. Вставить сюда это целиком (заменив то, что было), Cmd+S.
 *   3. Выбрать функцию setup → Выполнить → разрешить доступ.
 *      Google спросит разрешение дважды: на таблицы и на отправку почты.
 *   4. Начать развертывание → Новое развертывание → Веб-приложение:
 *      запуск от имени «Я», доступ «Все, у кого есть аккаунт Google».
 *   5. Ссылка на /exec — для учеников.
 *      Та же ссылка с ?page=teacher — ваша. Пароль не нужен:
 *      страница открывается только из вашего аккаунта.
 *
 * Этот файл собран автоматически из code.gs, student.html и teacher.html.
 * Правьте их, а файл пересоберите: node build-single.js
 */

`;

const pages = `
/* ------------------------------------------------------------------ */
/* Страницы, вшитые в скрипт                                           */
/* ------------------------------------------------------------------ */

var EMBEDDED_PAGES = {
  student: \`${asTemplate(student, 'student.html')}\`,

  teacher: \`${asTemplate(teacher, 'teacher.html')}\`
};
`;

const classes = list ? `
/* ------------------------------------------------------------------ */
/* Списки классов                                                      */
/* ------------------------------------------------------------------ */

/**
 * Заполняет лист «Классы». Вызывается из setup(), запускать отдельно не нужно.
 * Повторный запуск ничего не дублирует, вручную добавленных не удаляет.
 */
function importClasses() {
  var DATA = [
${list.body}
  ];

  var sheet = sheet_(SHEET_CLASSES);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Класс', 'Фамилия и имя']);
    sheet.setFrozenRows(1);
  }

  var existing = {};
  var last = sheet.getLastRow();
  if (last >= 2) {
    var values = sheet.getRange(2, 1, last - 1, 2).getValues();
    for (var i = 0; i < values.length; i++) {
      existing[key_(values[i][0], values[i][1])] = true;
    }
  }

  var add = [];
  for (var j = 0; j < DATA.length; j++) {
    if (!existing[key_(DATA[j][0], DATA[j][1])]) add.push(DATA[j]);
  }
  if (add.length) {
    sheet.getRange(sheet.getLastRow() + 1, 1, add.length, 2).setValues(add);
  }
  Logger.log('Списки классов: добавлено ' + add.length +
             ', уже было ' + (DATA.length - add.length) + '.');
}
` : '';

const out = head + code + pages + classes;
fs.writeFileSync(path.join(DIR, 'all-in-one.gs'), out);
console.log('all-in-one.gs собран:', Math.round(out.length / 1024) + ' КБ,',
            out.split('\n').length, 'строк');

/* Второй вариант: три файла в проекте. Тот же код плюс списки классов,
   но без вшитых страниц — страницы лежат отдельными HTML-файлами. */
const headThree = `/**
 * Повторение: методы списка (Python) — файл «Код.gs».
 *
 * Этот вариант рассчитан на ТРИ файла в проекте:
 *   Код.gs        — этот файл
 *   student.html  — страница ученика  (+ → HTML, имя ровно student)
 *   teacher.html  — страница учителя  (+ → HTML, имя ровно teacher)
 *
 * Установка:
 *   1. Вставить этот файл в Код.gs, Cmd+S.
 *   2. Создать два HTML-файла и вставить в них student.html и teacher.html.
 *   3. Функция setup → Выполнить → разрешить доступ (Google спросит дважды).
 *   4. Начать развертывание → Новое развертывание → Веб-приложение:
 *      запуск от имени «Я», доступ «Все, у кого есть аккаунт Google».
 *
 * Ссылка /exec — ученикам, та же ссылка с ?page=teacher — ваша.
 *
 * Собран автоматически из code.gs и classes.csv: node build-single.js
 */

`;
const three = headThree + code + classes;
fs.writeFileSync(path.join(DIR, 'code-with-classes.gs'), three);
console.log('code-with-classes.gs собран:', Math.round(three.length / 1024) + ' КБ,',
            three.split('\n').length, 'строк');
