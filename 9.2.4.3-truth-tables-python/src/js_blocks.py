# -*- coding: utf-8 -*-
RACE_JS = r"""/* ---------- tab 2: race human vs computer ---------- */
const raceF=k=>{const a=k>>2&1,b=k>>1&1,c=k&1;return ((a||b)&&!c)?1:0;};
let raceVals=[],raceT0=0,raceT1=0,raceTick=null,raceChecked=false;
function raceFmt(ms){return (ms/1000).toFixed(1).replace('.',',')+' с';}
function raceShowTime(){$('#raceTime').textContent=raceFmt(raceT0?((raceT1||Date.now())-raceT0):0);}
function raceDraw(){
  $('#raceTbl').innerHTML='<thead><tr><th>A</th><th>B</th><th>C</th><th>F</th></tr></thead><tbody>'+raceVals.map((v,k)=>{
    const cls=raceChecked?(v!==''&&+v===raceF(k)?'ok':'bad'):'';
    return `<tr><td>${k>>2&1}</td><td>${k>>1&1}</td><td>${k&1}</td><td class="tt-f"><button type="button" data-k="${k}" class="${cls}" aria-label="F, ${k+1}-жол">${v===''?'·':v}</button></td></tr>`;}).join('')+'</tbody>';
  $('#raceTbl').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{if(raceT1)return;const k=+b.dataset.k;
    if(!raceT0){raceT0=Date.now();raceTick=setInterval(raceShowTime,100);}
    raceVals[k]=raceVals[k]===''?'0':raceVals[k]==='0'?'1':'0';raceChecked=false;raceDraw();}));}
function raceNew(){clearInterval(raceTick);raceVals=Array(8).fill('');raceT0=0;raceT1=0;raceChecked=false;$('#raceFb').hidden=true;raceDraw();raceShowTime();}
function raceCheck(){const fb=$('#raceFb');fb.hidden=false;const filled=raceVals.filter(v=>v!=='').length;
  if(filled<8){fb.className='feedback no';fb.textContent=`Барлық 8 жолды толтырыңыз (толтырылғаны: ${filled}).`;return;}
  const ok=raceVals.filter((v,k)=>+v===raceF(k)).length;raceChecked=true;
  if(ok===8){raceT1=Date.now();clearInterval(raceTick);raceShowTime();fb.className='feedback ok';fb.textContent=`Барлығы дұрыс! Сіздің уақытыңыз: ${raceFmt(raceT1-raceT0)}. Енді компьютер қанша уақытта құратынын қараңыз →`;}
  else{fb.className='feedback no';fb.textContent=`Дұрысы: ${ok} / 8. Қызыл ұяшықтарды түзетіңіз: алдымен A ∨ B, содан кейін ¬C есептеңіз.`;}
  raceDraw();}
$('#raceCheck').addEventListener('click',raceCheck);$('#raceNew').addEventListener('click',raceNew);raceNew();
makeEditor($('#edRace'),{title:'race.py',compact:true,code:RACE_CODE});
makeEditor($('#edRace5'),{title:'race5.py',compact:true,code:RACE5_CODE});

"""

LAB_JS = r"""/* ---------- truth table constructor ---------- */
function ttParse(src){
  src=String(src);if(/[∧∨¬]/.test(src))throw 'Python-да ∧, ∨, ¬ орнына and, or, not жазыңыз';
  if(/[&|!~](?!=)/.test(src))throw 'Python-да &, |, ! емес, and, or, not сөздерін жазыңыз';
  const toks=[];let pos=0;const re=/(==|!=|\(|\)|[A-Za-z_][A-Za-z_0-9]*|\d+)/y;
  while(pos<src.length){if(/\s/.test(src[pos])){pos++;continue;}re.lastIndex=pos;const m=re.exec(src);if(!m)throw `«${src[pos]}» таңбасы түсініксіз`;toks.push(m[1]);pos=re.lastIndex;}
  let i=0;const vars=new Set();const take=t=>{if(toks[i]===t){i++;return true;}return false;};
  function pOr(){let n=pAnd();while(take('or')){const l=n,r=pAnd();n=e=>l(e)||r(e);}return n;}
  function pAnd(){let n=pNot();while(take('and')){const l=n,r=pNot();n=e=>l(e)&&r(e);}return n;}
  function pNot(){if(take('not')){const r=pNot();return e=>!r(e);}return pCmp();}
  function pCmp(){let n=pAtom();while(toks[i]==='=='||toks[i]==='!='){const op=toks[i++];const l=n,r=pAtom();n=op==='=='?e=>!!l(e)===!!r(e):e=>!!l(e)!==!!r(e);}return n;}
  function pAtom(){const t=toks[i];if(t===undefined)throw 'өрнек толық емес';i++;
    if(t==='('){const n=pOr();if(!take(')'))throw 'жабылатын жақша «)» жетіспейді';return n;}
    if(t==='0'||t==='False')return()=>false;if(t==='1'||t==='True')return()=>true;
    if(/^[A-D]$/.test(t)){vars.add(t);return e=>!!e[t];}
    if(t==='and'||t==='or')throw `«${t}» алдында айнымалы немесе жақша керек`;
    if(t===')')throw 'артық жабылатын жақша «)»';
    if(/^[a-d]$/.test(t))throw `«${t}» — айнымалыларды бас әріппен жазыңыз: ${t.toUpperCase()}`;
    if(/^\d+$/.test(t))throw `«${t}» — логикалық өрнекте тек 0 мен 1 болады`;
    throw `«${t}» — белгісіз атау. Айнымалылар: A, B, C, D`;}
  const f=pOr();if(i<toks.length)throw `«${toks[i]}» артық: амал (and, or) жетіспеуі мүмкін`;
  return {f,vars:[...vars].sort()};}
let tt=null,ttTimer=null;
function ttStop(){clearInterval(ttTimer);ttTimer=null;$('#ttAuto').textContent='▶ Авто';}
function ttCodeLines(vars,expr){const L=[`print("${vars.join(' ')} F")`];vars.forEach((v,i)=>L.push('    '.repeat(i)+`for ${v} in range(2):`));
  const ind='    '.repeat(vars.length);L.push(ind+'F = '+expr);L.push(ind+`print(${vars.join(', ')}, int(F))`);return L;}
function ttReset(){ttStop();const src=$('#ttExpr').value.trim().replace(/\s+/g,' ');let p;
  try{if(!src)throw 'өрнекті жазыңыз';p=ttParse(src);if(!p.vars.length)throw 'өрнекте айнымалы жоқ (A, B, C, D)';}
  catch(e){tt=null;$('#ttTbl').innerHTML='';$('#ttCode').innerHTML=`<span class="tt-err">Қате: ${esc(e)}</span>`;
    $('#ttVars').textContent='—';$('#ttRows').textContent='0';$('#ttTotal').textContent='0';$('#ttOnes').textContent='0';$('#ttState').textContent='';return;}
  tt={f:p.f,vars:p.vars,expr:src,n:p.vars.length,total:2**p.vars.length,rows:[]};
  $('#ttVars').textContent=`${p.vars.join(', ')} (n = ${tt.n})`;$('#ttTotal').textContent=tt.total;ttDraw();}
function ttStepOnce(){if(!tt||tt.rows.length>=tt.total)return false;const k=tt.rows.length,env={};
  tt.vars.forEach((v,i)=>env[v]=(k>>(tt.n-1-i))&1);tt.rows.push({env,F:tt.f(env)?1:0});return true;}
function ttDraw(){if(!tt)return;const v=tt.vars,done=tt.rows.length>=tt.total,last=tt.rows[tt.rows.length-1];
  $('#ttTbl').innerHTML=`<thead><tr>${v.map(x=>`<th>${x}</th>`).join('')}<th class="fcol">F</th></tr></thead><tbody>`+
    tt.rows.map((r,k)=>`<tr class="${!done&&k===tt.rows.length-1?'cur':''}">${v.map(x=>`<td>${r.env[x]}</td>`).join('')}<td class="fcol${r.F?' one':''}">${r.F}</td></tr>`).join('')+'</tbody>';
  const ones=tt.rows.filter(r=>r.F).length;$('#ttRows').textContent=tt.rows.length;$('#ttOnes').textContent=ones;
  const L=ttCodeLines(v,tt.expr);
  let html=L.map((l,i)=>(last&&!done&&i>v.length)?`<span class="hl">${esc(l)}</span>`:esc(l)).join('\n');
  if(last)html+=`\n\n<span class="cm"># ${v.map(x=>x+' = '+last.env[x]).join(', ')}  →  F = ${last.F}</span>`;
  else html+=`\n\n<span class="cm"># «Қадам» батырмасын басыңыз</span>`;
  $('#ttCode').innerHTML=html;
  $('#ttState').textContent=done?`Кесте дайын: ${tt.total} жол, оның ${ones} жолында F = 1`:'';}
$('#ttStep').addEventListener('click',()=>{if(!tt||tt.rows.length>=tt.total)ttReset();if(tt){ttStepOnce();ttDraw();}});
$('#ttAuto').addEventListener('click',()=>{if(ttTimer){ttStop();return;}if(!tt||tt.rows.length>=tt.total)ttReset();if(!tt)return;
  $('#ttAuto').textContent='❚❚ Үзіліс';ttTimer=setInterval(()=>{ttStepOnce();ttDraw();if(tt.rows.length>=tt.total)ttStop();},tt.total>8?350:700);});
$('#ttAll').addEventListener('click',()=>{ttReset();if(!tt)return;while(ttStepOnce());ttDraw();});
$('#ttReset').addEventListener('click',ttReset);
$('#ttExpr').addEventListener('change',ttReset);
$('#ttExpr').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();ttReset();}});
document.querySelectorAll('[data-ex]').forEach(b=>b.addEventListener('click',()=>{$('#ttExpr').value=b.dataset.ex;ttReset();}));
ttReset();

"""
