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

/** Версия кода. Видна внизу обеих страниц — так сразу понятно,
 *  развёрнута ли свежая версия или ссылка отдаёт старую. */
var APP_VERSION = 'v31 · 7 ноября';

var SHEET_CLASSES = 'Классы';
var SHEET_ANSWERS = 'Ответы';
var SHEET_RESULTS = 'Результаты';
var SHEET_DIALOG = 'Диалог';
var SHEET_NOTIFY = 'Уведомления';
var SHEET_STAGES = 'Этапы';
var PROP_DIGEST = 'LAST_DIGEST_AT';
var PROP_TOKEN = 'TEACHER_TOKEN';

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
    options: ['2', '3', 'z', 'Ошибка'],
    correct: 0,
    note: 'index(x) возвращает индекс первого вхождения. Индексы начинаются с нуля, поэтому у третьего элемента индекс 2.'
  },
  {
    id: 'q06', topic: 'append',
    code: 'a = [5, 3]\na.append(1)\nprint(a)',
    text: 'Что выведет программа?',
    options: ['[1, 5, 3]', '[1, 3, 5]', '[5, 3, 1]', '[5, 3]'],
    correct: 2,
    note: 'append(x) добавляет элемент в конец списка. Список при этом не сортируется и порядок остальных элементов не меняется.'
  },
  {
    id: 'q07', topic: 'extend',
    code: 'a = [1, 2]\na.extend([3, 4])\nprint(len(a))',
    text: 'Что выведет программа?',
    options: ['3', '4', '2', 'Ошибка'],
    correct: 1,
    note: 'extend(b) добавляет в список все элементы из b по одному, поэтому получится [1, 2, 3, 4] длиной 4.'
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
    code: 'a = [3, 1, 2]\na.sort()\nprint(a)',
    text: 'Что выведет программа?',
    options: ['[3, 2, 1]', '[3, 1, 2]', '[1, 2, 3]', 'Ошибка'],
    correct: 2,
    note: 'sort() сортирует список по возрастанию прямо в нём самом: прежний порядок [3, 1, 2] теряется.'
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
    options: ['a.append(5)', 'a.insert(10, 5)', 'a.count(5)', 'a.remove(5)'],
    correct: 3,
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
    note: 'sorted(a) — функция: она не трогает исходный список, а строит из него новый отсортированный. Метод a.sort() наоборот меняет сам список a.'
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
/* Новая тема: вкладка «Новая тема» на странице ученика                */
/* ------------------------------------------------------------------ */

/**
 * Весь текст новой темы. Все примеры проверены запуском в Python:
 * строка out — это то, что программа выводит на самом деле.
 */
var LESSON = {
  code: '8.2.1.4',
  title: 'Кортеж (tuple)',
  goal: 'Познакомиться с кортежами: чем они отличаются от списков, какие у них есть методы и где их применяют.',
  goalMap: [
    { part: 'чем кортеж отличается от списка',
      where: 'Этап 3, блоки «Читается точно как список» и «Но изменить нельзя»',
      check: 'Этап 4: задания 1 и 3 · Этап 5: задание 1' },
    { part: 'какие у кортежа есть методы',
      where: 'Этап 3, блок «Поэтому методов всего два»',
      check: 'Этап 4: задания 2, 5, 7 · Этап 5: задания 2 и 3' },
    { part: 'где кортежи применяют',
      where: 'Этап 3, блоки «Распаковка», «Список ↔ кортеж» и «Где применяют»',
      check: 'Этап 5: задания 4 и 5' }
  ],
  reached: 'Цель считается достигнутой, когда ученик набрал не меньше 6 из 10 на этапе 4 ' +
           'и не меньше 6 из 10 на этапе 5. Полностью — после задания 5 этапа «Практика».',
  outcomes: [
    { level: 'Все', text: 'создают кортеж, берут элемент по индексу и объясняют, чем кортеж отличается от списка' },
    { level: 'Большинство', text: 'применяют count и index, распаковывают кортеж в переменные и объясняют, почему у кортежа нет append и sort' },
    { level: 'Некоторые', text: 'осознанно выбирают кортеж или список под задачу и возвращают несколько значений одним кортежем' }
  ],
  blocks: [
    {
      heading: 'Читается точно как список',
      ask: 'Что из этого сработает с кортежем: взять элемент по индексу, узнать длину, сделать срез, проверить «есть ли элемент»?',
      text: 'Кортеж записывают в круглых скобках. Индексы, длина, срезы и проверка «есть ли элемент» работают так же, как у списка. Ничего нового учить не нужно.',
      code: 'spisok = [1, 2, 3]\nkortezh = (1, 2, 3)\nprint(spisok[0], kortezh[0])\nprint(len(kortezh), 2 in kortezh, kortezh[1:])',
      out: '1 1\n3 True (2, 3)'
    },
    {
      heading: 'Но изменить нельзя — в этом вся суть',
      ask: 'Пусть t = (1, 2, 3). Что произойдёт, если написать t[0] = 9?',
      text: 'Список можно менять, кортеж — нет. Попытка записать новое значение сразу даёт ошибку.',
      code: 't = (1, 2, 3)\nt[0] = 9',
      out: "TypeError: 'tuple' object does not support item assignment"
    },
    {
      heading: 'Поэтому методов всего два',
      ask: 'У списка одиннадцать методов. Как думаете, сколько методов у кортежа? И главное — почему именно столько?',
      text: 'У списка одиннадцать методов, у кортежа — два: count и index. Остальные девять меняли бы список, а кортеж меняться не умеет. Это не нужно запоминать: достаточно понять причину.',
      code: 't = (5, 7, 5, 5)\nprint(t.count(5), t.index(7))',
      out: '3 1'
    },
    {
      heading: 'Кортеж делает запятая, а не скобки',
      ask: 'Что такое (5) — кортеж из одного элемента или просто число? А что такое (5,)?',
      text: 'Скобки нужны для читаемости, а кортежем запись делает именно запятая. Без запятой в скобках остаётся то, что там и было: число или строка. Попробуйте в редакторе убрать и вернуть запятую.',
      code: 'a = (5)\nb = (5,)\nc = 1, 2, 3\nd = (\'привет\')\ne = (\'привет\',)\n' +
            'print(type(a).__name__, type(b).__name__, type(c).__name__)\n' +
            'print(type(d).__name__, type(e).__name__)',
      out: 'int tuple tuple\nstr tuple'
    },
    {
      heading: 'Распаковка: кортеж сразу в несколько переменных',
      ask: 'В кортеже point лежат координаты (3, 7). Как достать их в переменные x и y? Сколько строк кода нужно?',
      text: 'Одной строки достаточно: слева перечисляем столько имён, сколько элементов в кортеже, и каждое получает своё значение по порядку.',
      code: "point = (3, 7)\nx, y = point\nprint('x =', x)\nprint('y =', y)",
      out: 'x = 3\ny = 7'
    },
    {
      heading: 'Обмен значениями без третьей переменной',
      ask: 'В a лежит 1, в b лежит 2. Как поменять их местами? Обычно заводят третью переменную — можно ли обойтись без неё?',
      text: 'Справа от знака равенства Python сначала собирает кортеж (b, a), и только потом раскладывает его по именам слева. Поэтому старые значения не затираются и третья переменная не нужна.',
      code: "a = 1\nb = 2\na, b = b, a\nprint('a =', a)\nprint('b =', b)",
      out: 'a = 2\nb = 1'
    },
    {
      heading: 'Список ↔ кортеж',
      ask: 'Кортеж изменить нельзя. Как тогда получить его же, но отсортированным?',
      text: 'Если кортеж всё-таки нужно изменить, его превращают в список, меняют и собирают обратно. Исходный кортеж при этом остаётся прежним.',
      code: 't = (3, 1, 2)\ns = list(t)\ns.sort()\nprint(tuple(s))',
      out: '(1, 2, 3)'
    },
    {
      heading: 'Где применяют',
      ask: 'Где в программе пригодится набор значений, который не должен разъезжаться и меняться по ошибке?',
      text: 'Координаты точки (x, y) и размер экрана (ширина, высота) — пара чисел, которая не должна разъезжаться. Дата (день, месяц, год). Значения, которые не должны измениться по ошибке. И возврат нескольких значений из функции сразу.',
      code: '',
      out: ''
    }
  ],
  mistakes: [
    { wrong: 'a = (5)', why: 'это не кортеж, а число 5. Кортеж из одного элемента пишут с запятой: (5,)' },
    { wrong: 't.append(4)', why: "AttributeError: 'tuple' object has no attribute 'append'. У кортежа нет методов, которые его меняют" },
    { wrong: 'Кортеж нельзя изменить = переменную нельзя переприсвоить', why: 't = (3, 4) после t = (1, 2) работает: это новый кортеж, а не изменение старого' }
  ],
  check: {
    total: 10,
    intro: 'Короткая проверка: поняли ли вы новую тему. Задания разного вида, всего 10 баллов.',
    items: [
      { kind: 'tf', points: 1, text: 'Кортеж можно изменить после создания.', answer: false,
        note: 'Нельзя. Попытка записать новое значение даёт TypeError.' },
      { kind: 'tf', points: 1, text: 'У кортежа есть методы count и index.', answer: true,
        note: 'Именно эти два и остались: они ничего не меняют.' },
      { kind: 'tf', points: 1, text: '(5) — это кортеж из одного элемента.', answer: false,
        note: '(5) — это число. Кортеж из одного элемента пишут с запятой: (5,).' },
      { kind: 'gap', points: 1, text: 'Допишите, чтобы получился кортеж из одного элемента: t = (7 ___ )',
        accept: [','], note: 'Кортеж делает запятая: (7,).' },
      { kind: 'gap', points: 1, text: 'Сколько методов у кортежа? Напишите числом.',
        accept: ['2', 'два'], note: 'Два: count и index.' },
      { kind: 'choice', points: 1, text: 'Что выведет print(len((1, 2, 3)))?',
        options: ['2', '3', '4', 'Ошибка'], answer: 1, note: 'В кортеже три элемента.' },
      { kind: 'choice', points: 1, text: 'Какой метод у кортежа ЕСТЬ?',
        options: ['append', 'sort', 'index', 'clear'], answer: 2,
        note: 'Остальные три меняли бы кортеж, а он не меняется.' },
      { kind: 'match', points: 3, text: 'Сопоставьте запись и то, что она делает.',
        left: ['t.count(x)', 't.index(x)', 'tuple(s)'],
        right: ['сколько раз x встречается в t', 'на каком месте стоит x', 'превращает список s в кортеж'],
        note: 'count считает, index показывает место, tuple превращает список в кортеж.' }
    ]
  },

  work: {
    total: 10,
    intro: 'Практическая работа. В каждом задании напишите только выражение или одну строку кода — без print, если не просят. По 2 балла за задание.',
    tasks: [
      { points: 2, text: 'Напишите выражение, которое создаёт кортеж из одного числа 7.',
        accept: ['(7,)', '7,'], note: 'Запятая обязательна: (7,).' },
      { points: 2, text: 'Дано t = (4, 8, 4, 1). Напишите выражение, которое даёт количество четвёрок.',
        accept: ['t.count(4)'], note: 't.count(4) вернёт 2.' },
      { points: 2, text: 'Для того же t напишите выражение, которое даёт место числа 8.',
        accept: ['t.index(8)'], note: 't.index(8) вернёт 1: отсчёт с нуля.' },
      { points: 2, text: 'Дан список s = [5, 2, 9]. Напишите выражение, которое превращает его в кортеж.',
        accept: ['tuple(s)'], note: 'tuple(s) даст (5, 2, 9).' },
      { points: 2, text: 'Поменяйте местами значения a и b одной строкой, без третьей переменной.',
        accept: ['a,b=b,a', 'a, b = b, a'], note: 'a, b = b, a — справа собирается кортеж, слева распаковывается.' }
    ]
  },

  reflection: {
    question: 'Как вы поняли новую тему?',
    options: ['Понял всё, могу объяснить другому', 'Понял, но нужно ещё примеров', 'Почти ничего не понял'],
    open: 'Что осталось непонятным? Напишите своими словами.'
  },

  homework: {
    intro: 'Домашнее задание не отправляется и не оценивается автоматически — приносите в тетради или в файле.',
    tasks: [
      'Создайте кортеж из пяти чисел. Выведите первый и последний элементы.',
      'Дан кортеж оценок t = (5, 4, 5, 3, 5). Найдите, сколько пятёрок и на каком месте стоит тройка.',
      'Запишите координаты трёх точек тремя кортежами и выведите сумму всех x.',
      'Дан список s = [7, 1, 4]. Отсортируйте его и получите из него кортеж, не меняя исходный список.',
      'Объясните письменно в двух предложениях, почему у кортежа нет метода append.'
    ]
  }
};

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
  ensureSheet_(ss, SHEET_STAGES,
    ['Время', 'Класс', 'Ученик', 'Этап', 'Балл', 'Максимум', 'Подробности', 'ID отправки']);

  var resultsHeader = ['Время', 'Класс', 'Ученик', 'Email', 'Попытка', 'Балл', 'Максимум'];
  for (var i = 0; i < QUESTIONS.length; i++) {
    resultsHeader.push(QUESTIONS[i].id + ' (' + QUESTIONS[i].topic + ')');
  }
  resultsHeader.push('ID отправки');
  ensureSheet_(ss, SHEET_RESULTS, resultsHeader);

  var keep = [SHEET_CLASSES, SHEET_ANSWERS, SHEET_RESULTS, SHEET_DIALOG, SHEET_NOTIFY, SHEET_STAGES];
  var sheets = ss.getSheets();
  for (var j = 0; j < sheets.length; j++) {
    if (keep.indexOf(sheets[j].getName()) === -1 && sheets[j].getLastRow() === 0) {
      ss.deleteSheet(sheets[j]);
    }
  }

  props.setProperty(PROP_TEACHER, Session.getEffectiveUser().getEmail() || '');
  if (!props.getProperty(PROP_TOKEN)) {
    props.setProperty(PROP_TOKEN, Utilities.getUuid().replace(/-/g, '').substring(0, 16));
  }
  // списки классов, если они зашиты в этот же файл
  if (typeof importClasses === 'function') {
    try {
      importClasses();
    } catch (err) {
      Logger.log('Списки классов загрузить не удалось: ' + err.message);
    }
  }

  installAbandonCheck_();

  Logger.log('Версия кода: ' + APP_VERSION);
  Logger.log('Таблица: ' + ss.getUrl());
  Logger.log('Заданий: ' + QUESTIONS.length + ', учеников в списках: ' + countStudents_());
  Logger.log('Страница учителя: та же ссылка /exec — она сама узнает вас по аккаунту.');
  Logger.log('ТОКЕН ДЛЯ ФАЙЛА УЧИТЕЛЯ: ' + props.getProperty(PROP_TOKEN));
  Logger.log('Он уже вписан в ваш файл teacher-file.html. Ученикам его не давать.');
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

/**
 * Какую страницу показать.
 *
 * Без параметров: учителю — его страница, всем остальным — страница
 * ученика. Узнаём по аккаунту, которым выполняли setup(), поэтому
 * учителю достаточно открыть обычную ссылку /exec.
 *
 * ?page=student — посмотреть глазами ученика;
 * ?page=teacher — страница учителя (пустит только вас).
 */
/** Совпадает ли токен из файла учителя с сохранённым. */
function tokenOk_(token) {
  var expected = PropertiesService.getScriptProperties().getProperty(PROP_TOKEN);
  return !!expected && String(token || '') === expected;
}

/**
 * Данные для файла учителя, открытого с диска.
 *
 * Браузер не даёт локальной странице прочитать обычный ответ чужого
 * сервера, поэтому отдаём ответ как JavaScript: файл подключает его
 * тегом <script> и получает данные через функцию обратного вызова.
 */
function serveData_(params) {
  var cb = String(params.callback || 'callback').replace(/[^A-Za-z0-9_$]/g, '');
  var payload;
  if (!tokenOk_(params.key)) {
    payload = { error: 'Неверный токен. Пересоберите файл учителя.' };
  } else {
    try {
      payload = resultsForTeacher_();
    } catch (err) {
      payload = { error: err.message };
    }
  }
  return ContentService
    .createTextOutput(cb + '(' + JSON.stringify(payload) + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function doGet(e) {
  var params = (e && e.parameter) || {};
  if (params.data === 'results') return serveData_(params);

  var page = params.page || '';
  if (!page) page = isTeacher_() ? 'teacher' : 'student';
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

/**
 * Приём результата из автономного файла offline-test.html.
 *
 * Файл работает без интернета и проверяет ответы сам; когда связь
 * появляется, он присылает сюда готовую работу. Ограничение по числу
 * попыток к таким отправкам не применяется: офлайн его соблюдать нечем.
 */
function doPost(e) {
  var out = { ok: false };
  try {
    var p = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    // запись из файла учителя: вопрос ученику
    if (p.type === 'ask') {
      if (!tokenOk_(p.token)) throw new Error('Неверный токен.');
      appendMessage_(p.klass, p.name, p.qid, AUTHOR_TEACHER, p.text, p.uid);
      out.ok = true;
      return ContentService.createTextOutput(JSON.stringify(out))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // работа ученика, этапы 3–5
    if (p.type === 'stage') {
      var r = submitStage(p);
      out.ok = true; out.score = r.score; out.total = r.total;
      return ContentService.createTextOutput(JSON.stringify(out))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var klass = clean_(p.klass).substring(0, 20);
    var name = clean_(p.name).substring(0, 80);
    if (!name) throw new Error('Не указана фамилия.');

    var uid = String(p.uid || '').trim().substring(0, 50);
    var answers = p.answers || {};
    var attempt = String(p.attempt || uid);

    var lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      var log = sheet_(SHEET_ANSWERS);
      for (var i = 0; i < QUESTIONS.length; i++) {
        var q = QUESTIONS[i];
        if (!(q.id in answers)) continue;
        var given = answers[q.id];
        var rowUid = uid + '-' + q.id;
        if (hasUid_(log, 9, rowUid)) continue;
        log.appendRow([new Date(), klass, name, attempt, q.id, q.topic,
                       (given >= 0 && given < q.options.length ? q.options[given] : '—'),
                       (given === q.correct) ? 1 : 0, rowUid]);
      }
    } finally {
      lock.releaseLock();
    }

    var result = finishAttempt({
      uid: uid, attempt: attempt, klass: klass, name: name,
      answers: answers, addToClass: !!p.addToClass, skipLimit: true
    });
    out.ok = true;
    out.score = result.score;
    out.total = result.total;
    out.duplicate = result.duplicate;
  } catch (err) {
    out.error = err.message;
  }
  return ContentService.createTextOutput(JSON.stringify(out))
    .setMimeType(ContentService.MimeType.JSON);
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

/**
 * Задания без правильных ответов плюс списки классов.
 *
 * Порядок у всех одинаковый — тот, в котором задания идут в QUESTIONS.
 * Это повторение, а не контрольная: номер задания на экране ученика
 * совпадает с номером на экране учителя, и класс можно разбирать вместе.
 */
function getStudentData() {
  var order = QUESTIONS.slice();
  return {
    version: APP_VERSION,
    lesson: LESSON,
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

  if (!(p && p.skipLimit)) {
    var access = checkAccess(klass, name);
    if (!access.allowed) throw new Error(access.reason);
  }

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
  return resultsForTeacher_();
}

/** Вся сводка для учителя. Доступ проверяется выше по вызову. */
function resultsForTeacher_() {

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
      id: q.id, number: idx + 1, topic: q.topic, text: q.text, code: q.code, note: q.note,
      options: optionStats, correctText: q.options[q.correct],
      correct: q.correct,
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

  // полный список класса — для кнопки «кто отвечает» на странице учителя
  var roster = [];
  expected.forEach(function (c) {
    c.students.forEach(function (n) { roster.push({ klass: c.klass, name: n }); });
  });

  return {
    version: APP_VERSION,
    lesson: LESSON,
    roster: roster,
    stages: stageResults_(),
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
/* Этапы 3–5: понимание, практическая работа, рефлексия                */
/* ------------------------------------------------------------------ */

var STAGE_NAMES = { check: 'Проверка понимания', work: 'Практическая работа', reflection: 'Рефлексия' };

/** Приводит ответ к виду, в котором его можно сравнивать. */
function norm_(value) {
  return String(value === undefined || value === null ? '' : value)
    .toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, '').trim();
}

function accepted_(given, list) {
  var g = norm_(given);
  if (!g) return false;
  for (var i = 0; i < list.length; i++) {
    if (norm_(list[i]) === g) return true;
  }
  return false;
}

/** Проверяет этап 3. answers: { '0': ..., '1': ... } по номеру задания. */
function gradeCheck_(answers) {
  var items = LESSON.check.items, score = 0, detail = [];
  for (var i = 0; i < items.length; i++) {
    var it = items[i], given = answers[String(i)], got = 0;

    if (it.kind === 'tf') {
      if (typeof given === 'boolean' && given === it.answer) got = it.points;
    } else if (it.kind === 'choice') {
      if (given === it.answer) got = it.points;
    } else if (it.kind === 'gap') {
      if (accepted_(given, it.accept)) got = it.points;
    } else if (it.kind === 'match') {
      var pairs = given || {};
      for (var k = 0; k < it.left.length; k++) {
        if (Number(pairs[String(k)]) === k) got++;      // верная пара стоит на своём месте
      }
    }
    score += got;
    detail.push({ n: i + 1, got: got, max: it.points, note: it.note });
  }
  return { score: score, total: LESSON.check.total, detail: detail };
}

/** Проверяет этап 4. */
function gradeWork_(answers) {
  var tasks = LESSON.work.tasks, score = 0, detail = [];
  for (var i = 0; i < tasks.length; i++) {
    var t = tasks[i], given = answers[String(i)];
    var ok = accepted_(given, t.accept);
    if (ok) score += t.points;
    detail.push({ n: i + 1, got: ok ? t.points : 0, max: t.points,
                  given: String(given || '').substring(0, 120), note: t.note });
  }
  return { score: score, total: LESSON.work.total, detail: detail };
}

/**
 * Приём этапа от ученика.
 * p = { uid, klass, name, stage: 'check'|'work'|'reflection', answers, choice, text }
 */
function submitStage(p) {
  var klass = clean_(p && p.klass).substring(0, 20);
  var name = clean_(p && p.name).substring(0, 80);
  if (!name) throw new Error('Не выбрана фамилия.');

  var stage = String((p && p.stage) || '');
  if (!STAGE_NAMES[stage]) throw new Error('Неизвестный этап.');

  var uid = String((p && p.uid) || '').trim().substring(0, 50);
  var answers = (p && p.answers) || {};
  var result, details;

  if (stage === 'check') {
    result = gradeCheck_(answers);
    details = result.detail.map(function (d) { return d.n + ':' + d.got; }).join(' ');
  } else if (stage === 'work') {
    result = gradeWork_(answers);
    details = result.detail.map(function (d) { return d.n + ':' + d.got; }).join(' ');
  } else {
    var choice = String((p && p.choice) || '');
    var text = String((p && p.text) || '').substring(0, 1000);
    result = { score: '', total: '', detail: [], choice: choice, text: text };
    details = choice + (text ? ' — ' + text : '');
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var sheet = sheet_(SHEET_STAGES);
    if (!uid || !hasUid_(sheet, 8, uid)) {
      sheet.appendRow([new Date(), klass, name, STAGE_NAMES[stage],
                       result.score, result.total, details, uid]);
    }
  } finally {
    lock.releaseLock();
  }
  return result;
}

/** Что сдал каждый ученик по этапам 3–5. */
function stageResults_() {
  var out = {};
  rows_(SHEET_STAGES, 8).forEach(function (row) {
    var name = clean_(row[2]);
    if (!name) return;
    var k = key_(row[1], name);
    out[k] = out[k] || { klass: clean_(row[1]), name: name };
    var stage = String(row[3] || '');
    if (stage === STAGE_NAMES.check) out[k].check = { score: row[4], total: row[5] };
    else if (stage === STAGE_NAMES.work) out[k].work = { score: row[4], total: row[5] };
    else if (stage === STAGE_NAMES.reflection) out[k].reflection = String(row[6] || '');
  });
  return out;
}

/* ------------------------------------------------------------------ */
/* Письмо-сводка                                                       */
/* ------------------------------------------------------------------ */

/**
 * Одно письмо на всё, что пришло с прошлой проверки: сданные работы
 * по повторению и этапы 3–5. Домашнее задание не собирается и в письмо
 * не попадает. Письма идут сводкой, а не по одному на ученика:
 * у обычного аккаунта Gmail дневной лимит около 100 писем.
 */
function sendDigest() {
  var props = PropertiesService.getScriptProperties();
  var to = props.getProperty(PROP_TEACHER);
  if (!to) return 0;

  var since = Number(props.getProperty(PROP_DIGEST) || 0);
  var now = new Date().getTime();
  var lines = [], count = 0;

  var width = 7 + QUESTIONS.length + 1;
  rows_(SHEET_RESULTS, width).forEach(function (row) {
    var t = dateOf_(row[0]);
    if (!t || t.getTime() <= since) return;
    lines.push('• ' + clean_(row[1]) + ', ' + clean_(row[2]) +
               ' — повторение: ' + row[5] + ' из ' + row[6]);
    count++;
  });

  rows_(SHEET_STAGES, 8).forEach(function (row) {
    var t = dateOf_(row[0]);
    if (!t || t.getTime() <= since) return;
    var stage = String(row[3] || '');
    var score = (row[4] === '' || row[4] === null)
      ? String(row[6] || '')
      : row[4] + ' из ' + row[5];
    lines.push('• ' + clean_(row[1]) + ', ' + clean_(row[2]) + ' — ' + stage + ': ' + score);
    count++;
  });

  props.setProperty(PROP_DIGEST, String(now));
  if (!count) return 0;

  lines.sort();
  MailApp.sendEmail(to,
    'Урок «' + LESSON.title + '»: новых работ — ' + count,
    'С прошлой проверки пришло:\n\n' + lines.join('\n') +
    '\n\nДомашнее задание не собирается.\n\nТаблица: ' +
    (openSpreadsheet_() ? openSpreadsheet_().getUrl() : '') + '\n');
  Logger.log('Сводка отправлена на ' + to + ', строк: ' + count);
  return count;
}

/** Обе проверки за один запуск по расписанию. */
function checkAndNotify() {
  try { checkAbandoned(); } catch (err) { Logger.log('checkAbandoned: ' + err.message); }
  try { sendDigest(); } catch (err) { Logger.log('sendDigest: ' + err.message); }
}

/* ------------------------------------------------------------------ */
/* Письмо учителю, если ученик бросил тест                             */
/* ------------------------------------------------------------------ */

/** Ставит проверку по расписанию. Старые такие же проверки удаляет. */
function installAbandonCheck_() {
  try {
    var triggers = ScriptApp.getProjectTriggers();
    for (var i = 0; i < triggers.length; i++) {
      if (triggers[i].getHandlerFunction() === 'checkAbandoned' ||
          triggers[i].getHandlerFunction() === 'checkAndNotify') {
        ScriptApp.deleteTrigger(triggers[i]);
      }
    }
    ScriptApp.newTrigger('checkAndNotify')
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
    if (triggers[i].getHandlerFunction() === 'checkAbandoned' ||
        triggers[i].getHandlerFunction() === 'checkAndNotify') {
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
  [SHEET_ANSWERS, SHEET_RESULTS, SHEET_DIALOG, SHEET_NOTIFY, SHEET_STAGES].forEach(function (name) {
    var sheet = sheet_(name);
    if (sheet.getLastRow() > 1) sheet.deleteRows(2, sheet.getLastRow() - 1);
  });
  Logger.log('Ответы, итоги, переписка и отправленные уведомления очищены. ' +
             'Списки классов не тронуты.');
}

/** Проверка настройки: выполните, если что-то не работает. */
function diagnose() {
  var props = PropertiesService.getScriptProperties();
  Logger.log('Версия кода в редакторе: ' + APP_VERSION +
             ' (на странице внизу должна быть такая же; если другая — ' +
             'разверните новую версию)');
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

  [SHEET_CLASSES, SHEET_ANSWERS, SHEET_RESULTS, SHEET_DIALOG, SHEET_NOTIFY, SHEET_STAGES].forEach(function (name) {
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
      if (t.getHandlerFunction() === 'checkAndNotify') armed++;
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
