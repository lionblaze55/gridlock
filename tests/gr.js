(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const g=homeGarages()[0], p=G.player, o={}; G.cash=50000; const L=myCars(); L.push({type:'muscle',mods:{tur:1},legit:1,cond:.8}); L.push({type:'sports',mods:{},legit:1,cond:.9,noEng:1,missing:{wheelset:2}});
G.stash.items.eng_v8=1; G.stash.items.eng_i4t=1; G.stash.items.gearbox=1; partAdd('trn',2);
const c=G.cars.find(c=>c.owned); c.x=g.ax+g.f[0]*40; c.y=g.ay+g.f[1]*40; c.a=Math.atan2(-g.f[1],-g.f[0]); c.vx=c.vy=0; p.x=c.x; p.y=c.y+30; enterCar(c); const t0=performance.now(); while(performance.now()-t0<3000 && !G.scene){ c.vx=-g.f[0]*80; c.vy=-g.f[1]*80; await w(30);} 
o.scene=!!(G.scene&&G.scene.garage); o.cars=L.length; o.items=G.scene&&G.scene.items.map(i=>i.t).join(','); o.inCar=!!pCar(); p.y-=120; await w(600); return o;})()
