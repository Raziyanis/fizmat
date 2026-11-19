# -*- coding: utf-8 -*-
# JS for the 9.2.1.2 lesson (manual truth tables)

CORE_JS = r"""/* ---------- logic expression parser (¬ ∧ ∨ → ↔, also words) ---------- */
const LG_PREC={eq:1,imp:2,or:3,and:4,not:5,atom:6};
const LG_SYM={and:'∧',or:'∨',imp:'→',eq:'↔'};
function lgParse(src){
  src=String(src).replace(/А/g,'A').replace(/В/g,'B').replace(/С/g,'C');
  const toks=[];let pos=0;const re=/(\(|\)|¬|∧|∨|→|↔|<->|->|&&|\|\||&|\||!|~|[A-Za-zА-Яа-яӘәҒғҚқҢңӨөҰұҮүҺһІі_][A-Za-zА-Яа-яӘәҒғҚқҢңӨөҰұҮүҺһІі_0-9]*|\d+)/y;
  while(pos<src.length){if(/\s/.test(src[pos])){pos++;continue;}re.lastIndex=pos;const m=re.exec(src);if(!m)throw `«${src[pos]}» таңбасы түсініксіз`;toks.push(m[1]);pos=re.lastIndex;}
  const KW={'¬':'not','!':'not','~':'not','not':'not','ЕМЕС':'not','емес':'not',
    '∧':'and','&':'and','&&':'and','and':'and','ЖӘНЕ':'and','және':'and',
    '∨':'or','|':'or','||':'or','or':'or','НЕМЕСЕ':'or','немесе':'or','→':'imp','->':'imp','↔':'eq','<->':'eq'};
  const T=toks.map(t=>KW[t]||t);let i=0;const vars=new Set();const take=t=>{if(T[i]===t){i++;return true;}return false;};
  function pEq(){let n=pImp();while(take('eq')){n={t:'eq',a:n,b:pImp()};}return n;}
  function pImp(){const n=pOr();if(take('imp'))return {t:'imp',a:n,b:pImp()};return n;}
  function pOr(){let n=pAnd();while(take('or'))n={t:'or',a:n,b:pAnd()};return n;}
  function pAnd(){let n=pNot();while(take('and'))n={t:'and',a:n,b:pNot()};return n;}
  function pNot(){if(take('not'))return {t:'not',a:pNot()};return pAtom();}
  function pAtom(){const t=T[i];if(t===undefined)throw 'өрнек толық емес: соңында айнымалы жетіспейді';i++;
    if(t==='('){const n=pEq();if(!take(')'))throw 'жабылатын жақша «)» жетіспейді';return n;}
    if(t==='0'||t==='1')return {t:'c',v:+t};
    if(/^[A-D]$/.test(t)){vars.add(t);return {t:'v',n:t};}
    if(['and','or','imp','eq'].includes(t))throw `«${toks[i-1]}» алдында айнымалы немесе жақша керек`;
    if(t===')')throw 'артық жабылатын жақша «)»';
    if(/^[a-d]$/.test(t))throw `«${t}» — айнымалыларды бас әріппен жазыңыз: ${t.toUpperCase()}`;
    throw `«${toks[i-1]}» — белгісіз белгі. Айнымалылар: A, B, C, D; амалдар: ¬, ∧, ∨`;}
  const ast=pEq();if(i<T.length)throw `«${toks[i]}» артық: амал (∧, ∨) жетіспеуі мүмкін`;
  return {ast,vars:[...vars].sort()};}
function lgEval(n,env){switch(n.t){case 'c':return n.v;case 'v':return env[n.n]?1:0;case 'not':return lgEval(n.a,env)?0:1;
  case 'and':return lgEval(n.a,env)&&lgEval(n.b,env)?1:0;case 'or':return lgEval(n.a,env)||lgEval(n.b,env)?1:0;
  case 'imp':return (!lgEval(n.a,env)||lgEval(n.b,env))?1:0;case 'eq':return lgEval(n.a,env)===lgEval(n.b,env)?1:0;}}
function lgPrec(n){return n.t==='c'||n.t==='v'?6:LG_PREC[n.t];}
function lgStr(n){if(n.t==='c')return String(n.v);if(n.t==='v')return n.n;
  if(n.t==='not'){const s=lgStr(n.a);return '¬'+(lgPrec(n.a)<5?'('+s+')':s);}
  const p=LG_PREC[n.t];const L=lgStr(n.a),R=lgStr(n.b);
  const clar=x=>n.t==='or'&&x.t==='and';const wl=lgPrec(n.a)<p||(n.t==='imp'&&lgPrec(n.a)===p)||clar(n.a);const wr=lgPrec(n.b)<p||(n.t!=='imp'&&lgPrec(n.b)===p&&n.b.t!==n.t)||clar(n.b);
  return (wl?'('+L+')':L)+' '+LG_SYM[n.t]+' '+(wr?'('+R+')':R);}
function lgOps(n,acc){acc=acc||[];if(n.t==='c'||n.t==='v')return acc;lgOps(n.a,acc);if(n.b)lgOps(n.b,acc);const s=lgStr(n);if(!acc.some(x=>x.s===s))acc.push({s,n});return acc;}
function lgCompile(e){const p=lgParse(e);return env=>lgEval(p.ast,env);}
function ttEnvRows(vars){const n=vars.length;return Array.from({length:2**n},(_,k)=>{const env={};vars.forEach((v,i)=>env[v]=(k>>(n-1-i))&1);return env;});}
/* table html: vars + cols ([header, expr] or expr) */
function ttStatic(vars,cols){const C=cols.map(c=>Array.isArray(c)?c:[c,c]);const fs=C.map(c=>lgCompile(c[1]));
  return `<div class="tbl-wrap"><table class="tt-tbl"><thead><tr>${vars.map(v=>`<th>${v}</th>`).join('')}${C.map((c,j)=>`<th class="${j===0?'fcol':''}">${esc(c[0])}</th>`).join('')}</tr></thead><tbody>`+
    ttEnvRows(vars).map(env=>`<tr>${vars.map(v=>`<td>${env[v]}</td>`).join('')}${fs.map((f,j)=>{const x=f(env);return `<td class="${j===0?'fcol':''}${j===fs.length-1&&x?' one':''}">${x}</td>`;}).join('')}</tr>`).join('')+'</tbody></table></div>';}
/* interactive truth table task */
function mountTT(host,list,o){
 list.forEach((t,idx)=>{
  const key=o.keyOf(t,idx);const vars=t.vars,C=t.cols.map(c=>Array.isArray(c)?c:[c,c]),fs=C.map(c=>lgCompile(c[1]));
  const envs=ttEnvRows(vars),nv=vars.length,nc=nv+C.length;
  const exp=envs.map(env=>vars.map(v=>env[v]).concat(fs.map(f=>f(env))));
  const editable=(ci)=>ci<nv?!!t.fillVars:!(t.given||[]).includes(ci-nv);
  const box=document.createElement('div');box.className='task';if(t.lv)box.dataset.lv=t.lv;
  box.innerHTML=`<div class="task-head"><span class="badge ${t.lv||''}">${esc(o.badge(t,idx))}</span><h3>${esc(t.title||t.t)}</h3><span class="status"></span></div>
   <p class="desc">${esc(t.desc||t.goal)}</p><div class="tt-task"></div>
   ${t.q?`<div class="answer-row tt-q"><label>${esc(t.q.text)}</label><input type="text" class="tt-ans" autocomplete="off"></div>`:''}
   <div class="ed-bar tt-bar"><button class="btn alt chk" type="button" data-chk="1">✓ Тексеру</button><button class="btn-ghost tt-clr" type="button">${t.errs?'Бастапқы кесте':'Тазалау'}</button></div>
   <div class="verdict" hidden></div>
   <details class="sol"><summary>${o.solLbl}</summary><div class="solbody"></div></details>`;
  host.appendChild(box);
  const init=()=>exp.map((r,ri)=>r.map((v,ci)=>{if(t.errs){const e=t.errs.find(x=>x[0]===ri&&x[1]===ci);return String(e?e[2]:v);}return editable(ci)?'':String(v);}));
  let cells=store.get('ttc-'+key,null);if(!Array.isArray(cells)||cells.length!==exp.length)cells=init();
  let marks=null;const ans=box.querySelector('.tt-ans');if(ans){ans.value=store.get('tta-'+key,'');ans.addEventListener('input',()=>store.set('tta-'+key,ans.value));}
  const tbl=box.querySelector('.tt-task');
  function draw(){tbl.innerHTML=`<div class="tbl-wrap"><table class="tt-tbl tt-play"><thead><tr>${vars.map(v=>`<th>${v}</th>`).join('')}${C.map((c,j)=>`<th class="${j===0?'fcol':''}">${esc(c[0])}</th>`).join('')}</tr></thead><tbody>`+
    cells.map((r,ri)=>`<tr>${r.map((v,ci)=>{const ed=t.errs?(ci>=nv||!!t.fillVars):editable(ci);const cl=(ci===nv?'fcol ':'')+(ci<nv?'vcol':'');
      if(!ed)return `<td class="${cl}">${v}</td>`;const mk=marks?(marks[ri][ci]?' ok':' bad'):'';
      return `<td class="${cl} tt-f"><button type="button" class="tt-cell${mk}${ci<nv?' var':''}" data-r="${ri}" data-c="${ci}">${v===''?'·':v}</button></td>`;}).join('')}</tr>`).join('')+'</tbody></table></div>';
    tbl.querySelectorAll('.tt-cell').forEach(b=>b.addEventListener('click',()=>{const r=+b.dataset.r,c=+b.dataset.c;const v=cells[r][c];
      cells[r][c]=v===''?'0':v==='0'?'1':'0';marks=null;store.set('ttc-'+key,cells);draw();}));}
  draw();
  const verdict=box.querySelector('.verdict'),st=box.querySelector('.status');
  box.querySelector('.solbody').innerHTML=ttStatic(vars,C)+(t.q?`<p style="margin-top:6px"><b>Жауап:</b> ${esc(t.q.ans[0])}</p>`:'')+(t.why?`<p style="margin-top:6px">${esc(t.why)}</p>`:'');
  const renderSt=()=>{st.className='status'+(o.done[key]?' done':'');st.textContent=o.done[key]?o.doneLbl:'';};renderSt();
  box.querySelector('.tt-clr').addEventListener('click',()=>{cells=init();marks=null;store.set('ttc-'+key,cells);draw();verdict.hidden=true;});
  box.querySelector('.chk').addEventListener('click',()=>{verdict.hidden=false;verdict.style.whiteSpace='pre-wrap';
    let empty=0,wrong=0;marks=cells.map((r,ri)=>r.map((v,ci)=>{const ed=t.errs?(ci>=nv||!!t.fillVars):editable(ci);if(!ed)return true;if(v==='')empty++;const ok=v!==''&&+v===exp[ri][ci];if(!ok&&v!=='')wrong++;return ok;}));
    let fail=null;
    if(empty){fail=`Бос ұяшықтар бар: ${empty}. Барлық ұяшықты толтырыңыз.`;marks=null;}
    else if(wrong){const byCol={};marks.forEach(r=>r.forEach((ok,ci)=>{if(!ok)byCol[ci]=(byCol[ci]||0)+1;}));
      const names=Object.keys(byCol).map(ci=>`${+ci<nv?vars[ci]:C[ci-nv][0]}: ${byCol[ci]}`);
      fail=`Қате ұяшықтар: ${wrong}. Қызылмен белгіленді.\nБағандар бойынша — ${names.join('; ')}.`+(t.errs?'':' Алдымен сол жақтағы бағандарды тексеріңіз: қате оңға қарай өтеді.');}
    else if(t.q){const a=(ans.value||'').trim().toLowerCase().replace(/\s+/g,' ');if(!a)fail='Кесте дұрыс! Енді төмендегі сұраққа жауап беріңіз.';else if(!t.q.ans.includes(a))fail='Кесте дұрыс, бірақ сұраққа жауап қате. Кестені тағы бір қараңыз.';}
    o.tries[key]=(o.tries[key]||0)+1;store.set(o.keyTries,o.tries);
    if(fail){verdict.className='verdict no';verdict.textContent=fail;}
    else{verdict.className='verdict ok';verdict.textContent=t.errs?'Барлық қате түзетілді!':`Кесте толық дұрыс (${exp.length} жол, ${nc} баған). Керемет!`;o.done[key]=true;store.set(o.keyDone,o.done);}
    draw();renderSt();if(o.after)o.after();});
 });}

"""

RACE_JS = r"""/* ---------- tab 2: race — F at once vs intermediate columns ---------- */
function raceMake(id,vars,cols){const host=$('#'+id);const C=cols.map(c=>Array.isArray(c)?c:[c,c]),fs=C.map(c=>lgCompile(c[1]));const envs=ttEnvRows(vars);
  const exp=envs.map(env=>fs.map(f=>f(env)));let vals,t0=0,t1=0,tick=null,checked=false;
  host.innerHTML=`<div class="tbl-wrap"><table class="tt-race"></table></div><div class="answer-row"><button class="btn" type="button">Тексеру</button><button class="btn-ghost" type="button">Қайта бастау</button><span class="race-time">0,0 с</span></div><p class="feedback" hidden></p>`;
  const tb=host.querySelector('table'),[bChk,bNew]=host.querySelectorAll('button.btn,button.btn-ghost'),tm=host.querySelector('.race-time'),fb=host.querySelector('.feedback');
  const fmt=ms=>(ms/1000).toFixed(1).replace('.',',')+' с';const show=()=>{tm.textContent=fmt(t0?((t1||Date.now())-t0):0);};
  function draw(){tb.innerHTML=`<thead><tr>${vars.map(v=>`<th>${v}</th>`).join('')}${C.map(c=>`<th>${esc(c[0])}</th>`).join('')}</tr></thead><tbody>`+envs.map((env,k)=>`<tr>${vars.map(v=>`<td>${env[v]}</td>`).join('')}${C.map((c,j)=>{const v=vals[k][j];const cl=checked?(v!==''&&+v===exp[k][j]?'ok':'bad'):'';return `<td class="tt-f"><button type="button" data-k="${k}" data-j="${j}" class="${cl}">${v===''?'·':v}</button></td>`;}).join('')}</tr>`).join('')+'</tbody>';
    tb.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{if(t1)return;if(!t0){t0=Date.now();tick=setInterval(show,100);}const k=+b.dataset.k,j=+b.dataset.j;vals[k][j]=vals[k][j]===''?'0':vals[k][j]==='0'?'1':'0';checked=false;draw();}));}
  function reset(){clearInterval(tick);vals=envs.map(()=>C.map(()=>''));t0=0;t1=0;checked=false;fb.hidden=true;draw();show();}
  bNew.addEventListener('click',reset);
  bChk.addEventListener('click',()=>{fb.hidden=false;const all=vals.flat(),filled=all.filter(v=>v!=='').length;
    if(filled<all.length){fb.className='feedback no';fb.textContent=`Барлық ұяшықты толтырыңыз (толтырылғаны: ${filled} / ${all.length}).`;return;}
    const ok=vals.flat().filter((v,i)=>+v===exp.flat()[i]).length;checked=true;
    if(ok===all.length){t1=Date.now();clearInterval(tick);show();fb.className='feedback ok';fb.textContent=`Барлығы дұрыс! Уақытыңыз: ${fmt(t1-t0)}.`;}
    else{fb.className='feedback no';fb.textContent=`Дұрысы: ${ok} / ${all.length}. Қызыл ұяшықтарды түзетіңіз.`;}draw();});
  reset();}
raceMake('race1',['A','B','C'],[['F = (A ∨ B) ∧ ¬C','(A ∨ B) ∧ ¬C']]);
raceMake('race2',['A','B','C'],['A ∨ B','¬C',['F = (A ∨ B) ∧ ¬C','(A ∨ B) ∧ ¬C']]);

"""

LAB_JS = r"""/* ---------- truth table constructor ---------- */
let tt=null,ttTimer=null,ttMode=store.get('ttMode','row');
function ttStop(){clearInterval(ttTimer);ttTimer=null;$('#ttAuto').textContent='▶ Авто';}
function ttReset(){ttStop();const src=$('#ttExpr').value.trim();let p;
  try{if(!src)throw 'өрнекті жазыңыз';p=lgParse(src);if(!p.vars.length)throw 'өрнекте айнымалы жоқ (A, B, C, D)';}
  catch(e){tt=null;$('#ttTbl').innerHTML='';$('#ttSteps').innerHTML=`<span class="tt-err">Қате: ${esc(e)}</span>`;['#ttVars','#ttRows','#ttCols','#ttOnes'].forEach(s=>$(s).textContent='—');$('#ttState').textContent='';return;}
  const ops=lgOps(p.ast);if(!ops.length)ops.push({s:lgStr(p.ast),n:p.ast});
  const envs=ttEnvRows(p.vars);tt={vars:p.vars,ops,envs,F:lgStr(p.ast),step:0,
    vals:envs.map(env=>ops.map(o=>lgEval(o.n,env)))};
  tt.total=ttMode==='row'?envs.length:p.vars.length+ops.length;
  $('#ttVars').textContent=`${p.vars.join(', ')} (n = ${p.vars.length})`;$('#ttRows').textContent=`2^${p.vars.length} = ${envs.length}`;
  $('#ttCols').textContent=`${p.vars.length} + ${ops.length} = ${p.vars.length+ops.length}`;ttDraw();}
function ttVisible(r,c){if(!tt)return false;if(ttMode==='row')return r<tt.step;return c<tt.step;}
function ttDraw(){if(!tt)return;const v=tt.vars,nv=v.length,done=tt.step>=tt.total;
  const curR=ttMode==='row'?tt.step-1:-1,curC=ttMode==='col'?tt.step-1:-1;
  $('#ttTbl').innerHTML=`<thead><tr>${v.map((x,c)=>`<th class="${c===curC?'curc':''}">${x}</th>`).join('')}${tt.ops.map((o,j)=>`<th class="${j===0?'fcol ':''}${nv+j===curC?'curc':''}">${esc(o.s)}</th>`).join('')}</tr></thead><tbody>`+
    tt.envs.map((env,r)=>`<tr class="${r===curR&&!done?'cur':''}">${v.map((x,c)=>`<td class="${c===curC?'curc':''}">${ttVisible(r,c)?env[x]:''}</td>`).join('')}${tt.ops.map((o,j)=>{const c=nv+j;const val=tt.vals[r][j];
      return `<td class="${j===0?'fcol ':''}${c===curC?'curc ':''}${j===tt.ops.length-1&&val&&ttVisible(r,c)?'one':''}">${ttVisible(r,c)?val:''}</td>`;}).join('')}</tr>`).join('')+'</tbody>';
  const ones=tt.vals.filter(r=>r[r.length-1]).length;$('#ttOnes').textContent=done?ones:'…';
  let html='<ol class="tt-ops">'+tt.ops.map((o,j)=>`<li class="${ttMode==='col'&&nv+j===curC?'on':''}">${esc(o.s)}${j===tt.ops.length-1?' <b>= F</b>':''}</li>`).join('')+'</ol>';
  if(ttMode==='row'&&curR>=0){const env=tt.envs[curR];
    html+=`<div class="tt-calc"><b>${curR+1}-жол:</b> ${v.map(x=>x+' = '+env[x]).join(', ')}<br>`+tt.ops.map((o,j)=>{const n=o.n;const val=tt.vals[curR][j];
      const sub=x=>lgEval(x,env);let mid=n.t==='not'?`¬${sub(n.a)}`:n.b?`${sub(n.a)} ${LG_SYM[n.t]} ${sub(n.b)}`:String(val);return `${esc(o.s)} = ${mid} = <b>${val}</b>`;}).join('<br>')+'</div>';}
  else if(ttMode==='col'&&curC>=0){html+=`<div class="tt-calc">${curC<nv?`<b>${v[curC]}</b> бағаны: ${curC===0?'жартысы 0, жартысы 1':curC===nv-1?'0 мен 1 кезектеседі':'0 мен 1 топтары '+(2**(nv-1-curC))+'-ден'}`:`<b>${esc(tt.ops[curC-nv].s)}</b> бағаны есептелді`}</div>`;}
  else html+='<div class="tt-calc">«Қадам» батырмасын басыңыз.</div>';
  $('#ttSteps').innerHTML=html;
  $('#ttState').textContent=done?`Кесте дайын: ${tt.envs.length} жол, F = 1 болатын жолдар: ${ones}`:'';}
function ttStepOnce(){if(!tt||tt.step>=tt.total)return false;tt.step++;return true;}
function ttSetMode(m){ttMode=m;store.set('ttMode',m);document.querySelectorAll('[data-ttm]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.ttm===m));ttReset();}
document.querySelectorAll('[data-ttm]').forEach(b=>b.addEventListener('click',()=>ttSetMode(b.dataset.ttm)));
$('#ttStep').addEventListener('click',()=>{if(!tt||tt.step>=tt.total)ttReset();if(tt){ttStepOnce();ttDraw();}});
$('#ttAuto').addEventListener('click',()=>{if(ttTimer){ttStop();return;}if(!tt||tt.step>=tt.total)ttReset();if(!tt)return;
  $('#ttAuto').textContent='❚❚ Үзіліс';ttTimer=setInterval(()=>{ttStepOnce();ttDraw();if(tt.step>=tt.total)ttStop();},ttMode==='row'?900:1300);});
$('#ttAll').addEventListener('click',()=>{ttReset();if(!tt)return;tt.step=tt.total;ttDraw();});
$('#ttReset').addEventListener('click',ttReset);
$('#ttExpr').addEventListener('change',ttReset);
$('#ttExpr').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();ttReset();}});
document.querySelectorAll('[data-ex]').forEach(b=>b.addEventListener('click',()=>{$('#ttExpr').value=b.dataset.ex;ttReset();}));
document.querySelectorAll('[data-sym]').forEach(b=>b.addEventListener('click',()=>{const inp=$('#ttExpr');const s=inp.selectionStart??inp.value.length,e=inp.selectionEnd??s;
  const ins=b.dataset.sym==='⌫'?'':b.dataset.sym;let v=inp.value;if(b.dataset.sym==='⌫'){if(s===e&&s>0){inp.value=v.slice(0,s-1)+v.slice(e);inp.setSelectionRange(s-1,s-1);}else{inp.value=v.slice(0,s)+v.slice(e);inp.setSelectionRange(s,s);}}
  else{inp.value=v.slice(0,s)+ins+v.slice(e);inp.setSelectionRange(s+ins.length,s+ins.length);}inp.focus();}));
ttSetMode(ttMode);

"""

EXAMPLES_JS = r"""/* ---------- worked examples ---------- */
$('#methods').innerHTML=EXAMPLES.map((m,i)=>`<div class="method ex-card"><span class="grp">${esc(m.grp)}</span><span class="sig">${esc(m.sig)}</span><p>${esc(m.p)}</p>${ttStatic(m.vars,m.cols)}<button class="btn-ghost" type="button" data-m="${i}">Конструкторда ашу ↓</button></div>`).join('');
document.querySelectorAll('[data-m]').forEach(b=>b.addEventListener('click',()=>{const m=EXAMPLES[+b.dataset.m];$('#ttExpr').value=m.cols[m.cols.length-1];location.hash='lab';setTimeout(()=>{ttReset();},60);}));

"""

TASKS_JS = r"""/* ---------- tasks (truth tables) ---------- */
const done=store.get('done',{}),tries=store.get('tries',{});
const pracDone=store.get('pracDone',{}),pracTries=store.get('pracTries',{});
function pracScoreUpd(){$('#pracScore').textContent=`${prac.filter(t=>pracDone[t.id]).length} / ${prac.length}`;}
const afterCheck=()=>{try{updateLocks();}catch(e){}if(typeof sendProg==='function')sendProg(false);};
mountTT($('#tasks'),tasks,{keyOf:t=>t.id,badge:t=>t.id,done,tries,keyDone:'done',keyTries:'tries',after:afterCheck,solLbl:'Үлгі шешім',doneLbl:'Шешілді'});
mountTT($('#prac'),prac,{keyOf:t=>t.id,badge:t=>t.id,done:pracDone,tries:pracTries,keyDone:'pracDone',keyTries:'pracTries',after:()=>{pracScoreUpd();afterCheck();},solLbl:'Үлгі шешім',doneLbl:'Шешілді'});
pracScoreUpd();
document.querySelectorAll('#dop .lv').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('#dop .lv').forEach(x=>x.setAttribute('aria-pressed',x===b));
  document.querySelectorAll('#tasks .task').forEach(t=>t.hidden=!(b.dataset.lv==='all'||t.dataset.lv===b.dataset.lv));}));

"""

DBG_JS = r"""/* ---------- find the error in a table ---------- */
const dbgDone=store.get('dbgDone',{}),dbgTries=store.get('dbgTries',{});
function dbgScoreUpd(){$('#dbgScore').textContent=`${Object.keys(dbgDone).filter(k=>dbg[+k]).length} / ${dbg.length}`;}
mountTT($('#dbg'),dbg,{keyOf:(t,i)=>i,badge:(t,i)=>String(i+1),done:dbgDone,tries:dbgTries,keyDone:'dbgDone',keyTries:'dbgTries',
  after:()=>{dbgScoreUpd();if(typeof onDbgCheck==='function')onDbgCheck();},solLbl:'Дұрыс кесте',doneLbl:'Түзетілді'});
dbgScoreUpd();

"""
