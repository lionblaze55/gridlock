(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); Snd.init&&Snd.init(); const p=G.player; const out={};
for (const ex of [0,1,2,3]) { const c=new Car('sports',p.x+50,p.y,0); applyMods(c,{exh:ex}); c.owned=1; c.legit=1; c.ai={mode:'parked'}; G.cars.push(c); enterCar(c); let pops=0; const p0=Snd.pop; Snd.pop=function(){pops++; return p0.apply(this,arguments);};
  Input.stick={active:true,ox:90,oy:300,dx:0,dy:-1}; await w(2500); Input.stick={active:false}; await w(1500); Snd.pop=p0; out['exh'+ex]={pops, raspGain:Snd.L.rasp?+Snd.L.rasp.g.gain.value.toFixed(4):null, k:Snd.L.rasp&&Snd.L.rasp.k}; exitCar(true); }
return out;})()
