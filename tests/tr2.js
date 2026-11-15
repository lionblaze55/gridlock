(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const p=G.player, out=[]; const spots=W.parkSpots.filter(s=>s.type==='tractor').slice(0,6);
for (const s of spots) { const c=new Car('tractor',s.x,s.y,s.a); c.ai={mode:'parked'}; G.cars.push(c); p.x=s.x; p.y=s.y+30; enterCar(c); c.wired=1; c.owned=1; G.bi=null; const x0=c.x,y0=c.y; 
 Input.stick={active:true,ox:90,oy:300,dx:-Math.sin(s.a),dy:Math.cos(s.a)}; await w(2500); const sp1=Math.round(Math.hypot(c.vx,c.vy));
 Input.stick={active:false}; out.push({spd:sp1, thr:c.throttle, moved:Math.round(dist(x0,y0,c.x,c.y)), solid:solidW(s.x,s.y), props:propsNear(s.x,s.y,50).map(q=>q.t).join(',')}); exitCar(true); G.cars.splice(G.cars.indexOf(c),1); }
return out;})()
