(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const p=G.player, out={}; G.peds=[]; p.x=roadCX(8)+20; p.y=roadCY(5)+600; G.cash=20000;
giveWeapon('bolt'); giveWeapon('sniper'); giveWeapon('knife'); out.idx=[WI.bolt,WI.sniper,WI.knife];
const q=new Ped(p.x,p.y-500,{}); q.state='idle'; q.still=1; G.peds.push(q); p.weapon=WI.bolt; p.clip[WI.bolt]=5; p.fireCD=0; playerFire(-Math.PI/2); await w(50); out.boltHit=q.dead?'dead':q.hp;
G.wmods.sniper={muz:1,sight:2}; PWC={}; const q2=new Ped(p.x,p.y-900,{}); q2.state='idle'; q2.still=1; G.peds.push(q2); p.weapon=WI.sniper; p.clip[WI.sniper]=5; p.fireCD=0; playerFire(-Math.PI/2); await w(50); out.sniper=q2.dead?'dead':q2.hp; out.quiet=!!pw(WI.sniper).quiet; out.snd=pw(WI.sniper).sound;
const q3=new Ped(p.x+20,p.y,{}); q3.state='idle'; G.peds.push(q3); p.weapon=WI.knife; p.fireCD=0; playerFire(0); await w(50); out.knife=q3.hp; out.ammoKnife=p.ammo[WI.knife];
const b=W.buildings.find(b=>b.type==='gunshop'&&b.door); enterBuilding(b); await w(400); out.cases=G.scene.items.filter(i=>i.t==='case').map(i=>i.wpn); Panel.open('gunshop',{name:'x',sel:'sniper'}); await w(300); return out;})()
