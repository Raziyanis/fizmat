const { chromium } = require('playwright');
const [,,file,out,mode]=process.argv;
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:1100,height:900}});await c.route(/^https?:/,r=>r.abort());
const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+file);await p.waitForTimeout(700);
if(mode==='stuX'){await p.click('#stClasses button[data-c="9"]');await p.click('#stNames button >> nth=0');await p.click('#stGo');await p.waitForTimeout(500);}
await p.evaluate(()=>{const s=document.getElementById('startScreen');if(s)s.hidden=true;document.body.classList.remove('locked-scroll');});
// constructor: show an example table
await p.goto('file://'+file+'#lab');await p.waitForTimeout(200);await p.fill('#ttExpr','(A ∨ B) ∧ ¬C');await p.press('#ttExpr','Enter');await p.click('#ttAll');
if(mode==='tea'){const E=JSON.parse(require('fs').readFileSync(__dirname+'/exp3.json','utf8'));
 await p.goto('file://'+file+'#viktorina');await p.waitForTimeout(200);for(let i=0;i<E.quiz.length;i++)await p.locator(`#quiz .opt[data-q="${i}"][data-o="${E.quiz[i]}"]`).click();
 await p.goto('file://'+file+'#kakoy');await p.waitForTimeout(200);for(let i=0;i<E.mq.length;i++)await p.locator(`#mq .q[data-i="${i}"] .opt[data-o="${E.mq[i]}"]`).click();}
await p.goto('file://'+file+'#povtorenie');await p.waitForTimeout(200);
await p.addStyleTag({content:`
 section{display:block!important;break-before:page;padding-top:0!important}
 section:first-of-type{break-before:auto}
 .pager,.t-bar,.stu-bar,#picker,.picker, #startScreen,header.top,nav,.side-stu,.hint-modal,.lang-sw,.reset-box,.pk-bar,.results,.pairs,#attWrap,.prog-box{display:none!important}
 body{overflow:visible!important}
 .tbl-wrap{overflow:visible!important}
 .task,.qcard,table,.tt-tbl,pre,.card{break-inside:avoid}
 button.chk,button.tt-clr{display:none!important}
 ${mode==='tea'?'details.sol>*:not(summary){display:block!important}':''}
`});
await p.evaluate(m=>{document.querySelectorAll('main>section').forEach(s=>s.hidden=false);document.body.classList.remove('locked-scroll');document.querySelectorAll('details.memo,details.qcard'+(m==='tea'?',details.sol':'')).forEach(d=>d.open=true);},mode);
await p.emulateMedia({media:'screen'});await p.waitForTimeout(300);
await p.pdf({path:out,format:'A4',printBackground:true,margin:{top:'12mm',bottom:'14mm',left:'10mm',right:'10mm'},displayHeaderFooter:true,headerTemplate:'<span></span>',footerTemplate:'<div style="font-size:8px;width:100%;text-align:center;color:#888">9.2.1.2 · Ақиқат кестесін құру · <span class="pageNumber"></span> / <span class="totalPages"></span></div>'});
console.log(out,'errs',errs);await b.close();})();
