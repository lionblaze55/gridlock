(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const h=W.buildings.find(b=>b.name==='Your Apartment'); G.player.x=h.door.x; G.player.y=h.door.y+40; await w(800); return 1;})()
