(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const p=G.player, g=homeGarages()[0], o={};
p.x=g.x; p.y=g.y; await w(800); o.autoEnter=!!G.scene; const fi=findInteract(); o.prompt=fi&&fi.label; doInteract(fi); await w(300); o.entered=!!(G.scene&&G.scene.garage); exitBuilding(); await w(300);
const sp=homeSpot(); o.spotDist=Math.round(dist(sp.x,sp.y,g.x,g.y)); o.doorDist=Math.round(dist(sp.x,sp.y,g.b.door.x,g.b.door.y)); return o;})()
