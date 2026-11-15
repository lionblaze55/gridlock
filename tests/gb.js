(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const g=homeGarages()[0], p=G.player; const o={bld:g.bld, f:g.f}; p.x=g.ax+g.f[0]*70; p.y=g.ay+g.f[1]*70+50; await w(300); return o;})()
