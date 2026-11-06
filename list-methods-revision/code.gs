/**
 * Повторение: методы списка (Python).
 *
 * Веб-приложение с двумя страницами:
 *   - страница ученика  — ссылка веб-приложения (.../exec);
 *   - страница учителя  — та же ссылка с ?page=teacher, живая таблица ответов.
 *
 * Ответы пишутся в Google Таблицу на лист «Результаты».
 * Перед раздачей ссылки один раз выполните функцию setup().
 */

var SHEET_NAME = 'Результаты';
var SPREADSHEET_TITLE = 'Методы списка — повторение, результаты';

var PROP_SPREADSHEET = 'SPREADSHEET_ID';
var PROP_TEACHER = 'TEACHER_EMAIL';
var PROP_KEY = 'TEACHER_KEY';

/**
 * Банк заданий. correct — индекс правильного варианта в options.
 * topic попадает в заголовок таблицы учителя, note ученик видит после сдачи.
 */
var QUESTIONS = [
  {
    id: 'q01',
    topic: 'pop',
    code: 'a = [1, 2, 3]\nx = a.pop(0)\nprint(x, a)',
    text: 'Что выведет программа?',
    options: ['1 [1, 2, 3]', '3 [1, 2]', '1 [2, 3]', 'Ошибка'],
    correct: 2,
    note: 'pop(i) удаляет элемент по индексу и возвращает его. Без аргумента pop() удаляет последний элемент.'
  },
  {
    id: 'q02',
    topic: 'remove',
    code: 'a = [1, 2, 2, 3]\na.remove(2)\nprint(a)',
    text: 'Что выведет программа?',
    options: ['[1, 3]', '[1, 2, 3]', '[1, 2, 2, 3]', 'Ошибка'],
    correct: 1,
    note: 'remove(x) удаляет только первое вхождение значения, а не все сразу.'
  },
  {
    id: 'q03',
    topic: 'insert',
    code: 'a = [1, 2, 3]\na.insert(1, 9)\nprint(a)',
    text: 'Что выведет программа?',
    options: ['[9, 1, 2, 3]', '[1, 2, 9, 3]', '[1, 9, 3]', '[1, 9, 2, 3]'],
    correct: 3,
    note: 'insert(i, x) вставляет x так, что он становится элементом с индексом i, остальные сдвигаются вправо.'
  },
  {
    id: 'q04',
    topic: 'count',
    code: 'a = [5, 7, 5, 5]\nprint(a.count(5))',
    text: 'Что выведет программа?',
    options: ['3', '2', '1', '0'],
    correct: 0,
    note: 'count(x) возвращает число вхождений значения. Если значения нет, вернётся 0, ошибки не будет.'
  },
  {
    id: 'q05',
    topic: 'index',
    code: "a = ['x', 'y', 'z']\nprint(a.index('z'))",
    text: 'Что выведет программа?',
    options: ['3', 'z', '2', 'Ошибка'],
    correct: 2,
    note: 'index(x) возвращает индекс первого вхождения. Индексы начинаются с нуля, поэтому у третьего элемента индекс 2.'
  },
  {
    id: 'q06',
    topic: 'append',
    code: 'a = [1, 2]\na.append([3, 4])\nprint(len(a))',
    text: 'Что выведет программа?',
    options: ['4', '3', '2', 'Ошибка'],
    correct: 1,
    note: 'append добавляет аргумент как один элемент. Список [3, 4] стал третьим элементом: [1, 2, [3, 4]].'
  },
  {
    id: 'q07',
    topic: 'extend',
    code: 'a = [1, 2]\na.extend([3, 4])\nprint(len(a))',
    text: 'Что выведет программа?',
    options: ['3', '2', '4', 'Ошибка'],
    correct: 2,
    note: 'extend добавляет элементы по одному: получится [1, 2, 3, 4]. В этом и разница с append.'
  },
  {
    id: 'q08',
    topic: 'присваивание',
    code: 'a = [1, 2, 3]\nb = a\nb.append(4)\nprint(a)',
    text: 'Что выведет программа?',
    options: ['[1, 2, 3]', '[4]', 'Ошибка', '[1, 2, 3, 4]'],
    correct: 3,
    note: 'b = a не создаёт новый список: оба имени ссылаются на один и тот же объект, поэтому изменение видно через a.'
  },
  {
    id: 'q09',
    topic: 'copy',
    code: 'a = [1, 2, 3]\nb = a.copy()\nb.append(4)\nprint(a, b)',
    text: 'Что выведет программа?',
    options: ['[1, 2, 3, 4] [1, 2, 3, 4]', '[1, 2, 3] [1, 2, 3, 4]', '[1, 2, 3] [1, 2, 3]', 'Ошибка'],
    correct: 1,
    note: 'copy() создаёт независимую копию списка, поэтому a не меняется. Сравните с предыдущим заданием.'
  },
  {
    id: 'q10',
    topic: 'sort',
    code: 'a = [3, 1, 2]\nprint(a.sort())',
    text: 'Что выведет программа?',
    options: ['[1, 2, 3]', '[3, 1, 2]', 'None', 'Ошибка'],
    correct: 2,
    note: 'sort() сортирует список на месте и ничего не возвращает. Новый отсортированный список даёт функция sorted(a).'
  },
  {
    id: 'q11',
    topic: 'reverse',
    code: 'a = [1, 2, 3]\nr = a.reverse()\nprint(a, r)',
    text: 'Что выведет программа?',
    options: ['[3, 2, 1] [3, 2, 1]', '[1, 2, 3] [3, 2, 1]', 'Ошибка', '[3, 2, 1] None'],
    correct: 3,
    note: 'reverse() тоже меняет список на месте и возвращает None — как sort().'
  },
  {
    id: 'q12',
    topic: 'clear',
    code: 'a = [1, 2, 3]\na.clear()\nprint(a)',
    text: 'Что выведет программа?',
    options: ['[]', 'None', '[1, 2, 3]', 'Переменная a удалится, будет ошибка'],
    correct: 0,
    note: 'clear() удаляет все элементы, но сам список остаётся — он становится пустым.'
  },
  {
    id: 'q13',
    topic: 'ошибки',
    code: 'a = [1, 2]',
    text: 'Какой вызов приведёт к ошибке?',
    options: ['a.append(5)', 'a.insert(10, 5)', 'a.remove(5)', 'a.count(5)'],
    correct: 2,
    note: 'remove требует, чтобы значение было в списке. insert с индексом за границей просто добавит в конец, count вернёт 0.'
  }
];

/* ------------------------------------------------------------------ */
/* Настройка                                                           */
/* ------------------------------------------------------------------ */

/** Выполните один раз: создаёт таблицу результатов и выдаёт ссылки. */
function setup() {
  var props = PropertiesService.getScriptProperties();
  var ss = openSpreadsheet_();

  if (!ss) {
    ss = SpreadsheetApp.create(SPREADSHEET_TITLE);
    props.setProperty(PROP_SPREADSHEET, ss.getId());
  }

  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    var header = ['Время', 'Ученик', 'Email', 'Попытка', 'Балл', 'Максимум'];
    for (var i = 0; i < QUESTIONS.length; i++) {
      header.push(QUESTIONS[i].id + ' (' + QUESTIONS[i].topic + ')');
    }
    sheet.appendRow(header);
    sheet.setFrozenRows(1);
    sheet.setFrozenColumns(2);
  }

  var leftovers = ss.getSheets();
  for (var j = 0; j < leftovers.length; j++) {
    if (leftovers[j].getName() !== SHEET_NAME && leftovers[j].getLastRow() === 0) {
      ss.deleteSheet(leftovers[j]);
    }
  }

  props.setProperty(PROP_TEACHER, Session.getEffectiveUser().getEmail() || '');
  if (!props.getProperty(PROP_KEY)) {
    props.setProperty(PROP_KEY, Utilities.getUuid().replace(/-/g, '').substring(0, 10));
  }

  Logger.log('Таблица результатов: ' + ss.getUrl());
  Logger.log('Заданий в тесте: ' + QUESTIONS.length);
  Logger.log('Ключ страницы учителя: ' + props.getProperty(PROP_KEY));
  Logger.log('После развёртывания страница учителя: <ссылка>/exec?page=teacher&key=' +
             props.getProperty(PROP_KEY));
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

function resultsSheet_() {
  var ss = openSpreadsheet_();
  if (!ss) throw new Error('Таблица результатов не создана: выполните функцию setup().');
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('Лист «' + SHEET_NAME + '» не найден: выполните функцию setup().');
  return sheet;
}

/* ------------------------------------------------------------------ */
/* Маршрутизация страниц                                               */
/* ------------------------------------------------------------------ */

function doGet(e) {
  var params = (e && e.parameter) || {};

  if (params.page === 'teacher') {
    if (!isTeacher_(params.key)) {
      return HtmlService.createHtmlOutput(
        '<div style="font:16px/1.5 system-ui;padding:32px;max-width:640px">' +
        '<h2>Страница учителя</h2>' +
        '<p>Доступ только у учителя. Откройте ссылку с ключом: ' +
        '<code>?page=teacher&amp;key=…</code>. Ключ выводится в журнале выполнения ' +
        'функции <code>setup()</code>.</p></div>')
        .setTitle('Методы списка — учитель');
    }
    var teacher = HtmlService.createTemplateFromFile('teacher');
    teacher.payload = JSON.stringify({
      questions: QUESTIONS.map(function (q) { return { id: q.id, topic: q.topic }; }),
      key: params.key || ''
    });
    return teacher.evaluate()
      .setTitle('Методы списка — экран учителя')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }

  var order = shuffled_(QUESTIONS);
  var student = HtmlService.createTemplateFromFile('student');
  student.payload = JSON.stringify({
    email: safeEmail_(),
    total: QUESTIONS.length,
    questions: order.map(function (q) {
      return { id: q.id, topic: q.topic, code: q.code, text: q.text, options: q.options };
    })
  });
  return student.evaluate()
    .setTitle('Методы списка — повторение')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function isTeacher_(key) {
  var props = PropertiesService.getScriptProperties();
  var expected = props.getProperty(PROP_KEY);
  if (expected && key && key === expected) return true;

  var owner = (props.getProperty(PROP_TEACHER) || '').toLowerCase();
  var active = '';
  try {
    active = (Session.getActiveUser().getEmail() || '').toLowerCase();
  } catch (err) {
    active = '';
  }
  return !!owner && !!active && owner === active;
}

function safeEmail_() {
  try {
    return Session.getActiveUser().getEmail() || '';
  } catch (err) {
    return '';
  }
}

function shuffled_(items) {
  var copy = items.slice();
  for (var i = copy.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

/* ------------------------------------------------------------------ */
/* Приём ответов ученика                                               */
/* ------------------------------------------------------------------ */

/**
 * Принимает ответы, проверяет, пишет строку в таблицу.
 * submission = { name: String, answers: { q01: 2, q02: 0, ... } }
 */
function submitAnswers(submission) {
  var name = String((submission && submission.name) || '').trim().replace(/\s+/g, ' ');
  var email = safeEmail_();

  if (!name && !email) {
    throw new Error('Укажите фамилию и имя.');
  }
  if (name && name.length > 80) {
    name = name.substring(0, 80);
  }

  var answers = (submission && submission.answers) || {};
  var feedback = [];
  var marks = [];
  var score = 0;

  for (var i = 0; i < QUESTIONS.length; i++) {
    var q = QUESTIONS[i];
    var given = answers[q.id];
    var ok = (typeof given === 'number') && given === q.correct;
    if (ok) score++;
    marks.push(ok ? 1 : 0);
    feedback.push({
      id: q.id,
      topic: q.topic,
      code: q.code,
      text: q.text,
      options: q.options,
      given: (typeof given === 'number') ? given : -1,
      correct: q.correct,
      ok: ok,
      note: q.note
    });
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var sheet = resultsSheet_();
    var attempt = countAttempts_(sheet, name, email) + 1;
    var row = [new Date(), name || email, email, attempt, score, QUESTIONS.length];
    sheet.appendRow(row.concat(marks));
  } finally {
    lock.releaseLock();
  }

  return { score: score, total: QUESTIONS.length, feedback: feedback };
}

function countAttempts_(sheet, name, email) {
  var last = sheet.getLastRow();
  if (last < 2) return 0;
  var values = sheet.getRange(2, 2, last - 1, 2).getValues();
  var nameKey = name.toLowerCase();
  var emailKey = (email || '').toLowerCase();
  var count = 0;
  for (var i = 0; i < values.length; i++) {
    var rowName = String(values[i][0] || '').trim().toLowerCase();
    var rowEmail = String(values[i][1] || '').trim().toLowerCase();
    if (emailKey && rowEmail === emailKey) {
      count++;
    } else if (!emailKey && nameKey && rowName === nameKey) {
      count++;
    }
  }
  return count;
}

/* ------------------------------------------------------------------ */
/* Данные для экрана учителя                                           */
/* ------------------------------------------------------------------ */

/** Возвращает сводку по классу: последняя попытка каждого ученика + статистика. */
function getResults(key) {
  if (!isTeacher_(key)) {
    throw new Error('Доступ только у учителя.');
  }

  var sheet = resultsSheet_();
  var last = sheet.getLastRow();
  var width = 6 + QUESTIONS.length;
  var students = [];
  var byKey = {};

  if (last >= 2) {
    var values = sheet.getRange(2, 1, last - 1, width).getValues();
    for (var i = 0; i < values.length; i++) {
      var row = values[i];
      var name = String(row[1] || '').trim();
      var email = String(row[2] || '').trim();
      if (!name && !email) continue;

      var identity = (email || name).toLowerCase();
      var marks = [];
      for (var m = 0; m < QUESTIONS.length; m++) {
        marks.push(row[6 + m] === 1 || row[6 + m] === '1' ? 1 : 0);
      }
      var time = row[0] instanceof Date ? row[0] : new Date(row[0]);

      var entry = {
        name: name || email,
        email: email,
        time: time ? Utilities.formatDate(time, Session.getScriptTimeZone(), 'HH:mm') : '',
        score: Number(row[4]) || 0,
        total: Number(row[5]) || QUESTIONS.length,
        attempts: 1,
        marks: marks
      };

      if (byKey[identity]) {
        entry.attempts = byKey[identity].attempts + 1;
        students[byKey[identity].index] = entry;
        byKey[identity] = { index: byKey[identity].index, attempts: entry.attempts };
      } else {
        byKey[identity] = { index: students.length, attempts: 1 };
        students.push(entry);
      }
    }
  }

  var perQuestion = [];
  for (var q = 0; q < QUESTIONS.length; q++) {
    var right = 0;
    for (var s = 0; s < students.length; s++) {
      if (students[s].marks[q] === 1) right++;
    }
    perQuestion.push({
      id: QUESTIONS[q].id,
      topic: QUESTIONS[q].topic,
      right: right,
      percent: students.length ? Math.round((right / students.length) * 100) : 0
    });
  }

  var sumScore = 0;
  for (var k = 0; k < students.length; k++) sumScore += students[k].score;

  students.sort(function (a, b) { return a.name.localeCompare(b.name, 'ru'); });

  return {
    students: students,
    perQuestion: perQuestion,
    total: QUESTIONS.length,
    average: students.length ? Math.round((sumScore / students.length) * 10) / 10 : 0,
    spreadsheetUrl: openSpreadsheet_() ? openSpreadsheet_().getUrl() : ''
  };
}

/** Очистить результаты перед новым уроком (строка заголовка остаётся). */
function clearResults() {
  var sheet = resultsSheet_();
  if (sheet.getLastRow() > 1) {
    sheet.deleteRows(2, sheet.getLastRow() - 1);
  }
  Logger.log('Результаты очищены.');
}
