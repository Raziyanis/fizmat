#!/usr/bin/env node
/* Проверка банков заданий 9.1.3.5–9.1.3.6 на 500 вариантах:
 * у каждого текста есть kz и ru; ключ корректен; полный правильный ответ даёт максимум, пустой — 0, «всё отмечено» в hot/multi
 * не даёт максимума; в «Ретке келтір» начальный порядок не даёт баллов; в пропусках у каждого пропуска есть место в обоих текстах.
 * Запуск: node tools/check.js */
'use strict';
const fs = require('fs');
const path = require('path');
global.window = {};
eval(fs.readFileSync(path.join(__dirname, '..', 'content.js'), 'utf8'));
const C = window.CONTENT;
let n = 0;
const fail = (m) => { throw new Error(m); };
function both(o, where) {
  if (!o || typeof o.kz !== 'string' || typeof o.ru !== 'string' || !o.kz.trim() || !o.ru.trim()) fail('нет перевода: ' + where + ' ' + JSON.stringify(o));
  if (/[әіңғүұқөһӘІҢҒҮҰҚӨҺ]/.test(o.ru)) fail('казахские буквы в русском тексте: ' + o.ru);
}
function walk(x, where) {
  if (Array.isArray(x)) return x.forEach((v, i) => walk(v, where + '[' + i + ']'));
  if (x && typeof x === 'object') {
    if ('kz' in x && 'ru' in x && typeof x.kz === 'string') return both(x, where);
    Object.keys(x).forEach((k) => walk(x[k], where + '.' + k));
  }
}
walk(C.BANKS, 'BANKS');
['kz', 'ru'].forEach((l) => { if (!C.THEORY[l] || C.THEORY[l].length < 3000) fail('теория ' + l); });
const kinds = {};
for (let seed = 1; seed <= 500; seed++) {
  const T = C.generate(seed * 2654435761 >>> 0);
  if (T.length !== 13) fail('не 13 заданий');
  T.forEach((t, i) => {
    kinds[t.type] = (kinds[t.type] || 0) + 1;
    walk(t, 'task' + i);
    if (t.type === 'text') {
      kinds.text = (kinds.text || 0);
      if (C.precheck(t, '').score !== 0 || C.complete(t, '')) fail('text: пустой ответ');
      n++; return;
    }
    const p = C.perfect(t), e = C.empty(t), max = C.score(t, p);
    if (max !== t.max) fail(`${t.type}: правильный ответ даёт ${max}, а не ${t.max}`);
    if (C.score(t, e) !== 0) fail(t.type + ': пустой ответ даёт баллы');
    if (!C.complete(t, p)) fail(t.type + ': правильный ответ не считается выполненным');
    if (t.type === 'order' && C.touched(t, e)) fail('order: начальный порядок считается ответом');
    if (t.type === 'hot' || t.type === 'multi') {
      const all = (t.parts || t.opts).map(() => true);
      if (C.score(t, all) >= t.max) fail(t.type + ': «отметить всё» даёт максимум');
    }
    if (t.type === 'fill') ['kz', 'ru'].forEach((l) => {
      const ids = t.text[l].filter((s) => typeof s !== 'string').map((s) => s.b).sort();
      if (ids.join() !== t.blanks.map((_, k) => k).join()) fail('fill: пропуски не совпадают в ' + l);
    });
    if (t.type === 'match' && new Set(t.key).size !== t.key.length) fail('match: ключ повторяется');
    if (t.type === 'sort' && new Set(t.items.map((x) => x.bin)).size < 2) fail('sort: все элементы в одной группе');
    n++;
  });
}
// «Қосымша деңгей»: 2 әрекет, әр әрекетте тапсырмалар әртүрлі
let nb = 0;
for (let seed = 1; seed <= 300; seed++) {
  const s0 = seed * 2654435761 >>> 0, M = C.generate(s0), A = C.generateBonus(s0 ^ 777, 1, s0), B = C.generateBonus(s0 ^ 999, 2, s0);
  [A, B].forEach((T) => T.forEach((t, i) => {
    walk(t, 'bonus' + i);
    if (t.type === 'text') {
      if (C.precheck(t, '').score !== 0) fail('text: пустой ответ даёт баллы');
      if (C.complete(t, '')) fail('text: пустой ответ считается выполненным');
    } else {
      if (C.score(t, C.perfect(t)) !== t.max) fail('bonus ' + t.type + ': правильный ответ не даёт максимум');
      if (C.score(t, C.empty(t)) !== 0) fail('bonus ' + t.type + ': пустой ответ даёт баллы');
    }
    nb++;
  }));
  if (JSON.stringify(A[0].parts) === JSON.stringify(B[0].parts)) fail('попытки 1 и 2: одно и то же письмо');
  if (A[2].rude.kz === B[2].rude.kz) fail('попытки 1 и 2: одно и то же «Түзет»');
  if ([A[2], B[2]].some((x) => x.rude.kz === M[11].rude.kz)) fail('доп. уровень повторяет «Түзет» из основной работы');
  if ([A[3], B[3]].some((x) => x.ctx.kz === M[12].ctx.kz)) fail('доп. уровень повторяет «Пайымда» из основной работы');
  if (A[3].ctx.kz === B[3].ctx.kz) fail('попытки 1 и 2: одна и та же ситуация «Пайымда»');
}
// Алдын ала тексеру: сыпайы жауап балл алады, дөрекі көшірме — жоқ
C.BANKS.REWRITE.forEach((r) => {
  const t = { kind: 'rewrite', crit: C.BANKS.REWRITE_CRIT, rude: r.rude, topic: r.topic, minWords: 5 };
  ['kz', 'ru'].forEach((l) => { if (C.precheck(t, r.rude[l]).score !== 0) fail('precheck: грубый оригинал получил баллы: ' + r.rude[l]); });
});
console.log('OK: 500 вариантов, ' + n + ' заданий; доп. уровень: ' + nb + ' заданий (300 × 2 попытки); типы: ' + Object.entries(kinds).map(([k, v]) => k + ' ' + v).join(', '));
