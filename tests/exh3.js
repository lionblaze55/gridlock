(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const p=G.player; const out={};
for (const ex of [0,1,2,3]) { const c=new Car('sports',p.x+50,p.y,0); applyMods(c,{exh:ex}); c.owned=1; c.legit=1; c.ai={mode:'parked'}; G.cars.push(c); enterCar(c); let pops=0; const p0=Snd.pop; Snd.pop=function(){pops++; return p0.apply(this,arguments);};
 const t0=performance.now(); while(performance.now()-t0<2000){ c.vx=Math.cos(c.a)*c.st.max*.7; c.vy=Math.sin(c.a)*c.st.max*.7; await w(50);} Snd.pop=p0; out['exh'+ex]={pops, rpm:+Snd.L.engine.lastRpm.toFixed(2)}; exitCar(true); G.cars.splice(G.cars.indexOf(c),1); }
return out;})()
