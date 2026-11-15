(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const z=W.sprays.find(z=>z.kind==='chop'); const out=[]; if(!G.chopList) newDay(); G.heat=0;
for(let i=0;i<4;i++){ const t=i===1?G.chopList[0]:'sedan'; const c=new Car(t,(z.x0+z.x1)/2,(z.y0+z.y1)/2,0); G.cars.push(c); enterCar(c); G.heat=0; const c0=G.cash; const h0=G.heat; openChop(c,z); await w(100); const txt=document.querySelector('#dlg .txt, #dialog .txt, .dlg .txt')?.textContent||''; const b=[...document.querySelectorAll('button')].find(b=>/^Sell for/.test(b.textContent)); b.click(); await w(200); out.push({t, got:G.cash-c0, heat:+G.heat.toFixed(2), mv:mktValue(t,{},1,1)}); }
// moto tab
const z2=W.sprays.find(z=>z.kind==='mod'); const c=new Car('cafe',(z2.x0+z2.x1)/2,(z2.y0+z2.y1)/2,0); G.cars.push(c); enterCar(c); openGarage(c,z2); const tabs=garTabs(c).map(t=>t[1]); GAR.tab='moto'; renderGarage(); await w(300);
// garage cap with property
const hb=W.buildings.find(b=>b.realty&&b.realty.kind==='home'&&b.realty.price>200000)||W.buildings.find(b=>b.realty&&b.realty.kind==='home'); LIFE().own[hb.id]={price:hb.realty.price,name:hb.realty.name};
return {out, tabs, cap:garCap(), slots:garSlots(), price:hb.realty.price};})()
