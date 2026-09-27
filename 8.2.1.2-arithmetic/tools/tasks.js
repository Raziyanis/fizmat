/* Задания раздаточного листа 8.2.1.2 и их проверка. Все ответы вычисляются, а не вписываются вручную. */
'use strict';
const assert = require('assert');

const SUB = { 2: '₂', 8: '₈', 10: '₁₀', 16: '₁₆' };
const NAME = { 2: 'двоичной', 8: 'восьмеричной', 16: 'шестнадцатеричной' };
const val = (s, q) => parseInt(s, q);
const fmt = (n, q) => n.toString(q).toUpperCase();

// Задания 1–6: [a, знак, b, основание]
const CORE = {
  1: [['10111', '+', '1101', 2], ['110010', '−', '1011', 2], ['457', '+', '326', 8], ['702', '−', '345', 8], ['3AE', '+', '1B7', 16], ['B04', '−', '6C9', 16]],
  2: [['11011', '+', '1110', 2], ['110100', '−', '1101', 2], ['563', '+', '247', 8], ['603', '−', '275', 8], ['4CB', '+', '2A6', 16], ['A03', '−', '4E8', 16]],
};
// Задание 7: «ученик забыл уменьшить цифру, у которой занял» — [a, b, ответ ученика]
const ERR = { 1: ['526', '237', '377'], 2: ['625', '347', '366'] };
// Задание 8: восстановить цифры (единственное решение проверено перебором)
const GAPS = { 1: ['4*6', '26*', '*10'], 2: ['4*4', '25*', '*12'] };

function calc(a, op, b, q) {
  const r = op === '+' ? val(a, q) + val(b, q) : val(a, q) - val(b, q);
  return { r: fmt(r, q), dec: `${val(a, q)} ${op} ${val(b, q)} = ${r}` };
}

function gapSolutions([a, b, c], q) {
  const D = '0123456789ABCDEF'.slice(0, q);
  const n = (a + b + c).split('*').length - 1;
  const out = [];
  const rec = (ds) => {
    if (ds.length === n) {
      let k = 0;
      const fill = (s) => s.replace(/\*/g, () => ds[k++]);
      const A = fill(a), B = fill(b), C = fill(c);
      if (A[0] !== '0' && B[0] !== '0' && C[0] !== '0' && val(A, q) + val(B, q) === val(C, q)) out.push([A, B, C]);
      return;
    }
    for (const d of D) rec(ds + d);
  };
  rec('');
  return out;
}

function variant(v) {
  const core = CORE[v].map(([a, op, b, q]) => {
    const c = calc(a, op, b, q);
    return { a, op, b, q, text: `${a}${SUB[q]} ${op} ${b}${SUB[q]}`, sys: NAME[q], answer: c.r + SUB[q], dec: c.dec };
  });
  const [ea, eb, ewrong] = ERR[v];
  const ec = calc(ea, '−', eb, 8);
  assert.notStrictEqual(ec.r, ewrong);
  const err = { a: ea, b: eb, wrong: ewrong, answer: ec.r, check: fmt(val(ewrong, 8) + val(eb, 8), 8) };
  const sols = gapSolutions(GAPS[v], 8);
  assert.strictEqual(sols.length, 1, 'задание 8 варианта ' + v + ' должно иметь одно решение');
  return { v, core, err, gaps: GAPS[v], gapAnswer: sols[0] };
}

const VARIANTS = [variant(1), variant(2)];
module.exports = { VARIANTS, SUB };

if (require.main === module) console.log(JSON.stringify(VARIANTS, null, 1));
