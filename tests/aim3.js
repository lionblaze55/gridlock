(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const p=G.player, o={}; const sp=randStreetPoint(0,99999,TILE.ROAD); p.x=sp.x; p.y=sp.y; await w(300); giveWeapon('pistol',200); p.weapon=WI.pistol;
G.peds=G.peds.filter(q=>dist(q.x,q.y,p.x,p.y)>700); G.cars=G.cars.filter(c=>dist(c.x,c.y,p.x,p.y)>700);
// hostile thug right next to you (behind-left), a parked car straight ahead in your facing line, a bystander ahead-right
p.a=0; const thug=new Ped(p.x-30,p.y+45,{role:'civ'}); thug.state='fight'; thug.target=p; thug.hostile=1; G.peds.push(thug);
const car=new Car('sedan',p.x+120,p.y,0); car.ai={mode:'parked'}; G.cars.push(car); const by=new Ped(p.x+90,p.y+60,{role:'civ'}); G.peds.push(by);
let a=aimAt(p.a,620,'face'); o.first=AL.t===thug?'thug':AL.t===by?'bystander':AL.t===car?'car':String(AL.t);
// hold fire: keep calling; move the bystander right in front - lock must stay on thug
for(let i=0;i<10;i++){ by.x=p.x+40; by.y=p.y; aimAt(0,620,'face'); await w(30);} o.held=AL.t===thug;
// target dies while held: no switch
thug.dead=1; aimAt(0,620,'face'); await w(30); const r=aimAt(0,620,'face'); o.afterDeath=AL.t===null?'none (shoots straight)':'switched'; o.angle=r;
// release and press again: picks new target
await w(400); aimAt(0,620,'face'); o.afterRelease=AL.t===by?'bystander':AL.t===car?'car':String(AL.t&&AL.t.role);
return o;})()
