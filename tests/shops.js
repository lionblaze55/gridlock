(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const kinds={}; for(const b of W.buildings) if(b.type==='store'&&b.door) kinds[b.kind2]=(kinds[b.kind2]||0)+1;
window.__shopB={}; for(const b of W.buildings) if(b.type==='store'&&b.door&&!__shopB[b.kind2]) __shopB[b.kind2]=b; return kinds;})()
