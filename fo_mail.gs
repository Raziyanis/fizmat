/**
 * Письма урока складываются в папку (ярлык) Gmail «ФО». Если папки нет — она создаётся.
 *
 * Как подключить:
 * 1. В проекте Apps Script нажмите «+» → «Скрипт», назовите файл fo_mail и вставьте этот код.
 * 2. В lesson9.gs найдите строку, где отправляется письмо: MailApp.sendEmail( или GmailApp.sendEmail(
 *    и замените только это начало на  sendToFo_(   — всё, что в скобках, оставьте как было.
 * 3. Один раз запустите функцию testFo (выбрать её вверху → «Выполнить») и разрешите доступ к Gmail.
 * 4. «Начать развертывание» → «Управление развертываниями» → ✏️ → «Новая версия» → «Развернуть».
 */
const FO_LABEL = 'ФО';
/* true — письмо лежит только в папке «ФО» (не во «Входящих»); false — и во «Входящих», и в «ФО» */
const FO_SKIP_INBOX = true;

/** Отправляет письмо так же, как MailApp.sendEmail, и кладёт его в папку «ФО». */
function sendToFo_(a, b, c, d) {
  const m = typeof a === 'object' && a !== null
    ? a
    : Object.assign({}, d || {}, { to: a, subject: b, body: c });
  const opts = {};
  ['htmlBody', 'name', 'cc', 'bcc', 'replyTo', 'attachments', 'noReply', 'inlineImages'].forEach(function (k) {
    if (m[k] != null) opts[k] = m[k];
  });
  GmailApp.sendEmail(m.to || m.recipient, m.subject, m.body || '', opts);
  try { putInFo_(m.subject); } catch (e) { console.warn('ФО: ' + e); }
}

function putInFo_(subject) {
  const label = GmailApp.getUserLabelByName(FO_LABEL) || GmailApp.createLabel(FO_LABEL);
  for (let i = 0; i < 5; i++) {
    Utilities.sleep(1500);
    const threads = GmailApp.search('in:anywhere newer_than:1d subject:"' + String(subject).replace(/"/g, '') + '"', 0, 1);
    if (threads.length) {
      threads[0].addLabel(label);
      if (FO_SKIP_INBOX) threads[0].moveToArchive();
      return;
    }
  }
}

/** Пробный запуск: пришлёт вам письмо и положит его в «ФО». */
function testFo() {
  sendToFo_(Session.getEffectiveUser().getEmail(), 'Проверка папки ФО', 'Если это письмо в папке «ФО» — всё работает.');
}
