(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const o={}; const M=VMK();
M.msgs.unshift({id:'xt1',side:'sell',kind:'offer',who:'Test Buyer',offer:500,lid:'nope',t:M.clock,text:'I can do $500',ctype:'compact'});
M.msgs.unshift({id:'xt2',side:'sell',kind:'info',who:'Old Deal',t:M.clock,text:'done deal',done:1,ctype:'compact'});
openPhone('market'); Panel.msub='msgs'; Panel.render(); await w(150); const names=()=>[...document.querySelectorAll('#panel .prow b')].map(b=>b.textContent).join('|');
o.before=names(); o.histBtn=[...document.querySelectorAll('#panel button')].map(b=>b.textContent).filter(t=>/finished/.test(t));
// decline via ✕
const x=[...document.querySelectorAll('#panel .prow')].find(r=>/Test Buyer/.test(r.innerText)).querySelector('button:last-child'); [...[...document.querySelectorAll('#panel .prow')].find(r=>/Test Buyer/.test(r.innerText)).querySelectorAll('button')].find(b=>b.textContent==='✕').click(); await w(150); o.afterDecline=names();
// a message changing in the background while open
M.msgs.unshift({id:'xt3',side:'sell',kind:'offer',who:'Late Buyer',offer:700,lid:'nope',t:M.clock,text:'yo',ctype:'compact'}); await w(1300); o.liveAdded=names().includes('Late Buyer'); o.stillThere=VMK().msgs.some(m=>m.id==='xt3'); o.mt=VMK().msgs.find(m=>m.id==='xt3');
M.msgs[0].done=1; await w(1300); o.liveRemoved=!names().includes('Late Buyer');
// dialog close refresh
M.msgs.unshift({id:'xt4',side:'sell',kind:'offer',who:'Dlg Buyer',offer:700,lid:'nope',t:M.clock,text:'yo',ctype:'compact'}); Panel.render(); say('x','y',[{t:'ok', f:()=>{ M.msgs[0].done=1; }}]); await w(100); document.querySelector('#dlg .opts button').click(); await w(200); o.dlgRefresh=!names().includes('Dlg Buyer');
return o;})()
