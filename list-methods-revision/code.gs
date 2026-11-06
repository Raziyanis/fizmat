/**
 * Повторение: методы списка (Python).
 *
 * Веб-приложение с двумя страницами:
 *   - страница ученика  — ссылка веб-приложения (.../exec);
 *   - страница учителя  — та же ссылка с ?page=teacher&key=КЛЮЧ.
 *
 * Ученик выбирает класс, находит себя в списке и проходит тест.
 * Списки классов хранятся на листе «Классы» вашей Google Таблицы,
 * в коде их нет. Ответы пишутся на лист «Результаты».
 *
 * Перед раздачей ссылки один раз выполните функцию setup().
 */

var SHEET_RESULTS = 'Результаты';
var SHEET_CLASSES = 'Классы';
var SPREADSHEET_TITLE = 'Методы списка — повторение';

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

/** Выполните один раз: создаёт таблицу, листы и ключ учителя. */
function setup() {
  var props = PropertiesService.getScriptProperties();
  var ss = openSpreadsheet_();

  if (!ss) {
    ss = SpreadsheetApp.create(SPREADSHEET_TITLE);
    props.setProperty(PROP_SPREADSHEET, ss.getId());
  }

  var results = ss.getSheetByName(SHEET_RESULTS) || ss.insertSheet(SHEET_RESULTS);
  if (results.getLastRow() === 0) {
    var header = ['Время', 'Класс', 'Ученик', 'Email', 'Попытка', 'Балл', 'Максимум'];
    for (var i = 0; i < QUESTIONS.length; i++) {
      header.push(QUESTIONS[i].id + ' (' + QUESTIONS[i].topic + ')');
    }
    header.push('ID отправки');
    results.appendRow(header);
    results.setFrozenRows(1);
    results.setFrozenColumns(3);
  }

  var classes = ss.getSheetByName(SHEET_CLASSES) || ss.insertSheet(SHEET_CLASSES);
  if (classes.getLastRow() === 0) {
    classes.appendRow(['Класс', 'Фамилия и имя']);
    classes.setFrozenRows(1);
  }

  var sheets = ss.getSheets();
  for (var j = 0; j < sheets.length; j++) {
    var name = sheets[j].getName();
    if (name !== SHEET_RESULTS && name !== SHEET_CLASSES && sheets[j].getLastRow() === 0) {
      ss.deleteSheet(sheets[j]);
    }
  }

  props.setProperty(PROP_TEACHER, Session.getEffectiveUser().getEmail() || '');
  if (!props.getProperty(PROP_KEY)) {
    props.setProperty(PROP_KEY, Utilities.getUuid().replace(/-/g, '').substring(0, 10));
  }

  Logger.log('Таблица: ' + ss.getUrl());
  Logger.log('Заданий в тесте: ' + QUESTIONS.length);
  Logger.log('Учеников в списках: ' + countStudents_());
  Logger.log('КЛЮЧ УЧИТЕЛЯ: ' + props.getProperty(PROP_KEY));
  Logger.log('Страница учителя: <ссылка веб-приложения>?page=teacher&key=' + props.getProperty(PROP_KEY));
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
  if (!sheet) throw new Error('Лист «' + name + '» не найден: выполните функцию setup().');
  return sheet;
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

/** Читает лист «Классы» → [{ klass: '8A', students: ['Иванов Иван', …] }, …] */
function readClasses_() {
  var sheet = sheet_(SHEET_CLASSES);
  var last = sheet.getLastRow();
  if (last < 2) return [];

  var values = sheet.getRange(2, 1, last - 1, 2).getValues();
  var order = [];
  var map = {};

  for (var i = 0; i < values.length; i++) {
    var klass = String(values[i][0] || '').trim();
    var name = String(values[i][1] || '').trim().replace(/\s+/g, ' ');
    if (!klass || !name) continue;
    if (!map[klass]) {
      map[klass] = [];
      order.push(klass);
    }
    if (map[klass].indexOf(name) === -1) map[klass].push(name);
  }

  order.sort(function (a, b) { return a.localeCompare(b, 'ru'); });
  return order.map(function (klass) {
    map[klass].sort(function (a, b) { return a.localeCompare(b, 'ru'); });
    return { klass: klass, students: map[klass] };
  });
}

/* ------------------------------------------------------------------ */
/* Маршрутизация страниц                                               */
/* ------------------------------------------------------------------ */

function doGet(e) {
  var page = (e && e.parameter && e.parameter.page) || 'student';
  var file = page === 'teacher' ? 'teacher' : 'student';
  return HtmlService.createHtmlOutputFromFile(file)
    .setTitle(file === 'teacher' ? 'Методы списка — экран учителя' : 'Методы списка — повторение')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/* ------------------------------------------------------------------ */
/* Данные для страницы ученика                                         */
/* ------------------------------------------------------------------ */

/** Задания в случайном порядке плюс списки классов. */
function getStudentData() {
  var order = shuffled_(QUESTIONS);
  return {
    email: safeEmail_(),
    total: QUESTIONS.length,
    classes: readClasses_(),
    questions: order.map(function (q) {
      return { id: q.id, topic: q.topic, code: q.code, text: q.text, options: q.options };
    })
  };
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
/* Приём ответов                                                       */
/* ------------------------------------------------------------------ */

/**
 * submission = { klass: '8A', name: 'Иванов Иван', answers: { q01: 2, … },
 *                uid: 'строка', addToClass: true }
 *
 * uid — номер отправки, который придумывает страница ученика. Если такая
 * отправка уже записана (ответ ушёл повторно после обрыва связи), строка
 * не дублируется, а ученик всё равно получает свой разбор.
 */
function submitAnswers(submission) {
  var klass = String((submission && submission.klass) || '').trim().substring(0, 20);
  var name = String((submission && submission.name) || '').trim().replace(/\s+/g, ' ').substring(0, 80);
  var uid = String((submission && submission.uid) || '').trim().substring(0, 50);
  var email = safeEmail_();

  if (!name) throw new Error('Не выбрана фамилия.');

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
    if (uid && hasSubmission_(sheet, uid)) {
      duplicate = true;
    } else {
      var attempt = countAttempts_(sheet, klass, name) + 1;
      sheet.appendRow(
        [new Date(), klass, name, email, attempt, score, QUESTIONS.length].concat(marks).concat([uid]));
      if (submission && submission.addToClass) {
        addStudentIfMissing_(klass, name);
      }
    }
  } finally {
    lock.releaseLock();
  }

  return { score: score, total: QUESTIONS.length, feedback: feedback, duplicate: duplicate };
}

/** Была ли уже записана отправка с таким номером. */
function hasSubmission_(sheet, uid) {
  var last = sheet.getLastRow();
  if (last < 2) return false;
  var col = 7 + QUESTIONS.length + 1;
  var values = sheet.getRange(2, col, last - 1, 1).getValues();
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0] || '').trim() === uid) return true;
  }
  return false;
}

/** Дописывает ученика в список класса, если его там нет. */
function addStudentIfMissing_(klass, name) {
  if (!klass || !name) return;
  try {
    var sheet = sheet_(SHEET_CLASSES);
    var last = sheet.getLastRow();
    if (last >= 2) {
      var values = sheet.getRange(2, 1, last - 1, 2).getValues();
      for (var i = 0; i < values.length; i++) {
        if (String(values[i][0] || '').trim().toLowerCase() === klass.toLowerCase() &&
            String(values[i][1] || '').trim().replace(/\s+/g, ' ').toLowerCase() === name.toLowerCase()) {
          return;
        }
      }
    }
    sheet.appendRow([klass, name]);
  } catch (err) {
    // список классов не настроен — ответ ученика всё равно записан
  }
}

function countAttempts_(sheet, klass, name) {
  var last = sheet.getLastRow();
  if (last < 2) return 0;
  var values = sheet.getRange(2, 2, last - 1, 2).getValues();
  var klassKey = klass.toLowerCase();
  var nameKey = name.toLowerCase();
  var count = 0;
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0] || '').trim().toLowerCase() === klassKey &&
        String(values[i][1] || '').trim().toLowerCase() === nameKey) {
      count++;
    }
  }
  return count;
}

/* ------------------------------------------------------------------ */
/* Данные для экрана учителя                                           */
/* ------------------------------------------------------------------ */

function isTeacher_(key) {
  var props = PropertiesService.getScriptProperties();
  var expected = props.getProperty(PROP_KEY);
  if (expected && key && String(key) === expected) return true;

  var owner = (props.getProperty(PROP_TEACHER) || '').toLowerCase();
  var active = safeEmail_().toLowerCase();
  return !!owner && !!active && owner === active;
}

/** Сводка по классу: последняя попытка каждого ученика плюс статистика. */
function getResults(key) {
  if (!isTeacher_(key)) {
    throw new Error('Доступ только у учителя. Откройте ссылку с ключом из журнала setup().');
  }

  var sheet = sheet_(SHEET_RESULTS);
  var last = sheet.getLastRow();
  var width = 7 + QUESTIONS.length + 1;
  var students = [];
  var index = {};

  if (last >= 2) {
    var values = sheet.getRange(2, 1, last - 1, width).getValues();
    for (var i = 0; i < values.length; i++) {
      var row = values[i];
      var name = String(row[2] || '').trim();
      if (!name) continue;

      var klass = String(row[1] || '').trim();
      var marks = [];
      for (var m = 0; m < QUESTIONS.length; m++) {
        marks.push(row[7 + m] === 1 || row[7 + m] === '1' ? 1 : 0);
      }
      var time = row[0] instanceof Date ? row[0] : new Date(row[0]);
      var identity = (klass + '|' + name).toLowerCase();

      var entry = {
        klass: klass,
        name: name,
        time: time ? Utilities.formatDate(time, Session.getScriptTimeZone(), 'HH:mm') : '',
        score: Number(row[5]) || 0,
        total: Number(row[6]) || QUESTIONS.length,
        attempts: 1,
        marks: marks
      };

      if (index[identity] !== undefined) {
        entry.attempts = students[index[identity]].attempts + 1;
        students[index[identity]] = entry;
      } else {
        index[identity] = students.length;
        students.push(entry);
      }
    }
  }

  students.sort(function (a, b) {
    return a.klass.localeCompare(b.klass, 'ru') || a.name.localeCompare(b.name, 'ru');
  });

  var expected = [];
  try {
    expected = readClasses_();
  } catch (err) {
    expected = [];
  }

  return {
    students: students,
    perQuestion: questionStats_(students),
    classes: expected.map(function (c) {
      var submitted = {};
      students.forEach(function (s) {
        if (s.klass === c.klass) submitted[s.name.toLowerCase()] = true;
      });
      // в счётчик идут только ученики из списка класса,
      // иначе «сдали 2 из 2» соседствовало бы с фамилией в списке не сдавших
      var answered = c.students.filter(function (n) {
        return submitted[n.toLowerCase()];
      }).length;
      var extra = students.filter(function (s) { return s.klass === c.klass; }).length - answered;
      return { klass: c.klass, expected: c.students.length, answered: answered, extra: extra };
    }),
    missing: missingStudents_(expected, students),
    total: QUESTIONS.length,
    average: average_(students),
    spreadsheetUrl: openSpreadsheet_() ? openSpreadsheet_().getUrl() : ''
  };
}

function questionStats_(students) {
  var stats = [];
  for (var q = 0; q < QUESTIONS.length; q++) {
    var right = 0;
    for (var s = 0; s < students.length; s++) {
      if (students[s].marks[q] === 1) right++;
    }
    stats.push({
      id: QUESTIONS[q].id,
      topic: QUESTIONS[q].topic,
      right: right,
      percent: students.length ? Math.round((right / students.length) * 100) : 0
    });
  }
  return stats;
}

function average_(students) {
  if (!students.length) return 0;
  var sum = 0;
  for (var i = 0; i < students.length; i++) sum += students[i].score;
  return Math.round((sum / students.length) * 10) / 10;
}

/** Кто из списка класса ещё не сдал. */
function missingStudents_(expected, students) {
  var answered = {};
  for (var i = 0; i < students.length; i++) {
    answered[(students[i].klass + '|' + students[i].name).toLowerCase()] = true;
  }
  var out = [];
  for (var c = 0; c < expected.length; c++) {
    for (var s = 0; s < expected[c].students.length; s++) {
      var key = (expected[c].klass + '|' + expected[c].students[s]).toLowerCase();
      if (!answered[key]) {
        out.push({ klass: expected[c].klass, name: expected[c].students[s] });
      }
    }
  }
  return out;
}

/** Очистить ответы перед новым уроком (списки классов остаются). */
function clearResults() {
  var sheet = sheet_(SHEET_RESULTS);
  if (sheet.getLastRow() > 1) {
    sheet.deleteRows(2, sheet.getLastRow() - 1);
  }
  Logger.log('Ответы очищены. Списки классов не тронуты.');
}

/** Проверка настройки: выполните, если что-то не работает. */
function diagnose() {
  var props = PropertiesService.getScriptProperties();
  Logger.log('ID таблицы: ' + (props.getProperty(PROP_SPREADSHEET) || 'НЕ ЗАДАН — выполните setup()'));
  Logger.log('Ключ учителя: ' + (props.getProperty(PROP_KEY) || 'НЕ ЗАДАН — выполните setup()'));

  var names = ['student', 'teacher'];
  for (var i = 0; i < names.length; i++) {
    try {
      HtmlService.createHtmlOutputFromFile(names[i]);
      Logger.log('HTML-файл «' + names[i] + '»: найден');
    } catch (err) {
      Logger.log('HTML-файл «' + names[i] + '»: НЕ НАЙДЕН. Создайте файл с этим именем (+ → HTML).');
    }
  }

  try {
    var classes = readClasses_();
    Logger.log('Классов в списке: ' + classes.length + ', учеников: ' + countStudents_());
    for (var c = 0; c < classes.length; c++) {
      Logger.log('  ' + classes[c].klass + ': ' + classes[c].students.length);
    }
    if (!classes.length) {
      Logger.log('  Лист «Классы» пуст — ученик будет вводить фамилию вручную.');
    }
  } catch (err) {
    Logger.log('Списки классов: ошибка — ' + err.message);
  }

  try {
    Logger.log('Ответов записано: ' + Math.max(0, sheet_(SHEET_RESULTS).getLastRow() - 1));
  } catch (err) {
    Logger.log('Лист результатов: ошибка — ' + err.message);
  }
}
