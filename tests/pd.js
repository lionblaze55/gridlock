(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const o={}, p=G.player, g=homeGarages()[0]; o.bld=!!g.bld; const L=myCars(); L.push({type:'muscle',mods:{},legit:1,cond:.9});
p.x=g.x; p.y=g.y+90; await w(300); p.x=g.x; p.y=g.y; await w(600); o.walkIn=!!(G.scene&&G.scene.garage); let err=null; try{renderControls();}catch(e){err=String(e);} o.err=err;
const it=G.scene.items.find(i=>i.t==='gcar'); p.x=(it.x+it.w/2)*T; p.y=(it.y+it.h)*T+20; await w(300); const fi=findInteract(); o.prompt=fi&&(fi.label||fi.k);
exitBuilding(); await w(600); o.outside=!G.scene; o.onPad=onPad(g,p); await w(600); o.noReenter=!G.scene; p.y+=120; await w(400); p.y-=120; await w(600); o.reenter=!!G.scene; if(G.scene) exitBuilding();
const c=G.cars.find(c=>c.owned&&!c.dead&&!c.driver); p.x=g.x; p.y=g.y+150; await w(600); c.x=g.x; c.y=g.y+150; c.vx=c.vy=0; enterCar(c); await w(300); c.x=g.x; c.y=g.y; c.vx=c.vy=0; await w(800); o.drivePark=!!(G.scene&&G.scene.garage)&&!G.cars.includes(c); return o;})()
