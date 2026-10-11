#!/usr/bin/env node
/* Тексеру: 2000 нұсқа жасалады, әр жауап тәуелсіз қайта есептеледі. Іске қосу: node tools/check.js */
'use strict';
const path = require('path');
global.window = {};
require(path.join(__dirname, '..', 'content.js'));
const C = global.window.CONTENT;
const assert = require('assert');
const B = (n, q) => n.toString(q).toUpperCase();
let n = 0;
const kinds = {};
for (let s = 1; s <= 2000; s++) {
  const seed = (s * 2654435761) >>> 0, T = C.generate(seed);
  assert.strictEqual(T.length, 13, 'тапсырма саны');
  assert.strictEqual(T.filter((t) => !t.star).reduce((a, t) => a + t.max, 0), 10, 'негізгі 10 балл');
  assert.strictEqual(T.filter((t) => t.star).reduce((a, t) => a + t.max, 0), 6, 'қосымша 6 балл');
  T.forEach((t, i) => {
    assert.ok(t && t.title && t.prompt, 'бос тапсырма ' + i);
    const k = t.kind || t.type; kinds[k] = (kinds[k] || 0) + 1; n++;
    if (k === 'col') assert.strictEqual(t.fields[0].key, B(t.op === '+' ? t.a + t.b : t.a - t.b, t.q));
    if (k === 'col') assert.ok((t.op === '+' ? C.carries(t.a, t.b, t.q) : C.borrows(t.a, t.b, t.q)) >= 1, 'көшіру/қарыз жоқ');
    if (k === 'choice') { assert.strictEqual(new Set(t.opts).size, 4); assert.strictEqual(t.opts[t.key], B(t.a + t.b, t.q) + C.sub(t.q)); }
    if (k === 'digit') { const A = B(t.a, t.q); const pos = t.expr.indexOf('*'); assert.strictEqual(A[pos], t.fields[0].key); }
    if (k === 'mix') assert.strictEqual(+t.fields[0].key, t.vals[0] + t.vals[1] + (t.minus ? -t.vals[2] : t.vals[2]));
    if (k === 'cmp') { const L = t.lv[3], R = t.rv[3]; assert.strictEqual(t.key, L < R ? 0 : L === R ? 1 : 2); assert.ok(t.rv[0] > 0 && t.rv[1] > 0 && R > 0); }
    if (k === 'eq') { assert.strictEqual(+t.fields[0].key + t.a, t.b); assert.strictEqual(t.fields[1].key, B(t.x, 8)); }
    if (k === 'expr') { const r = t.vals[0] + t.vals[1] - t.vals[2]; assert.ok(r > 0); assert.strictEqual(t.fields[1].key, B(r, 2)); }
    if (k === 'base') { assert.deepStrictEqual(C.baseSols(B(t.x, t.bq), B(t.y, t.bq), B(t.x + t.y, t.bq)), [t.bq]); assert.strictEqual(t.fields[1].key, B(t.u + t.v, t.bq)); }
    // дұрыс жауап толық балл алады, бос жауап — 0
    const right = t.type === 'input' ? t.fields.map((f) => f.key) : t.key;
    assert.strictEqual(C.score(t, right), t.max);
    assert.strictEqual(C.score(t, C.empty(t)), 0);
    ['kz', 'ru'].forEach((l) => assert.ok(C.solution(t, l).length > 20 && !/undefined|NaN/.test(C.solution(t, l)), 'шешуі ' + k));
  });
}
['kz', 'ru'].forEach((l) => assert.ok(!/undefined|NaN/.test(C.theory(l))));
console.log('OK: 2000 нұсқа, ' + n + ' тапсырма;', JSON.stringify(kinds));
