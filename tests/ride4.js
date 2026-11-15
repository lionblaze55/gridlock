(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const p=G.player; const parks=W.blocks.filter(b=>parkBase(b.d)); let pinned=0, samples=0; const where={};
for (const bi of [0,1,2]) { const blk=parks[bi%parks.length]; p.x=(blk.bx+6)*T; p.y=(blk.by+13)*T;
G.peds=G.peds.filter(q=>!q.amb); const R=[]; for(let i=0;i<40;i++){ const s=ambSpawnSpot(p.x,p.y,i%2?blk:null)||ambSpawnSpot(p.x,p.y,null); if(!s) continue; R.push(makeRider(s[0],s[1],i%3?'bike':'skate'));}
const hist=new Map();
for(let t=0;t<30;t++){ await w(400); for(const q of R){ if(!q.ride||!G.peds.includes(q)) continue; const h=hist.get(q)||[]; h.push([q.x,q.y,q.state, Math.hypot(q.mvx,q.mvy)]); hist.set(q,h); if(h.length>5){ const win=h.slice(-5); if(win.some(s=>s[2]!=='walk'&&s[2]!=='goto')) continue; if(win.some(s=>s[3]<40)) continue; samples++; const [x0,y0]=win[0]; if(Math.hypot(q.x-x0,q.y-y0)<60){ pinned++; const k=propsNear(q.x,q.y,30).filter(o=>o.solid).map(o=>o.t).join(',')||'none'; where[k]=(where[k]||0)+1; } } } } }
return {samples, pinned, pct:+(pinned/samples*100).toFixed(2), where};})()
