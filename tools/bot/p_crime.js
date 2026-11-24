(async()=>{ const B=BOT, p=G.player; G.save.fix195=1; G.cash=2000; G.bank=0; const out={};
const SAY=showDialog; let pickRe=null; showDialog=function(title,text,opts){ if(pickRe){ const o=(opts||[]).find(x=>x&&x.t&&pickRe.test(x.t)&&!x.d); if(o){ try{ o.f&&o.f(); }catch(e){B.note('dialog opt threw: '+e.message);} return; } } return SAY.apply(this,arguments); };
const wi=WI.pistol; p.weapon=wi; p.ammo[wi]=400; if(p.guns) {}
// 1. store robberies
B.src='rob'; let t0=G.t, robs=0; const stores=W.buildings.filter(b=>b.door&&['store','gas','liquor','diner','pawn'].includes(b.type)&&!b.sub&&!b.locked);
while(G.t-t0<900){ if(p.dead){B.wait(()=>!p.dead,20);continue;} const st=stores.sort((a,b)=>dist2(a.door.x,a.door.y,p.x,p.y)-dist2(b.door.x,b.door.y,p.x,p.y)).find(b=>!(b._robT>G.t)); if(!st) break; st._robT=G.t+600; B.getCar(); B.route(st.door.x,st.door.y,60,120); if(pCar()) exitCar(true); try{ enterBuilding(st);}catch(e){B.note('enter threw '+e.message);} B.step(.5); const s=G.scene; if(!s){continue;} const reg=s.items.find(i=>i.t==='register'); if(reg){ const tg=s.items.find(i=>i.t==='register'); p.x=(reg.x+.3)*T; p.y=(reg.y+1)*T; pickRe=/Rob the register/; const m0=G.cash; try{ useItem0(reg);}catch(e){B.note('rob threw '+e.message);} pickRe=null; if(G.cash>m0) robs++; } B.step(1); exitBuilding(); B.step(.5); B.src='rob-evade'; B.getCar(); B.evade(200); B.src='rob'; }
out.robs=robs;
// 2. chop shop
B.src='chop'; t0=G.t; let chops=0; const Z=W.sprays.filter(z=>z.kind==='chop');
while(G.t-t0<900 && Z.length){ if(p.dead){B.wait(()=>!p.dead,20);continue;} const c=B.getCar(); if(!c){B.step(2);continue;} const z=Z.sort((a,b)=>dist2((a.x0+a.x1)/2,(a.y0+a.y1)/2,c.x,c.y)-dist2((b.x0+b.x1)/2,(b.y0+b.y1)/2,c.x,c.y))[0]; B.route((z.x0+z.x1)/2,(z.y0+z.y1)/2,30,200); pickRe=/^Sell for/; G.inGarage=null; const m0=G.cash; B.step(1); if(G.dlgOpen){ closeDialog(); } pickRe=null; if(G.cash>m0) chops++; else { const pc=pCar(); if(pc){ pickRe=/^Sell for/; try{openChop(pc,z);}catch(e){B.note('chop threw '+e.message);} pickRe=null; if(G.cash>m0) chops++; else B.note('chop: no sale'); } } if(pCar()) exitCar(true); B.step(.5); if(stars()>0){ B.src='chop-evade'; B.getCar(); B.evade(150); B.src='chop'; } }
out.chops=chops;
return {out, rep:B.report(), deaths:B.deaths, busts:G.busts, notes:B.notes, err:B.err}; })()
