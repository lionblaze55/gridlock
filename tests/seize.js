(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const o={}; const p=G.player;
const sp=randStreetPoint(0,99999,TILE.ROAD); p.x=sp.x; p.y=sp.y;
const c=new Car('sports',p.x+40,p.y,0); c.owned=1; c.legit=1; G.cars.push(c); enterCar(c); ensurePC(c,c.type,1);
Input.stick={active:true,ox:90,oy:300,dx:0,dy:-1}; await w(2500); o.healthy=Math.round(c.spd);
Input.stick={active:false}; c.vx=c.vy=0; await w(500);
c.pc.eng=0.01; Input.stick={active:true,ox:90,oy:300,dx:0,dy:-1}; await w(2500); o.seized=Math.round(c.spd);
Input.stick={active:false}; c.vx=c.vy=0; c.pc.eng=1; await w(300);
c.hp=-5; c.totaled=1; Input.stick={active:true,ox:90,oy:300,dx:0,dy:-1}; await w(2500); o.totaled=Math.round(c.spd); Input.stick={active:false};
return o;})()
