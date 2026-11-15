(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const o={}, p=G.player; G.wanted=0; const b=W.buildings.find(b=>b.type==='hospital'); enterBuilding(b); await w(800); const s=G.scene; o.sec=s.peds.filter(q=>q.sec).length;
const a=new Ped(s.door.x, s.door.y-150, {role:'civ'}); a.name='Angry Guy'; a.inside=s; a.weapon=WI.pistol; a.state='fight'; a.target=p; a.timer=30; s.peds.push(a);
hurtPlayer(5,a,'bullet'); await w(300); o.ejectors=s.peds.filter(q=>q.ejOf===a).length; o.troubled=!!a.troubleT;
// player shoots back
p.weapon=WI.pistol; G.inv && (G.ammo=G.ammo||{}); a.hurt(10,p,'bullet'); await w(200); o.playerTrouble=!!s.trouble;
const t0=performance.now(); while(performance.now()-t0<12000 && s.peds.includes(a) && !a.dead) await w(200); o.aGone=!s.peds.includes(a)||a.dead; o.inScene=G.scene===s; o.dead=a.dead; return o;})()
