(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));const p=G.player; G.peds=[]; G.cars=[]; const x0=roadCX(8)-140, y0=roadCY(5)+300; p.x=x0+150; p.y=y0+70;
const B=['cruiser','chopper','supermoto','touring','cafe','hyperbike','sportbike']; B.forEach((t,i)=>{const c=new Car(t,x0+i*45,y0,Math.PI/2); c.ai={mode:'parked'}; c.persist=1; G.cars.push(c);});
const mods=[{mfr:2,mbr:1,mpp:1,mtk:1,s:'#fff'},{mbr:2,mst:3,mpp:2,mtk:2},{mfr:3,mbg:2,mlt:3},{mfr:1,mbr:3,mpp:3,mtk:3,mst:1},{mst:2,mbg:1,mlt:1,mtk:4,s:'#ffd600'},{mlt:2,mfr:2}];
mods.forEach((m,i)=>{const c=new Car(['cruiser','chopper','touring','cafe','cruiser','hyperbike'][i],x0+i*45,y0+110,Math.PI/2); applyMods(c,m); c.ai={mode:'parked'}; c.persist=1; G.cars.push(c);});
const drv=new Car('cruiser',x0+6*45,y0+110,Math.PI/2); G.cars.push(drv); const q=new Ped(drv.x,drv.y,{}); drv.driver=q; drv.ai={mode:'parked'};
G.tod=12; G.msgs=[]; for(let k=0;k<6;k++){G.cam.x=x0+140; G.cam.y=y0+55; G.cam.z=2.8; await w(100);} return {st:calcSt(CAR_TYPES.cafe,{mfr:2,mbr:1}).max/CAR_TYPES.cafe.max, cap:garCap(), slots:garSlots()};})()
