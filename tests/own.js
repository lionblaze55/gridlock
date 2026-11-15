(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const sc=G.cars.find(c=>c.starter); const p=G.player; p.x=sc.x+50; p.y=sc.y; await w(300);
const before=G.wanted||0; tryEnterCar(sc); await w(200); return {found:!!sc, inCar:pCar()===sc, dlg:!!G.dlgOpen, heat:(G.wanted||0)-before, bi:!!G.bi};})()
