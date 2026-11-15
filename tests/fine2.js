(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const p=G.player, o={}; const sp=randStreetPoint(0,99999,TILE.ROAD); p.x=sp.x; p.y=sp.y; await w(300);
const cop=new Ped(p.x+80,p.y,{role:'cop'}); G.peds.push(cop); const s=new Car('skate',p.x+20,p.y,0); G.cars.push(s); s.ai={mode:'parked'}; enterCar(s); await w(300);
for(let i=0;i<20;i++){ crime(.12); G.heat=Math.max(G.heat,1); } o.rap=G.rap.map(e=>e.k+' x'+e.n+' = '+chargeFine(e)); o.total=G.rap.reduce((a,e)=>a+chargeFine(e),0);
G.cash=20000; busted(); await w(6000); o.booking=document.querySelector('#dlg.show .txt')?document.querySelector('#dlg.show .txt').innerText:null; o.cash=G.cash; return o;})()
