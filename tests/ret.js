(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const out={}; const p=G.player;
// carjack: spawn a driven traffic car next to player
let c=G.cars.find(c=>!c.dead&&c.driver&&c.driver!==p&&c.ai&&c.ai.mode==='traffic'&&!c.d.boat&&!c.d.two);
c.x=p.x+40; c.y=p.y; c.vx=c.vy=0; c.spd=0;
let tagged=0, n=0; for(let i=0;i<40;i++){ const q0=G.peds.length; const dr={role:'civ',name:'Test'+i}; c.driver=dr; c.owned=0; c.ai={mode:'traffic',dir:0,lane:1,wps:[]}; enterCar(c); const q=G.peds[G.peds.length-1]; if(q&&q.ownCar===c) tagged++; n++; exitCar(true); G.peds.pop(); }
out.tagRate=tagged/n;
// real scenario: jack, then walk away
c.driver={role:'civ',name:'Owner'}; c.owned=0; c.ai={mode:'traffic',dir:0,lane:1,wps:[]}; let q; for(let k=0;k<20;k++){ enterCar(c); q=G.peds[G.peds.length-1]; if(q.ownCar) break; exitCar(true); G.peds.pop(); c.driver={role:'civ',name:'Owner'}; c.owned=0; }
q.state='flee'; q.timer=1; exitCar(true); p.x=c.x+250; p.y=c.y+250; G.wanted=0;
await w(9000); out.reclaimed=!!(c.driver&&c.driver!==p); out.mode=c.ai&&c.ai.mode; out.qGone=!G.peds.includes(q); out.carSpd=Math.round(c.spd||Math.hypot(c.vx,c.vy));
// crash eject tag
const c2=G.cars.find(x=>!x.dead&&x.driver&&x.driver!==p&&!x.d.two&&!x.d.boat&&x!==c); let ok=0; if(c2){ c2.vx=500; c2.vy=0; for(let i=0;i<30&&!ok;i++){ c2.driver={role:'civ'}; c2.ai={mode:'traffic',dir:0,lane:1,wps:[]}; const b=G.peds.length; crashEject(c2,500,null); const qq=G.peds[G.peds.length-1]; if(G.peds.length>b&&qq.ownCar) ok=1; } } out.crashTag=ok;
return out;})()
