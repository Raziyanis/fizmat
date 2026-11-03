/**
 * Сервер урока «Одномерный массив. Список · 8 класс» (Google Apps Script).
 *
 * Что делает:
 *  1. Хранит СПИСОК УЧАЩИХСЯ на листе «Список» (столбцы: Класс | Фамилия Имя).
 *     Страница урока загружает его отсюда: <script src="…/exec?roster=1">.
 *  2. Принимает ответы урока (POST из страницы, app = "fizmat-lesson"):
 *     лист «Итоги» — одна строка на ученика, лист «Попытки» — все попытки.
 *  3. Когда ученик нажимает «📨 Отправить ответы учителю», отправляет письмо
 *     на TEACHER_EMAIL со сводкой и всеми попытками ученика.
 *
 * Первый запуск: выберите функцию setup → «Выполнить» → разрешите доступ
 * (это обязательно: без разрешения MailApp письма не отправляются).
 * После ЛЮБОГО изменения кода: «Начать развертывание → Управление развертываниями
 * → ✏ → Версия: Новая версия → Развернуть». Доступ: «Все» (Anyone).
 */

var VERSION = 'версия 8: урок «Математические функции» (Excel) отправляет ответы';
var TEACHER_EMAIL = '';          // пусто = почта владельца скрипта; можно вписать другой адрес
var MAIL_GAP_SEC = 60;           // не чаще одного письма в минуту от одного ученика

/* Начальный список (используется только функцией setup, если лист «Список» пуст).
   Дальше редактируйте список прямо в таблице. */
var ROSTER_INIT = [
  ['8A', 'Әбілхан Жасәмір'],
  ['8A', 'Дайрабай Дінмұхамед'],
  ['8A', 'Ермұхан Жания'],
  ['8A', 'Исин Бейбарыс'],
  ['8A', 'Қабдыраш Дильназ'],
  ['8A', 'Құдратулла Абылайхан'],
  ['8A', 'Мәжит Аспандияр'],
  ['8A', 'Мұхамбетқазы Нәдір'],
  ['8A', 'Оспанқұл Айсултан'],
  ['8A', 'Сағынтай Іңкәр'],
  ['8A', 'Сеилхан Дәмелі'],
  ['8A', 'Шәріп Бауыржан'],
  ['8B', 'Аманжол Диас'],
  ['8B', 'Әбдуәлі Рахман'],
  ['8B', 'Қайрат Алдияр'],
  ['8B', 'Қалкен Мағжан'],
  ['8B', 'Қуанышпай Інжу'],
  ['8B', 'Мелис Камила'],
  ['8B', 'Оралбай Әлихан'],
  ['8B', 'Русланұлы Амирлан'],
  ['8B', 'Талғат Амина'],
  ['8B', 'Умбеталиев Мансур'],
  ['8B', 'Шералы Нұрали'],
  ['8D', 'Алибекова Жания'],
  ['8D', 'Ахметов Амир'],
  ['8D', 'Биләл Алихан'],
  ['8D', 'Валитхан Әлімжан'],
  ['8D', 'Ганибек Арлин'],
  ['8D', 'Джанасаева Алия'],
  ['8D', 'Дуюмбаева Зере'],
  ['8D', 'Дүйсебай Әлімхан'],
  ['8D', 'Ринатұлы Шыңғыс'],
  ['8D', 'Русланов Рамаз'],
  ['8D', 'Русюк Оксана'],
  ['8D', 'Сулейменова Жания'],
  ['8D', 'Уразбек Інжу'],
  ['8E', 'Айсаров Расул'],
  ['8E', 'Биғазы Балнұр'],
  ['8E', 'Булатов Мадияр'],
  ['8E', 'Кабдулла Назар'],
  ['8E', 'Касымбаева Райана'],
  ['8E', 'Кеңесбек Айя'],
  ['8E', 'Керімбай Димаш'],
  ['8E', 'Ли Руслан'],
  ['8E', 'Мукатов Арслан'],
  ['8E', 'Омарбеков Нурали'],
  ['8E', 'Оспанов Айдан'],
  ['8E', 'Саят Даниал'],
  ['8E', 'Серік Асылжан'],
  ['8E', 'Умаргалиева Селин'],
  ['8F', 'Амірбек Ислам'],
  ['8F', 'Елімбай Іңкәр'],
  ['8F', 'Искакбаев Ансар'],
  ['8F', 'Кеңесбаев Бексұлтан'],
  ['8F', 'Қайыр Ерали'],
  ['8F', 'Мусалимов Амир'],
  ['8F', 'Папенфот Илона'],
  ['8F', 'Рустембеков Алихан'],
  ['8F', 'Сабырбек Байнұр'],
  ['8F', 'Сарсенов Алихан'],
  ['8F', 'Сартаев Алихан'],
  ['8F', 'Спирков Богдан'],
  ['8F', 'Темір Арыстан'],
  ['8F', 'Хасенов Алихан'],
  ['9B', 'Ахмадия Нұрәлі'],
  ['9B', 'Бахтигереева Амира-Челси'],
  ['9B', 'Бекмырза Асхат'],
  ['9B', 'Елемес Әлинұр'],
  ['9B', 'Кайроллин Даниял'],
  ['9B', 'Қайратқызы Мумина'],
  ['9B', 'Нығметолла Дания'],
  ['9B', 'Рахметжан Арсен'],
  ['9B', 'Серікбол Томирис'],
  ['9B', 'Сидалеев Нұрасыл'],
  ['9B', 'Шакизат Ерасыл']
];

/* ---------- таблица ---------- */
function book_() {
  var p = PropertiesService.getScriptProperties(), id = p.getProperty('SHEET_ID');
  if (id) { try { return SpreadsheetApp.openById(id); } catch (e) {} }
  var ss = SpreadsheetApp.getActiveSpreadsheet();          // скрипт привязан к таблице
  if (!ss) ss = SpreadsheetApp.create('Урок: Одномерный массив · 8 класс — ответы');
  p.setProperty('SHEET_ID', ss.getId());
  return ss;
}
var SUM_HEAD = ['Обновлено', 'Класс', 'Ученик', 'Этап', 'Нарушения', 'Повторение', 'Вспомним',
  'Какой метод?', 'Практика Z', 'Практика A', 'Практика B', 'Практика C', 'Сейчас решает', 'Практ. работа',
  'Тест', 'Описания', 'ДЗ', 'Олимпиада', 'Ожидания', 'Ожидания сбылись', 'Итог 1', 'Итог 2', 'Итог 3',
  'Где применю', 'Заметка', 'Сдал (нажал кнопку)', 'Письмо', 'id'];
var ATT_HEAD = ['Время', 'Класс', 'Ученик', 'Этап', 'Задание', 'Ответ ученика', 'Правильный ответ', 'Верно', 'Комментарий', 'id', 'Ключ'];
var ATT_ID = 9, ATT_KEY = 10;    // номера столбцов id и ключа попытки (с нуля)
function sheet_(name, head) {
  var ss = book_(), sh = ss.getSheetByName(name);
  if (sh && sh.getLastRow() > 0 && String(sh.getRange(1, head.length).getValue()) !== head[head.length - 1]) {
    sh.setName(name + ' (старый формат ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd.MM HH:mm') + ')');
    sh = null;                     // столбцы изменились: старый лист сохраняется под другим именем
  }
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(head); sh.setFrozenRows(1); sh.getRange(1, 1, 1, head.length).setFontWeight('bold'); }
  return sh;
}
function teacher_() { return TEACHER_EMAIL || Session.getEffectiveUser().getEmail(); }

/* ---------- список учащихся ---------- */
function roster_() {
  var sh = sheet_('Список', ['Класс', 'Фамилия Имя']), v = sh.getDataRange().getValues(), R = {};
  for (var i = 1; i < v.length; i++) {
    var c = String(v[i][0]).trim(), n = String(v[i][1]).trim();
    if (!c || !n) continue;
    (R[c] = R[c] || []).push(n);
  }
  return R;
}
var LAT2CYR = { A: 'А', B: 'В', C: 'С', E: 'Е', H: 'Н', K: 'К', M: 'М', O: 'О', P: 'Р', T: 'Т', X: 'Х', D: 'Д', F: 'Ф', G: 'Г', L: 'Л', I: 'И', Z: 'З', S: 'С', Y: 'У', R: 'Р', N: 'Н', V: 'В', U: 'У' };
function normClass_(v) { return String(v).toUpperCase().replace(/\s+/g, '').replace(/[A-Z]/g, function (ch) { return LAT2CYR[ch] || ch; }); }
var KZ = { 'ә': 'а', 'ғ': 'г', 'қ': 'к', 'ң': 'н', 'ө': 'о', 'ұ': 'у', 'ү': 'у', 'һ': 'х', 'і': 'и', 'ё': 'е', 'й': 'и' };
function sig_(x) {
  return String(x).toLowerCase().replace(/[әғқңөұүһіёй]/g, function (ch) { return KZ[ch]; })
    .replace(/[^a-zа-я ]/g, '').replace(/\s+/g, ' ').trim().split(' ').sort().join(' ');
}
/* Есть ли ученик в списке своего класса (так же, как проверяет страница) */
function inRoster_(cls, name) {
  var R = roster_(), keys = Object.keys(R);
  if (!keys.length) return true;
  var key = keys.filter(function (k) { return normClass_(k) === normClass_(cls); })[0];
  if (!key) return false;
  var want = sig_(name);
  return R[key].some(function (full) {
    return sig_(full) === want || sig_(String(full).split(/\s+/).slice(0, 2).join(' ')) === want;
  });
}

/* ---------- веб-приложение ---------- */
function doGet(e) {
  var q = (e && e.parameter) || {};
  if (q.roster) {
    var js = 'window.ROSTER = ' + JSON.stringify(roster_()) + ';';
    if (q.callback && /^[\w.$]+$/.test(q.callback)) js = q.callback + '(' + JSON.stringify(roster_()) + ');';
    return ContentService.createTextOutput(js).setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput('ok: скрипт урока работает (' + VERSION + '). Таблица: ' + book_().getUrl());
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var p = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (p.app !== 'fizmat-lesson') return out_('skip');
    if (!p.id || !p.cls || !p.name) return out_('error: нет данных ученика');
    if (!inRoster_(p.cls, p.name)) return out_('error: ученика «' + p.name + ', ' + p.cls + '» нет в списке класса');
    lock.waitLock(20000);
    saveAttempts_(p);
    var row = saveSummary_(p);
    lock.releaseLock();
    if (p.finish) {
      var err = mail_(p, row);
      if (err) return out_('error: ответы сохранены, но письмо учителю не отправлено — ' + err);
    }
    return out_('ok');
  } catch (x) {
    return out_('error: ' + (x && x.message ? x.message : x));
  } finally {
    try { lock.releaseLock(); } catch (z) {}
  }
}
function out_(t) { return ContentService.createTextOutput(t).setMimeType(ContentService.MimeType.TEXT); }

/* Попытки приходят порциями, а при нажатии «Отправить ответы учителю» — все сразу.
   У каждой попытки есть ключ (ученик + время + задание): записанные попытки не повторяются,
   а пропавшие (например, если строки удалили) записываются заново. */
function saveAttempts_(p) {
  var a = p.attempts || [];
  if (!a.length) return;
  var sh = sheet_('Попытки', ATT_HEAD), tz = Session.getScriptTimeZone(), n = sh.getLastRow(), have = {};
  if (n > 1) sh.getRange(2, ATT_KEY + 1, n - 1, 1).getValues().forEach(function (r) { have[r[0]] = 1; });
  var rows = [];
  a.forEach(function (x) {
    var key = p.id + '|' + (x.t || '') + '|' + (x.task || '');
    if (have[key]) return;
    have[key] = 1;
    rows.push([Utilities.formatDate(new Date(x.t || Date.now()), tz, 'dd.MM.yyyy HH:mm:ss'), p.cls, p.name,
      x.stage || '', x.task || '', String(x.answer || '').slice(0, 3000), String(x.right || '').slice(0, 3000),
      x.ok ? 'да' : 'нет', String(x.note || '').slice(0, 3000), p.id, key]);
  });
  if (rows.length) sh.getRange(n + 1, 1, rows.length, ATT_HEAD.length).setValues(rows);
}

function saveSummary_(p) {
  var s = p.summary || {}, sh = sheet_('Итоги', SUM_HEAD), tz = Session.getScriptTimeZone();
  var now = Utilities.formatDate(new Date(), tz, 'dd.MM.yyyy HH:mm:ss');
  var ids = sh.getRange(1, SUM_HEAD.length, Math.max(sh.getLastRow(), 1), 1).getValues().map(function (r) { return String(r[0]); });
  var r = ids.indexOf(String(p.id)) + 1;
  var old = r > 1 ? sh.getRange(r, 1, 1, SUM_HEAD.length).getValues()[0] : [];
  var row = [now, p.cls, p.name, s.stage || '', s.viol || 0, s.rev || '', s.act || '', s.match || '',
    s.z || '', s.a || '', s.b || '', s.c || '', s.now || '', s.pj || '', s.test || '', s.desc || '',
    s.hw || '', s.olymp || '', s.expect || '', s.expOk || '', s.r0 || '', s.r1 || '', s.r2 || '',
    s.use || '', s.note || '', p.finish ? now : (old[25] || ''), old[26] || '', p.id];
  if (r > 1) sh.getRange(r, 1, 1, row.length).setValues([row]);
  else { sh.appendRow(row); r = sh.getLastRow(); }
  return r;
}

/* ---------- письмо учителю ---------- */
function esc_(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
/* Тест и домашнее задание — дополнительные: в отчёт и балл не входят (в таблице «Попытки» они остаются) */
var SKIP_STAGES = /Тест|Домашн|Нарушение|Бұзушылық/;   // по названию этапа: номера этапов в уроках разные

/* Отчёт по заданиям: одна строка на задание.
   ✓ — задание решено (показан верный ответ ученика), ✗ — не решено (показан последний ответ). */
function taskReport_(id) {
  var att = sheet_('Попытки', ATT_HEAD).getDataRange().getValues().slice(1)
    .filter(function (r) { return String(r[ATT_ID]) === String(id) && !SKIP_STAGES.test(String(r[3])); });
  var map = {}, order = [];
  att.forEach(function (r) {
    var k = r[3] + '\u0001' + r[4], t = map[k];
    if (!t) { t = map[k] = { stage: String(r[3]), task: String(r[4]), n: 0, ok: false }; order.push(k); }
    t.n++;
    if (!t.ok) { t.ok = r[7] === 'да'; t.answer = r[5]; t.right = r[6]; t.note = r[8]; }
  });
  var tasks = order.map(function (k) { return map[k]; });
  tasks.sort(function (a, b) { return (parseInt(a.stage, 10) || 99) - (parseInt(b.stage, 10) || 99); });
  return tasks;
}

function mail_(p, row) {
  var cache = CacheService.getScriptCache(), ck = 'm:' + p.id;
  if (cache.get(ck)) return '';                      // письмо уже ушло меньше минуты назад
  if (MailApp.getRemainingDailyQuota() < 1) return 'исчерпан дневной лимит писем Google (у gmail.com — 100 в сутки); ответы есть в таблице';
  var s = p.summary || {}, tasks = taskReport_(p.id);
  var good = tasks.filter(function (t) { return t.ok; }).length;
  var sum = [['Этап', s.stage], ['Повторение', s.rev], ['Вспомним', s.act], ['Какой метод?', s.match],
    ['Практика 0 / A / B / C', [s.z, s.a, s.b, s.c].join(' · ')], ['Работа в Excel', s.ex], ['Описания', s.desc],
    ['Практическая работа: задачи 1–3', s.pj], ['Практическая работа: задачи 4–10', s.olymp], ['Нарушения', s.viol],
    ['Ожидания', s.expect], ['Ожидания сбылись', s.expOk], ['Итоги', [s.r0, s.r1, s.r2].join(' · ')],
    ['Где применю', s.use], ['Заметка', s.note]];
  var pre = function (t) { return '<pre style="margin:0;white-space:pre-wrap;font-family:monospace">' + esc_(String(t == null ? '' : t).slice(0, 1500)) + '</pre>'; };
  var html = '<h3>' + esc_(p.name) + ', ' + esc_(p.cls) + '</h3><p>' + esc_(p.lesson || '') +
    (p.auto ? ' · <i>отправлено автоматически: ученик закрыл окно урока</i>' : '') + '</p>' +
    '<p style="font-size:16px"><b>Решено верно: ' + good + ' из ' + tasks.length + ' заданий, к которым ученик приступал</b>' +
    ' <span style="color:#666">(тест и домашнее задание не учитываются)</span></p>' +
    '<table border="1" cellpadding="4" style="border-collapse:collapse">' +
    sum.filter(function (x) { return x[1] != null && String(x[1]).replace(/[ ·]/g, '') !== ''; }).map(function (x) { return '<tr><td><b>' + esc_(x[0]) + '</b></td><td>' + esc_(x[1]) + '</td></tr>'; }).join('') +
    '</table><h4>Отчёт по заданиям</h4>' +
    '<table border="1" cellpadding="4" style="border-collapse:collapse;font-size:13px">' +
    '<tr><th>Этап</th><th>Задание</th><th>Итог</th><th>Ответ ученика</th><th>Правильный ответ</th><th>Попыток</th><th>Комментарий</th></tr>' +
    tasks.map(function (t) {
      return '<tr style="background:' + (t.ok ? '#eef7f2' : '#fdeceb') + '"><td>' + esc_(t.stage) + '</td><td>' + esc_(t.task) + '</td><td style="text-align:center;font-size:16px">' +
        (t.ok ? '✓' : '✗') + '</td><td>' + pre(t.answer) + '</td><td>' + pre(t.right) + '</td><td style="text-align:center">' + t.n + '</td><td>' + (t.ok ? '' : pre(t.note)) + '</td></tr>';
    }).join('') + '</table><p><a href="' + book_().getUrl() + '">Открыть таблицу с ответами</a> (все попытки — на листе «Попытки»)</p>';
  try {
    var pdf = Utilities.newBlob('<html><head><meta charset="utf-8"></head><body style="font-family:Arial,sans-serif">' + html + '</body></html>', 'text/html', 'report.html')
      .getAs('application/pdf').setName(p.cls + ' ' + p.name + ' — отчёт.pdf');
    MailApp.sendEmail({ to: teacher_(), subject: 'Отчёт: ' + p.cls + ' · ' + p.name + ' — верно ' + good + ' из ' + tasks.length + (p.auto ? ' (окно закрыто)' : ''),
      htmlBody: html, attachments: [pdf], body: p.name + ', ' + p.cls + ': отчёт во вложении (PDF). Таблица: ' + book_().getUrl(), name: 'Урок fizmat' });
  } catch (x) { return x && x.message ? x.message : String(x); }
  cache.put(ck, '1', MAIL_GAP_SEC);
  sheet_('Итоги', SUM_HEAD).getRange(row, 27).setValue((p.auto ? 'авто ' : 'отправлено ') + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd.MM HH:mm'));
  return '';
}

/* ---------- запустить один раз из редактора ---------- */
function setup() {
  var sh = sheet_('Список', ['Класс', 'Фамилия Имя']);
  // новые ученики из ROSTER_INIT дописываются в конец листа; те, кто уже есть, не повторяются
  var have = {};
  sh.getDataRange().getValues().slice(1).forEach(function (r) { have[normClass_(r[0]) + '|' + sig_(r[1])] = 1; });
  var add = ROSTER_INIT.filter(function (r) { return !have[normClass_(r[0]) + '|' + sig_(r[1])]; });
  if (add.length) sh.getRange(sh.getLastRow() + 1, 1, add.length, 2).setValues(add);
  Logger.log('Добавлено новых учеников: ' + add.length);
  sheet_('Итоги', SUM_HEAD); sheet_('Попытки', ATT_HEAD);
  var def = book_().getSheetByName('Лист1') || book_().getSheetByName('Sheet1');
  if (def && book_().getSheets().length > 1 && def.getLastRow() === 0) book_().deleteSheet(def);
  MailApp.sendEmail(teacher_(), 'Урок fizmat: проверка почты', 'Письма приходят. Таблица с ответами: ' + book_().getUrl());
  Logger.log(VERSION + '. Таблица: ' + book_().getUrl());
  Logger.log('Письмо отправлено на ' + teacher_() + '. Осталось писем на сегодня: ' + MailApp.getRemainingDailyQuota());
}
