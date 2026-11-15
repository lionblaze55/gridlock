(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const p=G.player, out={}; const g=homeGarages()[0]; out.pad=!!g;
const c=new Car('coupe',g.x,g.y+400,-Math.PI/2); G.cars.push(c); enterCar(c); await w(200); c.x=g.x; c.y=g.y; c.vx=c.vy=0; await w(400); out.panel=Panel.mode; await w(100); return out;})()
