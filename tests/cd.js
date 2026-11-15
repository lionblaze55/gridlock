(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const p=G.player, g=homeGarages()[0], o={}; p.x=g.x; p.y=g.y; await w(200); doInteract(findInteract()); await w(100); const s=G.scene; o.in=!!s;
p.x=s.door.x; p.y=(s.h-.5)*T; await w(300); o.stillInEarly=!!G.scene; await w(1300); p.x=s.door.x; p.y=(s.h-.5)*T; await w(300); o.leftLater=!G.scene;
const fi=findInteract(); doInteract(fi); await w(100); o.reenterBlocked=!G.scene; await w(1300); doInteract(findInteract()); await w(100); o.reenterLater=!!G.scene; return o;})()
