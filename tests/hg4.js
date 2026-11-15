(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const g=homeGarages()[0]; G.player.x=g.x+90; G.player.y=g.y-60; G.cam.z=1.4; await w(700); return 1;})()
