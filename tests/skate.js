(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const p=G.player, o={}; const sp=randStreetPoint(0,99999,TILE.ROAD); p.x=sp.x; p.y=sp.y; await w(300);
const cop=new Ped(p.x+80,p.y,{role:'cop'}); G.peds.push(cop); const s=new Car('skate',p.x+20,p.y,0); G.cars.push(s); s.ai={mode:'parked'};
enterCar(s); await w(500); o.rap=JSON.stringify(G.rap); o.heat=G.heat; exitCar(true); await w(300); enterCar(s); await w(300); exitCar(true); o.rap2=JSON.stringify(G.rap);
o.fine=(G.rap||[]).reduce((a,e)=>a+chargeFine(e),0); return o;})()
