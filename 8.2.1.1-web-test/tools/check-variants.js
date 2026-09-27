#!/usr/bin/env node
/* Проверка variants.js: 15 вариантов × 10 заданий, одинаковая структура, числа не повторяются. */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'variants.js'), 'utf8'), ctx);
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'common.js'), 'utf8'), Object.assign(ctx, { localStorage: null }));
const V = ctx.window.VARIANTS;
const NT = ctx.window.NT;

assert.strictEqual(V.length, 15, '15 вариантов');
const structure = JSON.stringify(V[0].map((t) => [t[0], t[1]]));
const types = {};
V.forEach((v, i) => {
  assert.strictEqual(v.length, 10, 'вариант ' + (i + 1) + ': 10 заданий');
  assert.strictEqual(JSON.stringify(v.map((t) => [t[0], t[1]])), structure, 'вариант ' + (i + 1) + ': та же структура');
  assert.strictEqual(new Set(v.map((t) => t[2])).size, 10, 'вариант ' + (i + 1) + ': числа не повторяются');
  v.forEach((t) => {
    const k = t[0] + '→' + t[1];
    types[k] = (types[k] || 0) + 1;
    const q = NT.task(t);
    assert.strictEqual(parseInt(q.answer, t[1]), t[2]);
    assert.ok(NT.isCorrect(q.answer, q) && NT.isCorrect(' 0' + q.answer.toLowerCase() + ' ', q));
    assert.ok(!NT.isCorrect((t[2] + 1).toString(t[1]), q) && !NT.isCorrect('', q));
  });
});
for (let s = 0; s < 10; s++) {
  assert.strictEqual(new Set(V.map((v) => v[s][2])).size, 15, 'задание ' + (s + 1) + ': разные числа во всех вариантах');
}
console.log('OK. Типы заданий (на все варианты):', types);
