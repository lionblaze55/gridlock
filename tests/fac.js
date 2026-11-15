(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const b=W.factory; if(!b) return 'nofactory'; enterBuilding(b); await w(500); const s=G.scene; const p=G.player; const tc=s.items.find(i=>i.t==='timeclock'); p.x=(tc.x+.3)*T; p.y=(tc.y+1.2)*T; p.a=-Math.PI/2; let o=findInteract(); const l1=o&&o.label; doInteract(o); closeDialog&&closeDialog(); G.dlgOpen=false;
const fk=s.items.find(i=>i.t==='fkpark'); p.x=(fk.x+fk.w/2)*T; p.y=(fk.y+fk.h/2)*T+40; o=findInteract(); const l2=o&&o.label; doInteract(o);
// drive: teleport near a pallet and lift
const pal=s.items.find(i=>i.t==='pallet'); p.a=0; p.x=(pal.x+pal.w/2)*T-40; p.y=(pal.y+pal.h/2)*T; o=findInteract(); const l3=o&&o.label; doInteract(o);
// carry it to the right bay
const bay=s.items.find(i=>i.t==='fbay'&&i.bay===G.fork.load.bay); p.a=-Math.PI/2; p.x=(bay.x+bay.w/2)*T; p.y=(bay.y+bay.h/2)*T+40; await w(50); o=findInteract(); const l4=o&&o.label; G.cam.x=p.x; G.cam.y=p.y;
await w(600); return {name:b.name, l1,l2,l3,l4, job:!!G.fjob, pallets:s.items.filter(i=>i.t==='pallet').length};})()
