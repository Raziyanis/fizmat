const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765/';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const ok = (c, m) => { if (!c) throw new Error('CHECK FAILED: ' + m); console.log('ok -', m); };
(async () => {
  const b = await chromium.launch();
  const errs = [];
  const mk = async (w, h) => {
    const c = await b.newContext({ viewport: { width: w, height: h } });
    const p = await c.newPage();
    p.on('pageerror', e => errs.push(e.message));
    p.on('console', m => { if (m.type() === 'error' && !/status of 500/.test(m.text())) errs.push(m.text()); });
    return p;
  };
  const A = await mk(400, 860), B = await mk(400, 860), J = await mk(1366, 900);
  await A.goto(BASE); await B.goto(BASE);
  await A.waitForSelector('#regForm');
  await A.fill('#fName', 'Тұлпарлар'); await A.fill('#fCap', 'Айбек'); await A.click('#regBtn'); await A.waitForSelector('.code');
  const codeA = await A.textContent('.code');
  await B.waitForSelector('#regForm'); await B.fill('#fName', 'Жұлдыздар'); await B.click('#regBtn'); await B.waitForSelector('.code');
  const C = await mk(400, 860); await C.goto(BASE); await C.waitForSelector('#regForm');
  await C.click('#tabJoin'); await C.fill('#jName', 'Тұлпарлар'); await C.fill('#jCode', codeA); await C.click('#joinBtn'); await C.waitForSelector('.code');
  ok(true, 'register + join by code');

  await J.goto(BASE + (BASE.includes('?') ? '&' : '?') + 'page=jury'); await J.waitForSelector('#main:not([hidden])');
  await J.click('#stages button[data-s="r1"]');
  await A.waitForSelector('#cur', { timeout: 8000 });
  ok(await A.$$eval('.qrow.wait', e => e.length) === 9, 'only question 1 open, 9 waiting');
  // empty send is refused locally
  await A.click('#sendOne'); await A.waitForSelector('.status.warn');
  const r1A = ['1991 жыл', 'Конституция', 'тенге', 'Астана', 'Калдаяков', 'Байконур', 'Тәуелсіздік күні', 'бүркіт', '1992', ''];
  for (let i = 0; i < 10; i++) {
    await A.waitForSelector('.qrow.cur #cur, .qrow.cur input', { timeout: 8000 });
    if (r1A[i]) { await A.fill('#cur', r1A[i]); await A.press('#cur', 'Enter'); } else await A.click('#skipOne');
    await A.waitForFunction(n => document.querySelectorAll('.qrow .done').length === n, i + 1, { timeout: 8000 });
  }
  ok(await A.$('#cur') === null, 'all 10 answered, no input left');
  ok((await A.textContent('#app')).includes('өткізілді'), 'skipped answer shown');
  await A.screenshot({ path: 'shots/p_seq_done.png', fullPage: true });
  // C (same team, other device) sees locked answers after poll
  await sleep(3500);
  ok(await C.$$eval('.qrow .done', e => e.length) === 10, 'second device of same team sees all answers locked');
  // B answers 3, leaves mid-way
  await B.waitForSelector('#cur', { timeout: 8000 });
  for (const v of ['1990', 'Конституция', 'рубль']) { await B.fill('#cur', v); await B.click('#sendOne'); await sleep(400); }
  await B.screenshot({ path: 'shots/p_seq_mid.png', fullPage: true });
  ok(await B.$$eval('.qrow .done', e => e.length) === 3, 'B: 3 locked, question 4 open');
  // server rejects re-answer of locked question
  const rej = await B.evaluate(() => new Promise(res => call('p_answer', me.id, me.code, 'r1', 0, 'X').then(() => res('accepted'), e => res(e.message))));
  ok(/жауап берілген|Алдымен/.test(rej), 'server refuses changing a locked answer: ' + rej.slice(0, 40));

  await J.click('#tabs button[data-t="r1"]'); await sleep(4500);
  let sums = await J.$$eval('td.sum', e => e.map(x => x.textContent.split('/')[0].trim()));
  console.log('r1 sums', sums);
  ok(sums[0] === '9' && sums[1] === '1', 'auto-check: A 9, B 1');
  // synonym: B answered "рубль" for q3 -> add as synonym (for test), B gets +1
  await J.click('tbody tr:nth-child(2) [data-syn="2"]'); await sleep(800);
  sums = await J.$$eval('td.sum', e => e.map(x => x.textContent.split('/')[0].trim()));
  ok(sums[1] === '2', 'synonym added -> B 2');
  ok((await J.textContent('thead')).includes('рубль'), 'synonym chip in header');
  await J.click('[data-unsyn="2"]'); await sleep(800);
  sums = await J.$$eval('td.sum', e => e.map(x => x.textContent.split('/')[0].trim()));
  ok(sums[1] === '1', 'synonym removed -> B 1');
  // manual mark ✓ on B q1 then back to auto
  await J.click('tbody tr:nth-child(2) [data-mark="true"][data-i="0"]'); await sleep(800);
  sums = await J.$$eval('td.sum', e => e.map(x => x.textContent.split('/')[0].trim()));
  ok(sums[1] === '2', 'manual ✓ -> B 2');
  // adjustment -1 for A
  const adj = await J.$('input[data-adj="r1"][data-t]'); await adj.fill('-1'); await adj.press('Tab'); await sleep(900);
  sums = await J.$$eval('td.sum', e => e.map(x => x.textContent.split('/')[0].trim()));
  ok(sums[0] === '8', 'adjustment -1 -> A 8');
  await J.screenshot({ path: 'shots/j_r1_tools.png', fullPage: true });
  // unlock B round 1 -> B can answer from question 1 again
  await J.click('tbody tr:nth-child(2) [data-unlock="r1"]'); await J.click('[data-unlock-yes="r1"]'); await sleep(3800);
  ok(await B.$$eval('.qrow .done', e => e.length) === 0 && !!(await B.$('#cur')), 'unlock: B starts round 1 again');

  // round 4: click = answer
  await J.click('#stages button[data-s="r4"]'); await A.waitForSelector('.tf', { timeout: 8000 });
  const tf = ['true', 'false', 'true', 'false', 'false'];
  for (let i = 0; i < 5; i++) {
    await A.click(`.tf[data-i="${i}"] button[data-v="${tf[i]}"]`);
    await A.waitForFunction(n => document.querySelectorAll('.qrow .done').length === n, i + 1, { timeout: 8000 });
  }
  ok(true, 'round 4 answered one by one');
  // round 6 idea: single submission with confirmation, then locked
  await J.click('#stages button[data-s="r6"]'); await A.waitForSelector('#iTitle', { timeout: 8000 });
  await A.fill('#iTitle', 'EcoDala'); await A.fill('#iProblem', 'Даладағы өрт'); await A.click('#sendBtn');
  await A.waitForSelector('#sendYes'); await A.click('#sendYes'); await A.waitForSelector('.status.ok');
  ok(await A.$eval('#iTitle', e => e.disabled) && !(await A.$('#sendBtn')), 'idea locked after sending');

  await J.click('#stages button[data-s="final"]'); await sleep(600);
  await J.click('#resYes'); await sleep(4000);
  const fin = await A.textContent('#app');
  ok(fin.includes('Тұлпарлар') && fin.includes('Нәтижелер'), 'final results visible to teams');
  console.log('ERRORS', errs);
  await b.close();
  if (errs.length) process.exit(2);
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
