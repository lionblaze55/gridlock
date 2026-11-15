(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const out={}; G.cash=200000;
const L=myCars(); L.length=0; L.push({type:'sports',mods:{tur:1,rim:2},legit:1,cond:.55,id:'gA'});
const g=homeGarages()[0]; Panel.open('hgarage',{g}); Panel.wsel='gA'; Panel.render(); await w(150);
const r=L[0]; out.pc=Object.fromEntries(Object.entries(r.pc).map(([k,v])=>[k,+v.toFixed(2)])); out.cond=+r.cond.toFixed(3);
out.rows=[...document.querySelectorAll('#panel .pcol')[1].querySelectorAll('.prow')].map(x=>x.querySelector('b').textContent+' | '+(x.querySelector('small')||{}).textContent+' | '+[...x.querySelectorAll('button')].map(b=>b.textContent).join(','));
// pull panels → loose with same cond
const t=gTarget('gA',g); const pan=r.pc.panels; pullMech(t,'panels'); out.loosePanels=lcList('panels').map(x=>+x.toFixed(2)); out.panWas=+pan.toFixed(2);
// fix engine
const ce=r.pc.eng; fixSlot(t,'eng'); out.engFix=[+ce.toFixed(2), +r.pc.eng.toFixed(2)]; out.condAfter=+r.cond.toFixed(3);
// buy new panels and fit
G.stash.items.panels=(G.stash.items.panels|0)+1; fitMech(t,'panels'); out.panelsAfterFit=+r.pc.panels.toFixed(2); out.looseLeft=lcList('panels').map(x=>+x.toFixed(2));
// swap turbo with a new spare
partAdd('tur',1); const tb=r.pc['m:tur']; tFit(t,'tur',1); out.tur=[+tb.toFixed(2), +r.pc['m:tur'].toFixed(2), lcList('tur:1').map(x=>+x.toFixed(2))];
// costs curve
out.costs=[.9,.7,.5,.3,.2,.13].map(c=>[c,repairCost(700,c)]);
// damage sync: take out, damage, store
Panel.close(); takeOut(0,g); const c=G.cars[G.cars.length-1]; out.outPC=!!c.pc; out.hpRatio=+(c.hp/c.st.hp).toFixed(3); c.hp=c.st.hp*.3; storeCar(c); const r2=L[L.length-1]; Panel.open('hgarage',{g}); Panel.wsel=r2.id||recId(r2); Panel.render(); await w(100);
out.afterCrash=Object.fromEntries(Object.entries(r2.pc).map(([k,v])=>[k,+v.toFixed(2)])); out.cond2=+r2.cond.toFixed(3);
// scrap loose worst
const n0=G.cash; scrapLoose('panels'); out.scrapGot=G.cash-n0;
// part out keeps conds
partOut(L.indexOf(r2)); out.looseAfterPO=Object.fromEntries(['eng_i4','eng_v6','eng_v8','gearbox','wheelset','tur:1','rim:2'].filter(id=>looseN(id)).map(id=>[id,lcList(id).map(x=>+x.toFixed(2))]));
Panel.close(); return out;})()
