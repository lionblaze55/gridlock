(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const p=G.player, out={};
// reverse steering
G.peds=[]; G.cars=[]; const x0=roadCX(8), y0=roadCY(5)+600; const c=new Car('sedan',x0,y0,-Math.PI/2); G.cars.push(c); enterCar(c); await w(200);
Input.rev=true; Input.stick={active:false}; await w(1200); const f1=c.fwd; const a0=c.a;
Input.stick={active:true,ox:90,oy:300,dx:1,dy:.0001}; await w(1500); out.rev={fwdBefore:Math.round(f1), fwdAfter:Math.round(c.fwd), burn:!!c.burnout, turned:+(angDiff(a0,c.a)).toFixed(2), rearDir:+(c.a+Math.PI).toFixed(2)};
Input.rev=false; Input.stick={active:false}; await w(300); exitCar(true);
// follower inside
const b=W.buildings.find(b=>b.type==='bar'&&b.door); p.x=b.door.x; p.y=b.door.y+30; const g=new Ped(p.x+150,p.y,{}); g.state='fight'; g.target=p; g.timer=30; G.peds.push(g); await w(100); enterBuilding(b); await w(4500); out.followIn=G.scene&&G.scene.peds.includes(g); out.gState=g.state;
exitBuilding(); await w(2500); out.followOut=G.peds.includes(g);
// bubble
const q=G.peds.find(o=>!o.dead&&o!==g)||new Ped(p.x+40,p.y,{}); if(!G.peds.includes(q)) G.peds.push(q); q.gig=gigFor(); q.gigT=G.t+100; q.still=1; q.state='idle'; q.x=p.x+60; q.y=p.y-10; G.cam.x=p.x; G.cam.y=p.y; await w(600);
return out;})()
