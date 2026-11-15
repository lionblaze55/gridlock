(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const R={inv:[],acts:{}}; const p=G.player; G.tod=21; G.cash=200000; for (const x of ['pistol','uzi','shotgun']) giveWeapon(x,200);
const chk=(tag)=>{ const d=document.getElementById('dlg').classList.contains('show'), pn=document.getElementById('panel').classList.contains('show');
 if(G.dlgOpen && !d && !pn && !G.fullMap) R.inv.push(tag+': dlgOpen stuck');
 if(G.invOpen && !pn) R.inv.push(tag+': invOpen stuck');
 if(!isFinite(p.x)||!isFinite(p.y)) R.inv.push(tag+': player NaN');
 if(!isFinite(G.cash)) R.inv.push(tag+': cash NaN');
 for(const c of G.cars) if(!isFinite(c.x)||!isFinite(c.y)){ R.inv.push(tag+': car NaN '+c.type); break;}
 for(const q of G.peds) if(!isFinite(q.x)||!isFinite(q.y)){ R.inv.push(tag+': ped NaN '+q.role); break;}
};
const acts={
 walk:async()=>{ Input.stick={active:true,ox:90,oy:300,dx:Math.random()*2-1,dy:Math.random()*2-1}; await w(1200); Input.stick={active:false}; },
 drive:async()=>{ if(G.scene) return; const c=G.cars.filter(c=>!c.dead&&!c.d.boat&&!c.driver).sort((a,b)=>dist2(a.x,a.y,p.x,p.y)-dist2(b.x,b.y,p.x,p.y))[0]; if(!c) return; p.x=c.x+20;p.y=c.y; enterCar(c); Input.stick={active:true,ox:90,oy:300,dx:Math.random()*2-1,dy:-1}; await w(2500); Input.stick={active:false}; if(pCar()) exitCar(true); },
 bld:async()=>{ if(G.scene) { exitBuilding(); await w(300); return; } const bs=W.buildings.filter(b=>b.door); const b=bs[Math.floor(Math.random()*bs.length)]; try{enterBuilding(b);}catch(e){R.inv.push('enter '+b.type+': '+e.message);} await w(800); },
 shoot:async()=>{ p.weapon=1+Math.floor(Math.random()*3); for(let i=0;i<6;i++){ try{playerFire(Math.random()*6.28);}catch(e){R.inv.push('fire '+e.message);} await w(120);} },
 use:async()=>{ try{ const o=findInteract(); if(o) doInteract(o); }catch(e){R.inv.push('use '+e.message);} await w(400); const b=[...document.querySelectorAll('#dlg.show .opts button')]; if(b.length){ const x=b[Math.floor(Math.random()*b.length)]; x.click(); await w(400);} if(Panel.mode){ const bs=[...document.querySelectorAll('#panel .pbody button:not([disabled])')]; if(bs.length) { bs[Math.floor(Math.random()*bs.length)].click(); await w(300);} Panel.close(); } if(G.dlgOpen) closeDialog(); },
 phone:async()=>{ openPhone(); await w(100); for(let k=0;k<3;k++){ const bs=[...document.querySelectorAll('#panel button:not([disabled])')].filter(b=>!/Buy|Sell|Scrap|Deposit|Withdraw|Take it|Accept|Quit/.test(b.textContent)); if(!bs.length) break; bs[Math.floor(Math.random()*bs.length)].click(); await w(150); if(!Panel.mode) break;} if(Panel.mode) Panel.close(); if(G.dlgOpen) closeDialog(); },
 honk:async()=>{ const c=pCar(); if(c){ Snd.play('horn',c.x,c.y); await w(300); const b=[...document.querySelectorAll('#dlg.show .opts button')]; if(b.length){ b[b.length-1].click(); } } },
 tp:async()=>{ if(G.scene) return; const sp=randStreetPoint(0,99999,TILE.ROAD); p.x=sp.x; p.y=sp.y; await w(500); },
 hotwire:async()=>{ if(G.scene) return; const c=G.cars.find(c=>!c.dead&&!c.driver&&!c.owned&&!c.d.boat&&dist2(c.x,c.y,p.x,p.y)<600*600); if(!c) return; p.x=c.x+25;p.y=c.y; try{ const o=findInteract(); if(o) doInteract(o);}catch(e){R.inv.push('hw '+e.message);} await w(3000); if(pCar()) exitCar(true); },
};
const K=Object.keys(acts); const t0=Date.now();
while(Date.now()-t0< (window.SOAK||200000)){ const k=K[Math.floor(Math.random()*K.length)]; R.acts[k]=(R.acts[k]|0)+1; try{ await acts[k](); }catch(e){ R.inv.push(k+' threw '+e.message); } chk(k); if(G.player.dead){ await w(4000);} if(G.menuOpen&&G.inGame) hideMenu(); }
R.inv=[...new Set(R.inv)]; R.errStreak=G.errStreak; return R;})()
