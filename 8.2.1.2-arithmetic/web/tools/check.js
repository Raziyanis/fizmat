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
    assert.ok(t && t.title && t.prompt && t.items.length, 'бос тапсырма ' + i);
    if (!t.star) { assert.strictEqual(t.items.length, 2, '2 мысал'); assert.strictEqual(t.per, 0.5); }
    const ids = t.items.map((it) => it.expr || it.left + it.right); assert.strictEqual(new Set(ids).size, ids.length, 'мысалдар қайталанбайды');
    t.items.forEach((it) => {
      const k = it.kind || it.type; kinds[k] = (kinds[k] || 0) + 1; n++;
      if (k === 'col') assert.strictEqual(it.fields[0].key, B(it.op === '+' ? it.a + it.b : it.a - it.b, it.q));
      if (k === 'col') assert.ok((it.op === '+' ? C.carries(it.a, it.b, it.q) : C.borrows(it.a, it.b, it.q)) >= 1, 'көшіру/қарыз жоқ');
      if (k === 'stars') { const A = B(it.a, it.q), Bs = B(it.b, it.q); const rows = it.layout.rows.filter((r) => r.t === 'digits');
        const ha = rows[0].s.trim(), hb = rows[1].s.trim(); assert.strictEqual(ha.replace('*', it.fields[0].key[0]), A); assert.strictEqual(hb.replace('*', it.fields[0].key[1]), Bs);
        // жалғыз шешім: барлық цифр жұбын тексереміз
        let sols = 0; const D = '0123456789ABCDEF'.slice(0, it.q);
        for (const x of D) for (const y of D) { const a2 = ha.replace('*', x), b2 = hb.replace('*', y); if ((a2.length > 1 && a2[0] === '0') || (b2.length > 1 && b2[0] === '0')) continue; if (parseInt(a2, it.q) + parseInt(b2, it.q) === it.a + it.b) sols++; }
        assert.strictEqual(sols, 1, 'жасырын цифрлардың шешімі біреу'); }
      if (k === 'fix') { assert.notStrictEqual(it.wrong, it.fields[0].key); assert.strictEqual(it.fields[0].key, B(it.op === '+' ? it.a + it.b : it.a - it.b, it.q)); }
      if (k === 'conv') { assert.strictEqual(it.fields[0].key, B(it.op === '+' ? it.a + it.b : it.a - it.b, it.q)); assert.ok(it.op === '+' ? it.a + it.b > 0 : it.a > it.b); }
      if (it.layout) { const w = it.layout.w; it.layout.rows.forEach((r) => { if (r.s) assert.strictEqual(r.s.length, w, 'баған ені'); }); assert.ok(it.fields[0].key.length <= w, 'жауап бағанға сыяды'); }
      if (k === 'col') assert.ok(it.fields[0].key.length <= C.colLayout(it).w);
      if (k === 'eq') { assert.strictEqual(+it.fields[0].key + it.a, it.b); assert.strictEqual(it.fields[1].key, B(it.x, 8)); }
      if (k === 'expr') { const r = it.vals[0] + it.vals[1] - it.vals[2]; assert.ok(r > 0); assert.strictEqual(it.fields[1].key, B(r, 2)); }
      if (k === 'base') { assert.deepStrictEqual(C.baseSols(B(it.x, it.bq), B(it.y, it.bq), B(it.x + it.y, it.bq)), [it.bq]); assert.strictEqual(it.fields[1].key, B(it.u + it.v, it.bq)); }
      ['kz', 'ru'].forEach((l) => assert.ok(C.solution(it, l).length > 20 && !/undefined|NaN/.test(C.solution(it, l)), 'шешуі ' + k));
    });
    // дұрыс жауап толық балл алады, бос жауап — 0, бір мысал қате — max − per
    const right = t.items.map((it) => (it.type === 'input' ? it.fields.map((f) => f.key) : it.key));
    assert.strictEqual(C.score(t, right), t.max);
    assert.strictEqual(C.score(t, C.empty(t)), 0);
    if (!t.star) { const w = right.slice(); w[0] = ['']; assert.strictEqual(C.score(t, w), t.max - t.per); }
  });
}
['kz', 'ru'].forEach((l) => assert.ok(!/undefined|NaN/.test(C.theory(l))));
console.log('OK: 2000 нұсқа, ' + n + ' тапсырма;', JSON.stringify(kinds));
