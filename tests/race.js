(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const p=G.player, o={}; G.cash=5000;
const c=new Car('sports',W.meet.x,W.meet.y+60,0); G.cars.push(c); p.x=c.x; p.y=c.y; enterCar(c); startRace(RACES[0]); await w(300);
const rt=raceRoute(RACES[0]); c.x=rt.start[0]; c.y=rt.start[1]; await w(600); o.started=!!G.race; await w(4500); o.cd=G.race&&G.race.cd; const r0=G.race&&G.race.racers[0]; const x0=r0&&r0.x; await w(2000); o.racerMoved=r0?Math.round(dist(x0,r0.y,r0.x,r0.y)):null; o.meetCarModded=G.cars.filter(c=>c.spot&&c.spot.meet).map(c=>!!c.meetSet).join(); return o;})()
