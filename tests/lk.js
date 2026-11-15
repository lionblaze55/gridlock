(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const p=G.player; G.peds=[]; G.cars=[]; p.x=roadCX(8)+20; p.y=roadCY(5)+600; giveWeapon('pistol',999); p.weapon=WI.pistol; G.settings.assist=1;
const mk=(dx,dy)=>{const q=new Ped(p.x+dx,p.y+dy,{}); q.state='idle'; q.still=1; q.hp=99999; G.peds.push(q); return q;}; const A=mk(0,-200), B=mk(0,200); LK.t=null; LK.hard=0;
let a=autoAim(-Math.PI/2,600); const first=LK.t===A; const out={first};
// keep firing every frame while moving toward B (180 degrees away)
for(let i=0;i<60;i++){ a=autoAim(Math.PI/2,600); await w(16);} out.keptWhileFiring=LK.t===A;
await w(1200); a=autoAim(Math.PI/2,600); out.afterPauseFacingB=LK.t===B;
return out;})()
