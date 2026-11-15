(async()=>{const sc=G.cars.find(c=>c.starter); const p=G.player; p.x=sc.x+60; p.y=sc.y+30; await new Promise(r=>setTimeout(r,400)); return 1;})()
