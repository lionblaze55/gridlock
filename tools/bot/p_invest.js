(async()=>{ const B=BOT, p=G.player, L=LIFE(); G.save.fix195=1; G.bank=6e6; G.cash=0; p.hp=9999; const led={}; const add=(k,v)=>{led[k]=(led[k]||0)+v;};
const buy=r=>{ const b=W.buildings[r.id]; const m0=G.cash+G.bank; buyProperty(r); const ok=!!L.own[r.id]; add(r.kind+':capex', m0-(G.cash+G.bank)); return ok; };
const R=W.realty; const biz=R.filter(r=>r.kind==='biz'), clubs=R.filter(r=>r.kind==='club'), velvet=R.find(r=>r.name==='Velvet Lab'), grow=R.find(r=>r.name==='Grow Barn'), frost=R.find(r=>r.name==='Frost Lockup');
for(const r of [...biz,...clubs,velvet,grow,frost]) buy(r);
// upgrades
const pay=(k,n)=>{ if(payAny(n)) { add(k,-n); return true;} return false; };
for(const r of clubs){ const O=L.own[r.id]; O.up=O.up||{}; for(const [u,c] of [['sound',6000],['bar',9000],['vip',15000],['sec',5000]]) if(pay('club:capex2',-0)||true){ if(payAny(c)){ add('club:capex', c); O.up[u]=1; } } }
{ const O=L.own[velvet.id]; for(let lv=1;lv<5;lv++){ const n=Math.round(velvet.price*[0,.4,.8,1.3,2][lv]/500)*500; if(payAny(n)){ add('lab:capex',n); O.lvl=lv+1; } } for(let k=0;k<3;k++){ const n=Math.round(velvet.price*.15/500)*500+4000; if(payAny(n)){ add('lab:capex',n); O.cooks=(O.cooks|0)+1; } } }
{ const O=L.own[frost.id]; for(let k=0;k<2;k++){ const n=6000+(O.crew|0)*4000; if(payAny(n)){ add('lab:capex',n); O.crew=(O.crew|0)+1; } } }
const supply=(r)=>{ const O=L.own[r.id], lv=clamp(O.lvl|0,1,5), sp=Math.round(r.price*.05*(1+.25*(lv-1))); while(O.sup<=50 && payAny(sp)){ O.sup=Math.min(100,O.sup+50); add('lab:supplies:'+r.name,sp); } };
const days=3; const day0=G.day; const startM=G.cash+G.bank; const snap=[];
for(let d=0; d<days; d++){
  for(const r of [velvet,grow,frost]) supply(r);
  // advance half a day, then do rounds
  B.src='passive'; B.step(600);
  for(const r of [velvet,grow,frost]) supply(r);
  // ship lab product
  for(const r of [velvet,grow,frost]){ const O=L.own[r.id]; if(O.prod>=10){ const b=W.buildings[r.id]; B.src='ship'; B.route(b.door.x,b.door.y,60,200); const m0=G.cash+G.bank; startShipment(b,Math.floor(O.prod)); B.runMission(300); add('lab:ship:'+r.name, (G.cash+G.bank)-m0); if(stars()>0) B.evade(120);} }
  B.src='passive'; B.step(300);
  // club upkeep at night
  for(const r of clubs){ const O=L.own[r.id]; while(O.pop<85 && payAny(500)){ O.pop=Math.min(100,O.pop+15); add('club:upkeep',500);} if(O.stock<50 && payAny(800)){ O.stock=100; add('club:upkeep',800);} }
  // collect round (travel to each)
  B.src='collect';
  for(const r of [...biz,...clubs,velvet,grow,frost]){ const O=L.own[r.id]; if(!O||O.safe<1) continue; const b=W.buildings[r.id]; B.route(b.door.x,b.door.y,80,200); const n=Math.floor(O.safe); O.safe-=n; addCash(n); add(r.kind+':collect'+(r.kind==='lab'?':'+r.name:''),n); }
  snap.push({day:G.day, money:Math.round(G.cash+G.bank), velvet:{sup:Math.round(L.own[velvet.id].sup),prod:Math.round(L.own[velvet.id].prod)}});
}
return {gameMin:Math.round((G.t)/60), led, snap, rep:B.report(), deaths:B.deaths, notes:B.notes, err:B.err, labRates:[velvet,grow,frost].map(r=>{const O=L.own[r.id]; return r.name+': rate '+labRate(O).toFixed(2)+'/h burn '+labBurn(O).toFixed(1)+'%/h supply$ '+Math.round(r.price*.05*(1+.25*(clamp(O.lvl|0,1,5)-1)))+' base '+DRUGS.find(d=>d.id===r.drug).base;})}; })()
