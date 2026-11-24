(async()=>{ const B=BOT, p=G.player, L=LIFE(), D=DEV(); G.save.fix195=1; G.cash=0; G.bank=9e6; B.tick(1/30); const o={ships:[],raids:0};
hackPuzzle=(lvl,st,cb)=>{ B.step(15+lvl*3); cb(Math.random()<.88-lvl*.03); };
for(const r of W.realty.filter(r=>['biz','club','lab'].includes(r.kind))) buyProperty(r); L.bk=1;
for(const r of W.realty.filter(r=>r.kind==='lab')){ const O=L.own[r.id]; O.lvl=5; O.cooks=3; O.crew=2; O.up=O.up||{}; O.up.sec=1; G.bank-=Math.round(r.price*5.5); }
for(const r of W.realty.filter(r=>r.kind==='club')){ const O=L.own[r.id]; O.up={sound:1,bar:1,vip:1,sec:1}; }
const f=newDevice('forge',1); f.adds={vpn:1,exploit:1,rig:1}; D.list.push(f); f.loc='home';
const props=()=>{ let v=0; for(const id in L.own) v+=W.buildings[id].realty.price; return v; };
const NW=()=>G.cash+G.bank; const nw0=NW(); const t0=G.t; const labs=W.realty.filter(r=>r.kind==='lab');
const apt=W.buildings.find(b=>isMyApt(b));
while(G.t-t0<7200){
  for(const r of labs){ const O=L.own[r.id], Dg=DRUGS.find(d=>d.id===r.drug); while(O.sup<=50 && payAny(labSupply(O,Dg))) O.sup=Math.min(100,O.sup+50);
    if(O.prod>=Math.min(150, labCap(O)*.5)){ const b=W.buildings[r.id]; B.src='ship'; B.route(b.door.x,b.door.y,60,200); const m0=NW(), u=Math.floor(O.prod); startShipment(b,u); B.runMission(400); o.ships.push(r.name.split(' ')[0]+':'+u+'u→'+Math.round(NW()-m0)); if(stars()>0){ B.evade(150);} } }
  for(const r of W.realty.filter(r=>r.kind==='club')){ const O=L.own[r.id]; while(O.pop<85&&payAny(500)) O.pop=Math.min(100,O.pop+15); if(O.stock<50&&payAny(800)) O.stock=100; }
  B.src='pc'; if(!G.scene){ B.route(apt.door.x,apt.door.y,40,200); enterBuilding(apt); B.step(.5);} for(const row of [...NET,...DARK]){ if(['launder','dumps','gang','grid','lights','police'].includes(row[0])) continue; if(pcCD(row[0])>0) continue; pcDo(f,'x',row); B.step(2);} if(!D.gig){ const gg=[...PCGIGS].reverse().find(g=>devStats(f).power>=g[3]); D.gig={k:gg[0],end:nowT()+gigDur(gg,f),pay:gigPay(gg,devStats(f).power),uid:f.uid}; }
  B.step(60); }
const hrs=(G.t-t0)/3600; return {perHr:Math.round((NW()-nw0)/hrs), hrs:+hrs.toFixed(2), shipments:o.ships.length, shipSample:o.ships.slice(0,12), missions:B.missions.filter(m=>!m.ok).map(m=>m.t+': '+m.why).slice(0,8), deaths:B.deaths, notes:B.notes, err:B.err, projectHrsTo100M: Math.round((1e8-NW()-props())/((NW()-nw0)/hrs))}; })()
