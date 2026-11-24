(async()=>{ const B=BOT, p=G.player; G.save.fix195=1; G.cash=0; G.bank=0; const out={trace:[],seized:0};
const D=DEV(); const ph=activePhone();
// field hacking with the starter phone: skim everybody you can, ATMs when unlocked
HKS().pts=10; HKS().sk.atm=1; HKS().sk.mass=1;
B.src='field-hack'; let t0=G.t; const C=[roadCX(8),roadCY(8)];
while(G.t-t0<900){ if(p.dead){B.wait(()=>!p.dead,20);continue;} if(!G.hkOn) toggleHack(); B.step(.3); const L=G.hkList||[]; const ch=phoneCharge();
  const tgt=L.find(t=>(t.k==='ped'||t.k==='gang')&&!t.o.skimmed&&profileOf(t.o).bal>0) || L.find(t=>t.k==='atm'&&!(t.o.hkT>G.t));
  if(tgt && ch.n>= (tgt.k==='atm'?2:1)){ const a=hkActs(tgt).find(a=>a[0]==='skim'||a[0]==='atm'); if(a){ hkStart(tgt,a); B.wait(()=>!G.hkUp,5); } }
  else { B.go(p.x+rnd(-500,500),p.y+rnd(-500,500),30,8); }
  if(stars()>0){ B.src='field-evade'; B.evade(90); B.src='field-hack'; } }
out.fieldXP=HKS().lvl;
// PC crime: forge tower at home, VPN + exploit + rig; auto-solve puzzles with 85% success, 20s each
const f=newDevice('forge',1); f.adds={vpn:1,exploit:1,rig:1}; D.list.push(f); f.loc='home';
hackPuzzle=(lvl,st,cb)=>{ B.step(15+lvl*3); cb(Math.random()<.88-lvl*.03); };
const apt=W.buildings.find(b=>isMyApt(b)); B.route(apt.door.x,apt.door.y,40,200); enterBuilding(apt); B.step(.5);
const bank0=()=>G.bank; const _ta=traceAdd; traceAdd=function(n,d){ const b=G.bank; const r=_ta.apply(this,arguments); if(G.bank<b){ out.seized+=b-G.bank; out.trace.push('raid@'+Math.round(G.t)); } return r; };
B.src='pc-crime'; t0=G.t;
while(G.t-t0<1800){ if(!G.scene) { B.route(apt.door.x,apt.door.y,40,200); enterBuilding(apt); B.step(.5);} let did=0; for(const row of [...NET,...DARK]){ if(row[0]==='launder'||row[0]==='dumps') continue; if(pcCD(row[0])>0) continue; if(row[0]==='gang'||row[0]==='grid'||row[0]==='lights'||row[0]==='police') continue; pcDo(f,'x',row); did++; B.step(2); }
  if(!D.gig){ const gg=[...PCGIGS].reverse().find(g=>devStats(f).power>=g[3]); D.gig={k:gg[0],end:nowT()+gigDur(gg,f),pay:gigPay(gg,devStats(f).power),uid:f.uid}; }
  B.step(did?3:10); }
out.power=devStats(f).power; out.trace.push('final '+Math.round(D.trace));
return {out, rep:B.report(), deaths:B.deaths, notes:B.notes, err:B.err}; })()
