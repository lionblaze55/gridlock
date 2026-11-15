(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const out={}; G.cash=50000; const L=myCars(); L.length=0; L.push({type:'sports',mods:{tur:1},legit:1,cond:.5,id:'gC'});
G.stash.items.eng_v8=2; G.save.lc={eng_v8:[.95,.3]}; partAdd('tur',1); partAdd('tur',1); G.save.lc['tur:1']=[1,.2];
const g=homeGarages()[0]; Panel.open('hgarage',{g}); Panel.wsel='gC'; Panel.render(); await w(150);
const t=gTarget('gC',g); out.rows3=[...document.querySelectorAll('#panel .pcol')[2].querySelectorAll('.prow')].map(x=>x.querySelector('b').textContent+' | '+x.querySelector('small').textContent+' | '+[...x.querySelectorAll('button')].map(b=>b.textContent).join(','));
out.eff=[...document.querySelectorAll('#panel .pcol')[1].querySelectorAll('.prow small')].map(s=>s.textContent).slice(0,3);
// fit the WORN v8 specifically
const r=L[0]; withPick('eng_v8',.3,()=>tFitEng(t,'eng_v8')); out.engNow=+r.pc.eng.toFixed(2); out.v8left=lcList('eng_v8');
// value: worn turbo vs fresh
r.pc['m:tur']=1; const vA=recValue(r); r.pc['m:tur']=.1; const vB=recValue(r); out.val=[vA,vB];
// sell worn turbo unit on market
Panel.close(); Panel.open('phone',{tab:'market'}); Panel.msub='parts'; Panel.psub='sell'; Panel.render(); await w(100);
out.sellRows=[...document.querySelectorAll('#panel .pcol')[0].querySelectorAll('.prow')].map(x=>x.querySelector('b').textContent+' | '+x.querySelector('small').textContent);
Panel.sel='Utur:1@0.200'; Panel.mask=null; Panel.render(); await w(80); [...document.querySelectorAll('#panel .pfoot button')].find(b=>b.textContent==='Post listing').click(); await w(80);
const M=VMK(); const l=M.plist[M.plist.length-1]; out.listed={pk:l.pk,cond:l.cond,ask:l.ask}; out.turLeft=lcList('tur:1'); l.nextT=0; M.clock=M.clock||0; heldTick(); const m=M.msgs.find(x=>x.lid===l.id); out.msg=m&&m.text; const c0=G.cash; sellTo(m); out.got=G.cash-c0; out.plist=M.plist.length;
Panel.close(); return out;})()
