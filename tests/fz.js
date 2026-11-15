(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const p=G.player, o={errs:[]}; window.addEventListener('error',e=>o.errs.push(String(e.message)+' '+(e.error&&e.error.stack||'').slice(0,300))); G.cash=5000; G.wanted=0;
const b=W.buildings.find(b=>b.type==='bar'); enterBuilding(b); await w(1200); const s=G.scene; p.weapon=WI.uzi; G.ammo=G.ammo||{}; 
for(let round=0;round<6;round++){ if(!G.scene) { o.thrownOut=round; break; } const t0=G.t; const peds=(s.peds||[]).filter(q=>!q.dead); for(const q of peds.slice(0,3)){ q.hurt(30,p,'bullet'); } const a=peds.find(q=>!q.dead&&q.role!=='bouncer'); if(a){ a.weapon=WI.pistol; a.state='fight'; a.target=p; a.timer=20; hurtPlayer(2,a,'bullet'); const v=peds.find(q=>q!==a&&!q.dead); if(v) v.hurt(10,a,'bullet'); }
  for(let k=0;k<5;k++){ playerFire(Math.random()*6,0); await w(150);} await w(800); o['t'+round]=+(G.t-t0).toFixed(2); if(G.t-t0<.1) break; }
o.scene=!!G.scene; o.dead=p.dead; return o;})()
