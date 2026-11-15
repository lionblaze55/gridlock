(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const p=G.player, o={}; G.cash=200000; const K=W.track; o.track=K?[Math.round(K.X1-K.X0),Math.round(K.Y1-K.Y0), districtAt(K.sx,K.yb)]:null; if(!K) return o;
p.x=K.hub.x+40; p.y=K.hub.y+40; G.tod=14; await w(1500); const rosa=G.peds.find(q=>q.name==='Rosa Vega'); o.rosa=!!rosa; if(rosa) talkTo(rosa); await w(200); o.panel=Panel.mode+' '+Panel.tab; o.tabs=[...document.querySelectorAll('#panel .ptabs button')].map(b=>b.textContent).join('|');
for (const t of ['bet','gang','rep']) { Panel.tab=t; Panel.render(); await w(80);} Panel.close();
// track race
const c=new Car('gt',K.sx,K.yb,0); G.cars.push(c); enterCar(c); trackGo(TRACK_EVENTS[0],0,0); await w(300); o.race=!!G.race&&G.race.racers.length; await w(4200); const r0=G.race.racers[0], x0=r0.x; await w(3000); o.moved=Math.round(dist(x0,r0.y,r0.x,r0.y));
// teleport through checkpoints to finish
for (let k=0;k<40&&G.race;k++){ const cp=G.race.cps[G.race.pcp]; if(!cp) break; c.x=cp[0]; c.y=cp[1]; await w(120);} o.after={mission:!!G.mission, cash:G.cash, cred:MS().cred, wins:MS().wins};
return o;})()
