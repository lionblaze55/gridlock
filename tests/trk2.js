(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const p=G.player, o={}; G.cash=200000; const K=W.track; G.tod=14;
p.x=K.sx; p.y=K.yb-T*2.2; await w(800);
// betting
G.bet=newHeat(); G.bet.pick=1; G.bet.stake=500; payAny(500); heatStart(G.bet); await w(5000); o.heatCars=G.bet.cars.map(c=>Math.round(c.spd)); 
G.zoom=0.6; return o;})()
