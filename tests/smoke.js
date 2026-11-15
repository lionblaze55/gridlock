(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const out={};
for(const t of ['home','bank','jobs','realty','empire','cars','market','shop']){ Panel.open('phone',{tab:t}); await w(80);} for(const s of ['browse','sell','msgs']){Panel.msub=s; Panel.render(); await w(50);} Panel.close();
Panel.open("project",{tab:"cars"}); await w(100); out.cols=document.querySelectorAll("#panel .pcol").length; Panel.close(); openGarageAny(); await w(100); Panel.close();
for(const ty of ['home','bar','casino','factory','store','warehouse','club']){ const b=W.buildings.find(b=>b.type===ty&&b.door); if(!b) continue; enterBuilding(b); await w(400); exitBuilding(); await w(200);} 
const c=G.cars.find(c=>!c.dead&&!c.driver)||G.cars[0]; enterCar(c); Input.stick={active:true,ox:90,oy:300,dx:0,dy:-1}; await w(4000); Input.stick={active:false}; exitCar(true);
out.counts={cars:G.cars.length, types:[...new Set(G.cars.map(c=>c.type))].length}; return out;})()
