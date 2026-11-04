/**
 * Скрипт учителя для урока 9 класса «Кортеж и словарь» (kortezh-slovar-9.html).
 *
 * Что делает:
 *  • отдаёт странице урока список учеников (он записан ниже, в ROSTER);
 *  • принимает ответы учеников и пишет их в таблицу (листы «Итоги», «Попытки», «Состояние»);
 *  • возвращает ученику его сохранённый урок, если он вошёл с другого компьютера;
 *  • присылает учителю письмо с результатами — оно складывается в папку (ярлык) Gmail «ФО»;
 *    таблица с результатами лежит в папке «ФО» на Google Диске. Если папок нет — они создаются.
 *
 * Установка (один раз):
 *  1. script.google.com → «Новый проект» → удалить всё в Code.gs и вставить этот файл целиком.
 *  2. Вверху выбрать функцию setup → «Выполнить» → разрешить доступ (Таблицы, Диск, Gmail).
 *  3. «Начать развертывание» → «Новое развертывание» → тип «Веб-приложение»:
 *       Выполнять как: «Я»;  У кого есть доступ: «Все».
 *     Скопировать ссылку …/exec и вставить её в kortezh-slovar-9.html (строка window.LESSON_URL = "...").
 *  Если ссылка уже вставлена в урок, вместо «Нового развертывания» делайте
 *  «Управление развертываниями» → ✏️ → Версия: «Новая версия» → «Развернуть» — ссылка не изменится.
 *
 * Проверка: откройте …/exec?roster=1 — должно быть window.ROSTER = {"9А":[...], ...};
 * Изменили список учеников — снова «Управление развертываниями» → ✏️ → «Новая версия».
 */

/* ===================== Список учеников ===================== */
const ROSTER = {
  '9А': [
    'Абдыхадыр Хангелді', 'Аймагамбетова Жансая', 'Анварұлы Салих', 'Бегдилдаев Санжар',
    'Дандыбаева Мариам', 'Ермуханбетова Амина', 'Жеңісбекұлы Айбын', 'Какабаев Нурали',
    'Қайырғазы Рахманғазы', 'Рауанұлы Арлан', 'Сейділда Альбаур', 'Тортай Наиля', 'Тұрар Әсет'
  ],
  '9В': [
    'Амангельдина Айару', 'Әлімжан Бексұлтан', 'Демеубай Тахир', 'Көкен Алишер',
    'Қараш Санжар', 'Марат Мадина', 'Мәжит Аяғөз', 'Нұрғалиұлы Абай',
    'Оралханқызы Мерей', 'Сабыр Али', 'Сейлханова Айым', 'Темірхан Дәмелі', 'Тоқан Әди'
  ],
  '9Е': [
    'Елдосқызы Аиша', 'Каримулла Алиби', 'Кин София', 'Қуаныш Асыл',
    'Манкенов Айдар', 'Мұрат Айсері', 'Нурсултан Абай', 'Сахипова Айзере',
    'Сейітжан Іңкәр', 'Серіков Жәңгір', 'Тангулов Мансур', 'Туенбаев Амирсан', 'Шауали Дінмұхаммед'
  ],
  '9F': [
    'Алтай Айбын', 'Базылов Жангирхан', 'Даулеткалиев Адильжан', 'Касенов Алияр',
    'Колкобаева Дамели', 'Курамысов Темирлан', 'Оразымбет Ильяс', 'Садретдинова Элина',
    'Смағұлова Сәтті', 'Ұлан Адия', 'Хасенов Мирас', 'Хати Алдияр', 'Ыдырыс Сүлеймен'
  ]
};

/* ===================== Настройки ===================== */
const FO = 'ФО';                       // папка в Gmail и на Google Диске
const FO_SKIP_INBOX = true;            // true — письмо только в «ФО»; false — и во «Входящих», и в «ФО»
const MAIL_DELAY_MIN = 10;             // ученик закрыл окно и не вернулся — письмо через столько минут
const TABLE_NAME = 'Урок 9 · Кортеж и словарь · результаты';

const LABELS = {
  stage: 'Этап', rev: 'Повторим', act: 'Вспомним', actFirst: 'Вспомним, с 1-й попытки',
  a: 'Практика: кортеж', b: 'Практика: словарь', match: 'Что выбрать?', matchFirst: 'Что выбрать?, с 1-й попытки',
  desc: 'Описания', pj: 'Практ. работа: задачи 1–3', olymp: 'Практ. работа: задачи 4–10', test: 'Тест', hw: 'Домашнее задание',
  expect: 'Ожидания', expOk: 'Ожидания оправдались', r0: 'Результат 1', r1: 'Результат 2', r2: 'Результат 3',
  use: 'Где применю', note: 'Заметка', viol: 'Уходил со страницы', now: 'Сейчас', z: 'z', c: 'c'
};
const SKIP_KEYS = ['id', 'cls', 'name'];

/* ===================== Веб-приложение ===================== */
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.roster) {
    return js_('window.ROSTER = ' + JSON.stringify(rosterAll_()) + ';');
  }
  if (p.state) {
    const cb = /^[\w$]{1,64}$/.test(p.callback || '') ? p.callback : 'callback';
    let st = {};
    try { st = readState_(p.state) || {}; } catch (err) { console.warn(err); }
    return js_(cb + '(' + JSON.stringify(st) + ');');
  }
  return text_('ok: скрипт урока 9 работает');
}

function doPost(e) {
  let d;
  try { d = JSON.parse((e && e.postData && e.postData.contents) || '{}'); } catch (err) { return text_('error: неверные данные'); }
  if (!d || d.app !== 'fizmat-lesson') return text_('skip');
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(25000);
    if (d.addStudent) return text_(addStudent_(d.cls, d.name));
    saveLesson_(d);
    return text_('ok');
  } catch (err) {
    console.error(err);
    return text_('error: ' + ((err && err.message) || err));
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

/* ===================== Установка ===================== */
function setup() {
  const ss = book_();
  ['Итоги', 'Попытки', 'Состояние', 'Добавленные'].forEach(sheet_);
  foLabel_();
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'sendPendingMail') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('sendPendingMail').timeBased().everyMinutes(5).create();
  console.log('Готово. Таблица: ' + ss.getUrl());
}

/* ===================== Ученики ===================== */
const LAT2CYR = { A: 'А', B: 'В', C: 'С', E: 'Е', H: 'Н', K: 'К', M: 'М', O: 'О', P: 'Р', T: 'Т', X: 'Х', D: 'Д', G: 'Г', L: 'Л', I: 'И', Z: 'З', S: 'С', Y: 'У', R: 'Р', N: 'Н', V: 'В', U: 'У' };
function normClass_(v) {
  return String(v || '').toUpperCase().replace(/\s+/g, '').replace(/[A-Z]/g, function (ch) { return LAT2CYR[ch] || ch; });
}

/* Список из ROSTER + ученики, которых добавили кнопкой «Меня нет в списке» */
function rosterAll_() {
  const R = JSON.parse(JSON.stringify(ROSTER));
  try {
    const sh = book_().getSheetByName('Добавленные');
    if (sh && sh.getLastRow() > 1) {
      sh.getRange(2, 1, sh.getLastRow() - 1, 3).getValues().forEach(function (r) {
        const cls = String(r[1] || '').trim(), name = String(r[2] || '').trim();
        if (!cls || !name) return;
        const key = Object.keys(R).filter(function (k) { return normClass_(k) === normClass_(cls); })[0] || cls;
        R[key] = R[key] || [];
        if (R[key].indexOf(name) < 0) R[key].push(name);
      });
    }
  } catch (err) { console.warn(err); }
  return R;
}

function addStudent_(cls, name) {
  cls = String(cls || '').trim(); name = String(name || '').trim().replace(/\s+/g, ' ');
  if (!cls || name.split(' ').length < 2) return 'error: нужны класс, фамилия и имя';
  const all = rosterAll_();
  const key = Object.keys(all).filter(function (k) { return normClass_(k) === normClass_(cls); })[0];
  if (!key) return 'error: такого класса нет в списке';
  if (all[key].indexOf(name) < 0) sheet_('Добавленные').appendRow([new Date(), key, name]);
  return 'ok';
}

/* ===================== Ответы учеников ===================== */
function saveLesson_(d) {
  const id = String(d.id || '').trim();
  if (!id) throw new Error('нет ученика');
  const sum = d.summary || {};
  const props = PropertiesService.getScriptProperties();

  /* Попытки: дописываем только новые (страница присылает номер первой попытки в пакете) */
  const atts = Array.isArray(d.attempts) ? d.attempts : [];
  const nKey = 'n:' + id, have = Number(props.getProperty(nKey) || 0), from = Number(d.from || 0);
  const fresh = atts.slice(Math.max(0, have - from));
  if (fresh.length) {
    const rows = fresh.map(function (a) {
      return [a.t ? new Date(a.t) : new Date(), d.cls || '', d.name || '', a.stage || '', a.task || '',
        cut_(a.answer), cut_(a.right), a.ok ? 'верно' : 'неверно', cut_(a.note)];
    });
    const sh = sheet_('Попытки');
    sh.getRange(sh.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
    props.setProperty(nKey, String(Math.max(have, from + atts.length)));
  }

  writeSummary_(id, d, sum);
  if (d.state) writeState_(id, d.state);

  /* Письмо учителю */
  const pKey = 'pend:' + id;
  if (d.finish) {
    props.deleteProperty(pKey);
    mailResult_(d.cls, d.name, sum, d.lesson, 'ученик нажал «Отправить ответы учителю»');
  } else if (d.closed) {
    if (!d.nomail) props.setProperty(pKey, JSON.stringify({ t: Date.now(), cls: d.cls, name: d.name, lesson: d.lesson, sum: sum }));
  } else {
    props.deleteProperty(pKey); // ученик вернулся к уроку — письмо после закрытия пока не нужно
  }
}

function writeSummary_(id, d, sum) {
  const sh = sheet_('Итоги');
  const fixed = ['Обновлено', 'Ученик (id)', 'Класс', 'Фамилия и имя'];
  let head = sh.getLastRow() ? sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0] : [];
  if (!head.length || head[0] !== fixed[0]) { head = fixed.slice(); }
  const keys = Object.keys(sum).filter(function (k) { return SKIP_KEYS.indexOf(k) < 0; });
  keys.forEach(function (k) { const h = LABELS[k] || k; if (head.indexOf(h) < 0) head.push(h); });
  ['Закрыл окно', 'Отправил сам'].forEach(function (h) { if (head.indexOf(h) < 0) head.push(h); });
  sh.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold');
  sh.setFrozenRows(1);

  const last = sh.getLastRow();
  let row = 0;
  if (last > 1) {
    const ids = sh.getRange(2, 2, last - 1, 1).getValues();
    for (let i = 0; i < ids.length; i++) if (String(ids[i][0]) === id) { row = i + 2; break; }
  }
  const cur = row ? sh.getRange(row, 1, 1, head.length).getValues()[0] : head.map(function () { return ''; });
  cur[0] = new Date(); cur[1] = id; cur[2] = d.cls || ''; cur[3] = d.name || '';
  keys.forEach(function (k) { cur[head.indexOf(LABELS[k] || k)] = cut_(sum[k]); });
  if (d.closed) cur[head.indexOf('Закрыл окно')] = 'да';
  if (d.finish) cur[head.indexOf('Отправил сам')] = 'да';
  sh.getRange(row || last + 1, 1, 1, head.length).setValues([cur]);
}

/* Сохранённый урок ученика: длинный текст делим на куски (в ячейке не больше 50 000 символов) */
function writeState_(id, state) {
  const sh = sheet_('Состояние'), s = JSON.stringify(state), parts = [];
  for (let i = 0; i < s.length; i += 45000) parts.push(s.slice(i, i + 45000));
  const last = sh.getLastRow();
  let row = 0;
  if (last >= 1) {
    const ids = sh.getRange(1, 1, last, 1).getValues();
    for (let i = 0; i < ids.length; i++) if (String(ids[i][0]) === id) { row = i + 1; break; }
  }
  row = row || last + 1;
  const width = Math.max(sh.getLastColumn(), parts.length + 2);
  const vals = [id, new Date()].concat(parts);
  while (vals.length < width) vals.push('');
  sh.getRange(row, 1, 1, width).setValues([vals]);
}

function readState_(id) {
  const sh = book_().getSheetByName('Состояние');
  if (!sh || !sh.getLastRow()) return null;
  const data = sh.getRange(1, 1, sh.getLastRow(), sh.getLastColumn()).getValues();
  for (let i = 0; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) return JSON.parse(data[i].slice(2).join('') || '{}');
  }
  return null;
}

/* ===================== Письма в папку «ФО» ===================== */
/* Запускается само каждые 5 минут (setup): письма тех, кто закрыл окно и не вернулся */
function sendPendingMail() {
  const props = PropertiesService.getScriptProperties(), all = props.getProperties(), now = Date.now();
  Object.keys(all).forEach(function (k) {
    if (k.indexOf('pend:') !== 0) return;
    let p; try { p = JSON.parse(all[k]); } catch (e) { props.deleteProperty(k); return; }
    if (now - p.t < MAIL_DELAY_MIN * 60000) return;
    props.deleteProperty(k);
    try { mailResult_(p.cls, p.name, p.sum || {}, p.lesson, 'ученик закрыл окно урока'); } catch (e) { console.error(e); }
  });
}

function mailResult_(cls, name, sum, lesson, why) {
  const tz = Session.getScriptTimeZone();
  const subject = 'ФО · ' + (cls || '') + ' · ' + (name || '') + ' · ' + Utilities.formatDate(new Date(), tz, 'dd.MM HH:mm');
  const rows = Object.keys(sum).filter(function (k) { return SKIP_KEYS.indexOf(k) < 0 && sum[k] !== '' && sum[k] != null; })
    .map(function (k) { return [LABELS[k] || k, String(sum[k])]; });
  const esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
  const body = (lesson || 'Урок 9') + '\n' + name + ', ' + cls + ' (' + why + ')\n\n' +
    rows.map(function (r) { return r[0] + ': ' + r[1]; }).join('\n') + '\n\nТаблица: ' + book_().getUrl();
  const html = '<p><b>' + esc(lesson || 'Урок 9') + '</b><br>' + esc(name) + ', ' + esc(cls) + ' <i>(' + esc(why) + ')</i></p>' +
    '<table cellpadding="4" style="border-collapse:collapse">' +
    rows.map(function (r) { return '<tr><td style="border:1px solid #ccc">' + esc(r[0]) + '</td><td style="border:1px solid #ccc">' + esc(r[1]) + '</td></tr>'; }).join('') +
    '</table><p><a href="' + book_().getUrl() + '">Открыть таблицу с результатами</a></p>';
  GmailApp.sendEmail(Session.getEffectiveUser().getEmail(), subject, body, { htmlBody: html, name: 'Урок 9 · Python' });
  putInFo_(subject);
}

function foLabel_() { return GmailApp.getUserLabelByName(FO) || GmailApp.createLabel(FO); }

function putInFo_(subject) {
  const label = foLabel_();
  for (let i = 0; i < 6; i++) {
    Utilities.sleep(1500);
    const th = GmailApp.search('in:anywhere newer_than:1d subject:"' + String(subject).replace(/"/g, '') + '"', 0, 1);
    if (th.length) { th[0].addLabel(label); if (FO_SKIP_INBOX) th[0].moveToArchive(); return; }
  }
}

/* Пробное письмо: выбрать testMail → «Выполнить» — письмо должно появиться в папке «ФО» */
function testMail() {
  mailResult_('9А', 'Проверка Письма', { stage: 'Тест', test: '5/5' }, 'Урок 9 · проверка', 'пробный запуск');
}

/* ===================== Служебное ===================== */
function book_() {
  if (book_.ss) return book_.ss;
  let ss = null;
  try { ss = SpreadsheetApp.getActiveSpreadsheet(); } catch (e) {}
  if (!ss) {
    const props = PropertiesService.getScriptProperties(), id = props.getProperty('SS_ID');
    if (id) { try { ss = SpreadsheetApp.openById(id); } catch (e) { ss = null; } }
    if (!ss) {
      ss = SpreadsheetApp.create(TABLE_NAME);
      props.setProperty('SS_ID', ss.getId());
    }
  }
  try { /* таблица лежит в папке «ФО» на Диске */
    const it = DriveApp.getFoldersByName(FO), folder = it.hasNext() ? it.next() : DriveApp.createFolder(FO);
    const file = DriveApp.getFileById(ss.getId()), parents = file.getParents();
    let inside = false;
    while (parents.hasNext()) if (parents.next().getId() === folder.getId()) inside = true;
    if (!inside) file.moveTo(folder);
  } catch (e) { console.warn(e); }
  book_.ss = ss;
  return ss;
}

const HEADS = {
  'Попытки': ['Время', 'Класс', 'Фамилия и имя', 'Этап', 'Задание', 'Ответ', 'Правильный ответ', 'Итог', 'Пояснение'],
  'Добавленные': ['Когда', 'Класс', 'Фамилия и имя'],
  'Итоги': ['Обновлено', 'Ученик (id)', 'Класс', 'Фамилия и имя']
};
function sheet_(name) {
  const ss = book_();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    if (HEADS[name]) { sh.appendRow(HEADS[name]); sh.getRange(1, 1, 1, HEADS[name].length).setFontWeight('bold'); sh.setFrozenRows(1); }
    const def = ss.getSheetByName('Лист1') || ss.getSheetByName('Sheet1');
    if (def && def.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(def);
  }
  return sh;
}

function cut_(v) { v = v == null ? '' : String(v); return v.length > 45000 ? v.slice(0, 45000) + '…' : v; }
function text_(s) { return ContentService.createTextOutput(s).setMimeType(ContentService.MimeType.TEXT); }
function js_(s) { return ContentService.createTextOutput(s).setMimeType(ContentService.MimeType.JAVASCRIPT); }
