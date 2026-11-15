(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); G.fullMap=true; MAPV.init=1; MAPV.z=3; mapCentre(); MAPV.key=1; await w(600); return MAPV.pois.length;})()
