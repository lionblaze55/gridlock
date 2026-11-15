(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const out={}; G.cash=20000; const L=myCars(); L.length=0; const p=G.player;
// 1) titled car destroyed
const c=new Car('sports',p.x+60,p.y,0); applyMods(c,{tur:1}); c.owned=1; c.legit=1; c.persist=1; c.ai={mode:'parked'}; G.cars.push(c); explodeCar(c); G.insT=0; await w(700);
out.wreck={garage:L.map(r=>[r.type,r.cond,r.mods.tur]), cash:G.cash};
// 2) stolen (no title) destroyed -> nothing
const s=new Car('sedan',p.x+60,p.y+60,0); s.owned=1; s.ai={mode:'parked'}; G.cars.push(s); explodeCar(s); G.insT=0; await w(700); out.stolen=L.length;
// 3) die while away from your car
const k=new Car('muscle',p.x+80,p.y,0); k.owned=1; k.legit=1; k.persist=1; k.ai={mode:'parked'}; G.cars.push(k); enterCar(k); G.insT=0; await w(700); exitCar(true); p.x+=2000; 
const c1=G.cash; hurtPlayer(999,null,'boom'); await w(6500); out.died={garage:L.map(r=>r.type), inWorld:G.cars.includes(k), feePaid:c1-G.cash};
// 4) can't afford -> pending, shows in garage
G.cash=0; G.bank=0; const z=new Car('compact',p.x+60,p.y,0); z.owned=1; z.legit=1; z.ai={mode:'parked'}; G.cars.push(z); explodeCar(z); G.insT=0; await w(700); out.pending=CLAIMS().length;
const g=homeGarages()[0]; Panel.open('hgarage',{g}); await w(150); out.row=[...document.querySelectorAll('#panel .pcol')[0].querySelectorAll('.prow')].map(x=>x.textContent).find(t=>t.includes('insurance'));
G.cash=5000; [...document.querySelectorAll('#panel button')].find(b=>b.textContent.startsWith('Pay ')).click(); await w(100); out.afterPay={claims:CLAIMS().length, garage:L.length}; return out;})()
