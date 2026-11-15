(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const p=G.player; const parks=W.blocks.filter(b=>parkBase(b.d));
const blk=parks[0]; p.x=(blk.bx+6)*T; p.y=(blk.by+13)*T;
G.peds=G.peds.filter(q=>!q.amb); const R=[]; for(let i=0;i<40;i++){ const s=ambSpawnSpot(p.x,p.y,i%2?blk:null)||ambSpawnSpot(p.x,p.y,null); if(!s) continue; R.push(makeRider(s[0],s[1],i%3?'bike':'skate'));}
const tr=new Map(); const o0=updatePedMove; window.updatePedMove=function(q,dt){ if(q.ride){ const a=[q.mvx,q.mvy]; const x=q.x,y=q.y; o0(q,dt); const t=tr.get(q)||[]; t.push([Math.round(x),Math.round(y),Math.round(a[0]),Math.round(a[1]),+(q.dodgeT||0).toFixed(2),+(q.avT||0).toFixed(2),q.state[0], q.ring?Math.round(ringParam(q.ring,q.x,q.y)%q.ring.L):-1]); if(t.length>90)t.shift(); tr.set(q,t);} else o0(q,dt); };
const hist=new Map();
for(let t=0;t<40;t++){ await w(400); for(const q of R){ if(!q.ride||!G.peds.includes(q)) continue; const h=hist.get(q)||[]; h.push([q.x,q.y,q.state, Math.hypot(q.mvx,q.mvy)]); hist.set(q,h); if(h.length>5){ const win=h.slice(-5); if(win.some(s=>s[2]!=='walk')) continue; if(win.some(s=>s[3]<40)) continue; const [x0,y0]=win[0]; if(Math.hypot(q.x-x0,q.y-y0)<60){ return {L:q.ring.L, tr:(tr.get(q)||[]).filter((_,i)=>i%3==0)}; } } } }
return null;})()
