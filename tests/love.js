(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const o={}, p=G.player; const L=myCars(); L.length=0; G.cash=300;
const c=new Car('muscle',p.x+60,p.y,0); applyMods(c,{tur:1}); c.owned=1; c.legit=0; c.gid='gLove'; G.cars.push(c); explodeCar(c); G.lvT=0; await w(800);
const r=L[0]; o.wreck=r&&{type:r.type, cond:+r.cond.toFixed(2), wreck:r.wreck, gar:!!r.gar, tur:r.mods.tur};
// titled & broke: insurance can't pay -> wreck tow
G.cash=0; G.bank=0; const t=new Car('sedan',p.x+60,p.y+60,0); t.owned=1; t.legit=1; G.cars.push(t); explodeCar(t); G.insT=0; G.lvT=0; await w(900); o.broke={n:L.length, claims:CLAIMS().length, last:L[L.length-1]&&L[L.length-1].type};
// slow fix
G.cash=1000; const g=homeGarages()[0]; Panel.open('hgarage',{g}); Panel.wsel=r.id; Panel.render(); await w(200); const b=[...document.querySelectorAll('#panel button')].find(b=>b.textContent.startsWith('Slow fix')); o.slowBtn=b&&b.textContent; const c0=G.cash; b.click(); await w(100); o.paid=c0-G.cash; const s=r.sfix.s, v0=r.pc[s]; Panel.close(); await w(6000); o.progress=[+v0.toFixed(3), +r.pc[s].toFixed(3)];
// seize
const k=new Car('sedan',p.x+90,p.y,0); k.owned=1; k.legit=1; G.cars.push(k); enterCar(k); ensurePC(k,k.type,1); k.pc.eng=.015; await w(600); o.seized=k.throttle===0; exitCar(true); return o;})()
