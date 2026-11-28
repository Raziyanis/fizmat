// Local test harness: runs Code.gs with in-memory mocks of Apps Script services, serves the two pages.
const fs = require('fs'), vm = require('vm'), http = require('http'), crypto = require('crypto');
function makeSheet(name){ const s={name,rows:[]};
  const api={ setName(n){s.name=n;}, getName(){return s.name;},
    getRange(r,c,nr=1,nc=1){ return { setValues(v){ v.forEach((row,i)=>row.forEach((x,j)=>{ (s.rows[r-1+i] ||= [])[c-1+j]=x; })); },
      setValue(x){ (s.rows[r-1] ||= [])[c-1]=x; }, getValues(){ const o=[]; for(let i=0;i<nr;i++){const row=[];for(let j=0;j<nc;j++) row.push((s.rows[r-1+i]||[])[c-1+j] ?? '');o.push(row);} return o; } }; },
    getDataRange(){ const w=Math.max(1,...s.rows.map(r=>r?r.length:0)); return api.getRange(1,1,Math.max(1,s.rows.length),w); },
    appendRow(row){ s.rows.push(row.slice()); }, getLastRow(){ return s.rows.length; }, clearContents(){ s.rows=[]; }, _s:s };
  return api; }
const sheetsStore={}; let props={}; const cache={};
const ctx={ console, Date, Math, JSON, Object, Array, String, Number, Error, isNaN,
  PropertiesService:{ getScriptProperties:()=>({ getProperty:k=>props[k]??null, setProperty:(k,v)=>{props[k]=v;} }) },
  SpreadsheetApp:{ create(name){ const id='ss'+Date.now(); const sh=[makeSheet('Sheet1')]; const ss={ getId:()=>id, getUrl:()=>'https://docs/'+id, getSheets:()=>sh,
      getSheetByName:n=>sh.find(x=>x.getName()===n)||null, insertSheet:n=>{const x=makeSheet(n);sh.push(x);return x;} }; sheetsStore[id]=ss; return ss; },
    openById(id){ if(!sheetsStore[id]) throw new Error('nf'); return sheetsStore[id]; } },
  CacheService:{ getScriptCache:()=>({ get:k=>cache[k]??null, put:(k,v)=>{ if(v.length>100000) throw new Error('too big'); cache[k]=v; }, remove:k=>{delete cache[k];} }) },
  LockService:{ getScriptLock:()=>({ waitLock(){}, releaseLock(){} }) },
  Utilities:{ getUuid:()=>crypto.randomUUID() }, ContentService:{ MimeType:{JSON:'json',JAVASCRIPT:'js'}, createTextOutput:t=>({ setMimeType(){ return { _t:t }; } }) }, Logger:{ log:console.log } };
vm.createContext(ctx); vm.runInContext(fs.readFileSync(__dirname+'/../Code.gs','utf8'), ctx);
const shim=`<script>window.google={script:{get run(){ let ok=()=>{},fail=()=>{}; const p=new Proxy({}, {get(t,k){ if(k==='withSuccessHandler') return f=>{ok=f;return p;}; if(k==='withFailureHandler') return f=>{fail=f;return p;};
  return (...args)=>fetch('/rpc',{method:'POST',body:JSON.stringify({fn:k,args})}).then(r=>r.json()).then(j=>j.error?fail(new Error(j.error)):ok(j.result)).catch(e=>fail(e)); }}); return p; }}};</script>`;
http.createServer((req,res)=>{
  if(req.url==='/rpc'){ let b=''; req.on('data',c=>b+=c); req.on('end',()=>{ const {fn,args}=JSON.parse(b);
    try{ const r=ctx[fn](...args); res.end(JSON.stringify({result:r===undefined?null:r})); }catch(e){ res.end(JSON.stringify({error:String(e.message)})); } }); return; }
  if(req.url.startsWith('/exec?')){ const q=new URL('http://x'+req.url).searchParams; const o=ctx.doGet({parameter:Object.fromEntries(q)}); res.setHeader('content-type','application/javascript'); res.end(o._t); return; }
  if(req.url.startsWith('/exec') && req.method==='POST' && process.env.NOPOST){ res.statusCode=500; res.end('no'); return; }
  if(req.url.startsWith('/exec') && req.method==='POST'){ let b=''; req.on('data',c=>b+=c); req.on('end',()=>{ const o=ctx.doPost({postData:{contents:b}}); res.setHeader('content-type','application/json'); res.end(o._t); }); return; }
  if(req.url.startsWith('/standalone')){ const page=req.url.includes('jury')?'Jury':'Participant'; res.setHeader('content-type','text/html; charset=utf-8');
    res.end(fs.readFileSync(__dirname+'/../'+page+'.html','utf8').replace(/var SCRIPT_URL = '[^']*'/,"var SCRIPT_URL = 'http://localhost:8765/exec'")); return; }
  if(req.url==='/dump'){ res.end(JSON.stringify(Object.values(sheetsStore).map(ss=>ss.getSheets().map(s=>({n:s.getName(),rows:s._s.rows}))))); return; }
  const page=req.url.includes('jury')?'Jury':'Participant';
  res.setHeader('content-type','text/html; charset=utf-8');
  res.end(fs.readFileSync(__dirname+'/../'+page+'.html','utf8').replace('<head>','<head>'+shim));
}).listen(8765,()=>console.log('up'));
