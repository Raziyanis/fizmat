#!/usr/bin/env node
/**
 * Генерирует variants.js: 15 вариантов по 10 заданий одинаковой структуры.
 * Запуск: node tools/generate-variants.js   (из папки 8.2.1.1-web-test)
 * Измените SEED, чтобы получить другой набор чисел.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const VARIANTS = 15;
const SEED = 8211;

// Одинаковая структура для всех вариантов (позиция → тип и диапазон).
// Перевод из 10-й: в 2-ю ×2, в 8-ю ×1, в 16-ю ×2; в 10-ю: из 2-й ×2, из 8-й ×2, из 16-й ×1.
const hasLetter = (n) => /[a-f]/.test(n.toString(16));
const SLOTS = [
  { from: 10, to: 2, lo: 20, hi: 63 },
  { from: 2, to: 10, lo: 20, hi: 63 },
  { from: 10, to: 8, lo: 70, hi: 400 },
  { from: 8, to: 10, lo: 10, hi: 63 },
  { from: 10, to: 16, lo: 30, hi: 159, ok: hasLetter },
  { from: 16, to: 10, lo: 26, hi: 255, ok: hasLetter },
  { from: 10, to: 2, lo: 64, hi: 200 },
  { from: 2, to: 10, lo: 64, hi: 255 },
  { from: 8, to: 10, lo: 64, hi: 400 },
  { from: 10, to: 16, lo: 160, hi: 255, ok: hasLetter },
];

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Исключаем «слишком удобные» числа: 111111₂, FF₁₆, 200₈, 1000₂ и т. п.
function tooEasy(n, base) {
  const s = n.toString(base);
  return /^(.)\1*$/.test(s) || /^.0+$/.test(s);
}

const r = rng(SEED);
const usedBySlot = SLOTS.map(() => new Set());
const variants = [];
for (let v = 0; v < VARIANTS; v++) {
  const used = new Set();
  const tasks = SLOTS.map((s, i) => {
    let n;
    do {
      n = s.lo + Math.floor(r() * (s.hi - s.lo + 1));
    } while (used.has(n) || usedBySlot[i].has(n) || (s.ok && !s.ok(n)) ||
             tooEasy(n, s.from === 10 ? s.to : s.from));
    used.add(n);
    usedBySlot[i].add(n);
    return [s.from, s.to, n];
  });
  variants.push(tasks);
}

const body = variants.map((t, i) => '  /* ' + String(i + 1).padStart(2) + ' */ ' + JSON.stringify(t)).join(',\n');
const out = `/* Сгенерировано tools/generate-variants.js (SEED = ${SEED}). Не редактируйте вручную. */
/* Каждое задание: [из какой системы, в какую систему, число в десятичной записи]. */
window.VARIANTS = [
${body}
];
`;
fs.writeFileSync(path.join(__dirname, '..', 'variants.js'), out);
console.log('variants.js: ' + variants.length + ' вариантов');
