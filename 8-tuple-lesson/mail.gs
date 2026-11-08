/**
 * Письмо учителю с итогами урока «Кортеж: tuple · 8 класс».
 *
 * Страница урока (index.html) отправляет итоги, когда ученик нажимает
 * «Сохранить итог» на этапе «Итоги урока»:
 *   - обычная страница (файл, сайт) — POST-запросом на веб-приложение этого скрипта (doPost);
 *   - онлайн-версия в Apps Script — вызовом google.script.run.sendReport(...).
 *
 * TEACHER_EMAIL пустой — письмо приходит владельцу скрипта (тому, кто его развернул).
 * MAIL_KEY должен совпадать с MAIL_KEY в index.html.
 */
var TEACHER_EMAIL = "";
var MAIL_KEY = "fizmat-8";

var FIELDS = [
  ["cls", "Класс"],
  ["name", "Фамилия и имя (вписал ученик)"],
  ["time", "Время сдачи"],
  ["stage", "Этап, на котором ученик был"],
  ["rev", "1. Повторим"],
  ["act", "4. Вспомним"],
  ["actFirst", "4. Вспомним — с первой попытки"],
  ["match", "7. Список или кортеж?"],
  ["matchFirst", "7. Список или кортеж? — с первой попытки"],
  ["z", "8. Практика: разминка"],
  ["a", "8. Практика: уровень A"],
  ["b", "8. Практика: уровень B"],
  ["c", "8. Практика: уровень C"],
  ["now", "Практика: следующее нерешённое"],
  ["pj", "9. Практическая работа"],
  ["test", "10. Тест"],
  ["desc", "Дескрипторы"],
  ["expect", "Ожидания от урока"],
  ["expOk", "Ожидания оправдались"],
  ["r0", "Самооценка: результат для всех"],
  ["r1", "Самооценка: результат для большинства"],
  ["r2", "Самооценка: результат для некоторых"],
  ["use", "Где пригодится кортеж"],
  ["note", "Комментарий ученика"],
  ["hw", "Домашнее задание"],
  ["olymp", "Олимпиадные задачи"]
];

/** Вход для обычной страницы: форма присылает поле data с JSON. */
function doPost(e) {
  var d;
  try {
    d = JSON.parse((e && e.parameter && e.parameter.data) || "{}");
  } catch (err) {
    return ContentService.createTextOutput("bad json");
  }
  if (d.key !== MAIL_KEY) return ContentService.createTextOutput("bad key");
  sendReport(d);
  return ContentService.createTextOutput("ok");
}

/** Отправляет письмо. Вызывается из doPost и из онлайн-версии через google.script.run. */
function sendReport(d) {
  d = d || {};
  var to = TEACHER_EMAIL || Session.getEffectiveUser().getEmail();
  var who = String(d.name || "Без имени") + ", " + String(d.cls || "?");
  var subject = "Итоги урока «Кортеж: tuple» — " + who;

  var rows = [], text = [];
  FIELDS.forEach(function (f) {
    var v = d[f[0]];
    if (v === undefined || v === null || v === "") return;
    rows.push("<tr><td style='padding:4px 10px;border:1px solid #d7e0e5;color:#5a6a76'>" + esc(f[1]) +
      "</td><td style='padding:4px 10px;border:1px solid #d7e0e5'>" + esc(v) + "</td></tr>");
    text.push(f[1] + ": " + v);
  });

  MailApp.sendEmail({
    to: to,
    subject: subject,
    body: who + "\n\n" + text.join("\n"),
    htmlBody: "<p><b>" + esc(who) + "</b> завершил(а) урок «Кортеж: tuple · 8 класс».</p>" +
      "<table style='border-collapse:collapse;font:14px Arial,sans-serif'>" + rows.join("") + "</table>",
    name: "Урок информатики"
  });
  return true;
}

function esc(v) {
  return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Запустите один раз вручную: даст разрешение на отправку почты и пришлёт пробное письмо. */
function testMail() {
  sendReport({ cls: "8А", name: "Проверка Письма", time: new Date().toLocaleString("ru-RU"), test: "10/10", note: "Пробное письмо" });
}
