/**
 * Повторение: методы списка (Python).
 *
 * Страница ученика: задания выдаются по одному. Ответил — сразу видит
 * зелёный или красный и пояснение, после этого открывается следующее.
 * Страница учителя: разбор по каждому заданию (кто ответил верно, кто нет
 * и что именно выбрал) и возможность спросить ученика прямо с экрана;
 * ученик видит вопрос у себя и отвечает.
 *
 * Листы Google Таблицы:
 *   «Классы»      — Класс | Фамилия и имя
 *   «Ответы»      — журнал: по строке на каждое отвеченное задание
 *   «Результаты»  — сводка: по строке на каждую завершённую попытку
 *   «Диалог»      — переписка учителя и ученика по заданиям
 *
 * Перед раздачей ссылки один раз выполните setup().
 */

var SHEET_CLASSES = 'Классы';
var SHEET_ANSWERS = 'Ответы';
var SHEET_RESULTS = 'Результаты';
var SHEET_DIALOG = 'Диалог';
var SHEET_NOTIFY = 'Уведомления';

/** Сколько попыток подряд разрешено одному ученику. */
var MAX_ATTEMPTS = 3;
/** Через сколько минут счётчик попыток обнуляется. */
var COOLDOWN_MINUTES = 20;

/** Через сколько минут молчания считаем, что ученик бросил тест. */
var ABANDON_MINUTES = 15;
/** Как часто проверять. Допустимые значения: 1, 5, 10, 15, 30. */
var CHECK_EVERY_MINUTES = 5;
var SPREADSHEET_TITLE = 'Методы списка — повторение';

var PROP_SPREADSHEET = 'SPREADSHEET_ID';
var PROP_TEACHER = 'TEACHER_EMAIL';

var AUTHOR_TEACHER = 'Учитель';
var AUTHOR_STUDENT = 'Ученик';

/**
 * Банк заданий. correct — индекс правильного варианта в options.
 */
var QUESTIONS = [
  {
    id: 'q01', topic: 'pop',
    code: 'a = [1, 2, 3]\nx = a.pop(0)\nprint(x, a)',
    text: 'Что выведет программа?',
    options: ['1 [1, 2, 3]', '3 [1, 2]', '1 [2, 3]', 'Ошибка'],
    correct: 2,
    note: 'pop(i) удаляет элемент по индексу и возвращает его. Без аргумента pop() удаляет последний элемент.'
  },
  {
    id: 'q02', topic: 'remove',
    code: 'a = [1, 2, 2, 3]\na.remove(2)\nprint(a)',
    text: 'Что выведет программа?',
    options: ['[1, 3]', '[1, 2, 3]', '[1, 2, 2, 3]', 'Ошибка'],
    correct: 1,
    note: 'remove(x) удаляет только первое вхождение значения, а не все сразу.'
  },
  {
    id: 'q03', topic: 'insert',
    code: 'a = [1, 2, 3]\na.insert(1, 9)\nprint(a)',
    text: 'Что выведет программа?',
    options: ['[9, 1, 2, 3]', '[1, 2, 9, 3]', '[1, 9, 3]', '[1, 9, 2, 3]'],
    correct: 3,
    note: 'insert(i, x) вставляет x так, что он становится элементом с индексом i, остальные сдвигаются вправо.'
  },
  {
    id: 'q04', topic: 'count',
    code: 'a = [5, 7, 5, 5]\nprint(a.count(5))',
    text: 'Что выведет программа?',
    options: ['3', '2', '1', '0'],
    correct: 0,
    note: 'count(x) возвращает число вхождений значения. Если значения нет, вернётся 0, ошибки не будет.'
  },
  {
    id: 'q05', topic: 'index',
    code: "a = ['x', 'y', 'z']\nprint(a.index('z'))",
    text: 'Что выведет программа?',
    options: ['3', 'z', '2', 'Ошибка'],
    correct: 2,
    note: 'index(x) возвращает индекс первого вхождения. Индексы начинаются с нуля, поэтому у третьего элемента индекс 2.'
  },
  {
    id: 'q06', topic: 'append',
    code: 'a = [1, 2]\na.append([3, 4])\nprint(len(a))',
    text: 'Что выведет программа?',
    options: ['4', '3', '2', 'Ошибка'],
    correct: 1,
    note: 'append добавляет аргумент как один элемент. Список [3, 4] стал третьим элементом: [1, 2, [3, 4]].'
  },
  {
    id: 'q07', topic: 'extend',
    code: 'a = [1, 2]\na.extend([3, 4])\nprint(len(a))',
    text: 'Что выведет программа?',
    options: ['3', '2', '4', 'Ошибка'],
    correct: 2,
    note: 'extend добавляет элементы по одному: получится [1, 2, 3, 4]. В этом и разница с append.'
  },
  {
    id: 'q08', topic: 'присваивание',
    code: 'a = [1, 2, 3]\nb = a\nb.append(4)\nprint(a)',
    text: 'Что выведет программа?',
    options: ['[1, 2, 3]', '[4]', 'Ошибка', '[1, 2, 3, 4]'],
    correct: 3,
    note: 'b = a не создаёт новый список: оба имени ссылаются на один и тот же объект, поэтому изменение видно через a.'
  },
  {
    id: 'q09', topic: 'copy',
    code: 'a = [1, 2, 3]\nb = a.copy()\nb.append(4)\nprint(a, b)',
    text: 'Что выведет программа?',
    options: ['[1, 2, 3, 4] [1, 2, 3, 4]', '[1, 2, 3] [1, 2, 3, 4]', '[1, 2, 3] [1, 2, 3]', 'Ошибка'],
    correct: 1,
    note: 'copy() создаёт независимую копию списка, поэтому a не меняется. Сравните с предыдущим заданием.'
  },
  {
    id: 'q10', topic: 'sort',
    code: 'a = [3, 1, 2]\nprint(a.sort())',
    text: 'Что выведет программа?',
    options: ['[1, 2, 3]', '[3, 1, 2]', 'None', 'Ошибка'],
    correct: 2,
    note: 'sort() сортирует список на месте и ничего не возвращает. Новый отсортированный список даёт функция sorted(a).'
  },
  {
    id: 'q11', topic: 'reverse',
    code: 'a = [1, 2, 3]\nr = a.reverse()\nprint(a, r)',
    text: 'Что выведет программа?',
    options: ['[3, 2, 1] [3, 2, 1]', '[1, 2, 3] [3, 2, 1]', 'Ошибка', '[3, 2, 1] None'],
    correct: 3,
    note: 'reverse() тоже меняет список на месте и возвращает None — как sort().'
  },
  {
    id: 'q12', topic: 'clear',
    code: 'a = [1, 2, 3]\na.clear()\nprint(a)',
    text: 'Что выведет программа?',
    options: ['[]', 'None', '[1, 2, 3]', 'Переменная a удалится, будет ошибка'],
    correct: 0,
    note: 'clear() удаляет все элементы, но сам список остаётся — он становится пустым.'
  },
  {
    id: 'q13', topic: 'ошибки',
    code: 'a = [1, 2]',
    text: 'Какой вызов приведёт к ошибке?',
    options: ['a.append(5)', 'a.insert(10, 5)', 'a.remove(5)', 'a.count(5)'],
    correct: 2,
    note: 'remove требует, чтобы значение было в списке. insert с индексом за границей просто добавит в конец, count вернёт 0.'
  },
  {
    id: 'q14', topic: 'pop без аргумента',
    code: 'a = [1, 2, 3]\nprint(a.pop(), a)',
    text: 'Что выведет программа?',
    options: ['1 [2, 3]', '3 [1, 2]', '3 [1, 2, 3]', 'Ошибка: нужен индекс'],
    correct: 1,
    note: 'Без аргумента pop() удаляет и возвращает последний элемент. Индекс указывать не обязательно.'
  },
  {
    id: 'q15', topic: 'sorted',
    code: 'a = [3, 1, 2]\nb = sorted(a)\nprint(a, b)',
    text: 'Что выведет программа?',
    options: ['[1, 2, 3] [1, 2, 3]', '[3, 1, 2] [1, 2, 3]', '[1, 2, 3] None', '[3, 1, 2] None'],
    correct: 1,
    note: 'sorted(a) — функция: не трогает исходный список, а возвращает новый отсортированный. Метод a.sort() наоборот: меняет a и возвращает None.'
  }
];

function questionById_(id) {
  for (var i = 0; i < QUESTIONS.length; i++) {
    if (QUESTIONS[i].id === id) return QUESTIONS[i];
  }
  return null;
}

function questionNumber_(id) {
  for (var i = 0; i < QUESTIONS.length; i++) {
    if (QUESTIONS[i].id === id) return i + 1;
  }
  return 0;
}

/* ------------------------------------------------------------------ */
/* Настройка                                                           */
/* ------------------------------------------------------------------ */

function setup() {
  var props = PropertiesService.getScriptProperties();
  var ss = openSpreadsheet_();
  if (!ss) {
    ss = SpreadsheetApp.create(SPREADSHEET_TITLE);
    props.setProperty(PROP_SPREADSHEET, ss.getId());
  }

  ensureSheet_(ss, SHEET_CLASSES, ['Класс', 'Фамилия и имя']);
  ensureSheet_(ss, SHEET_ANSWERS,
    ['Время', 'Класс', 'Ученик', 'Попытка', 'Задание', 'Тема', 'Выбранный ответ', 'Верно', 'ID отправки']);
  ensureSheet_(ss, SHEET_DIALOG,
    ['Время', 'Класс', 'Ученик', 'Задание', 'Автор', 'Текст', 'ID отправки']);
  ensureSheet_(ss, SHEET_NOTIFY,
    ['Время письма', 'Класс', 'Ученик', 'Попытка', 'Отвечено', 'Последний ответ']);

  var resultsHeader = ['Время', 'Класс', 'Ученик', 'Email', 'Попытка', 'Балл', 'Максимум'];
  for (var i = 0; i < QUESTIONS.length; i++) {
    resultsHeader.push(QUESTIONS[i].id + ' (' + QUESTIONS[i].topic + ')');
  }
  resultsHeader.push('ID отправки');
  ensureSheet_(ss, SHEET_RESULTS, resultsHeader);

  var keep = [SHEET_CLASSES, SHEET_ANSWERS, SHEET_RESULTS, SHEET_DIALOG, SHEET_NOTIFY];
  var sheets = ss.getSheets();
  for (var j = 0; j < sheets.length; j++) {
    if (keep.indexOf(sheets[j].getName()) === -1 && sheets[j].getLastRow() === 0) {
      ss.deleteSheet(sheets[j]);
    }
  }

  props.setProperty(PROP_TEACHER, Session.getEffectiveUser().getEmail() || '');
  // списки классов, если они зашиты в этот же файл
  if (typeof importClasses === 'function') {
    try {
      importClasses();
    } catch (err) {
      Logger.log('Списки классов загрузить не удалось: ' + err.message);
    }
  }

  installAbandonCheck_();

  Logger.log('Таблица: ' + ss.getUrl());
  Logger.log('Заданий: ' + QUESTIONS.length + ', учеников в списках: ' + countStudents_());
  Logger.log('Страница учителя: <ссылка веб-приложения>?page=teacher');
  Logger.log('Открывать её можно только из аккаунта ' + props.getProperty(PROP_TEACHER) + '.');
}

function ensureSheet_(ss, name, header) {
  var sheet = ss.getSheetByName(name) || ss.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(header);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function openSpreadsheet_() {
  var id = PropertiesService.getScriptProperties().getProperty(PROP_SPREADSHEET);
  if (!id) return null;
  try {
    return SpreadsheetApp.openById(id);
  } catch (err) {
    return null;
  }
}

function sheet_(name) {
  var ss = openSpreadsheet_();
  if (!ss) throw new Error('Таблица не создана: выполните функцию setup() в редакторе скрипта.');
  var sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error('Лист «' + name + '» не найден: выполните setup().');
  return sheet;
}

function rows_(name, width) {
  var sheet = sheet_(name);
  var last = sheet.getLastRow();
  if (last < 2) return [];
  return sheet.getRange(2, 1, last - 1, width).getValues();
}

function countStudents_() {
  try {
    return readClasses_().reduce(function (n, c) { return n + c.students.length; }, 0);
  } catch (err) {
    return 0;
  }
}

/* ------------------------------------------------------------------ */
/* Списки классов                                                      */
/* ------------------------------------------------------------------ */

function readClasses_() {
  var values = rows_(SHEET_CLASSES, 2);
  var order = [], map = {}, seen = {};
  for (var i = 0; i < values.length; i++) {
    var klass = String(values[i][0] || '').trim();
    var name = clean_(values[i][1]);
    if (!klass || !name) continue;
    if (!map[klass]) { map[klass] = []; order.push(klass); }
    // сравниваем без учёта регистра и лишних пробелов: одна и та же фамилия,
    // записанная на листе по-разному, не должна показаться ученику дважды
    var k = key_(klass, name);
    if (!seen[k]) { seen[k] = true; map[klass].push(name); }
  }
  order.sort(function (a, b) { return a.localeCompare(b, 'ru'); });
  return order.map(function (klass) {
    map[klass].sort(function (a, b) { return a.localeCompare(b, 'ru'); });
    return { klass: klass, students: map[klass] };
  });
}

function clean_(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

function key_(klass, name) {
  return (clean_(klass) + '|' + clean_(name)).toLowerCase();
}

/* ------------------------------------------------------------------ */
/* Страницы                                                            */
/* ------------------------------------------------------------------ */

function doGet(e) {
  var page = (e && e.parameter && e.parameter.page) || 'student';
  var file = page === 'teacher' ? 'teacher' : 'student';
  return openPage_(file)
    .setTitle(file === 'teacher' ? 'Методы списка — экран учителя' : 'Методы списка — повторение')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Находит HTML-файл страницы. При создании файла легко ошибиться в имени
 * («student.html» превращается в «student.html.html»), поэтому пробуем
 * оба написания, а если файла нет совсем — объясняем, что делать.
 */
function openPage_(name) {
  // в варианте «один файл» страницы вшиты прямо в скрипт
  if (typeof EMBEDDED_PAGES !== 'undefined' && EMBEDDED_PAGES[name]) {
    return HtmlService.createHtmlOutput(EMBEDDED_PAGES[name]);
  }
  var tries = [name, name + '.html'];
  for (var i = 0; i < tries.length; i++) {
    try {
      return HtmlService.createHtmlOutputFromFile(tries[i]);
    } catch (err) {
      // пробуем следующее написание
    }
  }
  return HtmlService.createHtmlOutput(
    '<div style="max-width:620px;margin:40px auto;padding:24px;border:2px solid #b3261e;' +
    'border-radius:12px;font:16px/1.6 -apple-system,BlinkMacSystemFont,sans-serif">' +
    '<h2 style="margin:0 0 12px;color:#b3261e">В проекте нет файла «' + name + '»</h2>' +
    '<p>В редакторе Apps Script слева в панели «Файлы» должен быть HTML-файл, ' +
    'который в списке выглядит как <code>' + name + '.html</code>.</p>' +
    '<p>Если там <code>' + name + '.html.html</code> — наведите на него, нажмите три точки → ' +
    '<b>Переименовать</b> и впишите ровно <code>' + name + '</code>.</p>' +
    '<p>Если файла нет — <b>+ → HTML</b>, имя <code>' + name + '</code>, ' +
    'и вставьте в него содержимое <code>' + name + '.html</code>.</p>' +
    '<p style="color:#5b6471">Потом: Cmd+S, затем <b>Начать развертывание → ' +
    'Управление развертываниями</b> → версия <b>«Новая версия»</b> → Развернуть.</p></div>');
}

function safeEmail_() {
  try {
    return Session.getActiveUser().getEmail() || '';
  } catch (err) {
    return '';
  }
}

/* ------------------------------------------------------------------ */
/* Данные для ученика                                                  */
/* ------------------------------------------------------------------ */

/** Задания без правильных ответов, в случайном порядке, плюс списки классов. */
function getStudentData() {
  var order = QUESTIONS.slice();
  for (var i = order.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = order[i]; order[i] = order[j]; order[j] = tmp;
  }
  return {
    email: safeEmail_(),
    total: QUESTIONS.length,
    classes: readClasses_(),
    questions: order.map(function (q) {
      return { id: q.id, topic: q.topic, code: q.code, text: q.text, options: q.options };
    })
  };
}

/**
 * Проверяет один ответ и записывает его в журнал.
 * p = { uid, attempt, klass, name, qid, given }
 */
function answerQuestion(p) {
  var q = questionById_(p && p.qid);
  if (!q) throw new Error('Задание не найдено.');

  var klass = clean_(p.klass).substring(0, 20);
  var name = clean_(p.name).substring(0, 80);
  if (!name) throw new Error('Не выбрана фамилия.');

  var given = (typeof p.given === 'number') ? p.given : -1;
  var ok = given === q.correct;
  var uid = String(p.uid || '').trim().substring(0, 50);

  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var sheet = sheet_(SHEET_ANSWERS);
    if (!uid || !hasUid_(sheet, 9, uid)) {
      sheet.appendRow([new Date(), klass, name, String(p.attempt || ''), q.id, q.topic,
                       (given >= 0 ? q.options[given] : '—'), ok ? 1 : 0, uid]);
    }
  } finally {
    lock.releaseLock();
  }

  return {
    ok: ok,
    correct: q.correct,
    correctText: q.options[q.correct],
    note: q.note,
    number: questionNumber_(q.id)
  };
}

/**
 * Сколько завершённых попыток у ученика за последние COOLDOWN_MINUTES минут
 * и когда самая ранняя из них.
 */
function attemptsInWindow_(klass, name) {
  var since = new Date().getTime() - COOLDOWN_MINUTES * 60 * 1000;
  var k = key_(klass, name);
  var times = [];
  rows_(SHEET_RESULTS, 7 + QUESTIONS.length + 1).forEach(function (row) {
    if (key_(row[1], row[2]) !== k) return;
    var t = dateOf_(row[0]);
    if (t && t.getTime() >= since) times.push(t.getTime());
  });
  times.sort(function (a, b) { return a - b; });
  return { count: times.length, oldest: times.length ? times[0] : 0 };
}

/**
 * Можно ли ученику начинать работу. После MAX_ATTEMPTS попыток доступ
 * закрывается, а через COOLDOWN_MINUTES минут открывается снова.
 */
function checkAccess(klass, name) {
  if (!clean_(name)) return { allowed: false, reason: 'Не выбрана фамилия.' };

  var w = attemptsInWindow_(klass, name);
  if (w.count < MAX_ATTEMPTS) {
    return { allowed: true, used: w.count, max: MAX_ATTEMPTS };
  }

  var freeAt = w.oldest + COOLDOWN_MINUTES * 60 * 1000;
  var wait = Math.max(1, Math.ceil((freeAt - new Date().getTime()) / 60000));
  return {
    allowed: false, used: w.count, max: MAX_ATTEMPTS, wait: wait,
    reason: 'Вы уже прошли тест ' + w.count + ' раза. Следующая попытка будет доступна через ' +
            wait + ' мин.'
  };
}

/**
 * Записывает итог попытки.
 * p = { uid, attempt, klass, name, answers: {qid: index}, addToClass }
 */
function finishAttempt(p) {
  var klass = clean_(p.klass).substring(0, 20);
  var name = clean_(p.name).substring(0, 80);
  if (!name) throw new Error('Не выбрана фамилия.');

  var uid = String((p && p.uid) || '').trim().substring(0, 50);

  var access = checkAccess(klass, name);
  if (!access.allowed) throw new Error(access.reason);

  var answers = (p && p.answers) || {};
  var marks = [], feedback = [], score = 0;

  for (var i = 0; i < QUESTIONS.length; i++) {
    var q = QUESTIONS[i];
    var given = answers[q.id];
    var ok = (typeof given === 'number') && given === q.correct;
    if (ok) score++;
    marks.push(ok ? 1 : 0);
    feedback.push({
      id: q.id, topic: q.topic, code: q.code, text: q.text, options: q.options,
      given: (typeof given === 'number') ? given : -1,
      correct: q.correct, ok: ok, note: q.note
    });
  }

  var duplicate = false;
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var sheet = sheet_(SHEET_RESULTS);
    var idCol = 7 + QUESTIONS.length + 1;
    if (uid && hasUid_(sheet, idCol, uid)) {
      duplicate = true;
    } else {
      var attemptNo = countAttempts_(sheet, klass, name) + 1;
      sheet.appendRow([new Date(), klass, name, safeEmail_(), attemptNo, score, QUESTIONS.length]
        .concat(marks).concat([uid]));
      if (p && p.addToClass) addStudentIfMissing_(klass, name);
    }
  } finally {
    lock.releaseLock();
  }

  return { score: score, total: QUESTIONS.length, feedback: feedback, duplicate: duplicate };
}

function hasUid_(sheet, col, uid) {
  var last = sheet.getLastRow();
  if (last < 2) return false;
  var values = sheet.getRange(2, col, last - 1, 1).getValues();
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0] || '').trim() === uid) return true;
  }
  return false;
}

function countAttempts_(sheet, klass, name) {
  var last = sheet.getLastRow();
  if (last < 2) return 0;
  var values = sheet.getRange(2, 2, last - 1, 2).getValues();
  var k = key_(klass, name), count = 0;
  for (var i = 0; i < values.length; i++) {
    if (key_(values[i][0], values[i][1]) === k) count++;
  }
  return count;
}

function addStudentIfMissing_(klass, name) {
  if (!klass || !name) return;
  try {
    var sheet = sheet_(SHEET_CLASSES);
    var values = rows_(SHEET_CLASSES, 2);
    for (var i = 0; i < values.length; i++) {
      if (key_(values[i][0], values[i][1]) === key_(klass, name)) return;
    }
    sheet.appendRow([klass, name]);
  } catch (err) {
    // список классов не настроен — ответы ученика всё равно записаны
  }
}

/* ------------------------------------------------------------------ */
/* Переписка учителя и ученика                                         */
/* ------------------------------------------------------------------ */

function appendMessage_(klass, name, qid, author, text, uid) {
  var clipped = String(text || '').trim().substring(0, 1000);
  if (!clipped) throw new Error('Пустое сообщение.');

  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var sheet = sheet_(SHEET_DIALOG);
    if (uid && hasUid_(sheet, 7, uid)) return { duplicate: true };
    sheet.appendRow([new Date(), clean_(klass), clean_(name), String(qid || ''), author, clipped, uid || '']);
  } finally {
    lock.releaseLock();
  }
  return { duplicate: false };
}

/** Учитель спрашивает ученика по конкретному заданию. */
function askStudent(p) {
  if (!isTeacher_()) throw new Error('Писать ученикам может только учитель.');
  return appendMessage_(p.klass, p.name, p.qid, AUTHOR_TEACHER, p.text, p.uid);
}

/** Ответ ученика учителю. */
function replyToTeacher(p) {
  if (!clean_(p && p.name)) throw new Error('Не выбрана фамилия.');
  return appendMessage_(p.klass, p.name, p.qid, AUTHOR_STUDENT, p.text, p.uid);
}

/** Переписка этого ученика. Ученик видит только свою. */
function getMyMessages(klass, name) {
  if (!clean_(name)) return [];
  var k = key_(klass, name);
  var values = rows_(SHEET_DIALOG, 7);
  var out = [];
  for (var i = 0; i < values.length; i++) {
    if (key_(values[i][1], values[i][2]) !== k) continue;
    out.push({
      time: timeText_(values[i][0]),
      qid: String(values[i][3] || ''),
      number: questionNumber_(String(values[i][3] || '')),
      author: String(values[i][4] || ''),
      text: String(values[i][5] || '')
    });
  }
  return out;
}

function timeText_(value) {
  var date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return '';
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'HH:mm');
}

/* ------------------------------------------------------------------ */
/* Экран учителя                                                       */
/* ------------------------------------------------------------------ */

/**
 * Страницу учителя открывает только тот аккаунт, под которым выполнили
 * setup(). Пароля и ключа в ссылке нет: ученик, открыв адрес страницы
 * учителя, увидит отказ, потому что его аккаунт — не ваш.
 */
function isTeacher_() {
  var props = PropertiesService.getScriptProperties();
  var owner = (props.getProperty(PROP_TEACHER) || '').toLowerCase();
  var active = safeEmail_().toLowerCase();
  return !!owner && !!active && owner === active;
}

/**
 * Всё для экрана учителя: ученики, разбор по каждому заданию
 * (поимённо, кто ответил верно и кто что выбрал) и переписка.
 */
function getResults() {
  if (!isTeacher_()) {
    throw new Error('Эта страница только для учителя. Войдите в тот аккаунт Google, ' +
                    'под которым вы настраивали тест.');
  }

  var expected = [];
  try { expected = readClasses_(); } catch (err) { expected = []; }

  /* журнал ответов: оставляем последний ответ ученика на каждое задание */
  var log = rows_(SHEET_ANSWERS, 9);
  var latest = {};
  var seen = {};
  for (var i = 0; i < log.length; i++) {
    var klass = clean_(log[i][1]), name = clean_(log[i][2]), qid = String(log[i][4] || '');
    if (!name || !qid) continue;
    latest[key_(klass, name) + '|' + qid] = {
      klass: klass, name: name, chosen: String(log[i][6] || ''),
      ok: (log[i][7] === 1 || log[i][7] === '1'), time: timeText_(log[i][0])
    };
    seen[key_(klass, name)] = { klass: klass, name: name };
  }

  var perQuestion = QUESTIONS.map(function (q, idx) {
    var right = [], wrong = [];
    Object.keys(seen).forEach(function (sk) {
      var rec = latest[sk + '|' + q.id];
      if (!rec) return;
      (rec.ok ? right : wrong).push({ klass: rec.klass, name: rec.name, chosen: rec.chosen });
    });
    var byName = function (a, b) { return a.name.localeCompare(b.name, 'ru'); };
    right.sort(byName); wrong.sort(byName);
    var answered = right.length + wrong.length;

    // сколько человек выбрало каждый вариант — видно, какая ошибка самая частая
    var optionStats = q.options.map(function (text, oi) {
      var count = 0;
      Object.keys(seen).forEach(function (sk) {
        var rec = latest[sk + '|' + q.id];
        if (rec && rec.chosen === text) count++;
      });
      return { text: text, count: count, correct: oi === q.correct };
    });

    // кто до этого задания ещё не дошёл или пропустил его
    var silent = [];
    expected.forEach(function (c) {
      c.students.forEach(function (n) {
        if (!latest[key_(c.klass, n) + '|' + q.id]) {
          silent.push({ klass: c.klass, name: n });
        }
      });
    });
    silent.sort(function (a, b) {
      return a.klass.localeCompare(b.klass, 'ru') || a.name.localeCompare(b.name, 'ru');
    });

    return {
      id: q.id, number: idx + 1, topic: q.topic, text: q.text, code: q.code,
      options: optionStats, correctText: q.options[q.correct],
      right: right, wrong: wrong, silent: silent, answered: answered,
      rightCount: right.length, wrongCount: wrong.length, silentCount: silent.length,
      percent: answered ? Math.round((right.length / answered) * 100) : 0
    };
  });

  /* сводка по завершённым попыткам */
  var width = 7 + QUESTIONS.length + 1;
  var done = rows_(SHEET_RESULTS, width);
  var students = [], index = {};
  for (var r = 0; r < done.length; r++) {
    var row = done[r];
    var sName = clean_(row[2]);
    if (!sName) continue;
    var sKlass = clean_(row[1]);
    var marks = [];
    for (var m = 0; m < QUESTIONS.length; m++) {
      marks.push(row[7 + m] === 1 || row[7 + m] === '1' ? 1 : 0);
    }
    var entry = {
      klass: sKlass, name: sName, time: timeText_(row[0]),
      score: Number(row[5]) || 0, total: Number(row[6]) || QUESTIONS.length,
      attempts: 1, marks: marks, finished: true
    };
    var ik = key_(sKlass, sName);
    if (index[ik] !== undefined) {
      entry.attempts = students[index[ik]].attempts + 1;
      students[index[ik]] = entry;
    } else {
      index[ik] = students.length;
      students.push(entry);
    }
  }

  /* те, кто начал, но ещё не сдал */
  Object.keys(seen).forEach(function (sk) {
    if (index[sk] !== undefined) return;
    var answeredCount = 0, rightCount = 0, marks = [];
    QUESTIONS.forEach(function (q) {
      var rec = latest[sk + '|' + q.id];
      marks.push(rec ? (rec.ok ? 1 : 0) : -1);
      if (rec) { answeredCount++; if (rec.ok) rightCount++; }
    });
    students.push({
      klass: seen[sk].klass, name: seen[sk].name, time: '',
      score: rightCount, total: QUESTIONS.length, attempts: 1,
      marks: marks, finished: false, answered: answeredCount
    });
  });

  students.sort(function (a, b) {
    return a.klass.localeCompare(b.klass, 'ru') || a.name.localeCompare(b.name, 'ru');
  });

  /* переписка */
  var dialog = rows_(SHEET_DIALOG, 7).map(function (row) {
    return {
      time: timeText_(row[0]), klass: clean_(row[1]), name: clean_(row[2]),
      qid: String(row[3] || ''), number: questionNumber_(String(row[3] || '')),
      author: String(row[4] || ''), text: String(row[5] || '')
    };
  });

  var finished = students.filter(function (s) { return s.finished; });
  var sum = 0;
  finished.forEach(function (s) { sum += s.score; });

  return {
    students: students,
    perQuestion: perQuestion,
    dialog: dialog,
    classes: expected.map(function (c) {
      var submitted = {};
      students.forEach(function (s) {
        if (s.klass === c.klass && s.finished) submitted[s.name.toLowerCase()] = true;
      });
      var answered = c.students.filter(function (n) { return submitted[n.toLowerCase()]; }).length;
      var extra = students.filter(function (s) {
        return s.klass === c.klass && s.finished;
      }).length - answered;
      return { klass: c.klass, expected: c.students.length, answered: answered, extra: extra };
    }),
    missing: missingStudents_(expected, students),
    total: QUESTIONS.length,
    average: finished.length ? Math.round((sum / finished.length) * 10) / 10 : 0,
    spreadsheetUrl: openSpreadsheet_() ? openSpreadsheet_().getUrl() : ''
  };
}

function missingStudents_(expected, students) {
  var done = {};
  students.forEach(function (s) {
    if (s.finished) done[key_(s.klass, s.name)] = true;
  });
  var out = [];
  expected.forEach(function (c) {
    c.students.forEach(function (n) {
      if (!done[key_(c.klass, n)]) out.push({ klass: c.klass, name: n });
    });
  });
  return out;
}

/* ------------------------------------------------------------------ */
/* Письмо учителю, если ученик бросил тест                             */
/* ------------------------------------------------------------------ */

/** Ставит проверку по расписанию. Старые такие же проверки удаляет. */
function installAbandonCheck_() {
  try {
    var triggers = ScriptApp.getProjectTriggers();
    for (var i = 0; i < triggers.length; i++) {
      if (triggers[i].getHandlerFunction() === 'checkAbandoned') {
        ScriptApp.deleteTrigger(triggers[i]);
      }
    }
    ScriptApp.newTrigger('checkAbandoned')
      .timeBased()
      .everyMinutes(CHECK_EVERY_MINUTES)
      .create();
    Logger.log('Проверка брошенных работ включена: каждые ' + CHECK_EVERY_MINUTES +
               ' мин, порог ' + ABANDON_MINUTES + ' мин.');
  } catch (err) {
    Logger.log('Не удалось включить проверку брошенных работ: ' + err.message);
  }
}

/** Выключить письма. */
function stopAbandonCheck() {
  var triggers = ScriptApp.getProjectTriggers();
  var n = 0;
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'checkAbandoned') {
      ScriptApp.deleteTrigger(triggers[i]);
      n++;
    }
  }
  Logger.log('Проверок удалено: ' + n + '. Письма больше приходить не будут.');
}

/**
 * Кто начал тест, но за последние ABANDON_MINUTES минут не ответил
 * ни на одно задание и не сдал работу. По каждой такой попытке
 * письмо отправляется один раз.
 *
 * Вызывается по расписанию; вручную запускать тоже можно.
 */
function checkAbandoned() {
  var abandoned = findAbandoned_();
  if (!abandoned.length) return 0;

  var to = PropertiesService.getScriptProperties().getProperty(PROP_TEACHER);
  if (!to) {
    Logger.log('Почта учителя неизвестна — выполните setup().');
    return 0;
  }

  var lines = abandoned.map(function (a) {
    return '• ' + a.klass + ', ' + a.name +
           ' — ответил на ' + a.answered + ' из ' + QUESTIONS.length +
           ', последний ответ в ' + timeText_(a.last);
  });

  var body = 'Эти ученики начали тест «Методы списка», но больше ' + ABANDON_MINUTES +
    ' минут не отвечают и работу не сдали:\n\n' + lines.join('\n') +
    '\n\nВозможно, они закрыли страницу.\n\nТаблица с ответами: ' +
    (openSpreadsheet_() ? openSpreadsheet_().getUrl() : '') + '\n';

  MailApp.sendEmail(to,
    'Методы списка: бросили тест — ' + abandoned.length + ' чел.',
    body);

  var sheet = sheet_(SHEET_NOTIFY);
  abandoned.forEach(function (a) {
    sheet.appendRow([new Date(), a.klass, a.name, a.attempt, a.answered, a.last]);
  });

  Logger.log('Письмо отправлено на ' + to + '. В списке: ' + abandoned.length + '.');
  return abandoned.length;
}

/** Собирает брошенные попытки, по которым письма ещё не было. */
function findAbandoned_() {
  var now = new Date().getTime();
  var limit = ABANDON_MINUTES * 60 * 1000;

  /* когда каждый ученик в последний раз сдавал работу */
  var finished = {};
  var width = 7 + QUESTIONS.length + 1;
  rows_(SHEET_RESULTS, width).forEach(function (row) {
    var k = key_(row[1], row[2]);
    var t = dateOf_(row[0]);
    if (t && (!finished[k] || t > finished[k])) finished[k] = t;
  });

  /* о чём уже писали: класс|ученик|попытка */
  var notified = {};
  rows_(SHEET_NOTIFY, 6).forEach(function (row) {
    notified[key_(row[1], row[2]) + '|' + String(row[3] || '')] = true;
  });

  /* попытки из журнала ответов */
  var attempts = {};
  rows_(SHEET_ANSWERS, 9).forEach(function (row) {
    var klass = clean_(row[1]), name = clean_(row[2]);
    var attempt = String(row[3] || '');
    var qid = String(row[4] || '');
    var t = dateOf_(row[0]);
    if (!name || !qid || !t) return;

    var id = key_(klass, name) + '|' + attempt;
    if (!attempts[id]) {
      attempts[id] = { klass: klass, name: name, attempt: attempt, last: t, questions: {} };
    }
    attempts[id].questions[qid] = true;
    if (t > attempts[id].last) attempts[id].last = t;
  });

  var out = [];
  Object.keys(attempts).forEach(function (id) {
    var a = attempts[id];
    if (notified[id]) return;

    var answered = Object.keys(a.questions).length;
    if (answered >= QUESTIONS.length) return;        // ответил на всё — не бросил

    var finishedAt = finished[key_(a.klass, a.name)];
    if (finishedAt && finishedAt >= a.last) return;  // работа сдана

    if (now - a.last.getTime() < limit) return;      // ещё отвечает

    out.push({ klass: a.klass, name: a.name, attempt: a.attempt,
               answered: answered, last: a.last });
  });

  out.sort(function (x, y) {
    return x.klass.localeCompare(y.klass, 'ru') || x.name.localeCompare(y.name, 'ru');
  });
  return out;
}

function dateOf_(value) {
  var d = value instanceof Date ? value : new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

/* ------------------------------------------------------------------ */
/* Обслуживание                                                        */
/* ------------------------------------------------------------------ */

/** Очистить ответы и переписку перед новым уроком. Списки классов остаются. */
function clearResults() {
  [SHEET_ANSWERS, SHEET_RESULTS, SHEET_DIALOG, SHEET_NOTIFY].forEach(function (name) {
    var sheet = sheet_(name);
    if (sheet.getLastRow() > 1) sheet.deleteRows(2, sheet.getLastRow() - 1);
  });
  Logger.log('Ответы, итоги, переписка и отправленные уведомления очищены. ' +
             'Списки классов не тронуты.');
}

/** Проверка настройки: выполните, если что-то не работает. */
function diagnose() {
  var props = PropertiesService.getScriptProperties();
  Logger.log('ID таблицы: ' + (props.getProperty(PROP_SPREADSHEET) || 'НЕ ЗАДАН — выполните setup()'));

  ['student', 'teacher'].forEach(function (name) {
    var found = '';
    [name, name + '.html'].forEach(function (variant) {
      if (found) return;
      try {
        HtmlService.createHtmlOutputFromFile(variant);
        found = variant;
      } catch (err) { /* пробуем следующее написание */ }
    });
    if (found === name) {
      Logger.log('HTML-файл «' + name + '»: найден');
    } else if (found) {
      Logger.log('HTML-файл «' + name + '»: найден как «' + found + '.html» — лишнее .html в имени. ' +
                 'Страница работает, но лучше переименовать в «' + name + '».');
    } else {
      Logger.log('HTML-файл «' + name + '»: НЕ НАЙДЕН. Создайте его: + → HTML, имя ровно «' + name + '».');
    }
  });

  [SHEET_CLASSES, SHEET_ANSWERS, SHEET_RESULTS, SHEET_DIALOG, SHEET_NOTIFY].forEach(function (name) {
    try {
      Logger.log('Лист «' + name + '»: строк с данными ' + Math.max(0, sheet_(name).getLastRow() - 1));
    } catch (err) {
      Logger.log('Лист «' + name + '»: ошибка — ' + err.message);
    }
  });

  var mail = props.getProperty(PROP_TEACHER);
  Logger.log('Почта для писем: ' + (mail || 'НЕ ЗАДАНА — выполните setup()'));
  try {
    var armed = 0;
    ScriptApp.getProjectTriggers().forEach(function (t) {
      if (t.getHandlerFunction() === 'checkAbandoned') armed++;
    });
    Logger.log(armed
      ? 'Проверка брошенных работ: включена (каждые ' + CHECK_EVERY_MINUTES +
        ' мин, порог ' + ABANDON_MINUTES + ' мин)'
      : 'Проверка брошенных работ: ВЫКЛЮЧЕНА — выполните setup()');
  } catch (err) {
    Logger.log('Проверка брошенных работ: не удалось узнать — ' + err.message);
  }

  Logger.log('Страницы: ' +
    ((typeof EMBEDDED_PAGES !== 'undefined') ? 'вшиты в этот файл' : 'отдельные HTML-файлы'));

  try {
    var classes = readClasses_();
    Logger.log('Классов: ' + classes.length + ', учеников: ' + countStudents_());
    classes.forEach(function (c) { Logger.log('  ' + c.klass + ': ' + c.students.length); });
    if (!classes.length) Logger.log('  Лист «Классы» пуст — ученик будет вводить фамилию вручную.');
  } catch (err) {
    Logger.log('Списки классов: ошибка — ' + err.message);
  }
}
