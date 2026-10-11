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
  const cmpRel = T[9].items.map((it) => it.key); assert.ok([0, 1, 2].every((x) => cmpRel.includes(x)), 'салыстыруда <, =, > бар');
  assert.strictEqual(T.filter((t) => !t.star).reduce((a, t) => a + t.max, 0), 10, 'негізгі 10 балл');
  assert.strictEqual(T.filter((t) => t.star).reduce((a, t) => a + t.max, 0), 6, 'қосымша 6 балл');
  T.forEach((t, i) => {
    assert.ok(t && t.title && t.prompt && t.items.length, 'бос тапсырма ' + i);
    if (!t.star) { assert.strictEqual(t.items.length, 4, '4 мысал'); assert.strictEqual(t.per, 0.25); }
    const ids = t.items.map((it) => it.expr || it.left + it.right); assert.strictEqual(new Set(ids).size, ids.length, 'мысалдар қайталанбайды');
    t.items.forEach((it) => {
      const k = it.kind || it.type; kinds[k] = (kinds[k] || 0) + 1; n++;
      if (k === 'col') assert.strictEqual(it.fields[0].key, B(it.op === '+' ? it.a + it.b : it.a - it.b, it.q));
      if (k === 'col') assert.ok((it.op === '+' ? C.carries(it.a, it.b, it.q) : C.borrows(it.a, it.b, it.q)) >= 1, 'көшіру/қарыз жоқ');
      if (k === 'choice') { assert.strictEqual(new Set(it.opts).size, 4); assert.ok(it.opts.every((o) => o[0] !== '0'), 'нөлден басталған нұсқа'); assert.strictEqual(it.opts[it.key], B(it.a + it.b, it.q) + C.sub(it.q)); }
      if (k === 'digit') { const A = B(it.a, it.q); const pos = it.expr.indexOf('*'); assert.strictEqual(A[pos], it.fields[0].key); }
      if (k === 'mix') assert.strictEqual(+it.fields[0].key, it.vals[0] + it.vals[1] + (it.minus ? -it.vals[2] : it.vals[2]));
      if (k === 'cmp') { const L = it.lv[3], R = it.rv[3]; assert.strictEqual(it.key, L < R ? 0 : L === R ? 1 : 2); assert.ok(it.rv[0] > 0 && it.rv[1] > 0 && R > 0); }
      if (k === 'eq') { assert.strictEqual(+it.fields[0].key + it.a, it.b); assert.strictEqual(it.fields[1].key, B(it.x, 8)); }
      if (k === 'expr') { const r = it.vals[0] + it.vals[1] - it.vals[2]; assert.ok(r > 0); assert.strictEqual(it.fields[1].key, B(r, 2)); }
      if (k === 'base') { assert.deepStrictEqual(C.baseSols(B(it.x, it.bq), B(it.y, it.bq), B(it.x + it.y, it.bq)), [it.bq]); assert.strictEqual(it.fields[1].key, B(it.u + it.v, it.bq)); }
      ['kz', 'ru'].forEach((l) => assert.ok(C.solution(it, l).length > 20 && !/undefined|NaN/.test(C.solution(it, l)), 'шешуі ' + k));
    });
    // дұрыс жауап толық балл алады, бос жауап — 0, бір мысал қате — max − per
    const right = t.items.map((it) => (it.type === 'input' ? it.fields.map((f) => f.key) : it.key));
    assert.strictEqual(C.score(t, right), t.max);
    assert.strictEqual(C.score(t, C.empty(t)), 0);
    if (!t.star) { const w = right.slice(); w[0] = t.items[0].type === 'input' ? [''] : (t.items[0].key + 1) % 3; assert.strictEqual(C.score(t, w), t.max - t.per); }
  });
}
['kz', 'ru'].forEach((l) => assert.ok(!/undefined|NaN/.test(C.theory(l))));
console.log('OK: 2000 нұсқа, ' + n + ' тапсырма;', JSON.stringify(kinds));
