(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const out={}; const g=homeGarages()[0]; const L=myCars(); L.length=0; G.save.shells={sports:2}; G.cash=500;
const c=new Car('sedan',g.x,g.y,0); c.owned=1; c.persist=1; c.ai={mode:'parked'}; G.cars.push(c); G.player.x=g.x+40; G.player.y=g.y;
Panel.open('hgarage',{g}); await w(200); out.title=document.querySelector('#panel .pname').textContent; out.recs=myCars().map(r=>r.type+(r.shell?'(shell)':'')); out.used=garUsed();
const t=gTarget('pad',g); for(const k of ['gearbox','wheelset','wheelset','wheelset','wheelset','exhaustp','panels','panels','wiring','seats']) pullMech(t,k); tPullEng(t); out.padComp=completeness('sedan',c.missing,c.noEng);
Panel.wsel='pad'; Panel.render(); await w(200); const btns=[...document.querySelectorAll('#panel .pfoot button')].map(b=>b.textContent); out.footer=btns;
padScrap(c); out.cashAfterScrap=G.cash; out.padGone=!G.cars.includes(c); Panel.render(); await w(300); return out;})()
