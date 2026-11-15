(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const o={}, p=G.player; G.cash=1e5; const r=W.realty.filter(r=>r.kind==='home').sort((a,b)=>a.price-b.price)[0]; buyProperty(r); const b=W.buildings[r.id];
p.x=b.door.x+FACEV[b.door.f][0]*40; p.y=b.door.y+FACEV[b.door.f][1]*40; await w(600); o.here=!!yardHere();
Panel.open('phone',{tab:'empire'}); Panel.sel=String(r.id); Panel.render(); await w(100); o.row=[...document.querySelectorAll('#panel .prow b')].map(x=>x.textContent).filter(t=>/Yard/.test(t));
Panel.open('yard',{b,tab:'shop'}); await w(100); o.items=document.querySelectorAll('#panel .prow').length; Panel.close();
const toS=(x,y)=>[(x-G.cam.x)*G.cam.z+VW/2,(y-G.cam.y)*G.cam.z+VH/2]; let placed=0, why=[];
for (const t of ['ytub','ybbq','yflower','ylights','ytramp','tree']) { for(let k=0;k<40;k++){ const a=Math.random()*6.28, d=80+Math.random()*250, x=b.door.x+Math.cos(a)*d, y=b.door.y+Math.sin(a)*d; if(yardOK(b,x,y,t)) continue; G.placing={yard:1,b,t,price:YARD.find(q=>q[0]===t)[2]}; const [sx,sy]=toS(x,y); placeTap(sx,sy); placed++; break; } }
o.placed=placed; o.saved=(LIFE().yard[r.id]||[]).length; G.zoom=1; await w(500); return o;})()
