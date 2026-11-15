(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const out={}; G.cash=200000; const M=VMK(); marketTick(1); marketTick(1); out.pfeed=M.pfeed.map(l=>pkName(l.pk)+' $'+l.ask+(l.rare?' RARE':'')+(l.scam?' SCAM':'')).slice(0,6);
const st=calcSt(CAR_TYPES.sports,{eng:5,tur:3,ecu:4,tyr:4}), st0=calcSt(CAR_TYPES.sports,{}); out.gain={max:+(st.max/st0.max).toFixed(2), acc:+(st.acc/st0.acc).toFixed(2), grip:+(st.grip/st0.grip).toFixed(2)};
const l=M.pfeed.find(x=>!x.scam); const sh=JSON.stringify(PARTS()); buyListing(l,l.ask); out.bought=JSON.stringify(PARTS())!==sh;
// list a rare part for sale
partAdd('tur',3); M.plist=[{id:'plX',pk:'tur:3',ask:pkValue('tur:3'),v:pkValue('tur:3'),rare:1,nextT:M.clock}]; for(let i=0;i<4;i++) marketTick(.6); const o=M.msgs.find(m=>m.pk==='tur:3'); const c0=G.cash; if(o){ sellTo(o); } out.sold={offer:o&&o.offer, got:G.cash-c0, left:PARTS()['tur:3']|0};
Panel.open('phone',{tab:'market'}); Panel.msub='parts'; Panel.psub='buy'; Panel.sel=M.pfeed[0].id; Panel.render(); await w(300); return out;})()
